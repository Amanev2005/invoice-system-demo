import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface WorkOrder {
    id: number;
    work_order_number: string;
    client: number;
    client_name: string;
    description: string;
    status: string;
    total_amount: string;
    start_date: string;
    due_date: string;
    completion_date: string | null;
    created_at: string;
}

const WorkOrders: React.FC = () => {
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        client: '',
        description: '',
        total_amount: '',
        start_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'pending'
    });

    const statuses = [
        { value: 'pending', label: 'Pending', color: 'var(--warning)' },
        { value: 'in_progress', label: 'In Progress', color: 'var(--info)' },
        { value: 'completed', label: 'Completed', color: 'var(--success)' },
        { value: 'cancelled', label: 'Cancelled', color: 'var(--danger)' }
    ];

    useEffect(() => {
        loadWorkOrders();
        loadClients();
    }, [statusFilter]);

    const loadWorkOrders = async () => {
        try {
            const params: any = {};
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            const response = await axios.get('http://127.0.0.1:8000/api/work-orders/', { params });
            setWorkOrders(response.data);
        } catch (error) {
            console.error('Error loading work orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadClients = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/clients/');
            setClients(response.data);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/work-orders/', formData);
            setShowForm(false);
            setFormData({
                client: '',
                description: '',
                total_amount: '',
                start_date: new Date().toISOString().split('T')[0],
                due_date: '',
                status: 'pending'
            });
            loadWorkOrders();
        } catch (error) {
            console.error('Error creating work order:', error);
            alert('Failed to create work order');
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/work-orders/${id}/`, { status: newStatus });
            loadWorkOrders();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this work order?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/work-orders/${id}/`);
                loadWorkOrders();
            } catch (error) {
                console.error('Error deleting work order:', error);
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <h1>Work Orders</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-lg">
                    + Create Work Order
                </button>
            </div>

            {showForm && (
                <div className="card mb-lg">
                    <h3 className="mb-md">Create New Work Order</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-md mb-md">
                            <div>
                                <label className="form-label">Client *</label>
                                <select
                                    className="form-input"
                                    value={formData.client}
                                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select Client --</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Total Amount (Dhs) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={formData.total_amount}
                                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Start Date *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Due Date *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-md">
                            <label className="form-label">Description *</label>
                            <textarea
                                className="form-input"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex gap-md">
                            <button type="submit" className="btn btn-primary">Create Work Order</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-md mb-lg">
                {statuses.map(status => {
                    const count = workOrders.filter(wo => wo.status === status.value).length;
                    return (
                        <div key={status.value} className="card" style={{ padding: 'var(--spacing-md)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                                {status.label}
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 600, color: status.color }}>
                                {count}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="card">
                <div className="flex gap-md mb-md">
                    <select
                        className="form-input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ width: '200px' }}
                    >
                        <option value="all">All Statuses</option>
                        {statuses.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>WO Number</th>
                                <th>Client</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Start Date</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workOrders.map(wo => (
                                <tr key={wo.id}>
                                    <td style={{ fontWeight: 600 }}>{wo.work_order_number}</td>
                                    <td>{wo.client_name}</td>
                                    <td>{wo.description}</td>
                                    <td>{Number(wo.total_amount).toFixed(2)} Dhs</td>
                                    <td>{wo.start_date ? new Date(wo.start_date).toLocaleDateString() : '-'}</td>
                                    <td>{wo.due_date ? new Date(wo.due_date).toLocaleDateString() : '-'}</td>
                                    <td>
                                        <select
                                            className="form-input"
                                            value={wo.status}
                                            onChange={(e) => handleStatusChange(wo.id, e.target.value)}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '0.875rem',
                                                backgroundColor: statuses.find(s => s.value === wo.status)?.color,
                                                color: 'white',
                                                border: 'none'
                                            }}
                                        >
                                            {statuses.map(s => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(wo.id)}
                                            className="btn btn-sm btn-danger"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {workOrders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--gray-500)' }}>
                        No work orders found
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkOrders;
