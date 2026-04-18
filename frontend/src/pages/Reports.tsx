import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ReportData {
    revenue?: any;
    expenses?: any;
    profit_loss?: any;
}

const Reports: React.FC = () => {
    const [activeReport, setActiveReport] = useState<'revenue' | 'expenses' | 'profit'>('profit');
    const [reportData, setReportData] = useState<ReportData>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

    const loadReport = async (reportType: string) => {
        setLoading(true);
        setError('');
        // Clear previous data for this report type
        const reportKey = reportType.replace('-', '_');
        setReportData(prev => ({ ...prev, [reportKey]: null }));

        try {
            const params: any = {};
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const response = await axios.get(`http://127.0.0.1:8000/api/reports/${reportType}/`, { params });
            console.log(`${reportType} report data:`, response.data);
            setReportData(prev => ({ ...prev, [reportKey]: response.data }));
        } catch (error: any) {
            console.error(`Error loading ${reportType} report:`, error);
            setError(error.response?.data?.message || `Failed to load ${reportType} report. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = () => {
        const reportMap: any = {
            revenue: 'revenue',
            expenses: 'expenses',
            profit: 'profit-loss'
        };
        loadReport(reportMap[activeReport]);
    };

    // Auto-load report when page opens or active tab changes
    useEffect(() => {
        const reportMap: any = {
            revenue: 'revenue',
            expenses: 'expenses',
            profit: 'profit-loss'
        };
        loadReport(reportMap[activeReport]);
    }, [activeReport, dateFrom, dateTo]);

    return (
        <div>
            <h1 className="mb-lg">Reports</h1>

            {/* Report Type Tabs */}
            <div className="card mb-lg">
                <div className="flex gap-md mb-lg" style={{ borderBottom: '2px solid var(--gray-200)', paddingBottom: 'var(--spacing-md)' }}>
                    <button
                        className={`btn ${activeReport === 'revenue' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveReport('revenue')}
                    >
                        Revenue Report
                    </button>
                    <button
                        className={`btn ${activeReport === 'expenses' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveReport('expenses')}
                    >
                        Expense Report
                    </button>
                    <button
                        className={`btn ${activeReport === 'profit' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveReport('profit')}
                    >
                        Profit & Loss
                    </button>
                </div>

                {/* Date Range Filter */}
                <div className="grid grid-cols-3 gap-md mb-md">
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
                        <button onClick={handleGenerateReport} className="btn btn-primary" style={{ width: '100%' }}>
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="card" style={{ backgroundColor: 'var(--danger-light)', padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                    <p style={{ color: 'var(--danger)', margin: 0 }}>❌ {error}</p>
                </div>
            )}

            {/* Report Display */}
            {loading && (
                <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                    <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--gray-600)' }}>Loading report...</p>
                </div>
            )}

            {!loading && activeReport === 'revenue' && reportData.revenue && (
                <div className="card">
                    <h3 className="mb-md">Revenue Report</h3>
                    {reportData.revenue.total_revenue === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 'var(--spacing-xl)' }}>
                            No revenue data found for the selected date range.
                        </p>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-lg mb-lg">
                                <div className="card" style={{ backgroundColor: 'var(--success-light)', padding: 'var(--spacing-lg)' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Revenue</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--success)' }}>
                                        {reportData.revenue.total_revenue.toFixed(2)} Dhs
                                    </div>
                                </div>
                                <div className="card" style={{ backgroundColor: 'var(--info-light)', padding: 'var(--spacing-lg)' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Payment Count</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--info)' }}>
                                        {reportData.revenue.payment_count}
                                    </div>
                                </div>
                            </div>

                            {reportData.revenue.by_payment_method && reportData.revenue.by_payment_method.length > 0 && (
                                <div className="mb-lg">
                                    <h4 className="mb-md">By Payment Method</h4>
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Payment Method</th>
                                                    <th>Count</th>
                                                    <th>Total Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.revenue.by_payment_method.map((item: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td>{item.payment_method}</td>
                                                        <td>{item.count}</td>
                                                        <td>{Number(item.total).toFixed(2)} Dhs</td>
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
            )}

            {!loading && activeReport === 'expenses' && reportData.expenses && (
                <div className="card">
                    <h3 className="mb-md">Expense Report</h3>
                    {reportData.expenses.total_expenses === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 'var(--spacing-xl)' }}>
                            No expense data found for the selected date range.
                        </p>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-lg mb-lg">
                                <div className="card" style={{ backgroundColor: 'var(--danger-light)', padding: 'var(--spacing-lg)' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Expenses</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--danger)' }}>
                                        {reportData.expenses.total_expenses.toFixed(2)} Dhs
                                    </div>
                                </div>
                                <div className="card" style={{ backgroundColor: 'var(--info-light)', padding: 'var(--spacing-lg)' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Expense Count</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--info)' }}>
                                        {reportData.expenses.expense_count}
                                    </div>
                                </div>
                            </div>

                            {reportData.expenses.by_category && reportData.expenses.by_category.length > 0 && (
                                <div>
                                    <h4 className="mb-md">By Category</h4>
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Category</th>
                                                    <th>Count</th>
                                                    <th>Total Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.expenses.by_category.map((item: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td>{item.category.replace('_', ' ')}</td>
                                                        <td>{item.count}</td>
                                                        <td>{Number(item.total).toFixed(2)} Dhs</td>
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
            )}

            {!loading && activeReport === 'profit' && reportData.profit_loss && (
                <div className="card">
                    <h3 className="mb-md">Profit & Loss Statement</h3>
                    {reportData.profit_loss.revenue.total === 0 && reportData.profit_loss.expenses.total === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 'var(--spacing-xl)' }}>
                            No profit & loss data found for the selected date range. Please select a date range and generate the report.
                        </p>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-lg mb-lg">
                                <div className="card" style={{ backgroundColor: 'var(--success-light)', padding: 'var(--spacing-lg)' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Gross Profit</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--success)' }}>
                                        {reportData.profit_loss.profit.gross.toFixed(2)} Dhs
                                    </div>
                                </div>
                                <div className="card" style={{ backgroundColor: 'var(--danger-light)', padding: 'var(--spacing-lg)' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Expenses</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--danger)' }}>
                                        {reportData.profit_loss.expenses.total.toFixed(2)} Dhs
                                    </div>
                                </div>
                                <div className="card" style={{ backgroundColor: reportData.profit_loss.profit.net >= 0 ? 'var(--success-light)' : 'var(--danger-light)', padding: 'var(--spacing-lg)' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Net Profit</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 600, color: reportData.profit_loss.profit.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                        {reportData.profit_loss.profit.net.toFixed(2)} Dhs
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ backgroundColor: 'var(--gray-100)', padding: 'var(--spacing-md)' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Profit Margin</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                                    {reportData.profit_loss.profit.margin_percentage}%
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;
