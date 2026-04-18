import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const QuotationList: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'quotation' | 'converted' | 'rejected'>('quotation');
    const [showConverted, setShowConverted] = useState(false);

    // Placeholder data - will be replaced with API calls
    const tabs = [
        { key: 'quotation' as const, label: 'Quotation' },
        { key: 'converted' as const, label: 'Converted Quotation' },
        { key: 'rejected' as const, label: 'Rejected Quotation' },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <h1>Quotation List</h1>
                <Link to="/quotations/create" className="btn btn-primary">
                    + New Quotation
                </Link>
            </div>

            {/* Tabs */}
            <div className="card mb-lg" style={{ padding: 0 }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)' }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1,
                                padding: 'var(--spacing-md)',
                                border: 'none',
                                background: activeTab === tab.key ? 'white' : 'var(--gray-50)',
                                borderBottom: activeTab === tab.key ? '3px solid var(--primary)' : '3px solid transparent',
                                color: activeTab === tab.key ? 'var(--primary)' : 'var(--gray-600)',
                                fontWeight: activeTab === tab.key ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-lg">
                <div className="grid grid-cols-4 gap-md">
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">From Date</label>
                        <input type="date" className="form-input" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">To Date</label>
                        <input type="date" className="form-input" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Clients</label>
                        <select className="form-select">
                            <option value="">Select a Client</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Status</label>
                        <select className="form-select">
                            <option value="">Select a status</option>
                            <option value="new">New Order</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-md mt-lg">
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Created By</label>
                        <select className="form-select">
                            <option value="">Select a User</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Labels</label>
                        <select className="form-select">
                            <option value="">Select a Label</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'flex-end' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <input
                                type="checkbox"
                                checked={showConverted}
                                onChange={(e) => setShowConverted(e.target.checked)}
                            />
                            Show Converted
                        </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--spacing-sm)' }}>
                        <button className="btn btn-primary">Filter</button>
                        <button className="btn btn-secondary">Reset</button>
                    </div>
                </div>
            </div>

            {/* Search and Actions */}
            <div className="card mb-lg">
                <div className="flex items-center justify-between">
                    <input
                        type="search"
                        placeholder="Enter Quotation id / Trans. No / Hidden Remarks / Description"
                        className="form-input"
                        style={{ flex: 1, margin: 0 }}
                    />
                    <button className="btn btn-secondary" style={{ marginLeft: 'var(--spacing-md)' }}>
                        🔄 Reload All
                    </button>
                </div>
            </div>

            {/* Quotations Table */}
            <div className="card">
                <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 'var(--spacing-xl)' }}>
                    No quotations found. <Link to="/quotations/create" style={{ color: 'var(--primary)' }}>Create a new quotation</Link> to get started.
                </p>
            </div>
        </div>
    );
};

export default QuotationList;
