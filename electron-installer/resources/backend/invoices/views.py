from rest_framework import viewsets, status, exceptions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, ProtectedError, Sum, Count, F, Avg, Max, Min
from django.db.models.functions import TruncMonth
from django.db import transaction
from django.utils import timezone
from datetime import datetime
from .models import Invoice, InvoiceItem, CompanySettings, Client, Payment, Employee, Supplier, ActivityLog
from .serializers import (InvoiceSerializer, InvoiceListSerializer, CompanySettingsSerializer, 
                          EmailHistorySerializer, ClientSerializer, PaymentSerializer, EmployeeSerializer,
                          SupplierSerializer, ActivityLogSerializer)
from .utils import log_activity

class InvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Invoice CRUD operations with search, filter, and sort
    """
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    
    def get_queryset(self):
        """
        Filter and search invoices based on query parameters
        Supported params:
        - search: Search in invoice_number and client_name
        - status: Filter by status
        - date_from: Filter invoices from this date
        - date_to: Filter invoices until this date
        - amount_min: Filter invoices with amount >= this value
        - amount_max: Filter invoices with amount <= this value
        - ordering: Sort by field (prefix with - for descending)
        """
        queryset = Invoice.objects.all()
        
        # Search in invoice number and client name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(invoice_number__icontains=search) | 
                Q(client_name__icontains=search)
            )
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        if date_from:
            try:
                date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(invoice_date__gte=date_from_obj)
            except ValueError:
                pass
        
        date_to = self.request.query_params.get('date_to', None)
        if date_to:
            try:
                date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
                queryset = queryset.filter(invoice_date__lte=date_to_obj)
            except ValueError:
                pass
        
        # Filter by amount range
        amount_min = self.request.query_params.get('amount_min', None)
        if amount_min:
            try:
                queryset = queryset.filter(total_amount__gte=float(amount_min))
            except ValueError:
                pass
        
        amount_max = self.request.query_params.get('amount_max', None)
        if amount_max:
            try:
                queryset = queryset.filter(total_amount__lte=float(amount_max))
            except ValueError:
                pass
        
        # Sorting
        ordering = self.request.query_params.get('ordering', None)
        if ordering:
            # Validate ordering field to prevent SQL injection
            valid_fields = ['invoice_date', 'total_amount', 'invoice_number', 'client_name', 'status', 'created_at']
            order_field = ordering.lstrip('-')
            if order_field in valid_fields:
                queryset = queryset.order_by(ordering)
        
        return queryset
    
    def get_serializer_class(self):
        """Use simplified serializer for list view"""
        if self.action == 'list':
            return InvoiceListSerializer
        return InvoiceSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new invoice"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Log activity
        instance = serializer.instance
        log_activity(
            action='create',
            model_name='Invoice',
            object_id=instance.id,
            description=f"Created invoice {instance.invoice_number} for client {instance.client_name}",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        instance = serializer.save()
        log_activity(
            action='update',
            model_name='Invoice',
            object_id=instance.id,
            description=f"Updated invoice {instance.invoice_number} for client {instance.client_name}",
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

    def perform_destroy(self, instance):
        invoice_number = instance.invoice_number
        client_name = instance.client_name
        invoice_id = instance.id
        instance.delete()
        log_activity(
            action='delete',
            model_name='Invoice',
            object_id=invoice_id,
            description=f"Deleted invoice {invoice_number} for client {client_name}",
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    def update(self, request, *args, **kwargs):
        """Update an existing invoice"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Delete an invoice"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Invoice deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get invoice statistics with optional month filtering"""
        from django.db.models import Sum
        from datetime import datetime
        
        # Get month filter if provided (format: YYYY-MM)
        month_filter = request.query_params.get('month', None)
        
        # Base querysets
        invoices_query = Invoice.objects.all()
        payments_query = Payment.objects.all()
        
        # Apply month filter if provided
        if month_filter:
            try:
                year, month = map(int, month_filter.split('-'))
                invoices_query = invoices_query.filter(
                    invoice_date__year=year,
                    invoice_date__month=month
                )
                payments_query = payments_query.filter(
                    payment_date__year=year,
                    payment_date__month=month
                )
            except (ValueError, AttributeError):
                pass  # Invalid format, ignore filter
        
        total_invoices = invoices_query.count()
        draft_count = invoices_query.filter(status='draft').count()
        sent_count = invoices_query.filter(status='sent').count()
        paid_count = invoices_query.filter(status='paid').count()
        
        # Calculate total revenue from actual payments
        total_revenue = payments_query.aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Calculate total due (outstanding balances)
        all_invoices = invoices_query.all()
        total_due = sum(float(invoice.balance_due) for invoice in all_invoices if invoice.balance_due > 0)
        
        return Response({
            'total_invoices': total_invoices,
            'draft': draft_count,
            'sent': sent_count,
            'paid': paid_count,
            'total_revenue': float(total_revenue),
            'total_due': total_due,
            'month_filter': month_filter
        })


    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export invoices to CSV"""
        try:
            from .export_utils import export_invoices_csv
            return export_invoices_csv()
        except Exception as e:
            import traceback
            return Response({
                'error': str(e),
                'traceback': traceback.format_exc()
            }, status=500)

    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        """Export invoices to Excel"""
        try:
            from .export_utils import export_invoices_excel
            return export_invoices_excel()
        except Exception as e:
            import traceback
            return Response({
                'error': str(e),
                'traceback': traceback.format_exc()
            }, status=500)

    @action(detail=False, methods=['post'])
    def import_invoices(self, request):
        """Import invoices from CSV or Excel"""
        from .import_utils import import_invoices_from_file
        
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        file = request.FILES['file']
        success_count, errors = import_invoices_from_file(file)
        
        return Response({
            'success_count': success_count,
            'errors': errors,
            'message': f'Successfully imported {success_count} invoices.'
        })

    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        """Send invoice via email"""
        invoice = self.get_object()
        recipient_email = request.data.get('email')
        
        if not recipient_email:
            return Response(
                {'error': 'Recipient email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        from .email_utils import send_invoice_email
        # Pass None for user since authentication was removed
        success, message = send_invoice_email(invoice, recipient_email, user=None)
        
        # Log activity
        log_activity(
            action='email',
            model_name='Invoice',
            object_id=invoice.id,
            description=f"Sent invoice {invoice.invoice_number} to {recipient_email} - {'Success' if success else 'Failed: ' + message}",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        if success:
            return Response({'message': message})
        return Response({'error': message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def email_history(self, request, pk=None):
        """Get email history for an invoice"""
        invoice = self.get_object()
        history = invoice.email_history.all()
        serializer = EmailHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def export_revenue(self, request):
        """Export revenue data to Excel"""
        month_filter = request.query_params.get('month', None)
        payments_query = Payment.objects.all()
        
        if month_filter:
            try:
                year, month = map(int, month_filter.split('-'))
                payments_query = payments_query.filter(
                    payment_date__year=year,
                    payment_date__month=month
                )
            except (ValueError, AttributeError):
                pass
        
        payments = payments_query.select_related('invoice').order_by('-payment_date')
        
        from .excel_export import export_revenue_excel
        return export_revenue_excel(payments, month_filter)
    
    @action(detail=False, methods=['get'])
    def export_due(self, request):
        """Export outstanding invoices to Excel"""
        invoices = Invoice.objects.filter(balance_due__gt=0).order_by('due_date')
        
        from .excel_export import export_due_excel
        return export_due_excel(invoices)


class CompanySettingsViewSet(viewsets.ViewSet):
    """
    ViewSet for Company Settings (Singleton)
    Only supports retrieve and update operations
    """
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def list(self, request):
        """Return the singleton company settings instance"""
        settings = CompanySettings.get_instance()
        serializer = CompanySettingsSerializer(settings, context={'request': request})
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """Retrieve company settings (always returns the singleton)"""
        settings = CompanySettings.get_instance()
        serializer = CompanySettingsSerializer(settings, context={'request': request})
        return Response(serializer.data)
    
    def update(self, request, pk=None):
        """Update company settings"""
        settings = CompanySettings.get_instance()
        serializer = CompanySettingsSerializer(
            settings, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Refresh backup scheduler with new settings
        try:
            from .backup_scheduler import refresh_backup_schedule
            refresh_backup_schedule()
        except ImportError:
            # Fallback for different folder structure
            try:
                from backup_scheduler import refresh_backup_schedule
                refresh_backup_schedule()
            except ImportError:
                pass
                
        return Response(serializer.data)
    
    def partial_update(self, request, pk=None):
        """Partial update company settings (for PATCH requests like logo upload)"""
        return self.update(request, pk)


class ClientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Client CRUD operations
    """
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        log_activity(
            action='create',
            model_name='Client',
            object_id=instance.id,
            description=f"Created client {instance.name}",
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        log_activity(
            action='update',
            model_name='Client',
            object_id=instance.id,
            description=f"Updated client {instance.name}",
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

    def perform_destroy(self, instance):
        client_name = instance.name
        client_id = instance.id
        force = self.request.query_params.get('force') == 'true'

        try:
            if force:
                with transaction.atomic():
                    # Manually delete related protected objects
                    instance.ledger_entries.all().delete()
                    instance.invoices.all().delete()
                    instance.credit_transactions.all().delete()
                    instance.wallets.all().delete()
                    if hasattr(instance, 'work_orders'):
                        instance.work_orders.all().delete()
                    if hasattr(instance, 'documents'):
                        instance.documents.all().delete()
                    
                    instance.delete()
            else:
                instance.delete()
        except ProtectedError:
            raise exceptions.ValidationError({
                "detail": f"Cannot delete client '{client_name}' because they have associated ledger entries, invoices, or other financial records. Please delete those records first."
            })
        
        log_activity(
            action='delete',
            model_name='Client',
            object_id=client_id,
            description=f"Deleted client {client_name} (Force: {force})",
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    def get_queryset(self):
        """Filter clients by search query and ensure balances are initialized"""
        queryset = Client.objects.all()
        search = self.request.query_params.get('search', None)
        
        # Trigger balance update for clients with null balances (ensure data reflects in list)
        for client in queryset.filter(Q(debit_balance__isnull=True) | Q(advance_balance__isnull=True)):
            client.update_balance()

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        
        return queryset.order_by('name')
    
    @action(detail=True, methods=['get'])
    def invoices(self, request, pk=None):
        """Get all invoices for a client"""
        client = self.get_object()
        invoices = client.invoices.all().order_by('-invoice_date')
        serializer = InvoiceListSerializer(invoices, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def latest_invoice(self, request, pk=None):
        """Get the most recent invoice with FULL details (including items)"""
        client = self.get_object()
        latest = client.invoices.all().order_by('-invoice_date', '-id').first()
        if not latest:
            return Response(None)
        
        from .serializers import InvoiceSerializer
        serializer = InvoiceSerializer(latest, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_notify(self, request):
        """Send bulk email notifications to multiple clients"""
        from .models import CompanySettings
        from django.core.mail import EmailMessage, get_connection

        client_ids = request.data.get('client_ids', [])
        subject = request.data.get('subject', '').strip()
        message_body = request.data.get('message', '').strip()

        if not client_ids:
            return Response({'error': 'No clients selected'}, status=status.HTTP_400_BAD_REQUEST)
        if not subject or not message_body:
            return Response({'error': 'Subject and message are required'}, status=status.HTTP_400_BAD_REQUEST)

        company_settings = CompanySettings.get_instance()
        company_email = company_settings.company_email
        company_email_password = company_settings.company_email_password
        company_name = company_settings.company_name

        if not company_email or not company_email_password:
            return Response({
                'error': 'Email not configured. Please set Email and App Password in Settings.'
            }, status=status.HTTP_400_BAD_REQUEST)

        clients = Client.objects.filter(id__in=client_ids, email__gt='')

        success_count = 0
        failed_count = 0
        errors = []

        try:
            connection = get_connection(
                backend='django.core.mail.backends.smtp.EmailBackend',
                host='smtp.gmail.com',
                port=587,
                username=company_email,
                password=company_email_password,
                use_tls=True,
                use_ssl=False,
            )
            connection.open()
        except Exception as e:
            return Response({
                'error': f'Cannot connect to email server: {str(e)}. Check your Gmail App Password in Settings.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        for client in clients:
            try:
                personalized_subject = subject.replace('{client_name}', client.name).replace('{company_name}', company_name)
                personalized_body = message_body.replace('{client_name}', client.name).replace('{company_name}', company_name)

                email = EmailMessage(
                    subject=personalized_subject,
                    body=personalized_body,
                    from_email=f"{company_name} <{company_email}>",
                    to=[client.email],
                    connection=connection,
                )
                email.send()
                success_count += 1
            except Exception as e:
                failed_count += 1
                errors.append(f"{client.name} ({client.email}): {str(e)}")

        try:
            connection.close()
        except Exception:
            pass

        return Response({
            'success': success_count,
            'failed': failed_count,
            'errors': errors,
        })

    @action(detail=True, methods=['get'])
    def statement(self, request, pk=None):
        """Generate statement of account for a client"""
        client = self.get_object()
        from django.utils import timezone
        from datetime import timedelta
        
        # Get date range from query params or default to last 30 days
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
        
        if request.query_params.get('start_date'):
            start_date = datetime.strptime(request.query_params['start_date'], '%Y-%m-%d').date()
        if request.query_params.get('end_date'):
            end_date = datetime.strptime(request.query_params['end_date'], '%Y-%m-%d').date()
        
        # Get invoices in date range
        invoices = client.invoices.filter(
            invoice_date__gte=start_date,
            invoice_date__lte=end_date
        ).order_by('invoice_date')
        
        # Calculate aging
        today = timezone.now().date()
        aging = {
            'current': 0,
            'days_30': 0,
            'days_60': 0,
            'days_90_plus': 0
        }
        
        for invoice in invoices:
            if invoice.balance_due > 0 and invoice.due_date:
                days_overdue = (today - invoice.due_date).days
                if days_overdue < 0:
                    aging['current'] += float(invoice.balance_due)
                elif days_overdue < 30:
                    aging['days_30'] += float(invoice.balance_due)
                elif days_overdue < 60:
                    aging['days_60'] += float(invoice.balance_due)
                else:
                    aging['days_90_plus'] += float(invoice.balance_due)

        # Fetch ledger entries for this client in the period
        ledger_entries = client.ledger_entries.filter(
            date__gte=start_date,
            date__lte=end_date
        ).order_by('date')

        # Period Summary calculation
        from django.db.models import Sum
        period_totals = ledger_entries.aggregate(
            invoiced=Sum('debit', filter=Q(entry_type='INVOICE')),
            paid=Sum('credit', filter=Q(entry_type='PAYMENT')),
            debit=Sum('debit'),
            credit=Sum('credit')
        )

        # Serializer class for ledger entries
        class _LedgerEntrySerializer:
            def __init__(self, qs, many=False):
                self.qs = qs
            @property
            def data(self):
                result = []
                for e in self.qs:
                    # Determine related_id and related_type for edit/delete actions
                    if e.related_payment:
                        related_id = e.related_payment.id
                        related_type = 'payment'
                    elif e.related_credit_tx:
                        related_id = e.related_credit_tx.id
                        related_type = 'credit_tx'
                    elif e.related_invoice:
                        related_id = e.related_invoice.id
                        related_type = 'invoice'
                    else:
                        related_id = None
                        related_type = None
                    result.append({
                        'id': e.id,
                        'entry_type': e.entry_type,
                        'entry_type_display': e.get_entry_type_display(),
                        'reference': e.reference or '',
                        'debit': str(e.debit),
                        'credit': str(e.credit),
                        'running_balance': str(e.running_balance),
                        'date': str(e.date),
                        'notes': e.notes or '',
                        'invoice_number': e.related_invoice.invoice_number if e.related_invoice else None,
                        'created_at': str(e.created_at),
                        'related_id': related_id,
                        'related_type': related_type,
                    })
                return result

        from .models import CompanySettings
        cs = CompanySettings.get_instance()

        return Response({
            'client': ClientSerializer(client).data,
            'invoices': InvoiceListSerializer(invoices, many=True).data,
            'aging': aging,
            'total_outstanding': float(client.debit_balance),
            'advance_balance': float(client.advance_balance),
            'period_summary': {
                'total_invoiced': float(period_totals['invoiced'] or 0),
                'total_paid': float(period_totals['paid'] or 0),
                'total_debit': float(period_totals['debit'] or 0),
                'total_credit': float(period_totals['credit'] or 0),
            },
            'date_range': {
                'start': start_date,
                'end': end_date
            },
            'ledger': _LedgerEntrySerializer(ledger_entries).data,
            'company_settings': {
                'company_name': cs.company_name,
                'company_email': cs.company_email,
                'company_mobile': cs.company_mobile,
                'company_phone': cs.company_phone,
                'company_po_box': cs.company_po_box,
                'company_address': cs.company_address,
                'logo_url': cs.logo.url if cs.logo else None,
            }
        })
    
    @action(detail=True, methods=['get'])
    def export_statement(self, request, pk=None):
        """Export client statement to Excel"""
        client = self.get_object()
        from django.utils import timezone
        from datetime import timedelta
        
        # Get date range
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
        
        if request.query_params.get('start_date'):
            start_date = datetime.strptime(request.query_params['start_date'], '%Y-%m-%d').date()
        if request.query_params.get('end_date'):
            end_date = datetime.strptime(request.query_params['end_date'], '%Y-%m-%d').date()
        
        # Get invoices
        invoices = client.invoices.filter(
            invoice_date__gte=start_date,
            invoice_date__lte=end_date
        ).order_by('invoice_date')
        
        # Prepare data
        statement_data = {
            'invoices': InvoiceListSerializer(invoices, many=True).data,
            'total_outstanding': float(client.current_balance),
            'date_range': {
                'start': start_date.strftime('%Y-%m-%d'),
                'end': end_date.strftime('%Y-%m-%d')
            }
        }
        
        from .excel_export import export_client_statement_excel
        return export_client_statement_excel(statement_data, client.name)


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Payment CRUD operations
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        log_activity(
            action='create',
            model_name='Payment',
            object_id=instance.id,
            description=f"Recorded payment of {instance.amount} for invoice {instance.invoice.invoice_number}",
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

    def perform_destroy(self, instance):
        payment_amount = instance.amount
        invoice_number = instance.invoice.invoice_number
        payment_id = instance.id
        instance.delete()
        log_activity(
            action='delete',
            model_name='Payment',
            object_id=payment_id,
            description=f"Deleted payment of {payment_amount} for invoice {invoice_number}",
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
    
    def get_queryset(self):
        """Filter payments by invoice or client"""
        queryset = Payment.objects.all()
        invoice_id = self.request.query_params.get('invoice', None)
        client_id = self.request.query_params.get('client', None)
        
        if invoice_id:
            queryset = queryset.filter(invoice_id=invoice_id)
        
        if client_id:
            queryset = queryset.filter(invoice__client_id=client_id)
        
        return queryset.order_by('-payment_date', '-created_at')
# Add these views to views.py

from rest_framework.decorators import api_view
from django.db.models import Sum, Q, F
from django.utils import timezone
from datetime import timedelta, datetime
from .models import Wallet, Commission, WorkOrder, Expense, CreditTransaction
from .serializers import (
    WalletSerializer, CommissionSerializer, WorkOrderSerializer,
    ExpenseSerializer, CreditTransactionSerializer
)


@api_view(['GET'])
def dashboard_stats(request):
    """
    Get comprehensive dashboard statistics
    """
    today = timezone.now().date()
    
    # Cash Balance - calculated from actual cash payments and expenses
    # Same logic as cash_balance_detail for consistency
    cash_payments = Payment.objects.filter(
        payment_method='cash'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    cash_credit_transactions = CreditTransaction.objects.filter(
        payment_method__icontains='cash',
        transaction_type='credit',
        is_advance=False
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    total_cash_in = float(cash_payments) + float(cash_credit_transactions)
    
    # Cash expenses - include expenses from cash wallets OR expenses with no wallet (default to cash)
    cash_wallet_ids = list(Wallet.objects.filter(
        wallet_type='cash',
        is_active=True
    ).values_list('id', flat=True))
    
    # Include expenses with wallet_id in cash_wallet_ids OR wallet_id is None (default cash)
    from django.db.models import Q
    cash_expenses = Expense.objects.filter(
        Q(wallet_id__in=cash_wallet_ids) | Q(wallet_id__isnull=True)
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Calculate Total Transferred to bank from Cash Box
    total_transferred = Transaction.objects.filter(
        transaction_type='transfer',
        category='cash_transfer'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    cash_balance = total_cash_in - float(cash_expenses) - float(total_transferred)
    
    # Wallet/Clients Total - sum of client wallet balances (advance payments stored in Wallet model)
    # This represents money held in client-specific wallets
    wallet_total = Wallet.objects.filter(
        client__isnull=False,
        is_active=True
    ).aggregate(
        total=Sum('balance')
    )['total'] or 0
    
    # Customer Advance (Credit) - sum of all client advance balances
    # This represents only advance payments (is_advance=true), not all credits
    customer_advance = Client.objects.aggregate(
        total=Sum('advance_balance')
    )['total'] or 0
    
    # Customer Outstanding (Debit) - sum of unpaid invoice balances for 'sent' invoices.
    # Only invoices where client hasn't fully paid count as outstanding debit.
    customer_outstanding = Invoice.objects.filter(
        client__isnull=False,
        status='sent'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    # Subtract payments already made on those invoices
    paid_on_outstanding = Invoice.objects.filter(
        client__isnull=False,
        status='sent'
    ).aggregate(total=Sum('amount_paid'))['total'] or 0
    customer_outstanding = max(float(customer_outstanding) - float(paid_on_outstanding), 0)
    
    # Unsettled Debit & Credit - count of transactions that haven't been settled
    # A transaction is unsettled if settle_amount is null, 0, or less than amount
    unsettled_debit_credit = CreditTransaction.objects.filter(
        Q(settle_amount__isnull=True) | Q(settle_amount__lt=F('amount'))
    ).count()
    
    # Today's Supplier Payments
    today_supplier_payments = Expense.objects.filter(
        date=today,
        category='supplier'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Today's Expenses (All categories except supplier)
    today_expenses = Expense.objects.filter(
        date=today
    ).exclude(
        category='supplier'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Today's Service Transaction (Count of Invoices created today)
    today_service_transactions = Invoice.objects.filter(
        invoice_date=today
    ).count()
    
    # Profit = (total_amount - card_payment) across all invoices, minus all expenses.
    # card_payment represents government/3rd-party fees the company pays out,
    # so actual company revenue = invoice total minus card payments.
    from .models import InvoiceItem as _InvoiceItem
    total_revenue = Invoice.objects.filter(
        status__in=['sent', 'paid']
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    total_card_payments = _InvoiceItem.objects.filter(
        invoice__status__in=['sent', 'paid']
    ).aggregate(total=Sum('card_payment'))['total'] or 0
    total_expenses = Expense.objects.aggregate(total=Sum('amount'))['total'] or 0
    profit = float(total_revenue) - float(total_card_payments) - float(total_expenses)
    
    # Collection (total payments received)
    collection = Payment.objects.filter(payment_date=today).aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # Commission tracking
    total_payable_commission = Commission.objects.filter(is_paid=False).aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    today_commissions = Commission.objects.filter(date=today).aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # Sales Overview - group by service/description
    from django.db.models import Count
    sales_overview = InvoiceItem.objects.values('description').annotate(
        qty=Count('id'),
        amount=Sum('amount')
    ).order_by('-amount')[:10]
    
    # Wallet List
    wallets = Wallet.objects.filter(is_active=True).order_by('name')
    wallet_list = WalletSerializer(wallets, many=True).data
    
    # Balance Summary for chart
    balance_summary = {
        'cash_balance': float(cash_balance),
        'wallet_total': float(wallet_total),
        'outstanding': float(customer_outstanding)
    }
    
    # Recent Work Orders (include Invoices with work_order status)
    wo_objs = WorkOrder.objects.all().order_by('-created_at')[:10]
    inv_objs = Invoice.objects.filter(status='work_order').order_by('-created_at')[:10]
    
    # Combined list
    combined_wo = []
    from .serializers import WorkOrderSerializer
    for wo in wo_objs:
        combined_wo.append(WorkOrderSerializer(wo).data)
    for inv in inv_objs:
        combined_wo.append({
            'id': f'inv_{inv.id}',
            'work_order_number': inv.invoice_number,
            'client_name': inv.client_name,
            'description': inv.notes or f"Service: {inv.invoice_number}",
            'status': 'pending', 
            'total_amount': float(inv.total_amount),
            'start_date': inv.invoice_date.isoformat() if inv.invoice_date else None,
            'due_date': inv.due_date.isoformat() if inv.due_date else None,
            'created_at': inv.created_at.isoformat()
        })
    
    combined_wo.sort(key=lambda x: x['created_at'], reverse=True)
    work_orders_data = combined_wo[:10]
    
    # Commission breakdown
    commission_breakdown = {}
    commissions = Commission.objects.filter(is_paid=False).values('commission_to').annotate(
        total=Sum('amount')
    )
    for comm in commissions:
        commission_breakdown[comm['commission_to']] = float(comm['total'])
    
    return Response({
        'cash_balance': float(cash_balance),
        'wallet_total': float(wallet_total),
        'customer_advance': float(customer_advance),
        'customer_outstanding': float(customer_outstanding),
        'unsettled_debit_credit': unsettled_debit_credit,
        'today_supplier_payments': float(today_supplier_payments),
        'today_expenses': float(today_expenses),
        'today_service_transactions': today_service_transactions,
        'profit': profit,
        'collection': float(collection),
        'total_payable_commission': float(total_payable_commission),
        'today_commissions': float(today_commissions),
        'total_transferred': float(total_transferred),
        'sales_overview': list(sales_overview),
        'wallet_list': wallet_list,
        'balance_summary': balance_summary,
        'work_orders': work_orders_data,
        'commission_breakdown': commission_breakdown
    })


@api_view(['GET'])
def cash_balance_detail(request):
    """
    Get detailed cash balance breakdown showing cash in and cash out
    """
    from django.db.models import Sum
    
    # Cash In - all cash payments received (from Payment model and CreditTransaction model)
    cash_payments = Payment.objects.filter(
        payment_method='cash'
    ).select_related('invoice', 'invoice__client').order_by('-payment_date')
    
    # Also include credit transactions with cash payment method (advance unchecked = payment to invoices)
    cash_credit_transactions = CreditTransaction.objects.filter(
        payment_method__icontains='cash',
        transaction_type='credit',
        is_advance=False  # Only payments to invoices, not advance payments
    ).select_related('client').order_by('-date')
    
    # Cash Out - all expenses from cash wallet OR expenses with no wallet (default to cash)
    cash_wallet_ids = list(Wallet.objects.filter(
        wallet_type='cash',
        is_active=True
    ).values_list('id', flat=True))
    
    from django.db.models import Q
    cash_expenses = Expense.objects.filter(
        Q(wallet_id__in=cash_wallet_ids) | Q(wallet_id__isnull=True)
    ).order_by('-date')
    
    # Cash Transfers (Specific column request)
    cash_transfers = Transaction.objects.filter(
        transaction_type='transfer',
        category='cash_transfer'
    ).order_by('-date')
    
    # Calculate totals
    total_cash_in_payments = cash_payments.aggregate(total=Sum('amount'))['total'] or 0
    total_cash_in_credits = cash_credit_transactions.aggregate(total=Sum('amount'))['total'] or 0
    total_cash_in = float(total_cash_in_payments) + float(total_cash_in_credits)
    
    total_cash_out_expenses = cash_expenses.aggregate(total=Sum('amount'))['total'] or 0
    total_cash_out_transfers = cash_transfers.aggregate(total=Sum('amount'))['total'] or 0
    
    total_cash_out = float(total_cash_out_expenses) + float(total_cash_out_transfers)
    cash_balance = total_cash_in - total_cash_out
    
    # Serialize data
    from .serializers import PaymentSerializer, ExpenseSerializer, CreditTransactionSerializer
    
    # Combine payments and credit transactions for display
    cash_in_data = list(PaymentSerializer(cash_payments, many=True).data)
    
    # Add credit transactions to cash in data
    for ct in cash_credit_transactions:
        cash_in_data.append({
            'id': ct.id,
            'payment_date': ct.date.isoformat(),
            'amount': float(ct.amount),
            'payment_method': ct.payment_method,
            'invoice': None,
            'client_name': ct.client.name,
            'reference': f"Credit Payment - {ct.remarks}" if ct.remarks else "Credit Payment"
        })
    
    # Sort by date descending
    cash_in_data.sort(key=lambda x: x['payment_date'], reverse=True)
    
    return Response({
        'total_cash_in': total_cash_in,
        'total_cash_out': float(total_cash_out),
        'total_transferred': float(total_cash_out_transfers),
        'cash_balance': cash_balance,
        'cash_payments': cash_in_data,
        'cash_expenses': ExpenseSerializer(cash_expenses, many=True).data,
        'cash_transfers': TransactionSerializer(cash_transfers, many=True).data
    })


class WalletViewSet(viewsets.ModelViewSet):
    """ViewSet for Wallet CRUD operations"""
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer
    
    def get_queryset(self):
        queryset = Wallet.objects.all()
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset.order_by('name')


class CommissionViewSet(viewsets.ModelViewSet):
    """ViewSet for Commission CRUD operations"""
    queryset = Commission.objects.all()
    serializer_class = CommissionSerializer
    
    def get_queryset(self):
        queryset = Commission.objects.all()
        is_paid = self.request.query_params.get('is_paid', None)
        if is_paid is not None:
            queryset = queryset.filter(is_paid=is_paid.lower() == 'true')
        return queryset.order_by('-date')
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get commission summary by recipient"""
        from django.db.models import Sum
        summary = Commission.objects.values('commission_to').annotate(
            total=Sum('amount'),
            paid=Sum('amount', filter=Q(is_paid=True)),
            unpaid=Sum('amount', filter=Q(is_paid=False))
        )
        return Response(list(summary))


class WorkOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for WorkOrder CRUD operations"""
    queryset = WorkOrder.objects.all()
    serializer_class = WorkOrderSerializer
    
    def get_queryset(self):
        queryset = WorkOrder.objects.all()
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        
        # Add invoices with status 'work_order'
        status_filter = request.query_params.get('status', None)
        invoices = Invoice.objects.filter(status='work_order')
        
        for inv in invoices:
            # Map status 'work_order' to 'pending' as it matches the frontend category for new work
            mapped_status = 'pending'
            if not status_filter or status_filter == 'all' or status_filter == mapped_status:
                data.append({
                    'id': f'inv_{inv.id}',
                    'work_order_number': inv.invoice_number,
                    'client': inv.client_id,
                    'client_name': inv.client_name,
                    'description': inv.notes or f"Service: {inv.invoice_number}",
                    'status': mapped_status,
                    'total_amount': str(inv.total_amount),
                    'start_date': inv.invoice_date.isoformat() if inv.invoice_date else None,
                    'due_date': inv.due_date.isoformat() if inv.due_date else None,
                    'created_at': inv.created_at.isoformat()
                })
        
        # Sort by created_at descending
        data.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        return Response(data)

    def partial_update(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        if isinstance(pk, str) and pk.startswith('inv_'):
            inv_id = pk.split('_')[1]
            try:
                invoice = Invoice.objects.get(id=inv_id)
                new_status = request.data.get('status')
                
                # Map frontend WO statuses back to Invoice statuses
                # WO Statuses: pending, in_progress, completed, cancelled
                # Invoice Statuses: work_order, sent, paid, cancelled
                status_map = {
                    'pending': 'work_order',
                    'in_progress': 'work_order', # Keep as work_order
                    'completed': 'sent',       # Move to sent if completed
                    'cancelled': 'cancelled'
                }
                
                if new_status in status_map:
                    invoice.status = status_map[new_status]
                    invoice.save()
                    return Response({'status': 'Invoice status updated'})
            except Invoice.DoesNotExist:
                return Response({'error': 'Invoice not found'}, status=404)
        
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        if isinstance(pk, str) and pk.startswith('inv_'):
            inv_id = pk.split('_')[1]
            try:
                invoice = Invoice.objects.get(id=inv_id)
                invoice.delete()
                return Response(status=204)
            except Invoice.DoesNotExist:
                return Response({'error': 'Invoice not found'}, status=404)
        
        return super().destroy(request, *args, **kwargs)


class ExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for Expense CRUD operations"""
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    
    def get_queryset(self):
        queryset = Expense.objects.all()
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Date filtering
        date_from = self.request.query_params.get('date_from', None)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        
        date_to = self.request.query_params.get('date_to', None)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset.order_by('-date')


class CreditTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for CreditTransaction CRUD operations"""
    queryset = CreditTransaction.objects.all()
    serializer_class = CreditTransactionSerializer
    
    def get_queryset(self):
        queryset = CreditTransaction.objects.all()
        client_id = self.request.query_params.get('client', None)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        transaction_type = self.request.query_params.get('type', None)
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        
        return queryset.order_by('-date')
# ViewSets for Phase 1 models - Add to views.py

from .models import Service, Lead, Transaction, Document, PaymentLink, ActivityLog, Bookmark
from .serializers import (
    ServiceSerializer, LeadSerializer, TransactionSerializer,
    DocumentSerializer, PaymentLinkSerializer, ActivityLogSerializer, BookmarkSerializer
)


class ServiceViewSet(viewsets.ModelViewSet):
    """ViewSet for Service CRUD operations"""
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    
    def get_queryset(self):
        queryset = Service.objects.all()
        category = self.request.query_params.get('category', None)
        is_active = self.request.query_params.get('is_active', None)
        search = self.request.query_params.get('search', None)
        
        if category:
            queryset = queryset.filter(category=category)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('category', 'name')


class LeadViewSet(viewsets.ModelViewSet):
    """ViewSet for Lead CRUD operations"""
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    
    def get_queryset(self):
        queryset = Lead.objects.all()
        status_filter = self.request.query_params.get('status', None)
        source = self.request.query_params.get('source', None)
        search = self.request.query_params.get('search', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if source:
            queryset = queryset.filter(source=source)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(company__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        """Convert lead to client"""
        lead = self.get_object()
        if lead.status == 'converted':
            return Response(
                {'error': 'Lead already converted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        client = lead.convert_to_client()
        return Response({
            'message': 'Lead converted successfully',
            'client_id': client.id,
            'client_name': client.name
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get lead statistics"""
        from django.db.models import Count, Sum
        
        stats = {
            'total': Lead.objects.count(),
            'by_status': dict(Lead.objects.values('status').annotate(count=Count('id')).values_list('status', 'count')),
            'by_source': dict(Lead.objects.values('source').annotate(count=Count('id')).values_list('source', 'count')),
            'total_estimated_value': Lead.objects.aggregate(total=Sum('estimated_value'))['total'] or 0,
            'conversion_rate': 0
        }
        
        total_leads = stats['total']
        converted_leads = Lead.objects.filter(status='converted').count()
        if total_leads > 0:
            stats['conversion_rate'] = round((converted_leads / total_leads) * 100, 2)
        
        return Response(stats)


class TransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for Transaction CRUD operations"""
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    
    def get_queryset(self):
        queryset = Transaction.objects.all()
        transaction_type = self.request.query_params.get('type', None)
        category = self.request.query_params.get('category', None)
        wallet_id = self.request.query_params.get('wallet', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        if category:
            queryset = queryset.filter(category=category)
        if wallet_id:
            queryset = queryset.filter(wallet_id=wallet_id)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset.order_by('-date', '-created_at')
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get transaction summary statistics"""
        from django.db.models import Sum
        
        queryset = self.get_queryset()
        
        # Calculate totals by type
        total_income = queryset.filter(transaction_type='income').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        total_expense = queryset.filter(transaction_type='expense').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        net = float(total_income) - float(total_expense)
        
        return Response({
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'net': net,
            'count': queryset.count()
        })


class SupplierViewSet(viewsets.ModelViewSet):
    """ViewSet for Supplier CRUD operations"""
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    
    def get_queryset(self):
        queryset = Supplier.objects.all()
        status = self.request.query_params.get('status', None)
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        
        if status:
            queryset = queryset.filter(status=status)
        if category:
            queryset = queryset.filter(category=category)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        
        return queryset.order_by('name')


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for Document CRUD operations"""
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    
    def get_queryset(self):
        queryset = Document.objects.all()
        category = self.request.query_params.get('category', None)
        client_id = self.request.query_params.get('client', None)
        search = self.request.query_params.get('search', None)
        
        if category:
            queryset = queryset.filter(category=category)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('-uploaded_at')
    
    def perform_create(self, serializer):
        """Set file size on upload"""
        file = self.request.FILES.get('file')
        if file:
            serializer.save(file_size=file.size)
        else:
            serializer.save()


class PaymentLinkViewSet(viewsets.ModelViewSet):
    """ViewSet for PaymentLink CRUD operations"""
    queryset = PaymentLink.objects.all()
    serializer_class = PaymentLinkSerializer
    
    def get_queryset(self):
        queryset = PaymentLink.objects.all()
        status_filter = self.request.query_params.get('status', None)
        invoice_id = self.request.query_params.get('invoice', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if invoice_id:
            queryset = queryset.filter(invoice_id=invoice_id)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark payment link as paid"""
        payment_link = self.get_object()
        payment_link.status = 'paid'
        payment_link.paid_at = timezone.now()
        payment_link.save()
        
        return Response({'message': 'Payment link marked as paid'})


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for ActivityLog (read-only)"""
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    
    def get_queryset(self):
        queryset = ActivityLog.objects.all()
        action = self.request.query_params.get('action', None)
        model_name = self.request.query_params.get('model', None)
        date_from = self.request.query_params.get('date_from', None)
        
        if action:
            queryset = queryset.filter(action=action)
        if model_name:
            queryset = queryset.filter(model_name=model_name)
        if date_from:
            queryset = queryset.filter(timestamp__gte=date_from)
        
        return queryset.order_by('-timestamp')


class BookmarkViewSet(viewsets.ModelViewSet):
    """ViewSet for Bookmark CRUD operations"""
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    
    def get_queryset(self):
        queryset = Bookmark.objects.all()
        bookmark_type = self.request.query_params.get('type', None)
        
        if bookmark_type:
            queryset = queryset.filter(bookmark_type=bookmark_type)
        
        return queryset.order_by('-created_at')


# Reports API Views
@api_view(['GET'])
def revenue_report(request):
    """Generate revenue report"""
    from django.db.models import Sum, Count
    from datetime import datetime
    
    date_from = request.query_params.get('date_from', None)
    date_to = request.query_params.get('date_to', None)
    
    payments = Payment.objects.all()
    if date_from:
        payments = payments.filter(payment_date__gte=date_from)
    if date_to:
        payments = payments.filter(payment_date__lte=date_to)
    
    total_revenue = payments.aggregate(total=Sum('amount'))['total'] or 0
    payment_count = payments.count()
    
    # Group by payment method
    by_method = payments.values('payment_method').annotate(
        total=Sum('amount'),
        count=Count('id')
    )
    
    # Group by month (Postgres and SQLite compatible)
    by_month = payments.annotate(
        month=TruncMonth('payment_date')
    ).values('month').annotate(
        total=Sum('amount'),
        count=Count('id')
    ).order_by('month')
    
    # Format month for response
    month_data = []
    for entry in by_month:
        month_str = entry['month'].strftime('%Y-%m') if entry['month'] else 'Unknown'
        month_data.append({
            'month': month_str,
            'total': float(entry['total']),
            'count': entry['count']
        })
    
    # Detailed collection listing
    detailed_payments = []
    for p in payments.select_related('invoice', 'invoice__client'):
        detailed_payments.append({
            'id': p.id,
            'invoice_id': p.invoice.id if p.invoice else None,
            'invoice_number': p.invoice.invoice_number if p.invoice else 'N/A',
            'client_name': p.invoice.client.name if (p.invoice and p.invoice.client) else (p.invoice.client_name if p.invoice else 'N/A'),
            'amount': float(p.amount),
            'date': p.payment_date.strftime('%Y-%m-%d'),
            'payment_method': p.payment_method
        })

    return Response({
        'total_revenue': float(total_revenue),
        'payment_count': payment_count,
        'by_payment_method': list(by_method),
        'by_month': month_data,
        'payments': detailed_payments,
        'date_range': {
            'from': date_from,
            'to': date_to
        }
    })


@api_view(['GET'])
def expense_report(request):
    """Generate expense report"""
    from django.db.models import Sum, Count
    
    date_from = request.query_params.get('date_from', None)
    date_to = request.query_params.get('date_to', None)
    
    expenses = Expense.objects.all()
    if date_from:
        expenses = expenses.filter(date__gte=date_from)
    if date_to:
        expenses = expenses.filter(date__lte=date_to)
    
    total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or 0
    expense_count = expenses.count()
    
    # Group by category
    by_category = expenses.values('category').annotate(
        total=Sum('amount'),
        count=Count('id')
    )
    
    return Response({
        'total_expenses': float(total_expenses),
        'expense_count': expense_count,
        'by_category': list(by_category),
        'date_range': {
            'from': date_from,
            'to': date_to
        }
    })


@api_view(['GET'])
def payment_history_combined(request):
    """
    Get combined payment history from both Payment and CreditTransaction models
    """
    from .serializers import PaymentSerializer, CreditTransactionSerializer
    
    # Get all payments
    payments = Payment.objects.select_related('invoice', 'invoice__client').all()
    
    # Get all credit transactions (both advance and invoice payments)
    credit_transactions = CreditTransaction.objects.filter(
        transaction_type='credit'
    ).select_related('client').all()
    
    # Combine and format data
    combined_data = []
    
    # Add payments
    for payment in payments:
        combined_data.append({
            'id': f'payment_{payment.id}',
            'payment_date': payment.payment_date.isoformat(),
            'client_name': payment.invoice.client.name if payment.invoice and payment.invoice.client else (payment.invoice.client_name if payment.invoice else 'N/A'),
            'invoice_id': payment.invoice.id if payment.invoice else None,
            'invoice_number': payment.invoice.invoice_number if payment.invoice else 'N/A',
            'amount': float(payment.amount),
            'payment_method': payment.payment_method,
            'reference_number': payment.reference_number or '-',
            'type': 'Invoice Payment',
            'is_advance': False
        })
    
    # Add credit transactions
    for ct in credit_transactions:
        combined_data.append({
            'id': f'credit_{ct.id}',
            'payment_date': ct.date.isoformat(),
            'client_name': ct.client.name,
            'invoice_number': '-',
            'amount': float(ct.amount),
            'payment_method': ct.payment_method,
            'reference_number': ct.remarks or '-',
            'type': 'Advance Payment' if ct.is_advance else 'Credit Payment',
            'is_advance': ct.is_advance
        })
    
    # Sort by date descending
    combined_data.sort(key=lambda x: x['payment_date'], reverse=True)
    
    return Response(combined_data)



@api_view(['GET'])
def profit_loss_report(request):
    """Generate profit & loss report"""
    from django.db.models import Sum
    
    date_from = request.query_params.get('date_from', None)
    date_to = request.query_params.get('date_to', None)
    
    # Revenue = invoice totals minus card_payment (government/3rd-party fees)
    # Only count sent/paid invoices, filtered by invoice_date
    invoices = Invoice.objects.filter(status__in=['sent', 'paid'])
    if date_from:
        invoices = invoices.filter(invoice_date__gte=date_from)
    if date_to:
        invoices = invoices.filter(invoice_date__lte=date_to)
    
    total_invoice_amount = invoices.aggregate(total=Sum('total_amount'))['total'] or 0
    
    # Subtract card payments (government fees paid by the company on behalf of clients)
    from .models import InvoiceItem as _InvoiceItem
    total_card = _InvoiceItem.objects.filter(
        invoice__in=invoices
    ).aggregate(total=Sum('card_payment'))['total'] or 0
    
    total_revenue = float(total_invoice_amount) - float(total_card)
    
    # Expenses
    expenses = Expense.objects.all()
    if date_from:
        expenses = expenses.filter(date__gte=date_from)
    if date_to:
        expenses = expenses.filter(date__lte=date_to)
    
    total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or 0
    
    # Commissions
    commissions = Commission.objects.all()
    if date_from:
        commissions = commissions.filter(date__gte=date_from)
    if date_to:
        commissions = commissions.filter(date__lte=date_to)
    
    total_commissions = commissions.aggregate(total=Sum('amount'))['total'] or 0
    
    # Calculate profit
    gross_profit = total_revenue
    operating_expenses = float(total_expenses) + float(total_commissions)
    net_profit = gross_profit - operating_expenses
    
    profit_margin = 0
    if gross_profit > 0:
        profit_margin = round((net_profit / gross_profit) * 100, 2)
    
    return Response({
        'revenue': {
            'total': gross_profit,
            'invoice_total': float(total_invoice_amount),
            'card_payments_deducted': float(total_card),
        },
        'expenses': {
            'operating': float(total_expenses),
            'commissions': float(total_commissions),
            'total': operating_expenses
        },
        'profit': {
            'gross': gross_profit,
            'net': net_profit,
            'margin_percentage': profit_margin
        },
        'date_range': {
            'from': date_from,
            'to': date_to
        }
    })
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, Count
from datetime import datetime

@api_view(['GET'])
def daily_report(request):
    """Generate daily report for a specific date"""
    date_str = request.GET.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    try:
        report_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({'error': 'Invalid date format'}, status=400)
    
    # Get invoices for the day
    invoices = Invoice.objects.filter(invoice_date=report_date)
    
    # Get payments for the day
    payments = Payment.objects.filter(payment_date=report_date)
    
    # Calculate metrics
    invoice_count = invoices.count()
    total_revenue = payments.aggregate(total=Sum('amount'))['total'] or 0
    payment_count = payments.count()
    
    # Get expenses for the day
    expenses = Expense.objects.filter(date=report_date)
    total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or 0
    expense_count = expenses.count()
    
    # Combined transactions listing (Invoices and Payments)
    transactions = []
    
    # Add invoices
    for inv in invoices:
        transactions.append({
            'id': inv.id,
            'type': 'invoice',
            'invoice_number': inv.invoice_number,
            'client_name': inv.client_name,
            'amount': float(inv.total_amount),
            'status': inv.status,
            'description': 'Invoice Created'
        })
    
    # Add payments
    for p in payments.select_related('invoice', 'invoice__client'):
        transactions.append({
            'id': p.invoice.id if p.invoice else f'payment_{p.id}',
            'type': 'payment',
            'invoice_number': p.invoice.invoice_number if p.invoice else 'N/A',
            'client_name': p.invoice.client.name if (p.invoice and p.invoice.client) else (p.invoice.client_name if p.invoice else 'N/A'),
            'amount': float(p.amount),
            'status': 'PAID',
            'description': f'Payment Received ({p.payment_method})'
        })

    # Sort by amount descending or keep order
    transactions.sort(key=lambda x: x['amount'], reverse=True)
    
    return Response({
        'date': date_str,
        'invoice_count': invoice_count,
        'total_revenue': float(total_revenue),
        'total_expenses': float(total_expenses),
        'payment_count': payment_count,
        'expense_count': expense_count,
        'invoices': transactions
    })

@api_view(['GET'])
def expense_report(request):
    """Generate expense report"""
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    expenses = Expense.objects.all()
    
    if date_from:
        expenses = expenses.filter(date__gte=date_from)
    if date_to:
        expenses = expenses.filter(date__lte=date_to)
        
    total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or 0
    expense_count = expenses.count()
    
    # Group by category
    by_category = expenses.values('category').annotate(
        total=Sum('amount'),
        count=Count('id')
    ).order_by('-total')
    
    return Response({
        'total_expenses': float(total_expenses),
        'expense_count': expense_count,
        'by_category': list(by_category),
        'date_range': {
            'from': date_from,
            'to': date_to
        }
    })

@api_view(['GET'])
def cash_book_report(request):
    """Generate cash book report"""
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    # Get all payments
    payments = Payment.objects.all()
    
    if date_from:
        try:
            from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
            payments = payments.filter(payment_date__gte=from_date)
        except ValueError:
            pass
    
    if date_to:
        try:
            to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
            payments = payments.filter(payment_date__lte=to_date)
        except ValueError:
            pass
    
    # Get all expenses (Cash Out)
    expenses = Expense.objects.all()
    
    if date_from:
        try:
            from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
            expenses = expenses.filter(date__gte=from_date)
        except ValueError:
            pass
            
    if date_to:
        try:
            to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
            expenses = expenses.filter(date__lte=to_date)
        except ValueError:
            pass

    # Calculate totals
    cash_in = payments.aggregate(total=Sum('amount'))['total'] or 0
    cash_out = expenses.aggregate(total=Sum('amount'))['total'] or 0
    
    # Build transaction list
    transactions = []
    
    # Combine payments and expenses
    all_transactions = []
    
    for payment in payments:
        all_transactions.append({
            'date': payment.payment_date,
            'description': f"Payment for Invoice {payment.invoice.invoice_number}" if payment.invoice else "Payment",
            'type': 'in',
            'amount': float(payment.amount),
            'sort_date': payment.payment_date
        })
        
    for expense in expenses:
        all_transactions.append({
            'date': expense.date,
            'description': f"Expense: {expense.description} ({expense.category})",
            'type': 'out',
            'amount': float(expense.amount),
            'sort_date': expense.date
        })
        
    # Sort by date
    all_transactions.sort(key=lambda x: x['sort_date'])
    
    running_balance = 0
    for txn in all_transactions:
        if txn['type'] == 'in':
            running_balance += txn['amount']
            cash_in_val = txn['amount']
            cash_out_val = 0
        else:
            running_balance -= txn['amount']
            cash_in_val = 0
            cash_out_val = txn['amount']
            
        transactions.append({
            'date': txn['date'].strftime('%Y-%m-%d'),
            'description': txn['description'],
            'type': txn['type'],
            'cash_in': cash_in_val,
            'cash_out': cash_out_val,
            'balance': running_balance
        })
    
    return Response({
        'cash_in': float(cash_in),
        'cash_out': float(cash_out),
        'balance': running_balance,
        'transactions': transactions
    })

@api_view(['GET'])
def item_wise_report(request):
    """Generate item-wise sales report"""
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    # Get all invoice items
    items = InvoiceItem.objects.all()
    
    if date_from or date_to:
        invoices = Invoice.objects.all()
        if date_from:
            try:
                from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                invoices = invoices.filter(invoice_date__gte=from_date)
            except ValueError:
                pass
        
        if date_to:
            try:
                to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
                invoices = invoices.filter(invoice_date__lte=to_date)
            except ValueError:
                pass
        
        items = items.filter(invoice__in=invoices)
    
    # Group by description
    from django.db.models import Avg
    item_summary = items.values('description').annotate(
        quantity=Sum('quantity'),
        avg_rate=Avg('rate'),
        total_value=Sum('amount')
    )
    
    total_items = item_summary.count()
    total_quantity = items.aggregate(total=Sum('quantity'))['total'] or 0
    total_value = items.aggregate(total=Sum('amount'))['total'] or 0
    
    return Response({
        'total_items': total_items,
        'total_quantity': total_quantity,
        'total_value': float(total_value),
        'items': list(item_summary)
    })


@api_view(['GET'])
def supplier_report(request):
    """Generate supplier report"""
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    suppliers = Supplier.objects.all()
    
    supplier_data = []
    for supp in suppliers:
        # Calculate purchased amount (expenses)
        expenses = Expense.objects.filter(category='supplier', description__icontains=supp.name)
        
        # Apply date filter if provided
        if date_from:
            expenses = expenses.filter(date__gte=date_from)
        if date_to:
            expenses = expenses.filter(date__lte=date_to)
            
        purchases = expenses.aggregate(total=Sum('amount'))['total'] or 0
        
        supplier_data.append({
            'name': supp.name,
            'category': supp.category,
            'balance': float(supp.balance),
            'status': supp.status,
            'total_purchases': float(purchases)
        })
        
    return Response({
        'suppliers': supplier_data,
        'total_payable': sum(d['balance'] for d in supplier_data)
    })

@api_view(['GET'])
def salary_report(request):
    """Generate salary report"""
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    expenses = Expense.objects.filter(category='salary')
    if date_from:
        expenses = expenses.filter(date__gte=date_from)
    if date_to:
        expenses = expenses.filter(date__lte=date_to)
        
    salary_data = []
    for exp in expenses:
        salary_data.append({
            'description': exp.description,
            'date': exp.date,
            'amount': float(exp.amount),
            'payment_method': 'Bank Transfer' # helper logic needed if not stored
        })
        
    total_salary = expenses.aggregate(total=Sum('amount'))['total'] or 0
    
    return Response({
        'salaries': salary_data,
        'total_salary': float(total_salary)
    })

@api_view(['GET'])
def commission_report(request):
    """Generate commission report"""
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    commissions = Commission.objects.all().filter(is_paid=False)
    
    if date_from:
        commissions = commissions.filter(date__gte=date_from)
    if date_to:
        commissions = commissions.filter(date__lte=date_to)
    
    commission_data = commissions.values('commission_to').annotate(
        total_amount=Sum('amount'),
        count=Count('id')
    )
    
    return Response({
        'commissions': list(commission_data),
        'total_payable': sum(d['total_amount'] for d in commission_data)
    })

@api_view(['GET'])
def invoice_report(request):
    """Generate invoice/draft report"""
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    status = request.GET.get('status')
    
    invoices = Invoice.objects.all()
    if date_from:
        invoices = invoices.filter(invoice_date__gte=date_from)
    if date_to:
        invoices = invoices.filter(invoice_date__lte=date_to)
    if status:
        invoices = invoices.filter(status=status)
        
    invoice_data = []
    for inv in invoices:
        invoice_data.append({
            'invoice_number': inv.invoice_number,
            'date': inv.invoice_date,
            'client': inv.client_name,
            'amount': float(inv.total_amount),
            'status': inv.status
        })
        
    return Response({
        'invoices': invoice_data,
        'count': len(invoice_data),
        'total_amount': sum(d['amount'] for d in invoice_data)
    })


class EmployeeViewSet(viewsets.ModelViewSet):
    """ViewSet for Employee CRUD operations"""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    
    def get_queryset(self):
        queryset = Employee.objects.all()
        status_filter = self.request.query_params.get('status', None)
        role = self.request.query_params.get('role', None)
        department = self.request.query_params.get('department', None)
        search = self.request.query_params.get('search', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if role:
            queryset = queryset.filter(role=role)
        if department:
            queryset = queryset.filter(department=department)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search)
            )
        
        return queryset.order_by('name')
