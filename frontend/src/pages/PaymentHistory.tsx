import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Payment } from '../services/api';
import { Link } from 'react-router-dom';

const PaymentHistory: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMethod, setFilterMethod] = useState('all');
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            // Use combined endpoint that includes both Payment and CreditTransaction data
            const response = await axios.get('http://127.0.0.1:8000/api/payment-history-combined/');
            setPayments(response.data);
        } catch (error) {
            console.error('Error loading payments:', error);
            alert('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount as any) : amount;
        return `AED ${numAmount.toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: { [key: string]: string } = {
            'cash': 'Cash',
            'bank_transfer': 'Bank Transfer',
            'cheque': 'Cheque',
            'credit_card': 'Credit Card',
            'other': 'Other'
        };
        return labels[method] || method;
    };

    // Filter and sort payments
    const filteredPayments = payments
        .filter(payment => {
            const matchesSearch =
                payment.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.reference_number.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesMethod = filterMethod === 'all' || payment.payment_method === filterMethod;

            return matchesSearch && matchesMethod;
        })
        .sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'date') {
                comparison = new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime();
            } else {
                comparison = a.amount - b.amount;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    // Calculate total
    const totalReceived = filteredPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-2xl)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <h1>Payment History</h1>
                <Link to="/invoices" className="btn btn-secondary">
                    ← Back to Invoices
                </Link>
            </div>

            {/* Filters and Search */}
            <div className="card mb-lg">
                <div className="flex gap-md items-end" style={{ flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: '1 1 300px', marginBottom: 0 }}>
                        <label className="form-label">Search</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by invoice, client, or reference..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="form-group" style={{ flex: '0 1 200px', marginBottom: 0 }}>
                        <label className="form-label">Payment Method</label>
                        <select
                            className="form-input"
                            value={filterMethod}
                            onChange={(e) => setFilterMethod(e.target.value)}
                        >
                            <option value="all">All Methods</option>
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ flex: '0 1 150px', marginBottom: 0 }}>
                        <label className="form-label">Sort By</label>
                        <select
                            className="form-input"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                        >
                            <option value="date">Date</option>
                            <option value="amount">Amount</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ flex: '0 1 150px', marginBottom: 0 }}>
                        <label className="form-label">Order</label>
                        <select
                            className="form-input"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Card */}
            <div className="card mb-lg" style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white'
            }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 style={{ margin: 0, color: 'white' }}>Total Received</h3>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                            {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {formatCurrency(totalReceived)}
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="card">
                {filteredPayments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--gray-500)' }}>
                        <p>No payments found</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Invoice #</th>
                                    <th>Client</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Reference</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>{formatDate(payment.payment_date)}</td>
                                        <td>
                                            {payment.invoice_id ? (
                                                <Link
                                                    to={`/invoices/${payment.invoice_id}`}
                                                    style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                                                >
                                                    {payment.invoice_number}
                                                </Link>
                                            ) : (
                                                <span style={{ color: 'var(--gray-500)' }}>{payment.invoice_number}</span>
                                            )}
                                        </td>
                                        <td>{payment.client_name}</td>
                                        <td style={{ fontWeight: 600, color: '#10b981' }}>
                                            {formatCurrency(payment.amount)}
                                        </td>
                                        <td>
                                            <span className="badge badge-info">
                                                {getPaymentMethodLabel(payment.payment_method)}
                                            </span>
                                        </td>
                                        <td>{payment.reference_number || '-'}</td>
                                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {payment.notes || '-'}
                                        </td>
                                        <td>
                                            {payment.invoice_id && (
                                                <Link
                                                    to={`/invoices/${payment.invoice_id}`}
                                                    className="btn btn-sm btn-secondary"
                                                >
                                                    View Invoice
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
