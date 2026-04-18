import React, { useState, useEffect } from 'react';
import { clientAPI, Client } from '../services/api';
import '../styles/ClientForm.css';

interface ClientFormProps {
    client: Client | null;
    onClose: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        trn_no: '',
        vat_no: '',
        credit_limit: 0,
        credit_terms: 30,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name,
                email: client.email,
                phone: client.phone,
                address: client.address,
                trn_no: client.trn_no || '',
                vat_no: client.vat_no || '',
                credit_limit: client.credit_limit,
                credit_terms: client.credit_terms,
            });
        }
    }, [client]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (client) {
                await clientAPI.update(client.id, formData);
            } else {
                await clientAPI.create(formData);
            }
            onClose();
        } catch (error: any) {
            console.error('Error saving client:', error);
            alert(error.response?.data?.detail || 'Failed to save client');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'credit_limit' || name === 'credit_terms' ? parseFloat(value) || 0 : value
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{client ? 'Edit Client' : 'Add New Client'}</h2>
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Client Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter client name"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="client@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+971 XX XXX XXXX"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Enter client address"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="trn_no">TRN No (Tax Registration)</label>
                            <input
                                type="text"
                                id="trn_no"
                                name="trn_no"
                                value={formData.trn_no}
                                onChange={handleChange}
                                placeholder="e.g. 100234567800003"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="vat_no">VAT No</label>
                            <input
                                type="text"
                                id="vat_no"
                                name="vat_no"
                                value={formData.vat_no}
                                onChange={handleChange}
                                placeholder="VAT number (if applicable)"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="credit_limit">Credit Limit (AED)</label>
                            <input
                                type="number"
                                id="credit_limit"
                                name="credit_limit"
                                value={formData.credit_limit}
                                onChange={handleChange}
                                onInput={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    if (target.value.startsWith('0') && target.value.length > 1 && target.value[1] !== '.') {
                                        target.value = target.value.replace(/^0+/, '');
                                    }
                                }}
                                min="0"
                                step="0.01"
                                style={{ border: '1px solid black' }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="credit_terms">Credit Terms (Days)</label>
                            <select
                                id="credit_terms"
                                name="credit_terms"
                                value={formData.credit_terms}
                                onChange={handleChange}
                                style={{ border: '1px solid black' }}
                            >
                                <option value="0">Cash on Delivery</option>
                                <option value="7">7 Days</option>
                                <option value="15">15 Days</option>
                                <option value="30">30 Days</option>
                                <option value="60">60 Days</option>
                                <option value="90">90 Days</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (client ? 'Update Client' : 'Add Client')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientForm;
