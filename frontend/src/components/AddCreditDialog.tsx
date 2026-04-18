import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AddCreditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    clientId?: number;
}

interface Client {
    id: number;
    name: string;
    credit_balance: number;
    debit_balance: number;
}

const AddCreditDialog: React.FC<AddCreditDialogProps> = ({ isOpen, onClose, onSuccess, clientId }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
    // Format: YYYY-MM-DDThh:mm
    const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
    const [amount, setAmount] = useState('');
    const [isAdvance, setIsAdvance] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash Account');
    const [remarks, setRemarks] = useState('');
    const [settleAmount, setSettleAmount] = useState('');
    const [settleOutstanding, setSettleOutstanding] = useState(false);
    const [loading, setLoading] = useState(false);

    const selectedClient = clients.find(c => c.id === selectedClientId);
    const creditBalance = Number(selectedClient?.credit_balance || 0);
    const debitBalance = Number(selectedClient?.debit_balance || 0);
    const balance = creditBalance - debitBalance;
    const outstandingBalance = debitBalance - creditBalance;

    useEffect(() => {
        if (isOpen) {
            loadClients();
            if (clientId) {
                setSelectedClientId(clientId);
            }
        }
    }, [isOpen, clientId]);

    const loadClients = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/clients/');
            setClients(response.data);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClientId || !amount) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            // API call to add credit
            await axios.post('http://127.0.0.1:8000/api/credit-transactions/', {
                client: selectedClientId,
                transaction_type: 'credit',
                date,
                amount: parseFloat(amount),
                is_advance: isAdvance,
                payment_method: paymentMethod,
                remarks,
                settle_amount: settleOutstanding ? parseFloat(settleAmount || '0') : 0
            });

            alert('Credit added successfully');
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Error adding credit:', error);
            alert('Failed to add credit');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedClientId('');
        setAmount('');
        setIsAdvance(false);
        setPaymentMethod('Cash Account');
        setRemarks('');
        setSettleAmount('');
        setSettleOutstanding(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Credit</h2>
                    <button className="modal-close" onClick={handleClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* Balance Display */}
                        <div className="balance-display">
                            <div className="balance-item">
                                <span className="balance-label">Credit Balance</span>
                                <span className="balance-value balance-credit">{creditBalance.toFixed(2)}</span>
                            </div>
                            <div className="balance-item">
                                <span className="balance-label">DR</span>
                                <span className="balance-value balance-debit">{debitBalance.toFixed(2)}</span>
                            </div>
                            <div className="balance-item">
                                <span className="balance-label">Balance</span>
                                <span className={`balance-value ${balance >= 0 ? 'balance-credit' : 'balance-debit'}`}>
                                    {balance.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-md">
                            <div className="form-group">
                                <label className="form-label">Choose Client *</label>
                                <select
                                    className="form-select"
                                    value={selectedClientId}
                                    onChange={(e) => setSelectedClientId(Number(e.target.value))}
                                    required
                                    disabled={!!clientId}
                                >
                                    <option value="">Select Client</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Date *</label>
                                <input
                                    type="datetime-local"
                                    className="form-input"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-md">
                            <div className="form-group">
                                <label className="form-label">
                                    Amount *
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                    <input
                                        type="checkbox"
                                        id="advance-checkbox"
                                        checked={isAdvance}
                                        onChange={(e) => setIsAdvance(e.target.checked)}
                                        style={{ marginRight: '8px', width: '16px', height: '16px' }}
                                    />
                                    <label htmlFor="advance-checkbox" style={{ cursor: 'pointer', margin: 0 }}>
                                        Advance Payment
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    placeholder="Enter Amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Payment Method *</label>
                                <select
                                    className="form-select"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    required
                                >
                                    <option value="Cash Account">Cash Account</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Check">Check</option>
                                    <option value="Credit Card">Credit Card</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Remarks</label>
                            <textarea
                                className="form-textarea"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows={3}
                            />
                        </div>

                        {outstandingBalance > 0 && (
                            <div style={{
                                padding: 'var(--spacing-md)',
                                backgroundColor: 'var(--gray-50)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--gray-200)'
                            }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                    <input
                                        type="checkbox"
                                        checked={settleOutstanding}
                                        onChange={(e) => setSettleOutstanding(e.target.checked)}
                                    />
                                    <span style={{ fontWeight: 500, color: 'var(--danger)' }}>
                                        Previous Outstanding Balance: {outstandingBalance.toFixed(2)}
                                    </span>
                                </label>

                                {settleOutstanding && (
                                    <div className="form-group" style={{ marginBottom: 0, marginTop: 'var(--spacing-sm)' }}>
                                        <label className="form-label">Settle Amount</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-input"
                                            placeholder="Enter Amount"
                                            value={settleAmount}
                                            onChange={(e) => setSettleAmount(e.target.value)}
                                            max={outstandingBalance}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            Close
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCreditDialog;
