import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
import { InvoiceListItem } from '../types/invoice';
import SearchBar from '../components/SearchBar';
import FilterPanel, { FilterOptions } from '../components/FilterPanel';
import ExportButtons from '../components/ExportButtons';
import ImportDialog from '../components/ImportDialog';

const InvoiceList: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isImportOpen, setIsImportOpen] = useState(false);

    // Initialize filters from URL params if present
    const dateParam = searchParams.get('date');
    const [filters, setFilters] = useState<FilterOptions>({
        status: '',
        dateFrom: dateParam || '',
        dateTo: dateParam || '',
        amountMin: '',
        amountMax: '',
        ordering: ''
    });

    const loadInvoices = useCallback(async () => {
        try {
            setLoading(true);

            // Build query parameters
            const params: any = {};
            if (searchQuery) params.search = searchQuery;
            if (filters.status) params.status = filters.status;
            if (filters.dateFrom) params.date_from = filters.dateFrom;
            if (filters.dateTo) params.date_to = filters.dateTo;
            if (filters.amountMin) params.amount_min = filters.amountMin;
            if (filters.amountMax) params.amount_max = filters.amountMax;
            if (filters.ordering) params.ordering = filters.ordering;

            const response = await invoiceAPI.getAll(params);
            setInvoices(response.data);
        } catch (error) {
            console.error('Error loading invoices:', error);
            alert('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filters]);

    useEffect(() => {
        loadInvoices();
    }, [loadInvoices]);

    const handleDelete = async (id: number) => {
        const invoice = invoices.find(inv => inv.id === id);
        if (!invoice || !confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
            return;
        }

        try {
            await invoiceAPI.delete(id);
            setInvoices(invoices.filter(inv => inv.id !== id));
            alert('Invoice deleted successfully');
        } catch (error) {
            console.error('Error deleting invoice:', error);
            alert('Failed to delete invoice');
        }
    };

    const handleClearFilters = () => {
        setFilters({
            status: '',
            dateFrom: '',
            dateTo: '',
            amountMin: '',
            amountMax: '',
            ordering: ''
        });
        setSearchQuery('');
    };

    const handleImportSuccess = () => {
        loadInvoices();
        // Keep dialog open to show success message
    };

    const getStatusCounts = () => {
        // Note: These counts are from filtered results, not all invoices
        return {
            all: invoices.length,
            draft: invoices.filter(i => i.status === 'draft').length,
            sent: invoices.filter(i => i.status === 'sent').length,
            paid: invoices.filter(i => i.status === 'paid').length,
            cancelled: invoices.filter(i => i.status === 'cancelled').length
        };
    };

    const counts = getStatusCounts();

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <h1>All Invoices</h1>
                <div className="flex gap-sm">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="btn btn-secondary"
                    >
                        📥 Import
                    </button>
                    <ExportButtons />
                    <Link to="/invoices/create" className="btn btn-primary">
                        + New Invoice
                    </Link>
                </div>
            </div>

            <ImportDialog
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImportSuccess={handleImportSuccess}
            />

            {/* Search Bar */}
            <div className="card mb-lg">
                <div style={{ padding: 'var(--spacing-md)' }}>
                    <SearchBar
                        onSearch={setSearchQuery}
                        placeholder="Search by invoice number or client name..."
                    />
                </div>
            </div>

            {/* Filter Panel */}
            <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={handleClearFilters}
            />

            {/* Results Summary */}
            <div className="card mb-lg">
                <div style={{ padding: 'var(--spacing-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <strong>{invoices.length}</strong> invoice{invoices.length !== 1 ? 's' : ''} found
                        {(searchQuery || Object.values(filters).some(v => v !== '')) && (
                            <span style={{ color: 'var(--gray-500)', marginLeft: 'var(--spacing-sm)' }}>
                                (filtered)
                            </span>
                        )}
                    </div>
                    <div className="flex gap-sm">
                        <span className="badge badge-draft">{counts.draft} Draft</span>
                        <span className="badge badge-sent">{counts.sent} Sent</span>
                        <span className="badge badge-paid">{counts.paid} Paid</span>
                        {counts.cancelled > 0 && (
                            <span className="badge badge-cancelled">{counts.cancelled} Cancelled</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="card">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-2xl)' }}>
                        <div className="spinner"></div>
                    </div>
                ) : invoices.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 'var(--spacing-xl)' }}>
                        No invoices found. {(searchQuery || Object.values(filters).some(v => v !== '')) ? (
                            <>Try adjusting your filters or <button onClick={handleClearFilters} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>clear all filters</button>.</>
                        ) : (
                            <><Link to="/invoices/create" style={{ color: 'var(--primary)' }}>Create a new invoice</Link> to get started.</>
                        )}
                    </p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Client</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td>
                                        <Link to={`/invoices/${invoice.id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                            {invoice.invoice_number}
                                        </Link>
                                    </td>
                                    <td>{invoice.client_name}</td>
                                    <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                                    <td>{invoice.items_count || 0}</td>
                                    <td style={{ fontWeight: 600 }}>{Number(invoice.total_amount).toFixed(2)} Dhs</td>
                                    <td>
                                        <span className={`badge badge-${invoice.status}`}>
                                            {invoice.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-sm">
                                            <Link to={`/invoices/${invoice.id}`} className="btn btn-sm btn-secondary">
                                                View
                                            </Link>
                                            <Link to={`/invoices/${invoice.id}/edit`} className="btn btn-sm btn-primary">
                                                Edit
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(invoice.id!)}
                                            >
                                                Delete
                                            </button>
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

export default InvoiceList;
