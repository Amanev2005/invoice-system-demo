from rest_framework import serializers
import os
from django.conf import settings as django_settings
from .models import (
    Invoice, InvoiceItem, CompanySettings, EmailHistory, Client, Payment,
    Wallet, Commission, WorkOrder, WorkOrderItem, Expense, CreditTransaction,
    Service, Lead, Transaction, Document, PaymentLink, ActivityLog, Bookmark,
    Employee, Supplier, LedgerEntry
)
from decimal import Decimal
from datetime import timedelta

class EmailHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailHistory
        fields = ['id', 'recipient_email', 'status', 'error_message', 'sent_at']
        read_only_fields = fields

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['id', 'description', 'quantity', 'rate', 'amount', 'card_payment', 'payment_done']
        read_only_fields = ['amount']
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate_rate(self, value):
        if value < 0:
            raise serializers.ValidationError("Rate cannot be negative")
        return value

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    client = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        required=False,
        allow_null=True
    )
    balance_due = serializers.SerializerMethodField()
    
    # Write-only fields for commission creation
    commission_to = serializers.CharField(write_only=True, required=False, allow_blank=True)
    commission_amount = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'invoice_date', 'due_date', 'client', 'client_name',
            'company_name', 'company_email', 'company_mobile', 'company_phone',
            'company_po_box', 'company_address', 'payment_method',
            'subtotal', 'total_amount', 'amount_paid', 'balance_due', 'total_in_words', 
            'notes', 'status', 'created_at', 'updated_at', 'items',
            'commission_to', 'commission_amount'
        ]
        read_only_fields = ['subtotal', 'total_amount', 'amount_paid', 'created_at', 'updated_at']
        extra_kwargs = {
            'due_date': {'required': False, 'allow_null': True},
        }
    
    def get_balance_due(self, obj):
        """Calculate balance due"""
        return obj.balance_due

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Extract commission data
        commission_to = validated_data.pop('commission_to', None)
        commission_amount = validated_data.pop('commission_amount', None)
        
        # Create invoice without items first
        invoice = Invoice.objects.create(**validated_data)
        
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
            
        invoice.calculate_total()
        
        # Handle commission
        if commission_to and commission_amount:
            Commission.objects.create(
                invoice=invoice,
                commission_to=commission_to,
                amount=commission_amount
            )
            
        return invoice
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Extract commission data
        commission_to = validated_data.pop('commission_to', None)
        commission_amount = validated_data.pop('commission_amount', None)
        
        # Update invoice fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update items if provided
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InvoiceItem.objects.create(invoice=instance, **item_data)
            
            instance.save()
        
        return instance

class InvoiceListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing invoices"""
    items_count = serializers.SerializerMethodField()
    balance_due = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'invoice_date', 'due_date', 'client', 'client_name',
            'total_amount', 'amount_paid', 'balance_due', 'status', 'items_count', 'created_at'
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()
    
    def get_balance_due(self, obj):
        """Calculate balance due"""
        return obj.balance_due


class CompanySettingsSerializer(serializers.ModelSerializer):
    """Serializer for company settings"""
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanySettings
        fields = [
            'id', 'company_name', 'company_email', 'company_email_password',
            'company_mobile', 'company_phone', 'company_po_box', 'company_address',
            'about_company', 'logo', 'logo_url',
            'default_credit_terms', 'aging_period_1', 'aging_period_2', 
            'aging_period_3', 'soa_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['logo_url', 'created_at', 'updated_at']

    
    def get_logo_url(self, obj):
        """Return full URL for logo if it exists"""
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            
            # Fallback to reconstructing URL if request is not available
            from django.conf import settings
            # Try to get backend URL from env, otherwise default to localhost:8000
            backend_url = os.getenv('BACKEND_URL', 'http://127.0.0.1:8000').rstrip('/')
            return f"{backend_url}{obj.logo.url}"
        return None


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for Client model"""
    invoice_count = serializers.SerializerMethodField()
    overdue_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'phone', 'address',
            'trn_no', 'vat_no',
            'credit_limit', 'credit_terms', 'current_balance',
            'credit_balance', 'debit_balance', 'advance_balance',
            'invoice_count', 'overdue_amount',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['current_balance', 'credit_balance', 'debit_balance', 'advance_balance', 'created_at', 'updated_at']
    
    def get_invoice_count(self, obj):
        return obj.invoices.count()
    
    def get_overdue_amount(self, obj):
        """Calculate total overdue amount for this client"""
        from django.utils import timezone
        overdue_invoices = obj.invoices.filter(
            due_date__lt=timezone.now().date(),
            status__in=['draft', 'sent']
        )
        return sum(invoice.balance_due for invoice in overdue_invoices)


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    client_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'invoice', 'invoice_number', 'client_name',
            'amount', 'payment_date', 'payment_method',
            'reference_number', 'notes', 'created_at', 'created_by'
        ]
        read_only_fields = ['created_at']
    
    def get_client_name(self, obj):
        if obj.invoice.client:
            return obj.invoice.client.name
        return obj.invoice.client_name
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than 0")
        return value

# Add these serializers to the end of serializers.py

class WalletSerializer(serializers.ModelSerializer):
    """Serializer for Wallet model"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    
    class Meta:
        model = Wallet
        fields = [
            'id', 'name', 'bank_name', 'balance', 'wallet_type', 'is_active',
            'client', 'client_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class CommissionSerializer(serializers.ModelSerializer):
    """Serializer for Commission model"""
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    client_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Commission
        fields = [
            'id', 'invoice', 'invoice_number', 'client_name',
            'commission_to', 'amount', 'is_paid', 'payment_date',
            'date', 'created_at'
        ]
        read_only_fields = ['date', 'created_at']
    
    def get_client_name(self, obj):
        if obj.invoice.client:
            return obj.invoice.client.name
        return obj.invoice.client_name


class WorkOrderItemSerializer(serializers.ModelSerializer):
    """Serializer for WorkOrderItem"""
    class Meta:
        model = WorkOrderItem
        fields = ['id', 'description', 'quantity', 'rate', 'amount']


class WorkOrderSerializer(serializers.ModelSerializer):
    """Serializer for WorkOrder with nested items"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    items = WorkOrderItemSerializer(many=True, required=False)
    
    class Meta:
        model = WorkOrder
        fields = [
            'id', 'work_order_number', 'client', 'client_name',
            'status', 'count', 'total_count', 'description',
            'start_date', 'due_date',
            'subtotal', 'total_amount', 'notes', 'payment_method',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['work_order_number', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        work_order = WorkOrder.objects.create(**validated_data)
        
        for item_data in items_data:
            WorkOrderItem.objects.create(work_order=work_order, **item_data)
        
        # Calculate total
        if items_data:
            work_order.calculate_total()
        return work_order
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update work order fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update items if provided
        if items_data is not None:
            # Delete existing items
            instance.items.all().delete()
            
            # Create new items
            for item_data in items_data:
                WorkOrderItem.objects.create(work_order=instance, **item_data)
            
            # Recalculate total
            instance.calculate_total()
        
        return instance


class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for Expense model"""
    wallet_name = serializers.CharField(source='wallet.name', read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'description', 'amount', 'category', 'date',
            'wallet', 'wallet_name', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Expense amount must be greater than 0")
        return value


class CreditTransactionSerializer(serializers.ModelSerializer):
    """Serializer for CreditTransaction model"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    
    class Meta:
        model = CreditTransaction
        fields = [
            'id', 'client', 'client_name', 'transaction_type',
            'amount', 'date', 'is_advance', 'payment_method',
            'remarks', 'settle_amount', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Transaction amount must be greater than 0")
        return value
# Serializers for Phase 1 models - Add to serializers.py

class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service model"""
    
    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description', 'default_price', 'category',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class LeadSerializer(serializers.ModelSerializer):
    """Serializer for Lead model"""
    converted_client_name = serializers.CharField(source='converted_client.name', read_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'source', 'status',
            'notes', 'estimated_value', 'converted_client', 'converted_client_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'converted_client']
    
    def validate_estimated_value(self, value):
        if value < 0:
            raise serializers.ValidationError("Estimated value cannot be negative")
        return value


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    wallet_name = serializers.CharField(source='wallet.name', read_only=True)
    invoice_number = serializers.CharField(source='related_invoice.invoice_number', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_type', 'amount', 'category', 'description',
            'date', 'wallet', 'wallet_name', 'related_invoice', 'invoice_number',
            'related_payment', 'related_expense', 'reference_number', 'notes',
            'created_at'
        ]
        read_only_fields = ['created_at']
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document model"""
    client_name = serializers.CharField(source='client.name', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'file', 'file_url', 'category', 'description',
            'client', 'client_name', 'file_size', 'uploaded_at'
        ]
        read_only_fields = ['file_size', 'uploaded_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class PaymentLinkSerializer(serializers.ModelSerializer):
    """Serializer for PaymentLink model"""
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    payment_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentLink
        fields = [
            'id', 'invoice', 'invoice_number', 'link_code', 'amount',
            'status', 'expires_at', 'paid_at', 'payment_url', 'created_at'
        ]
        read_only_fields = ['link_code', 'paid_at', 'created_at']
    
    def get_payment_url(self, obj):
        return obj.get_payment_url()


class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for ActivityLog model"""
    
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'action', 'model_name', 'object_id', 'description',
            'ip_address', 'timestamp'
        ]
        read_only_fields = ['timestamp']


class BookmarkSerializer(serializers.ModelSerializer):
    """Serializer for Bookmark model"""
    
    class Meta:
        model = Bookmark
        fields = [
            'id', 'bookmark_type', 'object_id', 'title', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at']

class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for Employee model"""
    
    class Meta:
        model = Employee
        fields = [
            'id', 'name', 'email', 'role', 'department', 
            'status', 'join_date', 'permissions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class SupplierSerializer(serializers.ModelSerializer):
    """Serializer for Supplier model"""
    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'email', 'phone', 'address', 
            'category', 'balance', 'status', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class LedgerEntrySerializer(serializers.ModelSerializer):
    """Serializer for LedgerEntry - read-only, immutable ledger rows."""
    entry_type_display = serializers.CharField(
        source='get_entry_type_display', read_only=True
    )
    invoice_number = serializers.CharField(
        source='related_invoice.invoice_number', read_only=True
    )
    related_id = serializers.SerializerMethodField()
    related_type = serializers.SerializerMethodField()

    def get_related_id(self, obj):
        if obj.related_invoice: return obj.related_invoice.id
        if obj.related_payment: return obj.related_payment.id
        if obj.related_credit_tx: return obj.related_credit_tx.id
        return None

    def get_related_type(self, obj):
        if obj.related_invoice: return 'invoice'
        if obj.related_payment: return 'payment'
        if obj.related_credit_tx: return 'credit_tx'
        return None

    class Meta:
        model = LedgerEntry
        fields = [
            'id', 'entry_type', 'entry_type_display', 'reference',
            'debit', 'credit', 'running_balance',
            'date', 'notes', 'invoice_number', 'created_at',
            'related_id', 'related_type'
        ]
        read_only_fields = fields
