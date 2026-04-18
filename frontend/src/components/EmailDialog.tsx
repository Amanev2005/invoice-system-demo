import React, { useState } from 'react';
import { api } from '../services/api';

interface EmailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: number;
    clientEmail: string;
    onSuccess: () => void;
}

const EmailDialog: React.FC<EmailDialogProps> = ({
    isOpen,
    onClose,
    invoiceId,
    clientEmail,
    onSuccess
}) => {
    const [email, setEmail] = useState(clientEmail);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError(null);
        setSuccess(false);

        try {
            await api.post(`${invoiceId}/send_email/`, { email });
            setSuccess(true);
            onSuccess();
            // Auto-close after 2 seconds to show success message
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000);
        } catch (err: any) {
            console.error('Error sending email:', err);
            setError(err.response?.data?.error || 'Failed to send email. Please check your configuration.');
        } finally {
            setSending(false);
        }
    };

    const handleClose = () => {
        setEmail(clientEmail);
        setError(null);
        setSuccess(false);
        onClose();
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
            <div className="card" style={{ width: '450px', maxWidth: '90vw' }}>
                <h2 style={{ marginTop: 0 }}>Send Invoice</h2>

                {error && (
                    <div style={{
                        padding: 'var(--spacing-md)',
                        backgroundColor: 'var(--error-light, #fee)',
                        border: '1px solid var(--error, #c00)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-lg)',
                        fontSize: '0.875rem',
                        color: 'var(--error-dark, #800)'
                    }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        padding: 'var(--spacing-md)',
                        backgroundColor: '#d4edda',
                        border: '1px solid #28a745',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-lg)',
                        fontSize: '0.875rem',
                        color: '#155724'
                    }}>
                        <strong>✓ Success!</strong> Email sent successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Recipient Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="client@example.com"
                            disabled={success}
                        />
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: 'var(--spacing-xs)' }}>
                            This will send the invoice details via email to the client.
                        </p>
                    </div>

                    <div className="flex justify-end gap-md mt-lg">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-secondary"
                            disabled={sending}
                        >
                            {success ? 'Close' : 'Cancel'}
                        </button>
                        {!success && (
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={sending || !email}
                            >
                                {sending ? 'Sending...' : 'Send Invoice'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmailDialog;
