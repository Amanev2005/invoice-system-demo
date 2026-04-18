import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Lead {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    source: string;
    status: string;
    estimated_value: string;
    notes: string;
    created_at: string;
}

const Leads: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'website',
        status: 'new',
        estimated_value: '',
        notes: ''
    });

    const statuses = [
        { value: 'new', label: 'New', color: 'var(--info)' },
        { value: 'contacted', label: 'Contacted', color: 'var(--warning)' },
        { value: 'qualified', label: 'Qualified', color: 'var(--primary)' },
        { value: 'proposal', label: 'Proposal Sent', color: 'var(--purple)' },
        { value: 'negotiation', label: 'Negotiation', color: 'var(--orange)' },
        { value: 'converted', label: 'Converted', color: 'var(--success)' },
        { value: 'lost', label: 'Lost', color: 'var(--danger)' }
    ];

    const sources = [
        { value: 'website', label: 'Website' },
        { value: 'referral', label: 'Referral' },
        { value: 'cold_call', label: 'Cold Call' },
        { value: 'email', label: 'Email Campaign' },
        { value: 'social_media', label: 'Social Media' },
        { value: 'walk_in', label: 'Walk-in' },
        { value: 'other', label: 'Other' }
    ];

    useEffect(() => {
        loadLeads();
    }, [statusFilter]);

    const loadLeads = async () => {
        try {
            const params: any = {};
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            const response = await axios.get('http://127.0.0.1:8000/api/leads/', { params });
            setLeads(response.data);
        } catch (error) {
            console.error('Error loading leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/leads/', formData);
            setShowForm(false);
            setFormData({ name: '', email: '', phone: '', company: '', source: 'website', status: 'new', estimated_value: '', notes: '' });
            loadLeads();
        } catch (error) {
            console.error('Error creating lead:', error);
        }
    };

    const handleConvert = async (id: number) => {
        if (window.confirm('Convert this lead to a client?')) {
            try {
                await axios.post(`http://127.0.0.1:8000/api/leads/${id}/convert/`);
                loadLeads();
                alert('Lead converted to client successfully!');
            } catch (error) {
                console.error('Error converting lead:', error);
                alert('Error converting lead');
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <h1>Leads Management</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-lg">
                    + Add Lead
                </button>
            </div>

            {showForm && (
                <div className="card mb-lg">
                    <h3 className="mb-md">Add New Lead</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-md mb-md">
                            <div>
                                <label className="form-label">Name *</label>
                                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="form-label">Company</label>
                                <input type="text" className="form-input" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
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
                                <label className="form-label">Source</label>
                                <select className="form-input" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })}>
                                    {sources.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Estimated Value (Dhs)</label>
                                <input type="number" step="0.01" className="form-input" value={formData.estimated_value} onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })} />
                            </div>
                        </div>
                        <div className="mb-md">
                            <label className="form-label">Notes</label>
                            <textarea className="form-input" rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                        </div>
                        <div className="flex gap-md">
                            <button type="submit" className="btn btn-primary">Save Lead</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card mb-lg">
                <div className="flex gap-md mb-md">
                    <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '200px' }}>
                        <option value="all">All Statuses</option>
                        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Company</th>
                                <th>Contact</th>
                                <th>Source</th>
                                <th>Status</th>
                                <th>Est. Value</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map(lead => (
                                <tr key={lead.id}>
                                    <td style={{ fontWeight: 600 }}>{lead.name}</td>
                                    <td>{lead.company || '-'}</td>
                                    <td>
                                        {lead.email && <div>{lead.email}</div>}
                                        {lead.phone && <div>{lead.phone}</div>}
                                    </td>
                                    <td><span className="badge badge-info">{sources.find(s => s.value === lead.source)?.label}</span></td>
                                    <td>
                                        <span className="badge" style={{ backgroundColor: statuses.find(s => s.value === lead.status)?.color, color: 'white' }}>
                                            {statuses.find(s => s.value === lead.status)?.label}
                                        </span>
                                    </td>
                                    <td>{Number(lead.estimated_value).toFixed(2)} Dhs</td>
                                    <td>
                                        {lead.status !== 'converted' && (
                                            <button onClick={() => handleConvert(lead.id)} className="btn btn-sm btn-success">
                                                Convert to Client
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leads;
