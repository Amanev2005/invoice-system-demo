import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientAPI, Client } from '../services/api';
import ClientForm from '../components/ClientForm';
import '../styles/Clients.css';

const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async (search?: string) => {
        try {
            setLoading(true);
            const params = search ? { search } : {};
            const response = await clientAPI.getAll(params);
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
            alert('Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchClients(searchQuery);
    };

    const handleDelete = async (id: number, force: boolean = false) => {
        const confirmMsg = force 
            ? 'WARNING: This will permanently delete ALL invoices, payments, and ledger entries for this client. This action cannot be undone. Are you sure you want to FORCE DELETE?' 
            : 'Are you sure you want to delete this client?';
            
        if (!confirm(confirmMsg)) return;
        
        try {
            await clientAPI.delete(id, force ? { force: 'true' } : {});
            fetchClients();
            if (force) alert('Client and all associated history have been permanently deleted.');
        } catch (error: any) {
            console.error('Error deleting client:', error);
            const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to delete client';
            
            // If it's a protected error (contains "associate" or "financial") and not already forcing
            if (error.response?.status === 400 && !force && (errorMsg.includes('associate') || errorMsg.includes('financial'))) {
                if (confirm(`${errorMsg}\n\nDo you want to FORCE DELETE this client and erase all their history permanently?`)) {
                    handleDelete(id, true);
                }
            } else {
                alert(errorMsg);
            }
        }
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingClient(null);
        fetchClients();
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount || 0);

    // Determine status badge
    const getStatus = (client: Client) => {
        if ((client.overdue_amount || 0) > 0) return { label: 'OVERDUE', cls: 'status-overdue' };
        if ((client.current_balance || 0) > 0) return { label: 'OUTSTANDING', cls: 'status-outstanding' };
        if ((client.advance_balance || 0) > 0) return { label: 'ADVANCE', cls: 'status-advance' };
        return { label: 'CLEAR', cls: 'status-clear' };
    };


    return (
        <div className="clients-page">
            <div className="page-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ margin: 0, color: 'var(--primary-dark)' }}>👥 Client Management</h1>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        ➕ New Client
                    </button>
                </div>
            </div>

            <div className="search-bar no-print" style={{ background: 'white', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-lg)' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <input
                        type="text"
                        placeholder="Search by name, email, or contact..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input"
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-secondary">🔍 Search</button>
                    {searchQuery && (
                        <button type="button" className="btn btn-secondary" onClick={() => { setSearchQuery(''); fetchClients(); }}>
                            ✖ Clear
                        </button>
                    )}
                </form>
            </div>

            {/* Summary Row */}
            <div className="clients-summary-bar" style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', padding: '0 var(--spacing-xs)' }}>
                <span className="badge badge-sent" style={{ padding: '0.5rem 1rem' }}>Total: {clients.length} Clients</span>
                <span className="badge badge-danger" style={{ padding: '0.5rem 1rem' }}>Overdue: {clients.filter(c => (c.overdue_amount || 0) > 0).length}</span>
                <span className="badge badge-success" style={{ padding: '0.5rem 1rem' }}>With Advance: {clients.filter(c => (c.advance_balance || 0) > 0).length}</span>
            </div>

            {loading ? (
                <div className="loading" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                    <p style={{ marginTop: 'var(--spacing-md)' }}>Fetching client records...</p>
                </div>
            ) : (
                <div className="premium-table-wrapper" style={{ boxShadow: 'var(--shadow-lg)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-xl)', background: 'white' }}>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Client Identity</th>
                                <th>Contact Information</th>
                                <th style={{ textAlign: 'right' }}>Debit (Owed)</th>
                                <th style={{ textAlign: 'right' }}>Credit (Advance)</th>
                                <th style={{ textAlign: 'center' }}>Total Standing</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-3xl)', color: 'var(--gray-500)' }}>No client data found.</td></tr>
                            ) : (
                                clients.map((client, index) => {
                                    const status = getStatus(client);
                                    return (
                                        <tr key={client.id}>
                                            <td style={{ verticalAlign: 'top', fontWeight: 600, color: 'var(--gray-500)' }}>
                                                {index + 1}
                                            </td>
                                            <td style={{ verticalAlign: 'top' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--gray-800)' }}>{client.name}</span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                                        {client.invoice_count || 0} Invoices | {client.credit_terms} Days Terms
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ verticalAlign: 'top', color: 'var(--gray-600)', fontSize: '0.85rem' }}>
                                                {client.email && <div>📧 {client.email}</div>}
                                                {client.phone && <div>📞 {client.phone}</div>}
                                            </td>
                                            <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                                                <span style={{ fontWeight: 700, color: (client.debit_balance || 0) > 0 ? 'var(--danger)' : 'inherit' }}>
                                                    {formatCurrency(client.debit_balance || 0)}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                                                <span style={{ fontWeight: 700, color: (client.advance_balance || 0) > 0 ? 'var(--success)' : 'inherit' }}>
                                                    {formatCurrency(client.advance_balance || 0)}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'top' }}>
                                                <span className={`status-pill pill-${status.label.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                                                    {status.label}
                                                </span>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', marginTop: '0.25rem' }}>
                                                    {formatCurrency(client.current_balance || 0)}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div className="action-buttons" style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
                                                    <Link to={`/clients/${client.id}/statement`} className="btn btn-sm btn-primary" title="Financial Statement">
                                                        📄 Statement
                                                    </Link>
                                                    <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(client)} title="Update Client">
                                                        ✏️
                                                    </button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(client.id)} title="Delete Client">
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {showForm && (
                <ClientForm client={editingClient} onClose={handleFormClose} />
            )}
        </div>
    );
};

export default Clients;
