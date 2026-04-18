import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface GenericReportProps {
    title: string;
    description: string;
}

const GenericReport: React.FC<GenericReportProps & { endpoint?: string, type?: string }> = ({ title, description, endpoint, type }) => {
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [status, setStatus] = useState('');

    const loadReport = async () => {
        if (!endpoint) return;

        setLoading(true);
        try {
            const params: any = {};
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            if (status) params.status = status;

            // Handle Daily Report parameter name mismatch
            if (type === 'daily') {
                params.date = dateFrom || new Date().toISOString().split('T')[0];
            }

            const response = await axios.get(`http://127.0.0.1:8000/api/${endpoint}`, { params });
            setReportData(response.data);
        } catch (error) {
            console.error(`Error loading ${title}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = async () => {
        if (!reportData) return;

        try {
            const XLSX = await import('xlsx');
            const wb = XLSX.utils.book_new();
            let dataToExport: any[] = [];
            let fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

            // Map data based on type
            switch (type) {
                case 'expense':
                    dataToExport = reportData.by_category || [];
                    break;
                case 'daily':
                    dataToExport = reportData.invoices || [];
                    break;
                case 'cash-book':
                    dataToExport = reportData.transactions || [];
                    break;
                case 'supplier':
                    dataToExport = reportData.suppliers || [];
                    break;
                case 'salary':
                    dataToExport = reportData.salaries || [];
                    break;
                case 'commission':
                    dataToExport = reportData.commissions || [];
                    break;
                case 'invoice':
                    dataToExport = reportData.invoices || [];
                    break;
                case 'revenue':
                    dataToExport = reportData.by_payment_method || [];
                    break;
                case 'item-wise':
                    dataToExport = reportData.items || [];
                    break;
                default:
                    dataToExport = [reportData];
            }

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            XLSX.utils.book_append_sheet(wb, ws, "Report Data");
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error('Failed to load xlsx library:', error);
            alert('Excel export requires the "xlsx" package. Please run "npm install xlsx" in the frontend directory.');
        }
    };

    useEffect(() => {
        if (endpoint) {
            if (type === 'supplier' || type === 'commission') {
                loadReport();
            }
        }
    }, []);

    const renderReportContent = () => {
        if (!reportData) return null;

        switch (type) {
            case 'expense':
                return (
                    <div>
                        <div className="grid grid-cols-2 gap-lg mb-lg">
                            <div className="card bg-danger-light p-lg" style={{ borderLeft: '4px solid var(--danger)' }}>
                                <div className="text-sm font-semibold text-gray-600 mb-xs">Total Expenses</div>
                                <div className="text-3xl font-bold text-danger">{reportData.total_expenses?.toFixed(2)} Dhs</div>
                            </div>
                            <div className="card bg-info-light p-lg" style={{ borderLeft: '4px solid var(--info)' }}>
                                <div className="text-sm font-semibold text-gray-600 mb-xs">Transaction Count</div>
                                <div className="text-3xl font-bold text-info">{reportData.expense_count}</div>
                            </div>
                        </div>
                        {reportData.by_category?.length > 0 && (
                            <div className="table-responsive">
                                <table className="table">
                                    <thead><tr><th>Category</th><th>Count</th><th>Total</th></tr></thead>
                                    <tbody>
                                        {reportData.by_category.map((i: any, idx: number) => (
                                            <tr key={idx}><td>{i.category}</td><td>{i.count}</td><td className="font-bold">{i.total.toFixed(2)} Dhs</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            case 'daily':
                return (
                    <div>
                        <div className="grid grid-cols-4 gap-md mb-lg">
                            <div className="card bg-primary-light p-md"><div className="text-sm font-semibold text-gray-600 mb-xs">Invoices</div><div className="text-2xl font-bold text-primary">{reportData.invoice_count}</div></div>
                            <div className="card bg-success-light p-md"><div className="text-sm font-semibold text-gray-600 mb-xs">Revenue</div><div className="text-2xl font-bold text-success">{reportData.total_revenue?.toFixed(2)}</div></div>
                            <div className="card bg-danger-light p-md"><div className="text-sm font-semibold text-gray-600 mb-xs">Expenses</div><div className="text-2xl font-bold text-danger">{reportData.total_expenses?.toFixed(2)}</div></div>
                            <div className="card bg-info-light p-md"><div className="text-sm font-semibold text-gray-600 mb-xs">Payments</div><div className="text-2xl font-bold text-info">{reportData.payment_count}</div></div>
                        </div>
                        <h4 className="mb-md">Daily Transactions Listing</h4>
                        <div className="table-responsive">
                            <table className="table">
                                <thead><tr><th>Invoice Number</th><th>Client</th><th>Amount</th><th>Status</th></tr></thead>
                                <tbody>
                                    {reportData.invoices?.map((inv: any) => (
                                        <tr key={inv.id}>
                                            <td className="font-semibold">
                                                <Link to={`/invoices/${inv.id}`}>{inv.invoice_number}</Link>
                                            </td>
                                            <td>{inv.client_name || inv.client}</td>
                                            <td className="font-bold">{Number(inv.amount || 0).toFixed(2)} Dhs</td>
                                            <td>
                                                <span className={`badge badge-${inv.status}`}>
                                                    {inv.status.toUpperCase()}
                                                </span>
                                                {inv.type === 'payment' && <span className="text-xs text-gray-500 ml-xs">({inv.description})</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'cash-book':
                return (
                    <div>
                        <div className="grid grid-cols-3 gap-md mb-lg">
                            <div className="card bg-success-light p-md"><div className="text-sm font-semibold text-gray-600 mb-xs">Total Cash In</div><div className="text-2xl font-bold text-success">{reportData.cash_in?.toFixed(2)}</div></div>
                            <div className="card bg-danger-light p-md"><div className="text-sm font-semibold text-gray-600 mb-xs">Total Cash Out</div><div className="text-2xl font-bold text-danger">{reportData.cash_out?.toFixed(2)}</div></div>
                            <div className="card bg-primary-light p-md"><div className="text-sm font-semibold text-gray-600 mb-xs">Net Balance</div><div className="text-2xl font-bold text-primary">{reportData.balance?.toFixed(2)}</div></div>
                        </div>
                        <div className="table-responsive">
                            <table className="table">
                                <thead><tr><th>Date</th><th>Description</th><th>Type</th><th>In</th><th>Out</th><th>Balance</th></tr></thead>
                                <tbody>
                                    {reportData.transactions?.map((txn: any, idx: number) => (
                                        <tr key={idx}>
                                            <td>{txn.date}</td>
                                            <td>{txn.description}</td>
                                            <td><span className={`badge ${txn.type === 'in' ? 'badge-paid' : 'badge-cancelled'}`}>{txn.type.toUpperCase()}</span></td>
                                            <td className="text-success">{txn.cash_in > 0 ? txn.cash_in.toFixed(2) : '-'}</td>
                                            <td className="text-danger">{txn.cash_out > 0 ? txn.cash_out.toFixed(2) : '-'}</td>
                                            <td className="font-bold">{txn.balance.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'supplier':
                return (
                    <div>
                        <div className="card bg-danger-light p-md mb-lg" style={{ borderLeft: '4px solid var(--danger)' }}>
                            <div className="text-sm font-semibold text-gray-600 mb-xs">Total Payable Amount</div>
                            <div className="text-3xl font-bold text-danger">{reportData.total_payable?.toFixed(2)} Dhs</div>
                        </div>
                        <div className="table-responsive">
                            <table className="table">
                                <thead><tr><th>Supplier Name</th><th>Category</th><th>Total Purchases</th><th>Outstanding Balance</th></tr></thead>
                                <tbody>
                                    {reportData.suppliers?.map((s: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="font-semibold">{s.name}</td>
                                            <td><span className="badge badge-info">{s.category}</span></td>
                                            <td>{s.total_purchases.toFixed(2)}</td>
                                            <td className="text-danger font-bold">{s.balance.toFixed(2)} Dhs</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'salary':
                return (
                    <div className="table-responsive">
                        <div className="card bg-danger-light p-md mb-lg" style={{ borderLeft: '4px solid var(--danger)' }}>
                            <div className="text-sm font-semibold text-gray-600 mb-xs">Total Salary Dispatched</div>
                            <div className="text-3xl font-bold text-danger">{reportData.total_salary?.toFixed(2)} Dhs</div>
                        </div>
                        <table className="table">
                            <thead><tr><th>Date</th><th>Description / Pay period</th><th>Amount</th><th>Method</th></tr></thead>
                            <tbody>
                                {reportData.salaries?.map((s: any, idx: number) => (
                                    <tr key={idx}>
                                        <td>{s.date}</td><td>{s.description}</td><td className="font-bold text-danger">{s.amount.toFixed(2)}</td><td><span className="badge badge-draft">{s.payment_method}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'commission':
                return (
                    <div>
                        <div className="card bg-primary-light p-md mb-lg" style={{ borderLeft: '4px solid var(--primary)' }}>
                            <div className="text-sm font-semibold text-gray-600 mb-xs">Total Commission Outstanding</div>
                            <div className="text-3xl font-bold text-primary">{reportData.total_payable?.toFixed(2)} Dhs</div>
                        </div>
                        <div className="table-responsive">
                            <table className="table">
                                <thead><tr><th>Stakeholder / Agent</th><th>Transactions Count</th><th>Commission Amount</th></tr></thead>
                                <tbody>
                                    {reportData.commissions?.map((c: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="font-semibold">{c.commission_to}</td>
                                            <td>{c.count}</td>
                                            <td className="font-bold text-primary">{c.total_amount.toFixed(2)} Dhs</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'invoice':
                return (
                    <div>
                        <div className="grid grid-cols-2 gap-md mb-lg">
                            <div className="card bg-info-light p-md"><div className="text-sm font-semibold text-gray-600 mb-xs">Invoices Count</div><div className="text-2xl font-bold text-info">{reportData.count}</div></div>
                            <div className="card bg-success-light p-md"><div className="text-sm font-semibold text-gray-600 mb-xs">Total Billed Amount</div><div className="text-2xl font-bold text-success">{reportData.total_amount?.toFixed(2)} Dhs</div></div>
                        </div>
                        <div className="table-responsive">
                            <table className="table">
                                <thead><tr><th>Invoice Number</th><th>Date</th><th>Client</th><th>Amount</th><th>Status</th></tr></thead>
                                <tbody>
                                    {reportData.invoices?.map((inv: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="font-semibold">{inv.invoice_number}</td>
                                            <td>{inv.date}</td>
                                            <td>{inv.client}</td>
                                            <td className="font-bold">{inv.amount.toFixed(2)} Dhs</td>
                                            <td><span className={`badge badge-${inv.status}`}>{inv.status.toUpperCase()}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'revenue':
                return (
                    <div>
                        <div className="grid grid-cols-2 gap-md mb-lg">
                            <div className="card bg-success-light p-md"><div className="text-sm font-semibold text-gray-600 mb-xs">Total Net Revenue</div><div className="text-3xl font-bold text-success">{reportData.total_revenue?.toFixed(2)} Dhs</div></div>
                            <div className="card bg-info-light p-md"><div className="text-sm font-semibold text-gray-600 mb-xs">Total Collections</div><div className="text-3xl font-bold text-info">{reportData.payment_count}</div></div>
                        </div>
                        <h4 className="mb-md">Collection Breakdown by Payment Mode</h4>
                        <div className="grid grid-cols-3 gap-md mb-lg">
                            {reportData.by_payment_method?.map((i: any, idx: number) => (
                                <div key={idx} className="card p-md" style={{ borderTop: '3px solid var(--accent)' }}>
                                    <div className="text-sm font-semibold text-gray-500 mb-xs">{i.payment_method.toUpperCase()}</div>
                                    <div className="text-xl font-bold text-gray-800">{i.total.toFixed(2)} Dhs</div>
                                </div>
                            ))}
                        </div>
                        <h4 className="mb-md">Monthly Performance History</h4>
                        <div className="table-responsive">
                            <table className="table">
                                <thead><tr><th>Billing Month</th><th>Invoices Count</th><th>Monthly Revenue</th></tr></thead>
                                <tbody>
                                    {reportData.by_month?.map((i: any, idx: number) => (
                                        <tr key={idx}><td>{i.month}</td><td>{i.count}</td><td className="font-bold text-success">{i.total.toFixed(2)} Dhs</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {reportData.payments?.length > 0 && (
                            <div className="mt-xl">
                                <h4 className="mb-md">Daily Transactions Listing</h4>
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead><tr><th>Date</th><th>Invoice Number</th><th>Client</th><th>Amount</th><th>Method</th></tr></thead>
                                        <tbody>
                                            {reportData.payments.map((p: any) => (
                                                <tr key={p.id}>
                                                    <td>{p.date}</td>
                                                    <td className="font-semibold">
                                                        {p.invoice_id ? (
                                                            <Link to={`/invoices/${p.invoice_id}`}>{p.invoice_number}</Link>
                                                        ) : p.invoice_number}
                                                    </td>
                                                    <td>{p.client_name}</td>
                                                    <td className="font-bold text-success">{Number(p.amount || 0).toFixed(2)} Dhs</td>
                                                    <td><span className="badge badge-info">{p.payment_method.toUpperCase()}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'item-wise':
                return (
                    <div>
                        <div className="grid grid-cols-3 gap-md mb-lg">
                            <div className="card bg-info-light p-md"><div className="text-sm font-semibold text-gray-600 mb-xs">Distinct Items</div><div className="text-2xl font-bold text-info">{reportData.total_items}</div></div>
                            <div className="card bg-success-light p-md"><div className="text-sm font-semibold text-gray-600 mb-xs">Units Sold</div><div className="text-2xl font-bold text-success">{reportData.total_quantity}</div></div>
                            <div className="card bg-primary-light p-md"><div className="text-sm font-semibold text-gray-600 mb-xs">Inventory Value</div><div className="text-2xl font-bold text-primary">{reportData.total_value?.toFixed(2)} Dhs</div></div>
                        </div>
                        <div className="table-responsive">
                            <table className="table">
                                <thead><tr><th>Service / Item Description</th><th>Quantity Sold</th><th>Avg Selling Rate</th><th>Gross Sales Value</th></tr></thead>
                                <tbody>
                                    {reportData.items?.map((i: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="font-semibold">{i.description}</td>
                                            <td>{i.quantity}</td>
                                            <td>{i.avg_rate.toFixed(2)} Dhs</td>
                                            <td className="font-bold text-success">{i.total_value.toFixed(2)} Dhs</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="card bg-gray-50">
                        <pre style={{ fontSize: '0.875rem' }}>{JSON.stringify(reportData, null, 2)}</pre>
                    </div>
                );
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-lg">
                <h1 style={{ margin: 0 }}>{title}</h1>
                {reportData && (
                    <button onClick={exportToExcel} className="btn btn-secondary" title="Export current results to Excel">
                        📊 Export Excel (.xlsx)
                    </button>
                )}
            </div>
            <div className="card mb-lg">
                <div className="grid grid-cols-4 gap-md items-end">
                    <div><label className="form-label">Period Start</label><input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
                    {type !== 'daily' && (
                        <div><label className="form-label">Period End</label><input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
                    )}
                    {type === 'invoice' && (
                        <div><label className="form-label">Processing Status</label>
                            <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">All Statuses</option><option value="draft">Draft</option><option value="paid">Paid</option><option value="sent">Sent</option>
                            </select></div>
                    )}
                    <div className={type === 'daily' ? 'grid-cols-start-3' : ''}>
                        <button onClick={loadReport} className="btn btn-primary w-full">
                            {loading ? 'Processing...' : 'Generate New Report'}
                        </button>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="card text-center p-2xl">
                    <div className="spinner mb-md" style={{ margin: '0 auto' }}></div>
                    <p className="text-gray-600">Compiling report data...</p>
                </div>
            )}

            {!loading && reportData && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    {renderReportContent()}
                </div>
            )}

            {!loading && !reportData && (
                <div className="card p-3xl text-center" style={{ backgroundColor: 'var(--gray-50)', border: '2px dashed var(--gray-300)' }}>
                    <div className="text-6xl mb-md">📊</div>
                    <h3 className="mb-md" style={{ color: 'var(--gray-800)' }}>{title}</h3>
                    <p className="text-gray-500 max-w-md mx-auto">{description}</p>
                    <p className="mt-lg text-sm text-primary font-semibold">Select a date range and click 'Generate New Report' to begin.</p>
                </div>
            )}
        </div>
    );
};

// Export individual report components
export const InvoiceReceiptReport = () => (
    <GenericReport
        title="Invoice Receipt Summary"
        description="View all invoice receipts and payment summaries for the selected period."
        endpoint="reports/invoices/"
        type="invoice"
    />
);

export const DailySheetReport = () => (
    <GenericReport
        title="Daily Sheet Report"
        description="Comprehensive daily activity sheet showing all transactions and activities."
        endpoint="reports/daily/"
        type="daily"
    />
);

export const InvoiceDraftReport = () => (
    <GenericReport
        title="Invoice / Draft Report"
        description="View all invoices and drafts created during the selected period."
        endpoint="reports/invoices/"
        type="invoice"
    />
);

export const UserCommissionReport = () => (
    <GenericReport
        title="User Commission Report"
        description="Track commissions earned by each user/staff member."
        endpoint="reports/commission/"
        type="commission"
    />
);

export const SupplierCommissionReport = () => (
    <GenericReport
        title="Supplier Commission Report"
        description="View commissions payable to suppliers."
        endpoint="reports/commission/"
        type="commission"
    />
);

export const DividendReport = () => (
    <GenericReport
        title="Dividend Report"
        description="Track dividend distributions and profit sharing."
    // endpoint="reports/dividend/" 
    // type="dividend"
    />
);

export const QuantityReport = () => (
    <GenericReport
        title="Quantity Report"
        description="Analyze item quantities sold across all invoices."
        endpoint="reports/item-wise/"
        type="item-wise"
    />
);

export const UserWiseQtyReport = () => (
    <GenericReport
        title="User Wise Quantity Report"
        description="Track quantities sold by each user/staff member."
    // endpoint="reports/user-qty/"
    // type="user-qty"
    />
);

export const SalaryReport = () => (
    <GenericReport
        title="Salary Report"
        description="View salary payments and staff compensation details."
        endpoint="reports/salary/"
        type="salary"
    />
);

export const WalletBankReport = () => (
    <GenericReport
        title="Wallet/Bank Report"
        description="Track all wallet and bank account transactions and balances."
        endpoint="reports/cash-book/"
        type="cash-book"
    />
);

export const SupplierReport = () => (
    <GenericReport
        title="Supplier Report"
        description="View all supplier transactions and outstanding balances."
        endpoint="reports/supplier/"
        type="supplier"
    />
);

export const CollectionReport = () => (
    <GenericReport
        title="Collection Report"
        description="Track all payment collections from clients."
        endpoint="reports/revenue/"
        type="revenue" // Need to handle this type in switch case if different from default
    />
);

export const ExpenseReport = () => (
    <GenericReport
        title="Expense Report"
        description="View all business expenses categorized by type and period."
        endpoint="reports/expenses/"
        type="expense"
    />
);
