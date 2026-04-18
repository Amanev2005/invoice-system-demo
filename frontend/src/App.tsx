import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/InvoiceList';
import CreateInvoice from './pages/CreateInvoice';
import EditInvoice from './pages/EditInvoice';
import ViewInvoice from './pages/ViewInvoice';
import PaymentHistory from './pages/PaymentHistory';
import Settings from './pages/Settings';
import Clients from './pages/Clients';
import ClientStatement from './pages/ClientStatement';
import Drafts from './pages/Drafts';
import QuotationList from './pages/QuotationList';
import Services from './pages/Services';
import Leads from './pages/Leads';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import WorkOrders from './pages/WorkOrders';
import NotifyClient from './pages/NotifyClient';
import StaffPortal from './pages/StaffPortal';
import ActivityLog from './pages/ActivityLog';
import Suppliers from './pages/Suppliers';
import Expenses from './pages/Expenses';
import Commissions from './pages/Commissions';
import WalletsBanks from './pages/WalletsBanks';
import CashBalanceDetail from './pages/CashBalanceDetail';
import CustomerAdvance from './pages/CustomerAdvance';
import Backup from './pages/Backup';
import CashBookReport from './pages/reports/CashBookReport';
import DailyReport from './pages/reports/DailyReport';
import ItemWiseReport from './pages/reports/ItemWiseReport';
import CommissionPayableReport from './pages/reports/CommissionPayableReport';
import {
    InvoiceReceiptReport,
    DailySheetReport,
    InvoiceDraftReport,
    UserCommissionReport,
    SupplierCommissionReport,
    DividendReport,
    QuantityReport,
    UserWiseQtyReport,
    SalaryReport,
    WalletBankReport,
    SupplierReport,
    CollectionReport,
    ExpenseReport
} from './pages/reports/GenericReports';

function App() {
    return (
        <HashRouter>
            <Routes>
                {/* Dashboard */}
                <Route path="/" element={
                    <Layout>
                        <Dashboard />
                    </Layout>
                } />

                {/* Invoices */}
                <Route path="/invoices" element={
                    <Layout>
                        <InvoiceList />
                    </Layout>
                } />
                <Route path="/invoices/create" element={
                    <Layout>
                        <CreateInvoice />
                    </Layout>
                } />
                <Route path="/invoices/:id" element={
                    <Layout>
                        <ViewInvoice />
                    </Layout>
                } />
                <Route path="/invoices/:id/edit" element={
                    <Layout>
                        <EditInvoice />
                    </Layout>
                } />

                {/* Payment History */}
                <Route path="/payment-history" element={
                    <Layout>
                        <PaymentHistory />
                    </Layout>
                } />

                {/* Drafts */}
                <Route path="/drafts" element={
                    <Layout>
                        <Drafts />
                    </Layout>
                } />

                {/* Quotations */}
                <Route path="/quotations" element={
                    <Layout>
                        <QuotationList />
                    </Layout>
                } />
                <Route path="/quotations/create" element={
                    <Layout>
                        <CreateInvoice />
                    </Layout>
                } />

                {/* Clients */}
                <Route path="/clients" element={
                    <Layout>
                        <Clients />
                    </Layout>
                } />
                <Route path="/clients/:id/statement" element={
                    <Layout>
                        <ClientStatement />
                    </Layout>
                } />

                {/* Work Orders */}
                <Route path="/work-orders" element={
                    <Layout>
                        <WorkOrders />
                    </Layout>
                } />

                {/* Leads */}
                <Route path="/leads" element={
                    <Layout>
                        <Leads />
                    </Layout>
                } />





                {/* Notify Client */}
                <Route path="/notify-client" element={
                    <Layout>
                        <NotifyClient />
                    </Layout>
                } />

                {/* Transactions */}
                <Route path="/transactions" element={
                    <Layout>
                        <Transactions />
                    </Layout>
                } />

                {/* Services */}
                <Route path="/services" element={
                    <Layout>
                        <Services />
                    </Layout>
                } />

                {/* Staff Portal */}
                <Route path="/staff-portal" element={
                    <Layout>
                        <StaffPortal />
                    </Layout>
                } />



                {/* Suppliers */}
                <Route path="/suppliers" element={
                    <Layout>
                        <Suppliers />
                    </Layout>
                } />

                {/* Expenses */}
                <Route path="/expenses" element={
                    <Layout>
                        <Expenses />
                    </Layout>
                } />

                {/* Commissions */}
                <Route path="/commissions" element={
                    <Layout>
                        <Commissions />
                    </Layout>
                } />

                {/* Wallets/Banks */}
                <Route path="/wallets-banks" element={
                    <Layout>
                        <WalletsBanks />
                    </Layout>
                } />

                {/* Cash Balance Detail */}
                <Route path="/cash-balance" element={
                    <Layout>
                        <CashBalanceDetail />
                    </Layout>
                } />

                {/* Customer Advance */}
                <Route path="/customer-advance" element={
                    <Layout>
                        <CustomerAdvance />
                    </Layout>
                } />

                {/* Reports */}
                <Route path="/reports" element={
                    <Layout>
                        <Reports />
                    </Layout>
                } />
                <Route path="/reports/cash-book" element={
                    <Layout>
                        <CashBookReport />
                    </Layout>
                } />
                <Route path="/reports/invoice-receipt" element={
                    <Layout>
                        <InvoiceReceiptReport />
                    </Layout>
                } />
                <Route path="/reports/daily" element={
                    <Layout>
                        <DailyReport />
                    </Layout>
                } />
                <Route path="/reports/daily-sheet" element={
                    <Layout>
                        <DailySheetReport />
                    </Layout>
                } />
                <Route path="/reports/invoice-draft" element={
                    <Layout>
                        <InvoiceDraftReport />
                    </Layout>
                } />
                <Route path="/reports/item-wise" element={
                    <Layout>
                        <ItemWiseReport />
                    </Layout>
                } />
                <Route path="/reports/commission-payable" element={
                    <Layout>
                        <CommissionPayableReport />
                    </Layout>
                } />
                <Route path="/reports/user-commission" element={
                    <Layout>
                        <UserCommissionReport />
                    </Layout>
                } />
                <Route path="/reports/supplier-commission" element={
                    <Layout>
                        <SupplierCommissionReport />
                    </Layout>
                } />
                <Route path="/reports/dividend" element={
                    <Layout>
                        <DividendReport />
                    </Layout>
                } />
                <Route path="/reports/quantity" element={
                    <Layout>
                        <QuantityReport />
                    </Layout>
                } />
                <Route path="/reports/user-wise-qty" element={
                    <Layout>
                        <UserWiseQtyReport />
                    </Layout>
                } />
                <Route path="/reports/salary" element={
                    <Layout>
                        <SalaryReport />
                    </Layout>
                } />
                <Route path="/reports/wallet-bank" element={
                    <Layout>
                        <WalletBankReport />
                    </Layout>
                } />
                <Route path="/reports/supplier" element={
                    <Layout>
                        <SupplierReport />
                    </Layout>
                } />
                <Route path="/reports/collection" element={
                    <Layout>
                        <CollectionReport />
                    </Layout>
                } />
                <Route path="/reports/expense" element={
                    <Layout>
                        <ExpenseReport />
                    </Layout>
                } />

                {/* Backup */}
                <Route path="/backup" element={
                    <Layout>
                        <Backup />
                    </Layout>
                } />

                {/* Settings */}
                <Route path="/settings" element={
                    <Layout>
                        <Settings />
                    </Layout>
                } />







                {/* Activity Log */}
                <Route path="/activity-log" element={
                    <Layout>
                        <ActivityLog />
                    </Layout>
                } />
            </Routes>
        </HashRouter>
    );
}

export default App;
