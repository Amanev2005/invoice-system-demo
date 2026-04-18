import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clientAPI, Client, paymentAPI, creditTxAPI } from '../services/api';
import { InvoiceListItem } from '../types/invoice';
import PaymentDialog from '../components/PaymentDialog';
import AddCreditDialog from '../components/AddCreditDialog';
import '../styles/ClientStatement.css';

interface LedgerEntry {
    id: number;
    entry_type: string;
    entry_type_display: string;
    reference: string;
    debit: number;
    credit: number;
    running_balance: number;
    date: string;
    notes: string;
    invoice_number: string | null;
    created_at: string;
    related_id: number | null;
    related_type: 'invoice' | 'payment' | 'credit_tx' | null;
}

interface StatementData {
    client: Client;
    invoices: InvoiceListItem[];
    aging: {
        current: number;
        days_30: number;
        days_60: number;
        days_90_plus: number;
    };
    total_outstanding: number;
    period_summary: {
        total_invoiced: number;
        total_paid: number;
        total_debit: number;
        total_credit: number;
    };
    date_range: {
        start: string;
        end: string;
    };
    ledger: LedgerEntry[];
    company_settings: {
        company_name: string;
        company_email: string;
        company_mobile: string;
        company_phone: string;
        company_po_box: string;
        company_address: string;
        logo_url: string | null;
    };
}

const ClientStatement: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [statement, setStatement] = useState<StatementData | null>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isAddCreditOpen, setIsAddCreditOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceListItem | null>(null);

    useEffect(() => {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (startDate && endDate && id) {
            loadStatement();
        }
    }, [id, startDate, endDate]);

    const loadStatement = async () => {
        try {
            setLoading(true);
            const response = await clientAPI.getStatement(Number(id), startDate, endDate);
            setStatement(response.data);
        } catch (error) {
            console.error('Error loading statement:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED'
        }).format(amount || 0);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handlePrint = () => window.print();

    const handlePaymentSuccess = () => {
        setIsPaymentOpen(false);
        setSelectedInvoice(null);
        loadStatement();
        alert('Payment recorded successfully!');
    };

    const handleDeleteEntry = async (entry: LedgerEntry) => {
        if (!entry.related_id || !entry.related_type) {
            alert("This entry is auto-generated and cannot be deleted directly.");
            return;
        }

        if (!confirm(`Are you sure you want to delete this ${entry.entry_type_display}? This will rebalance the entire ledger.`)) {
            return;
        }

        try {
            if (entry.related_type === 'payment') {
                await paymentAPI.delete(entry.related_id);
            } else if (entry.related_type === 'credit_tx') {
                await creditTxAPI.delete(entry.related_id);
            } else if (entry.related_type === 'invoice') {
                alert("To delete an invoice, please use the Invoices page.");
                return;
            }
            loadStatement();
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Failed to delete entry.');
        }
    };

    const handleEditAmount = async (entry: LedgerEntry) => {
        if (!entry.related_id || !entry.related_type) {
            alert("This entry is auto-generated and cannot be edited directly.");
            return;
        }

        const newAmount = prompt(`Enter new amount for ${entry.entry_type_display}:`,
            entry.debit > 0 ? entry.debit.toString() : entry.credit.toString());

        if (newAmount === null || isNaN(Number(newAmount))) return;

        try {
            const amount = Number(newAmount);
            if (entry.related_type === 'payment') {
                await paymentAPI.update(entry.related_id, { amount });
            } else if (entry.related_type === 'credit_tx') {
                await creditTxAPI.update(entry.related_id, { amount });
            } else if (entry.related_type === 'invoice') {
                alert("To edit invoice amounts, please Edit the Invoice items directly.");
                return;
            }
            loadStatement();
        } catch (error) {
            console.error('Error editing amount:', error);
            alert('Failed to update amount.');
        }
    };

    const handleExportExcel = () => {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        window.open(`http://127.0.0.1:8000/api/clients/${id}/export_statement/?${params.toString()}`, '_blank');
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Gathering financial data...</p>
        </div>
    );

    if (!statement) return (
        <div className="error-container">
            <p>Failed to load statement. Please try again.</p>
            <button className="btn btn-primary" onClick={loadStatement}>Retry</button>
        </div>
    );

    // Calculate period specific "Total Due" (Sum of balances in the table)
    const periodBalanceDue = statement.invoices.reduce((sum, inv) => sum + (inv.balance_due || 0), 0);

    return (
        <div className="statement-page">
            <div className="statement-header no-print">
                <div className="header-title-area">
                    <h1>📄 Statement of Account</h1>
                    <span className="client-badge-name">{statement.client.name}</span>
                </div>
                <div className="header-actions">
                    <button onClick={handleExportExcel} className="btn btn-success">
                        Excel
                    </button>
                    <button onClick={handlePrint} className="btn btn-primary">
                        Print
                    </button>
                    <Link to="/clients" className="btn btn-secondary">
                        Back
                    </Link>
                </div>
            </div>

            <div className="date-range-selector no-print">
                <div className="date-inputs">
                    <div className="input-group">
                        <label>From</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-input" />
                    </div>
                    <div className="input-group">
                        <label>To</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-input" />
                    </div>
                    <button onClick={loadStatement} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Update View</button>
                    <button onClick={() => setIsAddCreditOpen(true)} className="btn btn-success" style={{ marginLeft: 'auto' }}>
                        ➕ Add Credit/Payment
                    </button>
                </div>
            </div>

            <div className="statement-content">
                {/* Visual Premium Header */}
                <div className="premium-statement-banner">
                    <div className="company-side">
                        <div className="info-blob">
                            {statement.company_settings?.logo_url && (
                                <img src={statement.company_settings.logo_url} alt="Logo" style={{ maxHeight: '50px', marginBottom: '8px' }} />
                            )}
                            <h3>{statement.company_settings?.company_name || 'Rashid Typing & Document Clearing'}</h3>
                            <p>{statement.company_settings?.company_address || 'Salama, Umm Al Quwain, UAE'}</p>
                            <p>Tel: {statement.company_settings?.company_phone || '06-7670165'} | Mob: {statement.company_settings?.company_mobile || '050-7441282'}</p>
                            <p>📧 {statement.company_settings?.company_email || ''}</p>
                        </div>
                    </div>
                    <div className="client-side">
                        <span className="side-label">BILL TO</span>
                        <h2>{statement.client.name}</h2>
                        <div className="sub-details">
                            {statement.client.phone && <span>📞 {statement.client.phone}</span>}
                            {statement.client.email && <span>📧 {statement.client.email}</span>}
                        </div>
                    </div>
                </div>

                {/* Key Financial stats */}
                <div className="financial-dash-grid">
                    <div className="dash-card primary">
                        <span className="dash-icon">🏦</span>
                        <div className="dash-content">
                            <span className="dash-label">Net Outstanding</span>
                            <span className="dash-value">{formatCurrency(statement.total_outstanding)}</span>
                            <span className="dash-sub">Total amount due across all time</span>
                        </div>
                    </div>
                    <div className="dash-card info">
                        <span className="dash-icon">📈</span>
                        <div className="dash-content">
                            <span className="dash-label">Total Debit (+)</span>
                            <span className="dash-value">{formatCurrency(statement.period_summary.total_debit)}</span>
                            <span className="dash-sub">Total invoiced in this period</span>
                        </div>
                    </div>
                    <div className="dash-card success">
                        <span className="dash-icon">📉</span>
                        <div className="dash-content">
                            <span className="dash-label">Total Credit (-)</span>
                            <span className="dash-value">{formatCurrency(statement.period_summary.total_credit)}</span>
                            <span className="dash-sub">Total paid/received in this period</span>
                        </div>
                    </div>
                    <div className="dash-card warning">
                        <span className="dash-icon">💰</span>
                        <div className="dash-content">
                            <span className="dash-label">Advance Balance</span>
                            <span className="dash-value">{formatCurrency(statement.client.credit_balance)}</span>
                            <span className="dash-sub">Unused advance credits in wallet</span>
                        </div>
                    </div>
                    <div className="dash-card secondary">
                        <span className="dash-icon">⏳</span>
                        <div className="dash-content">
                            <span className="dash-label">Credit Limit</span>
                            <span className="dash-value">{formatCurrency(statement.client.credit_limit)}</span>
                            <span className="dash-sub">Max allowable outstanding debt</span>
                        </div>
                    </div>
                </div>

                <div className="statement-sections-container">
                    <div className="full-width-section">
                        <div className="section-header">
                            <h3>📊 Aging Summary</h3>
                        </div>
                        <div className="aging-grid-new">
                            <div className="aging-item">
                                <span className="l">Current</span>
                                <span className="v">{formatCurrency(statement.aging.current)}</span>
                            </div>
                            <div className="aging-item">
                                <span className="l">1 - 30 Days</span>
                                <span className="v">{formatCurrency(statement.aging.days_30)}</span>
                            </div>
                            <div className="aging-item">
                                <span className="l">31 - 60 Days</span>
                                <span className="v">{formatCurrency(statement.aging.days_60)}</span>
                            </div>
                            <div className="aging-item overdue">
                                <span className="l">90+ Days (Overdue)</span>
                                <span className="v">{formatCurrency(statement.aging.days_90_plus)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="full-width-section">
                        <div className="section-header">
                            <h3>📄 Period Invoices ({formatDate(startDate)} - {formatDate(endDate)})</h3>
                        </div>
                        <div className="premium-table-wrapper">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Invoice #</th>
                                        <th>Date</th>
                                        <th style={{ textAlign: 'right' }}>Total</th>
                                        <th style={{ textAlign: 'right' }}>Received</th>
                                        <th style={{ textAlign: 'right' }}>Balance</th>
                                        <th style={{ textAlign: 'center' }}>Status</th>
                                        <th className="no-print">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statement.invoices.length === 0 ? (
                                        <tr><td colSpan={7} className="empty-row">No active invoices in this period</td></tr>
                                    ) : (
                                        statement.invoices.map((inv) => (
                                            <tr key={inv.id}>
                                                <td className="bold">{inv.invoice_number}</td>
                                                <td>{formatDate(inv.invoice_date)}</td>
                                                <td style={{ textAlign: 'right' }}>{formatCurrency(inv.total_amount)}</td>
                                                <td style={{ textAlign: 'right', color: 'var(--success)' }}>{formatCurrency(inv.amount_paid || 0)}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600, color: (inv.balance_due || 0) > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                                    {formatCurrency(inv.balance_due || 0)}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className={`status-pill pill-${inv.status}`}>{inv.status.toUpperCase()}</span>
                                                </td>
                                                <td className="no-print">
                                                    <button onClick={() => { setSelectedInvoice(inv); setIsPaymentOpen(true); }} className="action-link">Receive Payment</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Final Summary Row */}
                    <div className="period-financial-summary">
                        <div className="f-row opening">
                            <span>Balance Carried Forward (Opening)</span>
                            <span>{formatCurrency(statement.total_outstanding - statement.period_summary.total_debit + statement.period_summary.total_credit)}</span>
                        </div>
                        <div className="f-row">
                            <span>(+) New Debits in period</span>
                            <span>{formatCurrency(statement.period_summary.total_debit)}</span>
                        </div>
                        <div className="f-row">
                            <span>(-) New Credits/Payments in period</span>
                            <span style={{ color: 'var(--success)' }}>({formatCurrency(statement.period_summary.total_credit)})</span>
                        </div>
                        <div className="f-row closing">
                            <span className="bold">Final Account Balance (Outstanding)</span>
                            <span className="bold" style={{ fontSize: '1.4rem' }}>{formatCurrency(statement.total_outstanding)}</span>
                        </div>
                    </div>

                    {statement.ledger && statement.ledger.length > 0 && (
                        <div className="full-width-section">
                            <div className="section-header">
                                <h3>📒 Transaction Ledger Details</h3>
                            </div>
                            <div className="premium-table-wrapper">
                                <table className="premium-table ledger">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Ref / Details</th>
                                            <th style={{ textAlign: 'right' }}>Debit (+)</th>
                                            <th style={{ textAlign: 'right' }}>Credit (-)</th>
                                            <th style={{ textAlign: 'right' }}>Net History</th>
                                            <th className="no-print" style={{ textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {statement.ledger.map((entry) => (
                                            <tr key={entry.id}>
                                                <td>{formatDate(entry.date)}</td>
                                                <td><span className={`ledger-type-badge ${entry.entry_type}`}>{entry.entry_type_display}</span></td>
                                                <td style={{ fontSize: '0.8rem' }}>{entry.reference || entry.invoice_number || '—'} <br /> <small>{entry.notes}</small></td>
                                                <td style={{ textAlign: 'right', color: 'var(--danger)' }}>{Number(entry.debit) > 0 ? formatCurrency(Number(entry.debit)) : '—'}</td>
                                                <td style={{ textAlign: 'right', color: 'var(--success)' }}>{Number(entry.credit) > 0 ? formatCurrency(Number(entry.credit)) : '—'}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(Number(entry.running_balance))}</td>
                                                <td className="no-print" style={{ textAlign: 'center' }}>
                                                    {entry.related_type && entry.related_type !== 'invoice' && (
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                            <button
                                                                onClick={() => handleEditAmount(entry)}
                                                                className="btn-icon"
                                                                title="Edit Amount"
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteEntry(entry)}
                                                                className="btn-icon"
                                                                title="Delete"
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedInvoice && (
                <PaymentDialog isOpen={isPaymentOpen} onClose={() => { setIsPaymentOpen(false); setSelectedInvoice(null); }} invoiceId={selectedInvoice.id!} invoiceNumber={selectedInvoice.invoice_number} totalAmount={Number(selectedInvoice.total_amount)} outstandingAmount={Number(selectedInvoice.balance_due)} onSuccess={handlePaymentSuccess} />
            )}

            <AddCreditDialog isOpen={isAddCreditOpen} onClose={() => setIsAddCreditOpen(false)} onSuccess={() => { loadStatement(); setIsAddCreditOpen(false); }} clientId={Number(id)} />
        </div>
    );
};

export default ClientStatement;
