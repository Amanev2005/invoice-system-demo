"""
Accounting Service – Ledger-based accounting for client balances.

Every financial event calls one of these functions to create an immutable
LedgerEntry. Client balances are then recomputed from the ledger.

Entry type / Debit / Credit convention:
  INVOICE          debit = invoice total         (raises outstanding)
  PAYMENT          credit = amount paid           (lowers outstanding)
  ADVANCE_CREATED  credit = advance amount        (pre-credit, lowers outstanding)
  ADVANCE_APPLIED  debit  = advance used on inv   (offset against ADVANCE_CREATED)
  CREDIT_MEMO      credit = memo amount           (lowers outstanding)
  DEBIT_MEMO       debit  = memo amount           (raises outstanding)
"""
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


def _get_running_balance(client):
    """Return the latest running_balance for a client from the ledger."""
    from .models import LedgerEntry
    last = LedgerEntry.objects.filter(client=client).order_by(
        'date', 'created_at'
    ).last()
    return last.running_balance if last else Decimal('0')


def _create_entry(client, entry_type, debit, credit, date, reference='',
                  notes='', related_invoice=None, related_payment=None,
                  related_credit_tx=None):
    """Create a single immutable LedgerEntry and return it."""
    from .models import LedgerEntry
    prev_balance = _get_running_balance(client)
    # Outstanding goes up on debit, down on credit
    running_balance = prev_balance + Decimal(str(debit)) - Decimal(str(credit))
    entry = LedgerEntry(
        client=client,
        entry_type=entry_type,
        reference=reference,
        debit=Decimal(str(debit)),
        credit=Decimal(str(credit)),
        running_balance=running_balance,
        date=date,
        notes=notes,
        related_invoice=related_invoice,
        related_payment=related_payment,
        related_credit_tx=related_credit_tx,
    )
    entry.save()
    return entry


# ────────────────────────────────────────────────────────────────────────────
# Public functions called from model save() methods
# ────────────────────────────────────────────────────────────────────────────

def record_invoice(invoice):
    """
    Create or UPDATE an INVOICE ledger entry.
    Only creates/updates a ledger entry if the invoice has a linked client
    and is NOT a draft or quotation.
    """
    if not invoice.client:
        return

    from .models import LedgerEntry
    
    # If it's a draft or quotation, it shouldn't have a ledger entry.
    # If one exists (e.g. it was downgraded), we should remove it.
    if invoice.status in ['draft', 'quotation']:
        LedgerEntry.objects.filter(related_invoice=invoice, entry_type='INVOICE').delete()
        invoice.client.update_balance()
        return

    entry = LedgerEntry.objects.filter(related_invoice=invoice, entry_type='INVOICE').first()

    if entry:
        # Update existing entry
        entry.debit = invoice.total_amount
        entry.date = invoice.invoice_date
        entry.reference = invoice.invoice_number
        entry.notes = f'Invoice updated: {invoice.invoice_number}'
        # Use allow_recalculate=True to bypass immutability for system updates
        entry.save(allow_recalculate=True)
        # Recalculate ledger for this client since a debit value changed
        recalculate_ledger_balances(invoice.client)
    else:
        # Create new entry
        _create_entry(
            client=invoice.client,
            entry_type='INVOICE',
            debit=invoice.total_amount,
            credit=0,
            date=invoice.invoice_date,
            reference=invoice.invoice_number,
            notes=f'Invoice created for {invoice.client_name}',
            related_invoice=invoice,
        )
        # _create_entry internally handles its own running balance for new items, 
        # but we trigger client balance update.
        invoice.client.update_balance()


def recalculate_ledger_balances(client):
    """
    Rebalance the entire ledger for a client. 
    Crucial after editing or deleting a transaction in the middle of history.
    """
    from .models import LedgerEntry
    entries = LedgerEntry.objects.filter(client=client).order_by('date', 'created_at')
    
    running = Decimal('0')
    for entry in entries:
        running = running + entry.debit - entry.credit
        if entry.running_balance != running:
            # Update using our new flag to bypass immutability checks
            entry.running_balance = running
            entry.save(allow_recalculate=True)
    
    # Finally update client.current_balance (if model has it) or just trigger update_balance
    client.update_balance()


def record_payment(payment, balance_due_before=None):
    """
    Create or UPDATE a PAYMENT ledger entry. If the payment exceeds the invoice's
    outstanding balance, the excess is stored as an ADVANCE_CREATED entry.
    """
    invoice = payment.invoice
    if not invoice or not invoice.client:
        return

    from .models import LedgerEntry
    
    # Capture amounts
    amount = Decimal(str(payment.amount))
    
    # Check if we are updating an existing entry
    existing_entries = LedgerEntry.objects.filter(related_payment=payment)
    
    # If update, we need to handle the case where we might have had an overpayment before
    if existing_entries.exists():
        # For simplicity, we delete and recreate ledger entries for this payment
        # to ensure the balance_due logic is clean. 
        # Since recalculate_ledger_balances is called in signals, this is safe.
        existing_entries.delete()

    # If balance_due_before is None (on update), we need to estimate it or use current
    if balance_due_before is None:
        balance_due_before = invoice.total_amount - (invoice.amount_paid - amount)

    balance_due_before = Decimal(str(balance_due_before or 0))

    if balance_due_before <= 0:
        # Invoice was already fully paid – treat entire payment as advance
        _create_entry(
            client=invoice.client,
            entry_type='ADVANCE_CREATED',
            debit=0,
            credit=amount,
            date=payment.payment_date,
            reference=invoice.invoice_number,
            notes=f'Overpayment on {invoice.invoice_number} stored as advance credit (Updated)',
            related_invoice=invoice,
            related_payment=payment,
        )
        return

    payment_to_invoice = min(amount, balance_due_before)
    overpayment = max(amount - balance_due_before, Decimal('0'))

    # Normal payment entry
    _create_entry(
        client=invoice.client,
        entry_type='PAYMENT',
        debit=0,
        credit=payment_to_invoice,
        date=payment.payment_date,
        reference=f'{invoice.invoice_number} / {payment.payment_method}',
        notes=payment.notes,
        related_invoice=invoice,
        related_payment=payment,
    )

    # Overpayment → advance credit
    if overpayment > 0:
        _create_entry(
            client=invoice.client,
            entry_type='ADVANCE_CREATED',
            debit=0,
            credit=overpayment,
            date=payment.payment_date,
            reference=invoice.invoice_number,
            notes=f'Overpayment of {overpayment} converted to advance credit (Updated)',
            related_invoice=invoice,
            related_payment=payment,
        )


def apply_advance_credits(client, invoice):
    """
    FIFO: apply any unused advance credits to a newly created invoice.
    Reduces outstanding by creating ADVANCE_APPLIED debit entries
    (which pair with the original ADVANCE_CREATED credits).
    """
    from .models import LedgerEntry
    from django.db.models import Sum

    adv_created = LedgerEntry.objects.filter(
        client=client, entry_type='ADVANCE_CREATED'
    ).aggregate(s=Sum('credit'))['s'] or Decimal('0')

    adv_applied = LedgerEntry.objects.filter(
        client=client, entry_type='ADVANCE_APPLIED'
    ).aggregate(s=Sum('debit'))['s'] or Decimal('0')

    available_advance = adv_created - adv_applied
    if available_advance <= 0:
        return

    invoice_outstanding = Decimal(str(invoice.balance_due))
    to_apply = min(available_advance, invoice_outstanding)

    if to_apply <= 0:
        return

    _create_entry(
        client=client,
        entry_type='ADVANCE_APPLIED',
        debit=to_apply,
        credit=0,
        date=invoice.invoice_date,
        reference=invoice.invoice_number,
        notes=f'Advance credit auto-applied to {invoice.invoice_number}',
        related_invoice=invoice,
    )

    # Reflect the advance application on the invoice itself
    invoice.amount_paid = (invoice.amount_paid or Decimal('0')) + to_apply
    if invoice.amount_paid >= invoice.total_amount:
        invoice.status = 'paid'
    # Use update() to avoid re-triggering save() ledger logic
    from .models import Invoice
    Invoice.objects.filter(pk=invoice.pk).update(
        amount_paid=invoice.amount_paid,
        status=invoice.status,
    )


def record_credit_transaction(credit_tx):
    """
    Map or UPDATE a CreditTransaction to the appropriate ledger entry type:
      - credit + is_advance=True  → ADVANCE_CREATED
      - credit + is_advance=False → PAYMENT (payment to outstanding balance)
      - debit                     → DEBIT_MEMO
    """
    client = credit_tx.client
    amount = Decimal(str(credit_tx.amount))
    date = credit_tx.date.date() if hasattr(credit_tx.date, 'date') else credit_tx.date
    ref = credit_tx.remarks[:100] if credit_tx.remarks else ''

    from .models import LedgerEntry
    
    # Check for existing entries for this credit transaction
    existing = LedgerEntry.objects.filter(related_credit_tx=credit_tx)
    if existing.count() == 1:
        # Update existing single entry
        entry = existing.first()
        entry.date = date
        entry.reference = ref
        entry.notes = credit_tx.remarks
        if credit_tx.transaction_type == 'credit':
            entry.entry_type = 'ADVANCE_CREATED' if credit_tx.is_advance else 'PAYMENT'
            entry.debit = 0
            entry.credit = amount
        else:
            entry.entry_type = 'DEBIT_MEMO'
            entry.debit = amount
            entry.credit = 0
        entry.save(allow_recalculate=True)
    elif existing.count() > 1:
        # Should not happen but clean up if it does
        existing.delete()
        _create_record_credit_transaction(client, credit_tx, amount, date, ref)
    else:
        _create_record_credit_transaction(client, credit_tx, amount, date, ref)

def _create_record_credit_transaction(client, credit_tx, amount, date, ref):
    if credit_tx.transaction_type == 'credit':
        entry_type = 'ADVANCE_CREATED' if credit_tx.is_advance else 'PAYMENT'
        _create_entry(
            client=client,
            entry_type=entry_type,
            debit=0,
            credit=amount,
            date=date,
            reference=ref if not credit_tx.is_advance else ref,
            notes=credit_tx.remarks,
            related_credit_tx=credit_tx,
        )
    else:
        _create_entry(
            client=client,
            entry_type='DEBIT_MEMO',
            debit=amount,
            credit=0,
            date=date,
            reference=ref,
            notes=credit_tx.remarks,
            related_credit_tx=credit_tx,
        )
