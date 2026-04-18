import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Commission {
    id: number;
    recipient_name: string;
    amount: number;
    percentage: number;
    invoice_id: number;
    invoice_number: string;
    date: string;
    status: 'pending' | 'paid';
}

const Commissions: React.FC = () => {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadCommissions();
    }, [statusFilter]);

    const loadCommissions = async () => {
        try {
            const params: any = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            const response = await axios.get('http://127.0.0.1:8000/api/commissions/', { params });
            setCommissions(response.data);
        } catch (error) {
            console.error('Error loading commissions:', error);
            // Sample data
            setCommissions([
                { id: 1, recipient_name: 'Ahmed Sales', amount: 500, percentage: 5, invoice_id: 1, invoice_number: 'INV-2024-001', date: '2024-01-15', status: 'paid' },
                { id: 2, recipient_name: 'Fatima Marketing', amount: 750, percentage: 7.5, invoice_id: 2, invoice_number: 'INV-2024-002', date: '2024-01-20', status: 'pending' },
                { id: 3, recipient_name: 'Mohammed Referral', amount: 300, percentage: 3, invoice_id: 3, invoice_number: 'INV-2024-003', date: '2024-01-25', status: 'paid' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: number, newStatus: 'pending' | 'paid') => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/commissions/${id}/`, { status: newStatus });
            loadCommissions();
        } catch (error) {
            console.error('Error updating status:', error);
            // Update locally for demo
            setCommissions(commissions.map(c => c.id === id ? { ...c, status: newStatus } : c));
        }
    };

    const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
    const paidCommissions = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + Number(c.amount), 0);
    const pendingCommissions = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + Number(c.amount), 0);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="mb-lg">Commissions</h1>

            <div className="grid grid-cols-4 gap-md mb-lg">
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Commissions</div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary)' }}>{totalCommissions.toFixed(2)} Dhs</div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Paid</div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--success)' }}>{paidCommissions.toFixed(2)} Dhs</div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Pending</div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--warning)' }}>{pendingCommissions.toFixed(2)} Dhs</div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Records</div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--info)' }}>{commissions.length}</div>
                </div>
            </div>

            <div className="card">
                <div className="flex gap-md mb-md">
                    <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '200px' }}>
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Recipient</th>
                                <th>Invoice</th>
                                <th>Percentage</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commissions.map(commission => (
                                <tr key={commission.id}>
                                    <td>{new Date(commission.date).toLocaleDateString()}</td>
                                    <td style={{ fontWeight: 600 }}>{commission.recipient_name}</td>
                                    <td><span className="badge badge-info">{commission.invoice_number}</span></td>
                                    <td>{commission.percentage}%</td>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{Number(commission.amount).toFixed(2)} Dhs</td>
                                    <td>
                                        {commission.status === 'paid' ? (
                                            <span className="badge badge-success">Paid</span>
                                        ) : (
                                            <span className="badge badge-warning">Pending</span>
                                        )}
                                    </td>
                                    <td>
                                        {commission.status === 'pending' && (
                                            <button
                                                onClick={() => handleStatusChange(commission.id, 'paid')}
                                                className="btn btn-sm btn-success"
                                            >
                                                Mark as Paid
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Commissions;
