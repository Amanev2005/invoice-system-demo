from django.db import models
from django.utils import timezone

class Client(models.Model):
    """
    Client model for managing customer accounts and credit terms
    """
    name = models.CharField(max_length=255, unique=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    trn_no = models.CharField(max_length=100, blank=True, help_text='Tax Registration Number')
    vat_no = models.CharField(max_length=100, blank=True, help_text='VAT Number')
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text='Maximum credit allowed')
    credit_terms = models.IntegerField(default=30, help_text='Payment due in days')
    current_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text='Current outstanding balance')
    
    # Balance tracking fields
    credit_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Total credit/advance payments')
    debit_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Total outstanding/due amount')
    advance_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Advance payments made')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def update_balance(self):
        """Recalculate balances from the immutable LedgerEntry ledger."""
        from django.db.models import Sum
        agg = self.ledger_entries.aggregate(
            total_debit=Sum('debit'),
            total_credit=Sum('credit'),
        )
        total_debit  = agg['total_debit']  or 0
        total_credit = agg['total_credit'] or 0

        # Outstanding balance = all debits minus all credits (min 0)
        self.debit_balance = max(total_debit - total_credit, 0)

        # Advance balance = unused advance credits (ADVANCE_CREATED minus ADVANCE_APPLIED)
        adv_created = self.ledger_entries.filter(
            entry_type='ADVANCE_CREATED'
        ).aggregate(s=Sum('credit'))['s'] or 0
        adv_applied = self.ledger_entries.filter(
            entry_type='ADVANCE_APPLIED'
        ).aggregate(s=Sum('debit'))['s'] or 0
        self.advance_balance = max(adv_created - adv_applied, 0)

        # credit_balance = advance_balance (alias for clarity)
        self.credit_balance = self.advance_balance

        # current_balance = net outstanding (debit - advance)
        self.current_balance = max(self.debit_balance - self.advance_balance, 0)

        self.save(update_fields=[
            'debit_balance', 'advance_balance', 'credit_balance', 'current_balance'
        ])


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('quotation', 'Quotation'),
        ('work_order', 'Work Order'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Company Information
    company_name = models.CharField(max_length=255, default='Rashid Typing & Document Clearing')
    company_email = models.EmailField(default='rashidhuaq@gmail.com')
    company_mobile = models.CharField(max_length=50, default='050-7441282')
    company_phone = models.CharField(max_length=50, default='06-7670165')
    company_po_box = models.CharField(max_length=50, default='P.o Box: 7647')
    company_address = models.CharField(max_length=255, default='Opp. Tasheel, Salama, U.A.Q - UAE')
    
    # Invoice Details
    invoice_number = models.CharField(max_length=20, unique=True, blank=True)
    invoice_date = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True, help_text='Payment due date')
    
    # Client Information
    client = models.ForeignKey('Client', on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    client_name = models.CharField(max_length=255, help_text='Mr./M/s')
    
    # Financial Details
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text='Total amount paid')
    total_in_words = models.CharField(max_length=500, blank=True)
    
    # Additional Information
    payment_method = models.CharField(max_length=100, default='CASH/DEBIT MEMO')
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-invoice_date', '-created_at']
    
    def __str__(self):
        return f"{self.invoice_number} - {self.client_name}"
    
    def save(self, *args, **kwargs):
        """Auto-generate invoice number if not provided and sync with ledger"""
        is_new = not self.pk

        if not self.invoice_number:
            # Get the last invoice number
            last_invoice = Invoice.objects.order_by('-id').first()
            if last_invoice and last_invoice.invoice_number.startswith('INV-'):
                try:
                    last_number = int(last_invoice.invoice_number.split('-')[1])
                    new_number = last_number + 1
                except (ValueError, IndexError):
                    new_number = 1
            else:
                new_number = 1
            self.invoice_number = f'INV-{new_number:04d}'

        # Capture old status if not new
        old_status = 'draft'
        if not is_new:
            try:
                # Use a fresh query to get the value from the DB
                old_status = Invoice.objects.filter(pk=self.pk).values_list('status', flat=True).first() or 'draft'
            except Exception:
                old_status = 'draft'

        super().save(*args, **kwargs)

        if self.client:
            # Update ledger entry for the invoice (handles create/update/delete based on status)
            try:
                from .accounting_service import record_invoice, apply_advance_credits
                record_invoice(self)
                
                # Apply advance credits if it's new OR if it just moved from draft/quotation to a real status
                # but only if the current status is a specialized "active" status
                is_finalizing = old_status in ['draft', 'quotation'] and self.status not in ['draft', 'quotation']
                if (is_new and self.status not in ['draft', 'quotation']) or is_finalizing:
                    apply_advance_credits(self.client, self)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f'Ledger error on invoice save: {e}')

            # Update client balance
            self.client.update_balance()
    
    def calculate_total(self):
        """Calculate total from invoice items and update ledger"""
        self.subtotal = sum(item.amount for item in self.items.all())
        self.total_amount = self.subtotal
        
        # Standard save triggers post_save signals for ledger recording
        self.save()
    
    @property
    def balance_due(self):
        """Calculate remaining balance"""
        return self.total_amount - self.amount_paid
    
    @property
    def is_paid(self):
        """Check if invoice is fully paid"""
        return self.amount_paid >= self.total_amount
    
    @property
    def is_overdue(self):
        """Check if invoice is overdue"""
        if self.due_date and self.status != 'paid':
            return timezone.now().date() > self.due_date
        return False
    
    @property
    def days_overdue(self):
        """Calculate days overdue"""
        if self.is_overdue:
            return (timezone.now().date() - self.due_date).days
        return 0

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    rate = models.DecimalField(max_digits=10, decimal_places=2, help_text='Rate in Dirhams')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    card_payment = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text='Government / card payment cost')
    payment_done = models.BooleanField(default=False, help_text='Item-level payment verification')
    
    def __str__(self):
        return f"{self.description} - {self.amount} Dhs"
    
    def save(self, *args, **kwargs):
        """Auto-calculate amount from quantity and rate and update invoice total"""
        self.amount = self.quantity * self.rate
        super().save(*args, **kwargs)
        # Update parent invoice total immediately
        self.invoice.calculate_total()

    def delete(self, *args, **kwargs):
        """Update invoice total when an item is deleted"""
        invoice = self.invoice
        super().delete(*args, **kwargs)
        invoice.calculate_total()


class CompanySettings(models.Model):
    """
    Singleton model for company settings
    Only one instance should exist
    """
    company_name = models.CharField(max_length=255, default='Rashid Typing & Document Clearing')
    company_email = models.EmailField(default='rashidhuaq@gmail.com')
    company_email_password = models.CharField(
        max_length=255, 
        blank=True, 
        default='',
        help_text='Gmail App Password (16 characters) - Keep this secure!'
    )
    company_mobile = models.CharField(max_length=50, default='050-7441282')
    company_phone = models.CharField(max_length=50, default='06-7670165')
    company_po_box = models.CharField(max_length=50, default='P.o Box: 7647')
    company_address = models.CharField(max_length=255, default='Opp. Tasheel, Salama, U.A.Q - UAE')
    about_company = models.TextField(blank=True, help_text='Company description or about information')
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    
    # SOA Settings
    default_credit_terms = models.IntegerField(default=30, help_text='Default payment terms in days')
    aging_period_1 = models.IntegerField(default=30, help_text='First aging period in days')
    aging_period_2 = models.IntegerField(default=60, help_text='Second aging period in days')
    aging_period_3 = models.IntegerField(default=90, help_text='Third aging period in days')
    soa_notes = models.TextField(blank=True, help_text='Default notes to appear on SOA')
    
    # Backup Settings
    enable_auto_backup = models.BooleanField(default=True, help_text='Enable automatic scheduled backups')
    auto_backup_times = models.CharField(
        max_length=255,
        default='02:00, 06:00, 14:00, 18:00',
        blank=True,
        help_text='Comma-separated backup times in 24h format (e.g., 02:00, 06:00, 14:00, 18:00)'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Company Settings'
        verbose_name_plural = 'Company Settings'
    
    def save(self, *args, **kwargs):
        """Ensure only one instance exists (singleton pattern)"""
        self.pk = 1
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Prevent deletion of the singleton instance"""
        pass
    
    @classmethod
    def get_instance(cls):
        """Get or create the singleton instance"""
        instance, created = cls.objects.get_or_create(pk=1)
        return instance
    
    def __str__(self):
        return f"Company Settings - {self.company_name}"

class EmailHistory(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='email_history')
    recipient_email = models.EmailField()
    status = models.CharField(max_length=20, choices=[
        ('success', 'Success'),
        ('failed', 'Failed')
    ])
    error_message = models.TextField(blank=True, null=True)
    sent_by = models.CharField(max_length=150, default='system', help_text='Username of who sent the email')
    sent_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-sent_at']
        
    def __str__(self):
        return f"Email to {self.recipient_email} for {self.invoice.invoice_number} - {self.status}"

class Payment(models.Model):
    """
    Payment model for tracking payments against invoices
    """
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('cheque', 'Cheque'),
        ('credit_card', 'Credit Card'),
        ('other', 'Other'),
    ]
    
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(default=timezone.now)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    reference_number = models.CharField(max_length=100, blank=True, help_text='Cheque number, transaction ID, etc.')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(max_length=100, blank=True)
    
    class Meta:
        ordering = ['-payment_date', '-created_at']
    
    def __str__(self):
        return f"Payment of {self.amount} Dhs for {self.invoice.invoice_number}"
    
    def save(self, *args, **kwargs):
        """Update invoice amount_paid when payment is saved"""
        is_new = not self.pk

        # Capture balance_due BEFORE this payment is applied (for overpayment calc)
        balance_due_before = self.invoice.balance_due if is_new else None

        super().save(*args, **kwargs)

        # Recalculate invoice amount_paid
        total_payments = self.invoice.payments.aggregate(total=models.Sum('amount'))['total'] or 0
        self.invoice.amount_paid = total_payments

        # Update invoice status if fully paid
        if self.invoice.amount_paid >= self.invoice.total_amount:
            self.invoice.status = 'paid'

        self.invoice.save()

        # Create/Update ledger entries
        if self.invoice.client:
            try:
                from .accounting_service import record_payment
                # record_payment now handles both create and update
                record_payment(self, balance_due_before if is_new else None)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f'Ledger error on payment save: {e}')

        # Update client balance if client exists
        if self.invoice.client:
            self.invoice.client.update_balance()

class Wallet(models.Model):
    """
    Wallet model for managing different payment accounts
    """
    WALLET_TYPE_CHOICES = [
        ('bank', 'Bank Account'),
        ('cash', 'Cash Account'),
        ('swiping', 'Swiping Account'),
    ]
    
    name = models.CharField(max_length=100, unique=True, help_text='Wallet name (e.g., ADCB, ADIB, FAB)')
    bank_name = models.CharField(max_length=100, blank=True, help_text='Name of the bank (for bank-type wallets)')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Current wallet balance')
    wallet_type = models.CharField(max_length=50, choices=WALLET_TYPE_CHOICES, default='bank')
    is_active = models.BooleanField(default=True)
    client = models.ForeignKey(
        'Client',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='wallets',
        help_text='Client this wallet belongs to (for client-specific wallets)'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.balance} Dhs"


class Commission(models.Model):
    """
    Commission model for tracking commissions on invoices
    """
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='commissions')
    commission_to = models.CharField(max_length=100, help_text='Commission recipient (e.g., ASCR, SAR, VIVOMED2)')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    payment_date = models.DateField(null=True, blank=True)
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"Commission to {self.commission_to} - {self.amount} Dhs"


class WorkOrder(models.Model):
    """
    Work Order model for tracking service orders
    """
    STATUS_CHOICES = [
        ('new_order', 'New Order'),
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    work_order_number = models.CharField(max_length=50, unique=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='work_orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new_order')
    count = models.IntegerField(default=0, help_text='Completed count')
    total_count = models.IntegerField(default=0, help_text='Total items in order')
    description = models.TextField(blank=True)
    
    # Financial fields (matching Invoice format)
    start_date = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    payment_method = models.CharField(max_length=100, default='CASH/DEBIT MEMO', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.work_order_number} - {self.client.name}"
    
    def save(self, *args, **kwargs):
        """Auto-generate work order number if not provided"""
        if not self.work_order_number:
            # Get the last work order number
            last_wo = WorkOrder.objects.order_by('-id').first()
            if last_wo and last_wo.work_order_number.startswith('WO/MAIN/'):
                try:
                    last_number = int(last_wo.work_order_number.split('/')[-1])
                    new_number = last_number + 1
                except (ValueError, IndexError):
                    new_number = 1
            else:
                new_number = 1
            
            self.work_order_number = f'WO/MAIN/{new_number:03d}'
        
        super().save(*args, **kwargs)
    
    def calculate_total(self):
        """Calculate total from work order items"""
        self.subtotal = sum(item.amount for item in self.items.all())
        self.total_amount = self.subtotal
        self.save()


class WorkOrderItem(models.Model):
    """
    Work Order Item model for tracking individual items in a work order
    """
    work_order = models.ForeignKey(WorkOrder, related_name='items', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    rate = models.DecimalField(max_digits=10, decimal_places=2, help_text='Rate in Dirhams')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.description} - {self.amount} Dhs"
    
    def save(self, *args, **kwargs):
        """Auto-calculate amount from quantity and rate"""
        self.amount = self.quantity * self.rate
        super().save(*args, **kwargs)



class Expense(models.Model):
    """
    Expense model for tracking business expenses
    """
    CATEGORY_CHOICES = [
        ('supplier', 'Supplier Payment'),
        ('service', 'Service Transaction'),
        ('general', 'General Expense'),
        ('salary', 'Salary'),
        ('rent', 'Rent'),
        ('utilities', 'Utilities'),
        ('supplies', 'Office Supplies'),
        ('marketing', 'Marketing'),
        ('travel', 'Travel'),
        ('maintenance', 'Maintenance'),
        ('other', 'Other'),
    ]
    
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='general')
    date = models.DateField(default=timezone.now)
    wallet = models.ForeignKey(Wallet, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.description} - {self.amount} Dhs"
    
    def save(self, *args, **kwargs):
        """Update wallet balance when expense is saved"""
        super().save(*args, **kwargs)
        
        # Deduct from wallet balance if wallet is specified
        if self.wallet:
            self.wallet.balance -= self.amount
            self.wallet.save()


class CreditTransaction(models.Model):
    """
    Credit Transaction model for tracking client credit/debit entries
    """
    TRANSACTION_TYPE_CHOICES = [
        ('credit', 'Credit'),
        ('debit', 'Debit'),
    ]
    
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='credit_transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(default=timezone.now)
    is_advance = models.BooleanField(default=False, help_text='Is this an advance payment?')
    payment_method = models.CharField(max_length=100, default='Cash Account')
    remarks = models.TextField(blank=True)
    settle_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text='Amount used to settle outstanding')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.transaction_type.upper()} - {self.client.name} - {self.amount} Dhs"
    
    def save(self, *args, **kwargs):
        """Update client balance when transaction is saved"""
        is_new = not self.pk  # Check if this is a new transaction

        super().save(*args, **kwargs)

        # Create/Update ledger entries
        try:
            from .accounting_service import record_credit_transaction
            # record_credit_transaction now handles both create and update
            record_credit_transaction(self)
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f'Ledger error on credit_tx save: {e}')

        if is_new:
            if self.transaction_type == 'credit' and self.is_advance:
                wallet = Wallet.objects.filter(
                    client=self.client,
                    is_active=True
                ).first()
                if wallet:
                    wallet.balance += self.amount
                    wallet.save()
                else:
                    Wallet.objects.create(
                        name=f"{self.client.name} - Advance",
                        balance=self.amount,
                        wallet_type='bank',
                        client=self.client,
                        is_active=True
                    )
            elif self.transaction_type == 'credit' and not self.is_advance:
                # Payment to existing invoices — update cash wallet if cash
                if 'cash' in self.payment_method.lower():
                    cash_wallet = Wallet.objects.filter(
                        wallet_type='cash',
                        is_active=True,
                        client__isnull=True
                    ).first()
                    if cash_wallet:
                        cash_wallet.balance += self.amount
                        cash_wallet.save()
                    else:
                        Wallet.objects.create(
                            name='Cash Account',
                            balance=self.amount,
                            wallet_type='cash',
                            is_active=True
                        )

        # Recompute balances from ledger
        self.client.update_balance()

class Service(models.Model):
    """
    Service catalog for invoice line items
    """
    CATEGORY_CHOICES = [
        ('typing', 'Typing Services'),
        ('document', 'Document Clearing'),
        ('visa', 'Visa Services'),
        ('immigration', 'Immigration Services'),
        ('labour', 'Labour Card Services'),
        ('other', 'Other Services'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    default_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.default_price} Dhs"


class Lead(models.Model):
    """
    Lead management for sales pipeline
    """
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('proposal', 'Proposal Sent'),
        ('negotiation', 'Negotiation'),
        ('converted', 'Converted'),
        ('lost', 'Lost'),
    ]
    
    SOURCE_CHOICES = [
        ('website', 'Website'),
        ('referral', 'Referral'),
        ('cold_call', 'Cold Call'),
        ('email', 'Email Campaign'),
        ('social_media', 'Social Media'),
        ('walk_in', 'Walk-in'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    company = models.CharField(max_length=255, blank=True)
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default='other')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='new')
    notes = models.TextField(blank=True)
    estimated_value = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text='Estimated deal value')
    converted_client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='converted_from_lead')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.status}"
    
    def convert_to_client(self):
        """Convert lead to client"""
        if not self.converted_client:
            client = Client.objects.create(
                name=self.company if self.company else self.name,
                email=self.email,
                phone=self.phone
            )
            self.converted_client = client
            self.status = 'converted'
            self.save()
            return client
        return self.converted_client


class Transaction(models.Model):
    """
    Comprehensive transaction tracking
    """
    TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
        ('transfer', 'Transfer'),
    ]
    
    CATEGORY_CHOICES = [
        ('invoice_payment', 'Invoice Payment'),
        ('supplier_payment', 'Supplier Payment'),
        ('service_fee', 'Service Fee'),
        ('salary', 'Salary'),
        ('rent', 'Rent'),
        ('utilities', 'Utilities'),
        ('commission', 'Commission'),
        ('refund', 'Refund'),
        ('cash_transfer', 'Cash to Bank Transfer'),
        ('other', 'Other'),
    ]
    
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField()
    date = models.DateField(default=timezone.now)
    wallet = models.ForeignKey(Wallet, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    
    # Related objects
    related_invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    related_payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    related_expense = models.ForeignKey(Expense, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    
    reference_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.transaction_type.upper()} - {self.amount} Dhs - {self.date}"


class Document(models.Model):
    """
    Document management system
    """
    CATEGORY_CHOICES = [
        ('contract', 'Contract'),
        ('invoice', 'Invoice'),
        ('receipt', 'Receipt'),
        ('id_document', 'ID Document'),
        ('license', 'License'),
        ('certificate', 'Certificate'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/%Y/%m/')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField(blank=True)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    file_size = models.IntegerField(default=0, help_text='File size in bytes')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.title} - {self.category}"


class PaymentLink(models.Model):
    """
    Payment link generation for invoices
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paid', 'Paid'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payment_links')
    link_code = models.CharField(max_length=50, unique=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    expires_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment Link {self.link_code} - {self.amount} Dhs"
    
    def save(self, *args, **kwargs):
        """Auto-generate unique link code"""
        if not self.link_code:
            import uuid
            self.link_code = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)
    
    def get_payment_url(self):
        """Get full payment URL"""
        return f"/pay/{self.link_code}"


class ActivityLog(models.Model):
    """
    System-wide activity logging
    """
    ACTION_CHOICES = [
        ('create', 'Created'),
        ('update', 'Updated'),
        ('delete', 'Deleted'),
        ('view', 'Viewed'),
        ('email', 'Emailed'),
        ('export', 'Exported'),
        ('login', 'Logged In'),
        ('logout', 'Logged Out'),
    ]
    
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100, default='', help_text='Model that was affected')
    object_id = models.IntegerField(null=True, blank=True, help_text='ID of the affected object')
    description = models.TextField(default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.action} {self.model_name} at {self.timestamp}"


class Supplier(models.Model):
    """
    Supplier model for managing vendors and suppliers
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    category = models.CharField(max_length=100, default='Office Supplies')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Bookmark(models.Model):
    """
    Quick access bookmarks
    """
    BOOKMARK_TYPE_CHOICES = [
        ('client', 'Client'),
        ('invoice', 'Invoice'),
        ('service', 'Service'),
        ('report', 'Report'),
    ]
    
    bookmark_type = models.CharField(max_length=20, choices=BOOKMARK_TYPE_CHOICES)
    object_id = models.IntegerField(help_text='ID of the bookmarked object')
    title = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Bookmark: {self.title}"
class Employee(models.Model):
    """
    Employee model for managing staff members
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    join_date = models.DateField(default=timezone.now)
    permissions = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class LedgerEntry(models.Model):
    """
    Immutable double-entry ledger. Every financial event creates one row.
    running_balance is the client's net outstanding AFTER this entry.
    Ledger entries MUST NEVER be updated or deleted.

    Accounting rules:
      debit  (+) increases outstanding: INVOICE, DEBIT_MEMO, ADVANCE_APPLIED
      credit (-) decreases outstanding: PAYMENT, CREDIT_MEMO, ADVANCE_CREATED
    """
    ENTRY_TYPE_CHOICES = [
        ('INVOICE',          'Invoice Created'),
        ('PAYMENT',          'Payment Received'),
        ('CREDIT_MEMO',      'Credit Memo'),
        ('DEBIT_MEMO',       'Debit Memo'),
        ('ADVANCE_CREATED',  'Advance Credit Created'),
        ('ADVANCE_APPLIED',  'Advance Credit Applied'),
    ]

    client      = models.ForeignKey(
        Client, on_delete=models.PROTECT, related_name='ledger_entries'
    )
    entry_type  = models.CharField(max_length=20, choices=ENTRY_TYPE_CHOICES)
    reference   = models.CharField(
        max_length=100, blank=True,
        help_text='Invoice number, payment reference, etc.'
    )
    debit           = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    credit          = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    running_balance = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        help_text='Net outstanding balance after this entry'
    )
    date       = models.DateField(default=timezone.now)
    notes      = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Related objects for full traceability
    related_invoice   = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, null=True, blank=True,
        related_name='ledger_entries'
    )
    related_payment   = models.ForeignKey(
        Payment, on_delete=models.CASCADE, null=True, blank=True,
        related_name='ledger_entries'
    )
    related_credit_tx = models.ForeignKey(
        CreditTransaction, on_delete=models.CASCADE, null=True, blank=True,
        related_name='ledger_entries'
    )

    class Meta:
        ordering = ['date', 'created_at']

    def __str__(self):
        return (
            f"{self.entry_type} | {self.client.name} | "
            f"Dr {self.debit} Cr {self.credit} | Bal {self.running_balance}"
        )

    def save(self, *args, **kwargs):
        """
        Ledger entries are mostly immutable. 
        Update is only allowed if 'allow_recalculate' is in kwargs.
        """
        allow_recalculate = kwargs.pop('allow_recalculate', False)
        if self.pk and not allow_recalculate:
            raise ValueError(
                "LedgerEntry is immutable. Financial records cannot be edited directly."
            )
        super().save(*args, **kwargs)


# ────────────────────────────────────────────────────────────────────────────
# SIGNALS for Ledger Consistency
# ────────────────────────────────────────────────────────────────────────────
import threading
_ledger_balance_lock = threading.local()

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver([post_save, post_delete], sender=Invoice)
@receiver([post_save, post_delete], sender=Payment)
@receiver([post_save, post_delete], sender=CreditTransaction)
def trigger_ledger_rebalance(sender, instance, **kwargs):
    """
    Whenever a core transaction is modified or deleted, 
    rebalance the client's ledger.
    """
    # Simple recursion guard
    if getattr(_ledger_balance_lock, 'is_rebalancing', False):
        return

    client = None
    if isinstance(instance, Invoice):
        client = instance.client
    elif isinstance(instance, Payment):
        client = instance.invoice.client if instance.invoice else None
    elif isinstance(instance, CreditTransaction):
        client = instance.client

    if client:
        try:
            _ledger_balance_lock.is_rebalancing = True
            from .accounting_service import recalculate_ledger_balances
            recalculate_ledger_balances(client)
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Signal failed to rebalance ledger: {e}")
        finally:
            _ledger_balance_lock.is_rebalancing = False
