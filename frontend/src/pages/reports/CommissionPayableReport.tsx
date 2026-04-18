import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommissionPayableReport: React.FC = () => {
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

            const response = await axios.get('http://127.0.0.1:8000/api/commissions/', { params });
            setReportData(response.data);
        } catch (error) {
            console.error('Error loading commission report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, []);

    return (
        <div>
            <h1 className="mb-lg">Commission Payable Report</h1>

            <div className="card mb-lg">
                <div className="grid grid-cols-3 gap-md">
                    <div>
                        <label className="form-label">From Date</label>
                        <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label">To Date</label>
                        <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button onClick={loadReport} className="btn btn-primary" style={{ width: '100%' }}>Generate Report</button>
                    </div>
                </div>
            </div>

            {loading && <div className="card">Loading report...</div>}

            {!loading && reportData && Array.isArray(reportData) && (
                <div className="card">
                    <h3 className="mb-md">Commission Summary</h3>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Recipient</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((comm: any) => (
                                    <tr key={comm.id}>
                                        <td>{comm.date}</td>
                                        <td>{comm.description}</td>
                                        <td>{comm.recipient_name || '-'}</td>
                                        <td>{Number(comm.amount).toFixed(2)} Dhs</td>
                                        <td>
                                            <span className={`badge ${comm.status === 'paid' ? 'badge-paid' : 'badge-sent'}`}>
                                                {comm.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommissionPayableReport;
