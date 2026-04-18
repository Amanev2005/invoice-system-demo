from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InvoiceViewSet, CompanySettingsViewSet, ClientViewSet, PaymentViewSet,
    WalletViewSet, CommissionViewSet, WorkOrderViewSet, ExpenseViewSet,
    CreditTransactionViewSet, dashboard_stats, cash_balance_detail,
    ServiceViewSet, LeadViewSet, TransactionViewSet, DocumentViewSet,
    PaymentLinkViewSet, ActivityLogViewSet, BookmarkViewSet,
    revenue_report, expense_report, profit_loss_report,
    daily_report, cash_book_report, item_wise_report,
    supplier_report, salary_report, commission_report, invoice_report,
    EmployeeViewSet, SupplierViewSet, payment_history_combined
)
from .authentication import forgot_password
from .backup_views import BackupViewSet

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'settings', CompanySettingsViewSet, basename='settings')
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'wallets', WalletViewSet, basename='wallet')
router.register(r'commissions', CommissionViewSet, basename='commission')
router.register(r'work-orders', WorkOrderViewSet, basename='work-order')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'credit-transactions', CreditTransactionViewSet, basename='credit-transaction')
router.register(r'suppliers', SupplierViewSet, basename='supplier')

# Phase 1 routes
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'payment-links', PaymentLinkViewSet, basename='payment-link')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-log')
router.register(r'bookmarks', BookmarkViewSet, basename='bookmark')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'backups', BackupViewSet, basename='backup')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('cash-balance/detail/', cash_balance_detail, name='cash-balance-detail'),
    path('payment-history-combined/', payment_history_combined, name='payment-history-combined'),
    path('auth/forgot-password/', forgot_password, name='forgot-password'),
    
    # Report endpoints
    path('reports/revenue/', revenue_report, name='revenue-report'),
    path('reports/expenses/', expense_report, name='expense-report'),
    path('reports/profit-loss/', profit_loss_report, name='profit-loss-report'),
    path('reports/daily/', daily_report, name='daily-report'),
    path('reports/cash-book/', cash_book_report, name='cash-book-report'),
    path('reports/item-wise/', item_wise_report, name='item-wise-report'),
    path('reports/supplier/', supplier_report, name='supplier-report'),
    path('reports/salary/', salary_report, name='salary-report'),
    path('reports/commission/', commission_report, name='commission-report'),
    path('reports/invoices/', invoice_report, name='invoice-report'),
]
