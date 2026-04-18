import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Backup {
    filename: string;
    size: number;
    size_kb: number;
    created_at: string;
}

const API = 'http://127.0.0.1:8000/api/backups';

const Backup: React.FC = () => {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadBackups();
    }, []);

    const loadBackups = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/`);
            setBackups(res.data.backups || []);
        } catch {
            setMessage({ type: 'error', text: 'Could not load backup list.' });
        } finally {
            setLoading(false);
        }
    };

    const showMsg = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 6000);
    };

    const handleCreate = async () => {
        setCreating(true);
        try {
            const res = await axios.post(`${API}/create_backup/`);
            showMsg('success', res.data.message || 'Backup created successfully!');
            await loadBackups();
            // Automatically trigger download of the newly created backup
            if (res.data.backup && res.data.backup.filename) {
                handleDownload(res.data.backup.filename);
            }
        } catch (e: any) {
            showMsg('error', e.response?.data?.error || 'Failed to create backup. Make sure pg_dump is installed.');
        } finally {
            setCreating(false);
        }
    };

    const handleDownload = (filename: string) => {
        window.open(`${API}/download/${filename}/`, '_blank');
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith('.sql')) {
            showMsg('error', 'Only .sql backup files are accepted.');
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post(`${API}/upload/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showMsg('success', res.data.message || 'File uploaded successfully!');
            await loadBackups();
        } catch (e: any) {
            showMsg('error', e.response?.data?.error || 'Upload failed.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRestoreClick = (filename: string) => {
        setConfirmRestore(filename);
    };

    const handleRestoreConfirm = async () => {
        if (!confirmRestore) return;
        setRestoring(true);
        setConfirmRestore(null);
        try {
            const res = await axios.post(`${API}/restore/`, {
                filename: confirmRestore,
                confirm: true,
            });
            showMsg('success', res.data.message || 'Database restored successfully!');
        } catch (e: any) {
            showMsg('error', e.response?.data?.error || 'Restore failed. Check server logs.');
        } finally {
            setRestoring(false);
        }
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{ padding: 'var(--spacing-lg)', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>💾 Database Backup & Restore</h1>

            {/* Status Message */}
            {message && (
                <div
                    className={`alert alert-${message.type}`}
                    style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}
                >
                    {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
            )}

            {/* Restore Confirmation Modal */}
            {confirmRestore && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="card" style={{
                        maxWidth: '480px', width: '90%', padding: 'var(--spacing-xl)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>⚠️</div>
                            <h2 style={{ color: '#dc2626', marginBottom: 'var(--spacing-sm)' }}>Confirm Restore</h2>
                            <p style={{ color: 'var(--gray-700)', lineHeight: 1.6 }}>
                                <strong>This will overwrite ALL current data</strong> in the database
                                and cannot be undone!
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: 'var(--spacing-sm)' }}>
                                File: <code>{confirmRestore}</code>
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                            <button
                                onClick={() => setConfirmRestore(null)}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                ❌ Cancel
                            </button>
                            <button
                                onClick={handleRestoreConfirm}
                                className="btn"
                                style={{
                                    flex: 1, backgroundColor: '#dc2626',
                                    color: 'white', border: 'none'
                                }}
                            >
                                ✅ Yes, Restore
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                {/* Create Backup */}
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-md)' }}>📤</div>
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Create Backup</h3>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: 'var(--spacing-lg)' }}>
                        Save a full backup of the database right now.
                    </p>
                    <button
                        onClick={handleCreate}
                        disabled={creating}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        {creating ? '⏳ Creating...' : '📤 Create Backup Now'}
                    </button>
                </div>

                {/* Upload Backup */}
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-md)' }}>📁</div>
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Upload Backup</h3>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: 'var(--spacing-lg)' }}>
                        Upload a .sql backup file from your computer.
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".sql"
                        onChange={handleUpload}
                        style={{ display: 'none' }}
                        id="backup-upload-input"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                    >
                        {uploading ? '⏳ Uploading...' : '📁 Select & Upload File'}
                    </button>
                </div>

                {/* Download Latest */}
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-md)' }}>⬇️</div>
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Download Latest</h3>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: 'var(--spacing-lg)' }}>
                        Quickly download the most recent backup file.
                    </p>
                    <button
                        onClick={() => backups.length > 0 && handleDownload(backups[0].filename)}
                        disabled={backups.length === 0}
                        className="btn btn-success"
                        style={{ width: '100%' }}
                    >
                        {backups.length > 0 ? '⬇️ Download' : 'No Backups'}
                    </button>
                    <p style={{ marginTop: 'var(--spacing-md)', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        Stored in: <code>backend/backups/</code>
                    </p>
                </div>
            </div>

            {/* Backup List */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <h2 style={{ margin: 0 }}>📋 Available Backups ({backups.length})</h2>
                    <button onClick={loadBackups} className="btn btn-secondary btn-sm">
                        🔄 Refresh
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--gray-500)' }}>
                        Loading...
                    </div>
                ) : backups.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--gray-500)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>💾</div>
                        <p>No backups found. Create your first backup above!</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
                                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Filename</th>
                                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>Size</th>
                                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Created</th>
                                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {backups.map((backup) => (
                                    <tr key={backup.filename} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                        <td style={{ padding: 'var(--spacing-md)', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                            💾 {backup.filename}
                                        </td>
                                        <td style={{ padding: 'var(--spacing-md)', textAlign: 'right', color: 'var(--gray-600)' }}>
                                            {backup.size_kb} KB
                                        </td>
                                        <td style={{ padding: 'var(--spacing-md)', color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                                            {formatDate(backup.created_at)}
                                        </td>
                                        <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleDownload(backup.filename)}
                                                    className="btn btn-secondary btn-sm"
                                                    title="Download"
                                                >
                                                    ⬇️ Download
                                                </button>
                                                <button
                                                    onClick={() => handleRestoreClick(backup.filename)}
                                                    disabled={restoring}
                                                    className="btn btn-sm"
                                                    style={{ backgroundColor: '#dc2626', color: 'white', border: 'none' }}
                                                    title="Restore this backup"
                                                >
                                                    {restoring ? '⏳' : '♻️ Restore'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Backup;
