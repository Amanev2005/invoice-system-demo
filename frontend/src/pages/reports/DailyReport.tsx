import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DailyReport: React.FC = () => {
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const loadReport = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/reports/daily/', {
                params: { date: selectedDate }
            });
            setReportData(response.data);
        } catch (error) {
            console.error('Error loading daily report:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = async () => {
        if (!reportData || !reportData.invoices) return;
        try {
            const XLSX = await import('xlsx');
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(reportData.invoices);
            XLSX.utils.book_append_sheet(wb, ws, "Invoices");
            XLSX.writeFile(wb, `Daily_Report_${selectedDate}.xlsx`);
        } catch (error) {
            console.error('Failed to load xlsx library:', error);
            alert('Excel export requires the "xlsx" package. Please run "npm install xlsx" in the frontend directory.');
        }
    };

    useEffect(() => {
        loadReport();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-lg">
                <h1 style={{ margin: 0 }}>Daily Report</h1>
                {reportData && (
                    <button onClick={exportToExcel} className="btn btn-secondary">
                        📊 Export Excel
                    </button>
                )}
            </div>

            {/* Date Filter */}
            <div className="card mb-lg">
                <div className="grid grid-cols-2 gap-md">
                    <div>
                        <label className="form-label">Select Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button onClick={loadReport} className="btn btn-primary" style={{ width: '100%' }}>
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="card text-center p-xl">
                    <div className="spinner mb-sm" style={{ margin: '0 auto' }}></div>
                    <p>Loading report data...</p>
                </div>
            )}

            {!loading && reportData && (
                <>
                    <div className="grid grid-cols-4 gap-md mb-lg">
                        <div className="card bg-success-light" style={{ padding: 'var(--spacing-lg)', borderLeft: '4px solid var(--success)' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Invoices</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                                {reportData.invoice_count || 0}
                            </div>
                        </div>
                        <div className="card bg-info-light" style={{ padding: 'var(--spacing-lg)', borderLeft: '4px solid var(--info)' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Revenue</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--info)' }}>
                                {reportData.total_revenue?.toFixed(2) || '0.00'}
                            </div>
                        </div>
                        <div className="card bg-danger-light" style={{ padding: 'var(--spacing-lg)', borderLeft: '4px solid var(--danger)' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Expenses</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>
                                {reportData.total_expenses?.toFixed(2) || '0.00'}
                            </div>
                        </div>
                        <div className="card bg-primary-light" style={{ padding: 'var(--spacing-lg)', borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Payments</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                {reportData.payment_count || 0}
                            </div>
                        </div>
                    </div>

                    {reportData.invoices && reportData.invoices.length > 0 && (
                        <div className="card mb-lg">
                            <h3 className="mb-md">Invoices Produced ({selectedDate})</h3>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Client Name</th>
                                            <th>Gross Amount</th>
                                            <th>Current Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.invoices.map((inv: any) => (
                                            <tr key={inv.id}>
                                                <td className="font-semibold">
                                                    <Link to={`/invoices/${inv.id}`}>{inv.invoice_number}</Link>
                                                </td>
                                                <td>{inv.client_name}</td>
                                                <td className="font-bold">{Number(inv.amount || 0).toFixed(2)} Dhs</td>
                                                <td>
                                                    <span className={`badge badge-${inv.status}`}>
                                                        {inv.status.toUpperCase()}
                                                    </span>
                                                    {inv.type === 'payment' && <span className="text-xs text-gray-500 ml-xs">(PMT)</span>}
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DailyReport;
