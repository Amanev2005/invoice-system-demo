import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface NotificationTemplate {
    id: string;
    name: string;
    subject: string;
    message: string;
}

const NotifyClient: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClients, setSelectedClients] = useState<number[]>([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

    const templates: NotificationTemplate[] = [
        {
            id: 'payment_reminder',
            name: 'Payment Reminder',
            subject: 'Payment Reminder - Invoice Due',
            message: 'Dear {client_name},\n\nThis is a friendly reminder that your invoice is due for payment. Please settle your outstanding balance at your earliest convenience.\n\nThank you for your business.'
        },
        {
            id: 'invoice_sent',
            name: 'Invoice Sent',
            subject: 'New Invoice from {company_name}',
            message: 'Dear {client_name},\n\nPlease find attached your invoice. If you have any questions, please don\'t hesitate to contact us.\n\nBest regards'
        },
        {
            id: 'thank_you',
            name: 'Thank You',
            subject: 'Thank You for Your Business',
            message: 'Dear {client_name},\n\nThank you for your recent payment. We appreciate your business and look forward to serving you again.\n\nBest regards'
        },
        {
            id: 'custom',
            name: 'Custom Message',
            subject: '',
            message: ''
        }
    ];

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/clients/');
            setClients(response.data);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateChange = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setSubject(template.subject);
            setMessage(template.message);
        }
    };

    const toggleClient = (clientId: number) => {
        if (selectedClients.includes(clientId)) {
            setSelectedClients(selectedClients.filter(id => id !== clientId));
        } else {
            setSelectedClients([...selectedClients, clientId]);
        }
    };

    const selectAll = () => setSelectedClients(clients.map(c => c.id));
    const deselectAll = () => setSelectedClients([]);

    const handleSend = async () => {
        if (selectedClients.length === 0) {
            alert('Please select at least one client');
            return;
        }
        if (!message.trim()) {
            alert('Please enter a message');
            return;
        }
        if (!subject.trim()) {
            alert('Please enter a subject');
            return;
        }

        setSending(true);
        setResult(null);
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/clients/bulk_notify/', {
                client_ids: selectedClients,
                subject,
                message
            });
            setResult(response.data);
            if (response.data.success > 0) {
                setSelectedClients([]);
                setSubject('');
                setMessage('');
            }
        } catch (error: any) {
            const errMsg = error.response?.data?.error || 'Failed to send notifications. Check your email settings in Settings page.';
            alert(errMsg);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: 'var(--spacing-lg)' }}>
            <h1 className="mb-lg">📧 Notify Clients</h1>

            {result && (
                <div className={`alert alert-${result.failed === 0 ? 'success' : 'error'}`} style={{ marginBottom: 'var(--spacing-lg)' }}>
                    {result.success > 0 && <div>✅ Email sent to <strong>{result.success}</strong> client(s) successfully!</div>}
                    {result.failed > 0 && <div>❌ Failed to send to <strong>{result.failed}</strong> client(s).</div>}
                    {result.errors && result.errors.length > 0 && (
                        <ul style={{ marginTop: 'var(--spacing-sm)', paddingLeft: 'var(--spacing-lg)', fontSize: '0.875rem' }}>
                            {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                        </ul>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-lg">
                {/* Left Column - Client Selection */}
                <div className="card">
                    <div className="flex items-center justify-between mb-md">
                        <h3>Select Clients ({selectedClients.length} selected)</h3>
                        <div className="flex gap-sm">
                            <button onClick={selectAll} className="btn btn-sm btn-secondary">Select All</button>
                            <button onClick={deselectAll} className="btn btn-sm btn-secondary">Clear</button>
                        </div>
                    </div>

                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {clients.filter(c => c.email).map(client => (
                            <div
                                key={client.id}
                                onClick={() => toggleClient(client.id)}
                                style={{
                                    padding: 'var(--spacing-md)',
                                    borderBottom: '1px solid var(--gray-200)',
                                    cursor: 'pointer',
                                    backgroundColor: selectedClients.includes(client.id) ? 'var(--primary-light)' : 'transparent',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <div className="flex items-center gap-md">
                                    <input
                                        type="checkbox"
                                        checked={selectedClients.includes(client.id)}
                                        onChange={() => { }}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>{client.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                            📧 {client.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {clients.filter(c => !c.email).length > 0 && (
                            <div style={{ padding: 'var(--spacing-md)', color: 'var(--gray-400)', fontSize: '0.875rem', textAlign: 'center' }}>
                                {clients.filter(c => !c.email).length} client(s) without email are hidden
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Message Composition */}
                <div className="card">
                    <h3 className="mb-md">✉️ Compose Email</h3>

                    {/* Template Selection */}
                    <div className="mb-md">
                        <label className="form-label">Use Template</label>
                        <select
                            className="form-input"
                            onChange={(e) => handleTemplateChange(e.target.value)}
                        >
                            <option value="">-- Select Template --</option>
                            {templates.map(template => (
                                <option key={template.id} value={template.id}>{template.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Subject */}
                    <div className="mb-md">
                        <label className="form-label">Subject *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Enter email subject"
                        />
                    </div>

                    {/* Message */}
                    <div className="mb-md">
                        <label className="form-label">Message *</label>
                        <textarea
                            className="form-input"
                            rows={10}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter your message here..."
                        />
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: 'var(--spacing-xs)' }}>
                            Available variables: {'{client_name}'}, {'{company_name}'}
                        </div>
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={sending || selectedClients.length === 0}
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                    >
                        {sending ? '⏳ Sending...' : `📧 Send Email to ${selectedClients.length} Client(s)`}
                    </button>

                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 'var(--spacing-sm)', textAlign: 'center' }}>
                        Emails are sent using your Gmail settings configured in ⚙️ Settings.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotifyClient;
