import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import AddCreditDialog from '../components/AddCreditDialog';
import { API_ENDPOINTS } from '../config/api';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardStats {
    cash_balance: number;
    wallet_total: number;
    customer_advance: number;
    customer_outstanding: number;
    unsettled_debit_credit: number;
    today_supplier_payments: number;
    today_expenses: number;
    today_service_transactions: number;
    profit: number;
    collection: number;
    total_payable_commission: number;
    today_commissions: number;
    total_transferred: number;
    sales_overview: Array<{
        description: string;
        qty: number;
        amount: number;
    }>;
    wallet_list: Array<{
        id: number;
        name: string;
        balance: number;
    }>;
    balance_summary: {
        cash_balance: number;
        wallet_total: number;
        outstanding: number;
    };
    work_orders: Array<{
        id: number;
        work_order_number: string;
        client_name: string;
        count: number;
        total_count: number;
        created_at: string;
    }>;
    commission_breakdown: {
        [key: string]: number;
    };
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'work_orders' | 'drafts'>('work_orders');
    const [showCreditDialog, setShowCreditDialog] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const response = await axios.get(`${API_ENDPOINTS.DASHBOARD}stats/`);
            setStats(response.data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
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

    if (!stats) {
        return <div>Error loading dashboard data</div>;
    }

    // Prepare chart data
    const chartData = {
        labels: ['Cash Balance', 'Wallet Total', 'Outstanding'],
        datasets: [
            {
                data: [
                    stats.balance_summary.cash_balance,
                    stats.balance_summary.wallet_total,
                    stats.balance_summary.outstanding
                ],
                backgroundColor: ['#6366f1', '#22c55e', '#ef4444'],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                },
            },
        },
        cutout: '70%',
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <h1>Dashboard</h1>
                <div className="flex gap-md">
                    <button
                        onClick={() => setShowCreditDialog(true)}
                        className="btn btn-secondary btn-lg"
                    >
                        + Add Credit
                    </button>
                    <Link to="/invoices/create" className="btn btn-primary btn-lg">
                        + New Invoice
                    </Link>
                </div>
            </div>

            {showCreditDialog && (
                <AddCreditDialog
                    isOpen={showCreditDialog}
                    onClose={() => setShowCreditDialog(false)}
                    onSuccess={() => {
                        loadDashboardData();
                        setShowCreditDialog(false);
                    }}
                />
            )}

            {/* Top 8 Stats Cards */}
            <div className="grid grid-cols-4 gap-md mb-lg">
                <Link to="/cash-balance" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: 'var(--spacing-md)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                            <span style={{ fontSize: '1.5rem' }}>💰</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Cash Balance</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                            {stats.cash_balance.toFixed(2)}
                        </div>
                    </div>
                </Link>

                <Link to="/wallets-banks" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: 'var(--spacing-md)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                            <span style={{ fontSize: '1.5rem' }}>🏦</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Wallet/Clients Total</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                            {stats.wallet_total.toFixed(2)}
                        </div>
                    </div>
                </Link>

                <Link to="/customer-advance" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: 'var(--spacing-md)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                            <span style={{ fontSize: '1.5rem' }}>💳</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Customer Advance(Credit)</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--success)' }}>
                            {stats.customer_advance.toFixed(2)}
                        </div>
                    </div>
                </Link>

                <Link to="/clients" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: 'var(--spacing-md)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                            <span style={{ fontSize: '1.5rem' }}>📊</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Customer Outstanding(Debit)</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--danger)' }}>
                            {stats.customer_outstanding.toFixed(2)}
                        </div>
                    </div>
                </Link>

                <Link to="/transactions" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: 'var(--spacing-md)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                            <span style={{ fontSize: '1.5rem' }}>📝</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Unsettled Debit & Credit</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                            {stats.unsettled_debit_credit}
                        </div>
                    </div>
                </Link>

                <Link to="/suppliers" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: 'var(--spacing-md)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                            <span style={{ fontSize: '1.5rem' }}>🚚</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Today's Supplier Payments</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                            {stats.today_supplier_payments.toFixed(2)}
                        </div>
                    </div>
                </Link>

                <Link to="/expenses" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: 'var(--spacing-md)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                            <span style={{ fontSize: '1.5rem' }}>💸</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Today's Expenses</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--danger)' }}>
                            {stats.today_expenses.toFixed(2)}
                        </div>
                    </div>
                </Link>

                <Link to="/cash-balance?tab=transfer" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: 'var(--spacing-md)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                            <span style={{ fontSize: '1.5rem' }}>🔄</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Transferred to Bank</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--info)' }}>
                            {stats.total_transferred.toFixed(2)}
                        </div>
                    </div>
                </Link>

                <Link to={`/invoices?date=${new Date().toISOString().split('T')[0]}`} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: 'var(--spacing-md)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                            <span style={{ fontSize: '1.5rem' }}>⚡</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Today's Service Transaction</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                            {stats.today_service_transactions}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Profit and Collection */}
            <div className="grid grid-cols-2 gap-lg mb-lg">
                <Link to="/reports" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: 'var(--spacing-lg)', textAlign: 'center', background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%)', cursor: 'pointer' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-sm)' }}>Profit</div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: stats.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {stats.profit.toFixed(2)}
                        </div>
                    </div>
                </Link>

                <Link to="/reports" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: 'var(--spacing-lg)', textAlign: 'center', background: 'linear-gradient(135deg, var(--success-light) 0%, var(--success) 100%)', color: 'white', cursor: 'pointer' }}>
                        <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', marginBottom: 'var(--spacing-sm)' }}>Collection</div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: 'white' }}>
                            {stats.collection.toFixed(2)}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Your Commissions */}
            <div className="card mb-lg">
                <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Your Commissions</h3>
                <div className="grid grid-cols-2 gap-lg mb-lg">
                    <Link to="/commissions" style={{ textDecoration: 'none' }}>
                        <div style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 'var(--spacing-xs)' }}>
                                {stats.total_payable_commission.toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>Total Payable</div>
                        </div>
                    </Link>

                    <Link to="/commissions" style={{ textDecoration: 'none' }}>
                        <div style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 'var(--spacing-xs)' }}>
                                {stats.today_commissions.toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>Today's Commissions</div>
                        </div>
                    </Link>
                </div>

                {/* Commission Breakdown */}
                {Object.keys(stats.commission_breakdown).length > 0 && (
                    <div className="grid grid-cols-4 gap-md">
                        {Object.entries(stats.commission_breakdown).map(([name, amount]) => (
                            <div key={name} style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>{name}</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>{amount.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sales Overview */}
            {stats.sales_overview.length > 0 && (
                <div className="card mb-lg">
                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Sales Overview</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>SERVICE</th>
                                <th style={{ textAlign: 'center' }}>QTY</th>
                                <th style={{ textAlign: 'right' }}>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.sales_overview.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.description}</td>
                                    <td style={{ textAlign: 'center' }}>{item.qty}</td>
                                    <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>
                                        {item.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            <tr style={{ fontWeight: 600, borderTop: '2px solid var(--gray-300)' }}>
                                <td>Total</td>
                                <td style={{ textAlign: 'center' }}>
                                    {stats.sales_overview.reduce((sum, item) => sum + item.qty, 0)}
                                </td>
                                <td style={{ textAlign: 'right', color: 'var(--success)' }}>
                                    {stats.sales_overview.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Wallet List and Balance Summary */}
            <div className="grid grid-cols-2 gap-lg mb-lg">
                {/* Wallet List */}
                <Link to="/wallets-banks" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ cursor: 'pointer' }}>
                        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Wallet List</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {stats.wallet_list.map((wallet) => (
                                <div key={wallet.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--gray-200)' }}>
                                    <span style={{ fontWeight: 500 }}>{wallet.name}</span>
                                    <span style={{ fontWeight: 600, color: Number(wallet.balance) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                        {Number(wallet.balance).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Link>

                {/* Balance Summary Chart */}
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Balance Summary</h3>
                    <div style={{ height: '250px', position: 'relative' }}>
                        <Doughnut data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Work Orders / Drafts Tabs */}
            <div className="card">
                <div style={{ borderBottom: '1px solid var(--gray-200)', marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                        <button
                            onClick={() => setActiveTab('work_orders')}
                            style={{
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontWeight: 500,
                                borderBottom: activeTab === 'work_orders' ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === 'work_orders' ? 'var(--primary)' : 'var(--gray-600)'
                            }}
                        >
                            Work Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('drafts')}
                            style={{
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontWeight: 500,
                                borderBottom: activeTab === 'drafts' ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === 'drafts' ? 'var(--primary)' : 'var(--gray-600)'
                            }}
                        >
                            Drafts
                        </button>
                    </div>
                </div>

                {activeTab === 'work_orders' && (
                    <div>
                        {stats.work_orders.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 'var(--spacing-xl)' }}>
                                No work orders yet
                            </p>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Client</th>
                                        <th style={{ textAlign: 'center' }}>Count</th>
                                        <th>Created Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.work_orders.map((wo) => (
                                        <tr key={wo.id}>
                                            <td>
                                                <Link to={`/work-orders/${wo.id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                                    {wo.work_order_number}
                                                </Link>
                                            </td>
                                            <td>{wo.client_name}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ color: wo.count === wo.total_count ? 'var(--success)' : 'var(--warning)' }}>
                                                    {wo.count} / {wo.total_count}
                                                </span>
                                            </td>
                                            <td>{new Date(wo.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
                            <Link to="/work-orders" className="btn btn-secondary">
                                View More →
                            </Link>
                        </div>
                    </div>
                )}

                {activeTab === 'drafts' && (
                    <div>
                        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 'var(--spacing-xl)' }}>
                            No draft invoices
                        </p>
                        <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
                            <Link to="/drafts" className="btn btn-secondary">
                                View All Drafts →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
