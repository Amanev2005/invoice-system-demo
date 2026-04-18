import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

interface CashPayment {
    id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number: string;
    invoice_number: string;
    client_name: string;
}

interface Transaction {
    id: number;
    amount: number;
    date: string;
    category: string;
    description: string;
}

interface CashBalanceData {
    total_cash_in: number;
    total_cash_out: number;
    total_transferred: number;
    cash_balance: number;
    cash_payments: CashPayment[];
    cash_expenses: Transaction[];
    cash_transfers: Transaction[];
}

const CashBalanceDetail: React.FC = () => {
    const location = useLocation();
    const [data, setData] = useState<CashBalanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'in' | 'out' | 'transfer'>('in');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab === 'transfer' || tab === 'in' || tab === 'out') {
            setActiveTab(tab as any);
        }
    }, [location]);

    useEffect(() => {
        loadCashBalanceDetail();
    }, []);

    const loadCashBalanceDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/cash-balance/detail/');
            console.log('Cash balance detail:', response.data);
            setData(response.data);
        } catch (error: any) {
            console.error('Error loading cash balance detail:', error);
            setError(error.response?.data?.message || 'Failed to load cash balance details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-2xl)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={{ backgroundColor: 'var(--danger-light)', padding: 'var(--spacing-lg)' }}>
                <p style={{ color: 'var(--danger)', margin: 0 }}>❌ {error}</p>
            </div>
        );
    }

    if (!data) {
        return <div>No data available</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <h1>💰 Cash Balance Detail</h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-lg mb-lg">
                <div className="card" style={{ backgroundColor: 'white', borderLeft: '5px solid var(--success)', padding: 'var(--spacing-lg)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                        📈 Cash In (Payments Received)
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)' }}>
                        {data.total_cash_in.toFixed(2)} <span style={{ fontSize: '1rem' }}>Dhs</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: 'var(--spacing-xs)' }}>
                        {data.cash_payments.length} total transactions
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: 'white', borderLeft: '5px solid var(--danger)', padding: 'var(--spacing-lg)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                        📉 Cash Out (Expenses + Transfers)
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--danger)' }}>
                        {data.total_cash_out.toFixed(2)} <span style={{ fontSize: '1rem' }}>Dhs</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: 'var(--spacing-xs)' }}>
                        {data.cash_expenses.length + data.cash_transfers.length} total transactions
                    </div>
                </div>

                <div className="card" style={{
                    backgroundColor: data.cash_balance >= 0 ? 'var(--primary)' : 'var(--warning)',
                    color: 'white',
                    padding: 'var(--spacing-lg)',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', marginBottom: 'var(--spacing-xs)', fontWeight: 600 }}>
                        💵 Net Cash Balance
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>
                        {data.cash_balance.toFixed(2)} <span style={{ fontSize: '1rem' }}>Dhs</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginTop: 'var(--spacing-xs)' }}>
                        Available Liquidity (In - Out)
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="card mb-lg">
                <div className="flex gap-md">
                    <button
                        className={`btn ${activeTab === 'in' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('in')}
                    >
                        Cash In ({data.cash_payments.length})
                    </button>
                    <button
                        className={`btn ${activeTab === 'out' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('out')}
                    >
                        Cash Out ({data.cash_expenses.length})
                    </button>
                    <button
                        className={`btn ${activeTab === 'transfer' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('transfer')}
                    >
                        Transfers ({data.cash_transfers.length})
                    </button>
                </div>
            </div>

            {/* Cash In Table */}
            {activeTab === 'in' && (
                <div className="card">
                    <h3 className="mb-md">Cash Payments Received</h3>
                    {data.cash_payments.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 'var(--spacing-xl)' }}>
                            No cash payments received yet.
                        </p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Invoice #</th>
                                        <th>Client</th>
                                        <th>Reference</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.cash_payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                            <td>
                                                <Link to={`/invoices`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                                                    {payment.invoice_number}
                                                </Link>
                                            </td>
                                            <td>{payment.client_name}</td>
                                            <td>{payment.reference_number || '-'}</td>
                                            <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                                                +{Number(payment.amount).toFixed(2)} Dhs
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Cash Out Table */}
            {activeTab === 'out' && (
                <div className="card">
                    <h3 className="mb-md">Cash Expenses Paid</h3>
                    {data.cash_expenses.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 'var(--spacing-xl)' }}>
                            No cash expenses recorded yet.
                        </p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.cash_expenses.map((expense) => (
                                        <tr key={expense.id}>
                                            <td>{new Date(expense.date).toLocaleDateString()}</td>
                                            <td>
                                                <span className="badge badge-warning">
                                                    {expense.category.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>{expense.description}</td>
                                            <td style={{ color: 'var(--danger)', fontWeight: 600 }}>
                                                -{Number(expense.amount).toFixed(2)} Dhs
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Cash Transfers Table */}
            {activeTab === 'transfer' && (
                <div className="card">
                    <h3 className="mb-md">Cash Transferred to Banks</h3>
                    {data.cash_transfers.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 'var(--spacing-xl)' }}>
                            No cash transfers recorded yet.
                        </p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.cash_transfers.map((transfer) => (
                                        <tr key={transfer.id}>
                                            <td>{new Date(transfer.date).toLocaleDateString()}</td>
                                            <td>{transfer.description}</td>
                                            <td style={{ color: 'var(--info)', fontWeight: 600 }}>
                                                -{Number(transfer.amount).toFixed(2)} Dhs
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CashBalanceDetail;
