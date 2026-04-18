import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface StaffMember {
    id: number;
    name: string;
    email: string;
    role: string;
    department: string;
    status: 'active' | 'inactive';
    join_date: string;
    permissions: string[];
}

const StaffPortal: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Staff',
        department: 'Sales',
        status: 'active' as 'active' | 'inactive',
        permissions: [] as string[]
    });

    const roles = ['Admin', 'Manager', 'Accountant', 'Sales Executive', 'Staff', 'PRO'];
    const departments = ['Sales', 'Finance', 'Operations', 'HR', 'IT', 'Admin'];
    const availablePermissions = [
        { id: 'view_invoices', label: 'View Invoices' },
        { id: 'create_invoices', label: 'Create Invoices' },
        { id: 'edit_invoices', label: 'Edit Invoices' },
        { id: 'delete_invoices', label: 'Delete Invoices' },
        { id: 'view_clients', label: 'View Clients' },
        { id: 'manage_clients', label: 'Manage Clients' },
        { id: 'view_reports', label: 'View Reports' },
        { id: 'manage_payments', label: 'Manage Payments' },
        { id: 'manage_staff', label: 'Manage Staff' },
        { id: 'system_settings', label: 'System Settings' }
    ];

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/employees/');
            setStaff(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading staff:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedStaff) {
                await axios.put(`http://127.0.0.1:8000/api/employees/${selectedStaff.id}/`, formData);
            } else {
                await axios.post('http://127.0.0.1:8000/api/employees/', formData);
            }
            loadStaff();
            setShowForm(false);
            resetForm();
        } catch (error) {
            console.error('Error saving staff:', error);
            alert('Failed to save staff member');
        }
    };

    const handleEdit = (member: StaffMember) => {
        setSelectedStaff(member);
        setFormData({
            name: member.name,
            email: member.email,
            role: member.role,
            department: member.department,
            status: member.status,
            permissions: member.permissions || []
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to remove this staff member?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/employees/${id}/`);
                loadStaff();
            } catch (error) {
                console.error('Error deleting staff:', error);
                alert('Failed to delete staff member');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            role: 'Staff',
            department: 'Sales',
            status: 'active',
            permissions: []
        });
        setSelectedStaff(null);
    };

    const togglePermission = (permissionId: string) => {
        if (formData.permissions.includes(permissionId)) {
            setFormData({
                ...formData,
                permissions: formData.permissions.filter(p => p !== permissionId)
            });
        } else {
            setFormData({
                ...formData,
                permissions: [...formData.permissions, permissionId]
            });
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <h1>Staff Portal</h1>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    className="btn btn-primary btn-lg"
                >
                    {showForm ? 'Cancel' : '+ Add Staff Member'}
                </button>
            </div>

            {showForm && (
                <div className="card mb-lg">
                    <h3 className="mb-md">{selectedStaff ? 'Edit' : 'Add'} Staff Member</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-md mb-md">
                            <div>
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Role *</label>
                                <select
                                    className="form-input"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Department *</label>
                                <select
                                    className="form-input"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                >
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Status *</label>
                                <select
                                    className="form-input"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-md">
                            <label className="form-label">Permissions</label>
                            <div className="grid grid-cols-2 gap-sm" style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
                                {availablePermissions.map(perm => (
                                    <div key={perm.id} className="flex items-center gap-sm">
                                        <input
                                            type="checkbox"
                                            id={perm.id}
                                            checked={formData.permissions.includes(perm.id)}
                                            onChange={() => togglePermission(perm.id)}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <label htmlFor={perm.id} style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                                            {perm.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-md">
                            <button type="submit" className="btn btn-primary">
                                {selectedStaff ? 'Update' : 'Add'} Staff Member
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-md mb-lg">
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                        Total Staff
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {staff.length}
                    </div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                        Active
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--success)' }}>
                        {staff.filter(s => s.status === 'active').length}
                    </div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                        Departments
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--info)' }}>
                        {new Set(staff.map(s => s.department)).size}
                    </div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>
                        Roles
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--warning)' }}>
                        {new Set(staff.map(s => s.role)).size}
                    </div>
                </div>
            </div>

            {/* Staff List */}
            <div className="card">
                <h3 className="mb-md">Staff Members</h3>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Join Date</th>
                                <th>Permissions</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map(member => (
                                <tr key={member.id}>
                                    <td style={{ fontWeight: 600 }}>{member.name}</td>
                                    <td>{member.email}</td>
                                    <td><span className="badge badge-info">{member.role}</span></td>
                                    <td>{member.department}</td>
                                    <td>{new Date(member.join_date).toLocaleDateString()}</td>
                                    <td>
                                        <span className="badge badge-secondary">
                                            {member.permissions ? member.permissions.length : 0} permissions
                                        </span>
                                    </td>
                                    <td>
                                        {member.status === 'active' ? (
                                            <span className="badge badge-success">Active</span>
                                        ) : (
                                            <span className="badge badge-danger">Inactive</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex gap-sm">
                                            <button
                                                onClick={() => handleEdit(member)}
                                                className="btn btn-sm btn-secondary"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="btn btn-sm btn-danger"
                                            >
                                                Remove
                                            </button>
                                        </div>
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

export default StaffPortal;
