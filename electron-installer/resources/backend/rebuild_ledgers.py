"""
Rebuild Client Ledgers Script
- Removes all existing LedgerEntry records 
- Re-records all invoices and payments from scratch
- Run with: python manage.py shell < rebuild_ledgers.py
"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'invoice_system.settings')
django.setup()

from invoices.models import Client, LedgerEntry, Invoice, Payment, CreditTransaction
from invoices.accounting_service import record_invoice, record_payment, recalculate_ledger_balances
from decimal import Decimal

print("=== Ledger Rebuild Script ===")

# Step 1: Delete all existing ledger entries that have debit=0 AND credit=0 (invalid/orphaned)
bad_entries = LedgerEntry.objects.filter(debit=0, credit=0)
bad_count = bad_entries.count()
print(f"Found {bad_count} invalid ledger entries (debit=0 and credit=0). Removing...")
# We need to force-delete since LedgerEntry save() is immutable
LedgerEntry.objects.filter(debit=0, credit=0).delete()
print(f"Deleted {bad_count} invalid entries.")

# Step 2: Find clients that have no ledger entries at all but have invoices
clients_needing_rebuild = Client.objects.all()
print(f"\nRebuilding ledger for {clients_needing_rebuild.count()} clients...")

rebuilt = 0
for client in clients_needing_rebuild:
    # Check if this client has invoices but no ledger entries
    invoice_count = client.invoices.count()
    ledger_count = client.ledger_entries.count()
    
    if invoice_count > 0 and ledger_count == 0:
        print(f"  Rebuilding for {client.name} ({invoice_count} invoices, {ledger_count} ledger entries)...")
        
        # Re-record all invoices
        for invoice in client.invoices.filter(status__in=['sent', 'paid', 'draft']).order_by('invoice_date', 'id'):
            try:
                record_invoice(invoice)
            except Exception as e:
                print(f"    Error recording invoice {invoice.invoice_number}: {e}")
        
        # Re-record all payments
        for invoice in client.invoices.order_by('invoice_date', 'id'):
            for payment in invoice.payments.order_by('payment_date', 'id'):
                try:
                    balance_before = invoice.total_amount - invoice.payments.filter(
                        id__lt=payment.id
                    ).aggregate(total=__import__('django').db.models.Sum('amount'))['total'] or Decimal('0')
                    record_payment(payment, balance_before)
                except Exception as e:
                    print(f"    Error recording payment {payment.id}: {e}")
        
        recalculate_ledger_balances(client)
        rebuilt += 1
    elif ledger_count > 0:
        # Just rebalance existing entries
        recalculate_ledger_balances(client)
    
print(f"\n=== Done! Rebuilt {rebuilt} client ledgers ===")

# Step 3: Final summary
for client in clients_needing_rebuild:
    client.refresh_from_db()
    if client.debit_balance > 0 or client.current_balance > 0:
        print(f"  {client.name}: outstanding={client.current_balance}, debit={client.debit_balance}")

print("\nLedger rebuild complete!")
