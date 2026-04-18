import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

interface EmailLog {
    id: number;
    recipient_email: string;
    status: 'success' | 'failed';
    error_message: string | null;
    sent_at: string;
}

interface EmailHistoryProps {
    invoiceId: number;
    refreshTrigger: number;
}

const EmailHistory: React.FC<EmailHistoryProps> = ({ invoiceId, refreshTrigger }) => {
    const [history, setHistory] = useState<EmailLog[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadHistory();
    }, [invoiceId, refreshTrigger]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get(`${invoiceId}/email_history/`);
            setHistory(response.data);
        } catch (error) {
            console.error('Error loading email history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && history.length === 0) {
        return <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Loading history...</div>;
    }

    if (history.length === 0) {
        return null; // hide if empty
    }

    return (
        <div style={{ marginTop: 'var(--spacing-xl)', borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--spacing-lg)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Email History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {history.map(log => (
                    <div
                        key={log.id}
                        style={{
                            fontSize: '0.875rem',
                            padding: 'var(--spacing-sm)',
                            backgroundColor: 'var(--gray-50)',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: `3px solid ${log.status === 'success' ? 'var(--success)' : 'var(--danger)'}`
                        }}
                    >
                        <div className="flex justify-between">
                            <strong>{log.recipient_email}</strong>
                            <span style={{ color: 'var(--gray-500)' }}>
                                {new Date(log.sent_at).toLocaleString()}
                            </span>
                        </div>
                        {log.status === 'failed' && (
                            <div style={{ color: 'var(--danger)', marginTop: '2px' }}>
                                Error: {log.error_message}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmailHistory;
