import React, { useState, useEffect } from 'react';
import { supplierAPI, Supplier } from '../services/api';

const Suppliers: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        category: 'Office Supplies',
        status: 'active' as 'active' | 'inactive',
        balance: 0
    });

    const categories = ['Office Supplies', 'IT Services', 'Printing', 'Utilities', 'Professional Services', 'Other'];

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        try {
            const response = await supplierAPI.getAll();
            setSuppliers(response.data);
        } catch (error) {
            console.error('Error loading suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await supplierAPI.create(formData);
            loadSuppliers();
            setShowForm(false);
            setFormData({ name: '', email: '', phone: '', address: '', category: 'Office Supplies', status: 'active', balance: 0 });
        } catch (error) {
            console.error('Error creating supplier:', error);
            alert('Failed to create supplier');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            try {
                await supplierAPI.delete(id);
                loadSuppliers();
            } catch (error) {
                console.error('Error deleting supplier:', error);
                alert('Failed to delete supplier');
            }
        }
    };

    const totalBalance = suppliers.reduce((sum, s) => sum + Number(s.balance), 0);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <h1>Suppliers</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-lg">
                    + Add Supplier
                </button>
            </div>

            {showForm && (
                <div className="card mb-lg">
                    <h3 className="mb-md">Add New Supplier</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-md mb-md">
                            <div>
                                <label className="form-label">Supplier Name *</label>
                                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="form-label">Category *</label>
                                <select className="form-input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Email</label>
                                <input type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Phone</label>
                                <input type="tel" className="form-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Opening Balance (Dhs)</label>
                                <input type="number" className="form-input" value={formData.balance} onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })} step="0.01" />
                            </div>
                        </div>
                        <div className="mb-md">
                            <label className="form-label">Address</label>
                            <textarea className="form-input" rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                        <div className="flex gap-md">
                            <button type="submit" className="btn btn-primary">Add Supplier</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-3 gap-md mb-lg">
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Suppliers</div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary)' }}>{suppliers.length}</div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Active Suppliers</div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--success)' }}>{suppliers.filter(s => s.status === 'active').length}</div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Payable</div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--danger)' }}>{totalBalance.toFixed(2)} Dhs</div>
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Supplier Name</th>
                                <th>Category</th>
                                <th>Contact</th>
                                <th>Address</th>
                                <th>Balance</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map(supplier => (
                                <tr key={supplier.id}>
                                    <td style={{ fontWeight: 600 }}>{supplier.name}</td>
                                    <td><span className="badge badge-info">{supplier.category}</span></td>
                                    <td>
                                        {supplier.email && <div>{supplier.email}</div>}
                                        {supplier.phone && <div>{supplier.phone}</div>}
                                    </td>
                                    <td>{supplier.address}</td>
                                    <td style={{ fontWeight: 600, color: supplier.balance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                        {Number(supplier.balance).toFixed(2)} Dhs
                                    </td>
                                    <td>
                                        {supplier.status === 'active' ? (
                                            <span className="badge badge-success">Active</span>
                                        ) : (
                                            <span className="badge badge-secondary">Inactive</span>
                                        )}
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(supplier.id)} className="btn btn-sm btn-danger">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {suppliers.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No suppliers found. Add one above.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Suppliers;
