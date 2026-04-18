from django.core.management.base import BaseCommand
from invoices.models import Client, Wallet, Commission, WorkOrder, Expense, CreditTransaction, Invoice, InvoiceItem
from decimal import Decimal
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = 'Create sample data for testing the dashboard'

    def handle(self, *args, **kwargs):
        self.stdout.write("Creating sample data...")

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
                self.stdout.write(self.style.SUCCESS(f"Created wallet: {wallet.name}"))
            else:
                wallet.balance = wallet_data['balance']
                wallet.save()
                self.stdout.write(self.style.SUCCESS(f"Updated wallet: {wallet.name}"))

        # Create or update sample clients
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
        ]

        for client_data in clients_data:
            client, created = Client.objects.get_or_create(
                name=client_data['name'],
                defaults=client_data
            )
            if not created:
                client.credit_balance = client_data['credit_balance']
                client.debit_balance = client_data['debit_balance']
                client.save()
            self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Updated'} client: {client.name}"))

        # Create Work Orders
        clients = Client.objects.all()
        if clients.exists():
            work_orders_data = [
                {'client': clients[0], 'count': 0, 'total_count': 1},
                {'client': clients[1], 'count': 2, 'total_count': 6},
            ]
            
            for wo_data in work_orders_data:
                wo = WorkOrder.objects.create(**wo_data)
                self.stdout.write(self.style.SUCCESS(f"Created work order: {wo.work_order_number}"))

        # Create sample expenses
        today = datetime.now().date()
        Expense.objects.create(description='Supplier payment', amount=Decimal('1000.00'), category='supplier', date=today)
        Expense.objects.create(description='Service fee', amount=Decimal('750.00'), category='service', date=today)
        
        self.stdout.write(self.style.SUCCESS("\nSample data creation complete!"))
