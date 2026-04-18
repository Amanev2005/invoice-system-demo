import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ActivityLog {
    id: number;
    action: string;
    model_name: string;
    object_id: number;
    description: string;
    ip_address: string;
    timestamp: string;
}

const ActivityLog: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('all');
    const [modelFilter, setModelFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    const actions = [
        { value: 'create', label: 'Create', icon: '➕', color: 'var(--success)' },
        { value: 'update', label: 'Update', icon: '✏️', color: 'var(--info)' },
        { value: 'delete', label: 'Delete', icon: '🗑️', color: 'var(--danger)' },
        { value: 'view', label: 'View', icon: '👁️', color: 'var(--gray-600)' },
        { value: 'email', label: 'Email', icon: '📧', color: 'var(--primary)' },
        { value: 'export', label: 'Export', icon: '📤', color: 'var(--warning)' },
        { value: 'login', label: 'Login', icon: '🔐', color: 'var(--success)' },
        { value: 'logout', label: 'Logout', icon: '🚪', color: 'var(--gray-500)' }
    ];

    const models = [
        'Invoice', 'Client', 'Payment', 'WorkOrder', 'Lead',
        'Service', 'Transaction', 'Document', 'User'
    ];

    useEffect(() => {
        loadLogs();
    }, [actionFilter, modelFilter, dateFilter]);

    const loadLogs = async () => {
        try {
            const params: any = {};
            if (actionFilter !== 'all') params.action = actionFilter;
            if (modelFilter !== 'all') params.model = modelFilter;
            if (dateFilter) params.date_from = dateFilter;

            const response = await axios.get('http://127.0.0.1:8000/api/activity-logs/', { params });
            setLogs(response.data);
        } catch (error) {
            console.error('Error loading activity logs:', error);
            setLogs([]); // Show empty list on error
        } finally {
            setLoading(false);
        }
    };

    const getActionInfo = (action: string) => {
        return actions.find(a => a.value === action) || { icon: '📝', color: 'var(--gray-600)', label: action };
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleString();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="mb-lg">Activity Log</h1>

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-md mb-lg">
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                        Total Activities
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {logs.length}
                    </div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                        Today
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--success)' }}>
                        {logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length}
                    </div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                        This Week
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--info)' }}>
                        {logs.filter(l => {
                            const logDate = new Date(l.timestamp);
                            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                            return logDate >= weekAgo;
                        }).length}
                    </div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                        Unique IPs
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--warning)' }}>
                        {new Set(logs.map(l => l.ip_address)).size}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-lg">
                <div className="grid grid-cols-3 gap-md">
                    <div>
                        <label className="form-label">Filter by Action</label>
                        <select
                            className="form-input"
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                        >
                            <option value="all">All Actions</option>
                            {actions.map(action => (
                                <option key={action.value} value={action.value}>
                                    {action.icon} {action.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Filter by Model</label>
                        <select
                            className="form-input"
                            value={modelFilter}
                            onChange={(e) => setModelFilter(e.target.value)}
                        >
                            <option value="all">All Models</option>
                            {models.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">From Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="card">
                <h3 className="mb-md">Activity Timeline</h3>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {logs.map(log => {
                        const actionInfo = getActionInfo(log.action);
                        return (
                            <div
                                key={log.id}
                                style={{
                                    padding: 'var(--spacing-md)',
                                    borderLeft: `4px solid ${actionInfo.color}`,
                                    borderBottom: '1px solid var(--gray-200)',
                                    marginBottom: 'var(--spacing-sm)',
                                    backgroundColor: 'var(--gray-50)',
                                    borderRadius: 'var(--radius-sm)'
                                }}
                            >
                                <div className="flex items-start gap-md">
                                    <div
                                        style={{
                                            fontSize: '1.5rem',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            border: `2px solid ${actionInfo.color}`
                                        }}
                                    >
                                        {actionInfo.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="flex items-center justify-between mb-xs">
                                            <div style={{ fontWeight: 600, color: actionInfo.color }}>
                                                {actionInfo.label} - {log.model_name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                                                {formatTimestamp(log.timestamp)}
                                            </div>
                                        </div>
                                        <div style={{ color: 'var(--gray-700)', marginBottom: 'var(--spacing-xs)' }}>
                                            {log.description}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                            <span className="badge badge-secondary" style={{ marginRight: 'var(--spacing-xs)' }}>
                                                ID: {log.object_id}
                                            </span>
                                            <span className="badge badge-secondary">
                                                IP: {log.ip_address}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {logs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--gray-500)' }}>
                        No activity logs found
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
