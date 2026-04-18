import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
import { InvoiceListItem } from '../types/invoice';

const Drafts: React.FC = () => {
    const [drafts, setDrafts] = useState<InvoiceListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDrafts();
    }, []);

    const loadDrafts = async () => {
        try {
            const response = await invoiceAPI.getAll({ status: 'draft' });
            setDrafts(response.data);
        } catch (error) {
            console.error('Error loading drafts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <h1>Drafts</h1>
                <Link to="/invoices/create" className="btn btn-primary">
                    + New Draft
                </Link>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-2xl)' }}>
                        <div className="spinner"></div>
                    </div>
                ) : drafts.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 'var(--spacing-xl)' }}>
                        No drafts found. <Link to="/invoices/create" style={{ color: 'var(--primary)' }}>Create a new draft</Link> to get started.
                    </p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Client</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drafts.map((draft) => (
                                <tr key={draft.id}>
                                    <td>
                                        <Link to={`/invoices/${draft.id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                            {draft.invoice_number}
                                        </Link>
                                    </td>
                                    <td>{draft.client_name}</td>
                                    <td>{new Date(draft.invoice_date).toLocaleDateString()}</td>
                                    <td style={{ fontWeight: 600 }}>{Number(draft.total_amount).toFixed(2)} Dhs</td>
                                    <td>
                                        <div className="flex gap-sm">
                                            <Link to={`/invoices/${draft.id}/edit`} className="btn btn-sm btn-primary">
                                                Edit
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Drafts;
