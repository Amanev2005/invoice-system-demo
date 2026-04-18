import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Transaction {
    id: number;
    transaction_type: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    reference_number: string;
}

interface TransactionSummary {
    total_income: number;
    total_expense: number;
    net: number;
    count: number;
}

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<TransactionSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        loadTransactions();
    }, [filter]);

    const loadTransactions = async () => {
        setLoading(true);
        setError('');
        try {
            const params: any = {};
            if (filter !== 'all') {
                params.type = filter;
            }

            const [transactionsRes, summaryRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/transactions/', { params }),
                axios.get('http://127.0.0.1:8000/api/transactions/summary/', { params })
            ]);

            console.log('Transactions:', transactionsRes.data);
            console.log('Summary:', summaryRes.data);

            setTransactions(transactionsRes.data);
            setSummary(summaryRes.data);
        } catch (error: any) {
            console.error('Error loading transactions:', error);
            setError(error.response?.data?.message || 'Failed to load transactions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="mb-lg">Transactions</h1>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-3 gap-lg mb-lg">
                    <div className="card" style={{ backgroundColor: 'var(--success-light)', padding: 'var(--spacing-lg)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Income</div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--success)' }}>
                            {summary.total_income.toFixed(2)} Dhs
                        </div>
                    </div>
                    <div className="card" style={{ backgroundColor: 'var(--danger-light)', padding: 'var(--spacing-lg)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Expense</div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--danger)' }}>
                            {summary.total_expense.toFixed(2)} Dhs
                        </div>
                    </div>
                    <div className="card" style={{ backgroundColor: summary.net >= 0 ? 'var(--success-light)' : 'var(--danger-light)', padding: 'var(--spacing-lg)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Net</div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: summary.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {summary.net.toFixed(2)} Dhs
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Buttons */}
            <div className="card mb-lg">
                <div className="flex gap-md">
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('all')}
                    >
                        All Transactions
                    </button>
                    <button
                        className={`btn ${filter === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('income')}
                    >
                        Income
                    </button>
                    <button
                        className={`btn ${filter === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('expense')}
                    >
                        Expenses
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="card" style={{ backgroundColor: 'var(--danger-light)', padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                    <p style={{ color: 'var(--danger)', margin: 0 }}>❌ {error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                    <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--gray-600)' }}>Loading transactions...</p>
                </div>
            )}

            {/* Transactions Table */}
            {!loading && !error && (
                <div className="card">
                    <h3 className="mb-md">Transaction List</h3>
                    {transactions.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 'var(--spacing-xl)' }}>
                            No transactions found. {filter !== 'all' && `Try changing the filter to see more results.`}
                        </p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                        <th>Reference</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>{new Date(transaction.date).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${transaction.transaction_type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                                                    {transaction.transaction_type}
                                                </span>
                                            </td>
                                            <td>{transaction.category.replace('_', ' ')}</td>
                                            <td>{transaction.description}</td>
                                            <td>{transaction.reference_number || '-'}</td>
                                            <td style={{ color: transaction.transaction_type === 'income' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                                                {transaction.transaction_type === 'income' ? '+' : '-'}{Number(transaction.amount).toFixed(2)} Dhs
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

export default Transactions;
