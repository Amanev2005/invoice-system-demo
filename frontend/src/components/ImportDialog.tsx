import React, { useState, useRef } from 'react';
import { api } from '../services/api';

interface ImportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: () => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ isOpen, onClose, onImportSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('import_invoices/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setResult({
                success: response.data.success_count,
                errors: response.data.errors
            });

            if (response.data.success_count > 0) {
                onImportSuccess();
            }
        } catch (error) {
            console.error('Import failed:', error);
            setResult({
                success: 0,
                errors: ['Failed to upload file. Please try again.']
            });
        } finally {
            setUploading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 style={{ marginTop: 0 }}>Import Invoices</h2>

                {!result ? (
                    <>
                        <p className="text-gray-600 mb-lg">
                            Upload a CSV or Excel file to bulk import invoices.
                            Duplicate invoice numbers will be skipped.
                        </p>

                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                className="form-input"
                            />
                        </div>

                        <div className="flex justify-end gap-md">
                            <button
                                onClick={onClose}
                                className="btn btn-secondary"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                className="btn btn-primary"
                                disabled={!file || uploading}
                            >
                                {uploading ? 'Importing...' : 'Start Import'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="result-container">
                        <div className={`alert ${result.success > 0 ? 'alert-success' : 'alert-warning'} mb-lg`}>
                            Successfully imported {result.success} invoices.
                        </div>

                        {result.errors.length > 0 && (
                            <div className="alert alert-error mb-lg">
                                <strong>Errors ({result.errors.length}):</strong>
                                <ul style={{ margin: 'var(--spacing-sm) 0 0 0', paddingLeft: 'var(--spacing-lg)' }}>
                                    {result.errors.slice(0, 5).map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                    {result.errors.length > 5 && (
                                        <li>...and {result.errors.length - 5} more errors</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-end gap-md">
                            <button
                                onClick={handleReset}
                                className="btn btn-secondary"
                            >
                                Import More
                            </button>
                            <button
                                onClick={onClose}
                                className="btn btn-primary"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportDialog;
