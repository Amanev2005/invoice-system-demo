import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ItemWiseReport: React.FC = () => {
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const loadReport = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const response = await axios.get('http://127.0.0.1:8000/api/reports/item-wise/', { params });
            setReportData(response.data);
        } catch (error) {
            console.error('Error loading item-wise report:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = async () => {
        if (!reportData || !reportData.items) return;
        try {
            const XLSX = await import('xlsx');
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(reportData.items);
            XLSX.utils.book_append_sheet(wb, ws, "Items Sold");
            XLSX.writeFile(wb, `Item_Wise_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                <h1 style={{ margin: 0 }}>Item Wise Report</h1>
                {reportData && (
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
                    <p>Fetching inventory analytics...</p>
                </div>
            )}

            {!loading && reportData && (
                <div className="card">
                    <h3 className="mb-md">Periodic Items Summary</h3>

                    <div className="grid grid-cols-3 gap-lg mb-lg">
                        <div className="card bg-info-light" style={{ padding: 'var(--spacing-lg)', borderLeft: '4px solid var(--info)' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Distinct Items</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--info)' }}>
                                {reportData.total_items || 0}
                            </div>
                        </div>
                        <div className="card bg-success-light" style={{ padding: 'var(--spacing-lg)', borderLeft: '4px solid var(--success)' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Units Dispatched</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                                {reportData.total_quantity || 0}
                            </div>
                        </div>
                        <div className="card bg-primary-light" style={{ padding: 'var(--spacing-lg)', borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Movement Value</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                {reportData.total_value?.toFixed(2) || '0.00'} Dhs
                            </div>
                        </div>
                    </div>

                    {reportData.items && reportData.items.length > 0 && (
                        <div>
                            <h4 className="mb-md">Itemized Breakdown</h4>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Item Description</th>
                                            <th>Quantity</th>
                                            <th>Avg Rate</th>
                                            <th>Gross Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.items.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="font-semibold">{item.description}</td>
                                                <td>{item.quantity}</td>
                                                <td>{Number(item.avg_rate).toFixed(2)} Dhs</td>
                                                <td className="font-bold text-success">{Number(item.total_value).toFixed(2)} Dhs</td>
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

export default ItemWiseReport;
