import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CashBookReport: React.FC = () => {
    const [cashData, setCashData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const loadReport = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const response = await axios.get('http://127.0.0.1:8000/api/reports/cash-book/', { params });
            setCashData(response.data);
        } catch (error) {
            console.error('Error loading cash book:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = async () => {
        if (!cashData || !cashData.transactions) return;
        try {
            const XLSX = await import('xlsx');
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(cashData.transactions);
            XLSX.utils.book_append_sheet(wb, ws, "Cash Book");
            XLSX.writeFile(wb, `Cash_Book_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                <h1 style={{ margin: 0 }}>Cash Book Report</h1>
                {cashData && (
                    <button onClick={exportToExcel} className="btn btn-secondary">
                        📊 Export Excel
                    </button>
                )}
            </div>

            {/* Date Range Filter */}
            <div className="card mb-lg">
                <div className="grid grid-cols-3 gap-md">
                    <div>
                        <label className="form-label">From Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="form-label">To Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
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
                    <p>Fetching ledger transactions...</p>
                </div>
            )}

            {!loading && cashData && (
                <div className="card">
                    <h3 className="mb-md">Cash Book Financial Summary</h3>

                    <div className="grid grid-cols-3 gap-lg mb-lg">
                        <div className="card bg-success-light" style={{ padding: 'var(--spacing-lg)', borderLeft: '4px solid var(--success)' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Cash In</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                                {cashData.cash_in?.toFixed(2) || '0.00'} Dhs
                            </div>
                        </div>
                        <div className="card bg-danger-light" style={{ padding: 'var(--spacing-lg)', borderLeft: '4px solid var(--danger)' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Cash Out</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>
                                {cashData.cash_out?.toFixed(2) || '0.00'} Dhs
                            </div>
                        </div>
                        <div className="card bg-primary-light" style={{ padding: 'var(--spacing-lg)', borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Closing Balance</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                {cashData.balance?.toFixed(2) || '0.00'} Dhs
                            </div>
                        </div>
                    </div>

                    {cashData.transactions && cashData.transactions.length > 0 && (
                        <div>
                            <h4 className="mb-md">Detailed Transaction History</h4>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Description</th>
                                            <th>Type</th>
                                            <th>Cash In</th>
                                            <th>Cash Out</th>
                                            <th>Current Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cashData.transactions.map((txn: any, idx: number) => (
                                            <tr key={idx}>
                                                <td>{txn.date}</td>
                                                <td>{txn.description}</td>
                                                <td>
                                                    <span className={`badge ${txn.type === 'in' ? 'badge-paid' : 'badge-cancelled'}`}>
                                                        {txn.type === 'in' ? 'CASH IN' : 'CASH OUT'}
                                                    </span>
                                                </td>
                                                <td className="text-success">{txn.cash_in ? Number(txn.cash_in).toFixed(2) : '-'}</td>
                                                <td className="text-danger">{txn.cash_out ? Number(txn.cash_out).toFixed(2) : '-'}</td>
                                                <td className="font-bold">{Number(txn.balance).toFixed(2)} Dhs</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CashBookReport;
