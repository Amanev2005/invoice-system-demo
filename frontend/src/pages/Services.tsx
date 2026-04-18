import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Service {
    id: number;
    name: string;
    description: string;
    default_price: string;
    category: string;
    is_active: boolean;
    created_at: string;
}

const Services: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        default_price: '',
        category: 'typing',
        is_active: true
    });

    const categories = [
        { value: 'typing', label: 'Typing Services' },
        { value: 'document', label: 'Document Clearing' },
        { value: 'visa', label: 'Visa Services' },
        { value: 'immigration', label: 'Immigration Services' },
        { value: 'labour', label: 'Labour Card Services' },
        { value: 'other', label: 'Other Services' }
    ];

    useEffect(() => {
        loadServices();
    }, [categoryFilter]);

    const loadServices = async () => {
        try {
            const params: any = {};
            if (categoryFilter !== 'all') {
                params.category = categoryFilter;
            }
            const response = await axios.get('http://127.0.0.1:8000/api/services/', { params });
            setServices(response.data);
        } catch (error) {
            console.error('Error loading services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/services/', formData);
            setShowForm(false);
            setFormData({ name: '', description: '', default_price: '', category: 'typing', is_active: true });
            loadServices();
        } catch (error) {
            console.error('Error creating service:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/services/${id}/`);
                loadServices();
            } catch (error) {
                console.error('Error deleting service:', error);
            }
        }
    };

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <h1>Services Catalog</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-lg">
                    + Add Service
                </button>
            </div>

            {showForm && (
                <div className="card mb-lg">
                    <h3 className="mb-md">Add New Service</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-md mb-md">
                            <div>
                                <label className="form-label">Service Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Default Price (Dhs) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={formData.default_price}
                                    onChange={(e) => setFormData({ ...formData, default_price: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-md">
                            <label className="form-label">Category *</label>
                            <select
                                className="form-input"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-md">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-input"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-md">
                            <button type="submit" className="btn btn-primary">Save Service</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card mb-lg">
                <div className="flex gap-md mb-md">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <select
                        className="form-input"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{ width: '200px' }}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Service Name</th>
                                <th>Category</th>
                                <th>Default Price</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.map(service => (
                                <tr key={service.id}>
                                    <td style={{ fontWeight: 600 }}>{service.name}</td>
                                    <td>
                                        <span className="badge badge-info">
                                            {categories.find(c => c.value === service.category)?.label}
                                        </span>
                                    </td>
                                    <td>{Number(service.default_price).toFixed(2)} Dhs</td>
                                    <td>{service.description || '-'}</td>
                                    <td>
                                        {service.is_active ? (
                                            <span className="badge badge-success">Active</span>
                                        ) : (
                                            <span className="badge badge-secondary">Inactive</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(service.id)}
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

                {filteredServices.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--gray-500)' }}>
                        No services found
                    </div>
                )}
            </div>
        </div>
    );
};

export default Services;
