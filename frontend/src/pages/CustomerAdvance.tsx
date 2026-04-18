import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    credit_balance: number;
    debit_balance: number;
    current_balance: number;
    advance_balance: number;
    created_at: string;
}

const CustomerAdvance: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/clients/');
            // Filter clients with advance balance > 0 (advance payments where is_advance=true)
            const clientsWithAdvance = response.data.filter((client: Client) => client.advance_balance > 0);
            setClients(clientsWithAdvance);
        } catch (error: any) {
            console.error('Error loading clients:', error);
            setError('Failed to load customer advance data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const totalAdvance = clients.reduce((sum, client) => sum + Number(client.advance_balance), 0);

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

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <h1>💵 Customer Advance / Credit</h1>
                <Link to="/" className="btn btn-secondary">
                    ← Back to Dashboard
                </Link>
            </div>

            {/* Summary Card */}
            <div className="card mb-lg" style={{ backgroundColor: 'var(--success-light)', padding: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                            Total Customer Advance
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--success)' }}>
                            {formatCurrency(totalAdvance)}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: 'var(--spacing-xs)' }}>
                            From {clients.length} client{clients.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <div style={{ fontSize: '4rem' }}>💰</div>
                </div>
            </div>

            {/* Clients Table */}
            <div className="card">
                <h3 className="mb-md">Clients with Advance Payments</h3>
                {clients.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 'var(--spacing-xl)' }}>
                        No clients with advance payments found.
                    </p>
                ) : (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Client Name</th>
                                    <th>Contact</th>
                                    <th>Advance Balance</th>
                                    <th>Debit Balance</th>
                                    <th>Net Balance</th>
                                    <th>Date Added</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client.id}>
                                        <td>
                                            <Link
                                                to={`/clients/${client.id}/statement`}
                                                style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                                            >
                                                {client.name}
                                            </Link>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.875rem' }}>
                                                {client.email && <div>📧 {client.email}</div>}
                                                {client.phone && <div>📞 {client.phone}</div>}
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                                            {formatCurrency(client.advance_balance)}
                                        </td>
                                        <td style={{ color: 'var(--danger)', fontWeight: 600 }}>
                                            {formatCurrency(client.debit_balance)}
                                        </td>
                                        <td style={{
                                            color: client.current_balance >= 0 ? 'var(--success)' : 'var(--danger)',
                                            fontWeight: 600
                                        }}>
                                            {formatCurrency(client.current_balance)}
                                        </td>
                                        <td>{formatDate(client.created_at)}</td>
                                        <td>
                                            <Link
                                                to={`/clients/${client.id}/statement`}
                                                className="btn btn-sm btn-primary"
                                            >
                                                View Statement
                                            </Link>
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

export default CustomerAdvance;
