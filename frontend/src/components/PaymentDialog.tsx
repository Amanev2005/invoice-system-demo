import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';

interface PaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: number;
    invoiceNumber: string;
    totalAmount: number;
    outstandingAmount: number;
    onSuccess: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
    isOpen,
    onClose,
    invoiceId,
    invoiceNumber,
    totalAmount,
    outstandingAmount,
    onSuccess
}) => {
    const [amount, setAmount] = useState<number>(0);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAmount(outstandingAmount);
            setPaymentDate(new Date().toISOString().split('T')[0]);
            setPaymentMethod('cash');
            setReferenceNumber('');
            setNotes('');
        }
    }, [isOpen, outstandingAmount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await paymentAPI.create({
                invoice: invoiceId,
                amount: amount,
                payment_date: paymentDate,
                payment_method: paymentMethod,
                reference_number: referenceNumber,
                notes: notes
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error recording payment:', error);
            alert('Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2>Record Payment</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="mb-md">
                    <p>Recording payment for Invoice <strong>{invoiceNumber}</strong></p>
                    <p>Total Amount: <strong>{totalAmount.toFixed(2)} Dhs</strong></p>
                    <p>Outstanding Balance: <strong style={{ color: 'var(--danger)' }}>{outstandingAmount.toFixed(2)} Dhs</strong></p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Amount (Dhs) *</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-input"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                            required
                            max={outstandingAmount}
                            min="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Payment Date *</label>
                        <input
                            type="date"
                            className="form-input"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Payment Method *</label>
                        <select
                            className="form-input"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            required
                        >
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Reference Number (Optional)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            placeholder="Cheque No, Transaction ID, etc."
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes (Optional)</label>
                        <textarea
                            className="form-textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional payment details..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-md mt-lg">
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
                            {loading ? 'Recording...' : 'Save Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentDialog;
