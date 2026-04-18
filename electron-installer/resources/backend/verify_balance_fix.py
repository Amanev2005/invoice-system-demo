import os
import django
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from invoices.models import Client, Invoice, LedgerEntry
from django.utils import timezone

def test_balance_sync_on_delete():
    print("Starting balance sync verification...")
    
    # 1. Create a test client
    client = Client.objects.create(name="Test Sync Client", credit_limit=1000)
    print(f"Created client: {client.name}, Initial Balance: {client.debit_balance}")
    
    # 2. Create an invoice
    invoice = Invoice.objects.create(
        client=client,
        client_name=client.name,
        invoice_number="TEST-SYNC-001",
        invoice_date=timezone.now().date(),
        total_amount=Decimal('500.00'),
        status='sent'
    )
    print(f"Created invoice: {invoice.invoice_number}, Amount: {invoice.total_amount}")
    
    # Refresh client from DB
    client.refresh_from_db()
    print(f"Balance after invoice: {client.debit_balance}")
    
    if client.debit_balance != Decimal('500.00'):
        print("ERROR: Balance not updated after invoice creation!")
        return False

    # Check ledger
    entries = LedgerEntry.objects.filter(client=client)
    print(f"Ledger entries count: {entries.count()}")
    if entries.count() == 0:
        print("ERROR: No ledger entry created!")
        return False
        
    # 3. Delete the invoice
    print("Deleting invoice...")
    invoice.delete()
    
    # Refresh client from DB
    client.refresh_from_db()
    print(f"Balance after deletion: {client.debit_balance}")
    
    # Check ledger again
    entries = LedgerEntry.objects.filter(client=client)
    print(f"Ledger entries count after deletion: {entries.count()}")
    
    if client.debit_balance != Decimal('0.00'):
        print("ERROR: Balance not reset after invoice deletion!")
        return False
        
    if entries.count() != 0:
        print("ERROR: Ledger entry not removed after deletion!")
        return False

    # Cleanup
    client.delete()
    print("Verification SUCCESS!")
    return True

if __name__ == "__main__":
    test_balance_sync_on_delete()
