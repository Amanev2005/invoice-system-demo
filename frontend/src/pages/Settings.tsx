import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface CompanySettings {
    id: number;
    company_name: string;
    company_email: string;
    company_email_password: string;
    company_mobile: string;
    company_phone: string;
    company_po_box: string;
    company_address: string;
    about_company: string;
    logo?: string;
    logo_url: string | null;
    default_credit_terms: number;
    aging_period_1: number;
    aging_period_2: number;
    aging_period_3: number;
    soa_notes: string;
    enable_auto_backup: boolean;
    auto_backup_times: string;
}

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<CompanySettings>({
        id: 1,
        company_name: '',
        company_email: '',
        company_email_password: '',
        company_mobile: '',
        company_phone: '',
        company_po_box: '',
        company_address: '',
        about_company: '',
        logo_url: null,
        default_credit_terms: 30,
        aging_period_1: 30,
        aging_period_2: 60,
        aging_period_3: 90,
        soa_notes: '',
        enable_auto_backup: true,
        auto_backup_times: '02:00, 06:00, 14:00, 18:00'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.SETTINGS);
            // API returns single object, not array
            if (response.data) {
                setSettings(response.data);
                if (response.data.logo_url) {
                    setLogoPreview(response.data.logo_url);
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            setMessage({ type: 'error', text: 'Failed to load settings. Using defaults.' });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file type
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                setMessage({ type: 'error', text: 'Invalid file type. Please upload PNG or JPG format only.' });
                e.target.value = ''; // Clear the input
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                setMessage({ type: 'error', text: 'File too large. Maximum size is 5MB.' });
                e.target.value = '';
                return;
            }

            // Check image dimensions
            const img = new Image();
            const reader = new FileReader();

            reader.onloadend = () => {
                const result = reader.result as string;

                img.onload = () => {
                    // All validations passed
                    setLogoPreview(result);
                    setMessage(null);

                    // Upload the file
                    uploadLogo(file);
                };

                img.src = result;
            };

            reader.readAsDataURL(file);
        }
    };

    const uploadLogo = async (file: File) => {
        const formData = new FormData();
        formData.append('logo', file);

        try {
            // Use PATCH to update only the logo field
            // API_ENDPOINTS.SETTINGS typically ends in with /
            const url = `${API_ENDPOINTS.SETTINGS}${settings.id || 1}/`;
            await axios.patch(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Reload all settings to get the updated logo URL
            await loadSettings();

            setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
        } catch (error) {
            console.error('Error uploading logo:', error);
            setMessage({ type: 'error', text: 'Failed to upload logo. Please try again.' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            // Create a copy of settings and remove logo/logo_url
            // These are handled separately or are read-only
            const { logo, logo_url, ...settingsToSave } = settings as any;

            const url = `${API_ENDPOINTS.SETTINGS}${settings.id || 1}/`;
            await axios.put(url, settingsToSave);
            setMessage({ type: 'success', text: 'Settings saved successfully!' });

            // Reload settings to confirm save
            await loadSettings();

            // Reload page to update navigation bar
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof CompanySettings, value: string | number) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-2xl)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Company Settings</h1>

            {message && (
                <div className={`alert alert-${message.type}`} style={{ marginBottom: 'var(--spacing-lg)' }}>
                    {message.text}
                </div>
            )}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-lg">
                        {/* Company Logo Section */}
                        <div style={{ gridColumn: '1 / -1', marginBottom: 'var(--spacing-md)' }}>
                            <label className="form-label">Company Logo</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                                <div
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        overflow: 'hidden',
                                        border: '1px solid var(--gray-300)',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'var(--gray-50)'
                                    }}
                                >
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Company Logo"
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <span style={{ color: 'var(--gray-400)' }}>No Logo</span>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="form-input"
                                        style={{ marginBottom: 'var(--spacing-sm)' }}
                                    />
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', margin: 0 }}>
                                        Recommended size: 300x150 pixels. PNG or JPG format.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Company Information Fields */}
                        <div className="form-group">
                            <label className="form-label">Company Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={settings.company_name}
                                onChange={e => handleChange('company_name', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                value={settings.company_email}
                                onChange={e => handleChange('company_email', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Password (Gmail App Password)</label>
                            <input
                                type="password"
                                className="form-input"
                                value={settings.company_email_password}
                                onChange={e => handleChange('company_email_password', e.target.value)}
                                placeholder="16-character app password"
                            />
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: 'var(--spacing-xs)' }}>
                                Required for sending emails. Generate from Google Account → Security → App Passwords
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mobile Number</label>
                            <input
                                type="text"
                                className="form-input"
                                value={settings.company_mobile}
                                onChange={e => handleChange('company_mobile', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Telephone Number</label>
                            <input
                                type="text"
                                className="form-input"
                                value={settings.company_phone}
                                onChange={e => handleChange('company_phone', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                        </div>

                        <div className="form-group">
                            <label className="form-label">P.O. Box</label>
                            <input
                                type="text"
                                className="form-input"
                                value={settings.company_po_box}
                                onChange={e => handleChange('company_po_box', e.target.value)}
                            />
                        </div>

                        {/* SOA Settings Section */}
                        <div style={{ gridColumn: '1 / -1', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-md)', borderBottom: '2px solid var(--primary-500)', paddingBottom: 'var(--spacing-sm)' }}>
                                Statement of Account (SOA) Settings
                            </h3>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Default Credit Terms (Days)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={settings.default_credit_terms}
                                onChange={e => handleChange('default_credit_terms', parseInt(e.target.value) || 30)}
                                min="1"
                            />
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: 'var(--spacing-xs)' }}>
                                Default payment terms for new clients
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Aging Period 1 (Days)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={settings.aging_period_1}
                                onChange={e => handleChange('aging_period_1', parseInt(e.target.value) || 30)}
                                min="1"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Aging Period 2 (Days)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={settings.aging_period_2}
                                onChange={e => handleChange('aging_period_2', parseInt(e.target.value) || 60)}
                                min="1"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Aging Period 3 (Days)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={settings.aging_period_3}
                                onChange={e => handleChange('aging_period_3', parseInt(e.target.value) || 90)}
                                min="1"
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">SOA Default Notes</label>
                            <textarea
                                className="form-textarea"
                                value={settings.soa_notes}
                                onChange={e => handleChange('soa_notes', e.target.value)}
                                rows={3}
                                placeholder="Default notes to appear on Statement of Account..."
                            />
                        </div>

                        {/* Backup Settings Section */}
                        <div style={{ gridColumn: '1 / -1', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-md)', borderBottom: '2px solid var(--primary-500)', paddingBottom: 'var(--spacing-sm)' }}>
                                Backup & Maintenance Settings
                            </h3>
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <input
                                    type="checkbox"
                                    id="enable_auto_backup"
                                    checked={settings.enable_auto_backup}
                                    onChange={e => setSettings(prev => ({ ...prev, enable_auto_backup: e.target.checked }))}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <label htmlFor="enable_auto_backup" style={{ fontWeight: 600, cursor: 'pointer' }}>
                                    Enable Automatic Daily Backups
                                </label>
                            </div>
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Auto-Backup Timers (24h format, comma separated)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={settings.auto_backup_times}
                                onChange={e => handleChange('auto_backup_times', e.target.value)}
                                placeholder="e.g. 02:00, 06:00, 14:00, 18:00"
                                disabled={!settings.enable_auto_backup}
                            />
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: 'var(--spacing-xs)' }}>
                                The system will automatically create database backups at these specified times every day.
                            </p>
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Address</label>
                            <textarea
                                className="form-textarea"
                                value={settings.company_address}
                                onChange={e => handleChange('company_address', e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">About Company</label>
                            <textarea
                                className="form-textarea"
                                value={settings.about_company}
                                onChange={e => handleChange('about_company', e.target.value)}
                                rows={4}
                                placeholder="Enter company description, mission, or other information..."
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--gray-200)' }}>
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
