import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Expense {
    id: number;
    category: string;
    amount: number;
    description: string;
    date: string;
    payment_method: string;
    reference: string;
}

const Expenses: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        category: 'rent',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference: ''
    });

    const categories = [
        { value: 'supplier', label: 'Supplier Payment', icon: '🚚' },
        { value: 'service', label: 'Service Transaction', icon: '🛠️' },
        { value: 'general', label: 'General Expense', icon: '💸' },
        { value: 'rent', label: 'Rent', icon: '🏢' },
        { value: 'utilities', label: 'Utilities', icon: '💡' },
        { value: 'salary', label: 'Salary', icon: '💰' },
        { value: 'supplies', label: 'Office Supplies', icon: '📎' },
        { value: 'marketing', label: 'Marketing', icon: '📢' },
        { value: 'travel', label: 'Travel', icon: '✈️' },
        { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
        { value: 'other', label: 'Other', icon: '📋' }
    ];

    const paymentMethods = ['Cash', 'Bank Transfer', 'Credit Card', 'Cheque'];

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/expenses/');
            setExpenses(response.data);
        } catch (error) {
            console.error('Error loading expenses:', error);
            // Sample data
            setExpenses([
                { id: 1, category: 'rent', amount: 15000, description: 'Office rent - January', date: '2024-01-01', payment_method: 'Bank Transfer', reference: 'TXN001' },
                { id: 2, category: 'utilities', amount: 2500, description: 'Electricity and water bill', date: '2024-01-15', payment_method: 'Cash', reference: '' },
                { id: 3, category: 'salary', amount: 45000, description: 'Staff salaries - January', date: '2024-01-31', payment_method: 'Bank Transfer', reference: 'TXN002' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/expenses/', formData);
            setShowForm(false);
            setFormData({ category: 'rent', amount: '', description: '', date: new Date().toISOString().split('T')[0], payment_method: 'cash', reference: '' });
            loadExpenses();
        } catch (error) {
            console.error('Error creating expense:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/expenses/${id}/`);
                loadExpenses();
            } catch (error) {
                console.error('Error deleting expense:', error);
            }
        }
    };

    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const thisMonthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        const now = new Date();
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }).reduce((sum, exp) => sum + Number(exp.amount), 0);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <h1>Expenses</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-lg">
                    + Add Expense
                </button>
            </div>

            {showForm && (
                <div className="card mb-lg">
                    <h3 className="mb-md">Add New Expense</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-md mb-md">
                            <div>
                                <label className="form-label">Category *</label>
                                <select className="form-input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Amount (Dhs) *</label>
                                <input type="number" step="0.01" className="form-input" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                            </div>
                            <div>
                                <label className="form-label">Date *</label>
                                <input type="date" className="form-input" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                            </div>
                            <div>
                                <label className="form-label">Payment Method *</label>
                                <select className="form-input" value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}>
                                    {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mb-md">
                            <label className="form-label">Description *</label>
                            <textarea className="form-input" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                        </div>
                        <div className="mb-md">
                            <label className="form-label">Reference Number</label>
                            <input type="text" className="form-input" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} />
                        </div>
                        <div className="flex gap-md">
                            <button type="submit" className="btn btn-primary">Add Expense</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-3 gap-md mb-lg">
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Expenses</div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--danger)' }}>{totalExpenses.toFixed(2)} Dhs</div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>This Month</div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--warning)' }}>{thisMonthExpenses.toFixed(2)} Dhs</div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Records</div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--info)' }}>{expenses.length}</div>
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Payment Method</th>
                                <th>Reference</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(expense => {
                                const category = categories.find(c => c.value === expense.category);
                                return (
                                    <tr key={expense.id}>
                                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                                        <td>
                                            <span className="badge badge-warning">
                                                {category?.icon} {category?.label}
                                            </span>
                                        </td>
                                        <td>{expense.description}</td>
                                        <td>{expense.payment_method}</td>
                                        <td>{expense.reference || '-'}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--danger)' }}>{Number(expense.amount).toFixed(2)} Dhs</td>
                                        <td>
                                            <button onClick={() => handleDelete(expense.id)} className="btn btn-sm btn-danger">Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
