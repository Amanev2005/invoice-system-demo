"""
Script to create sample data for testing the dashboard
Run this with: python manage.py shell < create_sample_data.py
"""

from invoices.models import Client, Wallet, Commission, WorkOrder, Expense, CreditTransaction, Invoice, InvoiceItem
from decimal import Decimal
from datetime import datetime, timedelta

print("Creating sample data...")

# Create Wallets
wallets_data = [
    {'name': 'ADCB', 'balance': Decimal('118296.22'), 'wallet_type': 'bank'},
    {'name': 'ADIB', 'balance': Decimal('0.00'), 'wallet_type': 'bank'},
    {'name': 'FAB', 'balance': Decimal('0.00'), 'wallet_type': 'bank'},
    {'name': 'MASHREQ', 'balance': Decimal('-352760.71'), 'wallet_type': 'bank'},
    {'name': 'Swiping Account', 'balance': Decimal('0.00'), 'wallet_type': 'swiping'},
]

for wallet_data in wallets_data:
    wallet, created = Wallet.objects.get_or_create(
        name=wallet_data['name'],
        defaults=wallet_data
    )
    if created:
        print(f"Created wallet: {wallet.name}")
    else:
        # Update balance
        wallet.balance = wallet_data['balance']
        wallet.save()
        print(f"Updated wallet: {wallet.name}")

# Create or update sample clients with balance data
clients_data = [
    {
        'name': 'BS MOBILES AND ELOCTRONC TRADING LLC',
        'email': 'bs@example.com',
        'phone': '050-1234567',
        'credit_balance': Decimal('5000.00'),
        'debit_balance': Decimal('2000.00'),
    },
    {
        'name': 'ABBAS CONSTRUCTION EQUIPMENT RENTAL L L C',
        'email': 'abbas@example.com',
        'phone': '050-2345678',
        'credit_balance': Decimal('3000.00'),
        'debit_balance': Decimal('1500.00'),
    },
    {
        'name': 'IKKAS TASTY KITCHEN AND RESTAURANT',
        'email': 'ikkas@example.com',
        'phone': '050-3456789',
        'credit_balance': Decimal('2000.00'),
        'debit_balance': Decimal('500.00'),
    },
    {
        'name': 'NEUTRON ENERGY SOLUTION LLC',
        'email': 'neutron@example.com',
        'phone': '050-4567890',
        'credit_balance': Decimal('4000.00'),
        'debit_balance': Decimal('3000.00'),
    },
    {
        'name': 'FENGO METALS ENGINEERING',
        'email': 'fengo@example.com',
        'phone': '050-5678901',
        'credit_balance': Decimal('1000.00'),
        'debit_balance': Decimal('800.00'),
    },
]

for client_data in clients_data:
    client, created = Client.objects.get_or_create(
        name=client_data['name'],
        defaults=client_data
    )
    if not created:
        # Update balances
        client.credit_balance = client_data['credit_balance']
        client.debit_balance = client_data['debit_balance']
        client.save()
    print(f"{'Created' if created else 'Updated'} client: {client.name}")

# Create Work Orders
clients = Client.objects.all()
if clients.exists():
    work_orders_data = [
        {'client': clients[0], 'count': 0, 'total_count': 1, 'description': 'Mobile repair service'},
        {'client': clients[1], 'count': 2, 'total_count': 6, 'description': 'Equipment rental'},
        {'client': clients[2], 'count': 0, 'total_count': 3, 'description': 'Restaurant setup'},
        {'client': clients[3], 'count': 0, 'total_count': 5, 'description': 'Energy solution installation'},
        {'client': clients[4], 'count': 0, 'total_count': 7, 'description': 'Metal engineering work'},
        {'client': clients[0], 'count': 2, 'total_count': 6, 'description': 'Additional mobile services'},
        {'client': clients[1], 'count': 0, 'total_count': 1, 'description': 'Construction equipment'},
        {'client': clients[2], 'count': 11, 'total_count': 11, 'description': 'Kitchen equipment'},
    ]
    
    for wo_data in work_orders_data:
        wo = WorkOrder.objects.create(**wo_data)
        print(f"Created work order: {wo.work_order_number}")

# Create sample expenses
today = datetime.now().date()
expenses_data = [
    {'description': 'Office supplies', 'amount': Decimal('500.00'), 'category': 'general', 'date': today},
    {'description': 'Supplier payment', 'amount': Decimal('1000.00'), 'category': 'supplier', 'date': today},
    {'description': 'Service fee', 'amount': Decimal('750.00'), 'category': 'service', 'date': today},
]

for expense_data in expenses_data:
    expense = Expense.objects.create(**expense_data)
    print(f"Created expense: {expense.description}")

# Create sample invoices with commissions
if clients.exists():
    # Create a few invoices
    for i, client in enumerate(clients[:3]):
        invoice = Invoice.objects.create(
            client=client,
            client_name=client.name,
            invoice_date=today - timedelta(days=i),
            subtotal=Decimal('1000.00'),
            total_amount=Decimal('1000.00'),
            status='sent'
        )
        
        # Add invoice items
        InvoiceItem.objects.create(
            invoice=invoice,
            description='LABOUR CARD',
            quantity=1,
            rate=Decimal('590.00'),
            amount=Decimal('590.00')
        )
        
        InvoiceItem.objects.create(
            invoice=invoice,
            description='IMMIGRATION CARD',
            quantity=1,
            rate=Decimal('590.00'),
            amount=Decimal('590.00')
        )
        
        # Create commissions
        commission_types = ['ASCR', 'SAR', 'VIVOMED2']
        Commission.objects.create(
            invoice=invoice,
            commission_to=commission_types[i % 3],
            amount=Decimal('50.00'),
            is_paid=False
        )
        
        print(f"Created invoice: {invoice.invoice_number} with commission")

print("\nSample data creation complete!")
print(f"Created {Wallet.objects.count()} wallets")
print(f"Created {Client.objects.count()} clients")
print(f"Created {WorkOrder.objects.count()} work orders")
print(f"Created {Expense.objects.count()} expenses")
print(f"Created {Commission.objects.count()} commissions")
