import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Wallet {
    id: number;
    name: string;
    bank_name?: string;
    balance: string;
    wallet_type: string;
    is_active: boolean;
    client?: number | null;
    client_name?: string;
}

interface Client {
    id: number;
    name: string;
}

interface Transaction {
    id: number;
    amount: string;
    date: string;
    description: string;
    category: string;
}

const WalletsBanks: React.FC = () => {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [transfers, setTransfers] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);
    const [transferLoading, setTransferLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bank_name: '',
        balance: '',
        wallet_type: 'bank',
        is_active: true,
        client: ''
    });
    const [transferData, setTransferData] = useState({
        from_wallet_id: '',
        to_wallet_id: '',
        amount: '',
        notes: ''
    });

    useEffect(() => {
        loadWallets();
        loadClients();
        loadTransfers();
    }, []);

    const loadTransfers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/transactions/?transaction_type=transfer&category=cash_transfer');
            setTransfers(response.data);
        } catch (error) {
            console.error('Error loading transfers:', error);
        }
    };


    const loadClients = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/clients/');
            setClients(response.data);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const loadWallets = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/wallets/');
            setWallets(response.data);
        } catch (error) {
            console.error('Error loading wallets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                client: formData.client ? parseInt(formData.client) : null
            };
            await axios.post('http://127.0.0.1:8000/api/wallets/', submitData);
            setShowForm(false);
            setFormData({ name: '', bank_name: '', balance: '', wallet_type: 'bank', is_active: true, client: '' });
            loadWallets();
        } catch (error) {
            console.error('Error creating wallet:', error);
            alert('Failed to create wallet/bank.');
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(transferData.amount);
        if (!transferData.to_wallet_id) {
            alert('Please select a destination bank account.');
            return;
        }
        if (!amount || amount <= 0) {
            alert('Please enter a valid transfer amount.');
            return;
        }

        setTransferLoading(true);
        try {
            // Add to destination wallet (Bank)
            const toWallet = wallets.find(w => w.id === parseInt(transferData.to_wallet_id));
            if (!toWallet) {
                alert('Destination wallet not found.');
                return;
            }

            const toBal = Number(toWallet.balance) + amount;
            await axios.patch(`http://127.0.0.1:8000/api/wallets/${transferData.to_wallet_id}/`, {
                balance: toBal.toFixed(2)
            });

            // Create a Transaction record for the transfer (to deduct from cash balance)
            await axios.post('http://127.0.0.1:8000/api/transactions/', {
                transaction_type: 'transfer',
                amount: amount.toFixed(2),
                category: 'cash_transfer',
                description: `Transfer to ${toWallet.name}`,
                wallet: toWallet.id,
                date: new Date().toISOString().split('T')[0]
            });

            alert(`✅ Transfer successful! ${amount.toFixed(2)} Dhs moved from Company Cash to ${toWallet.name}.`);
            setTransferData({ from_wallet_id: '', to_wallet_id: '', amount: '', notes: '' });
            setShowTransfer(false);
            loadWallets();
            loadTransfers();
        } catch (error) {
            console.error('Error processing transfer:', error);
            alert('Transfer failed. Please try again.');
        } finally {
            setTransferLoading(false);
        }
    };


    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this wallet?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/wallets/${id}/`);
                loadWallets();
            } catch (error) {
                console.error('Error deleting wallet:', error);
            }
        }
    };

    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const activeWalletsList = wallets.filter(w => w.is_active);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-lg">
                <h1>💳 Wallets & Banks</h1>
                <div className="flex gap-sm">
                    <button onClick={() => { setShowTransfer(!showTransfer); setShowForm(false); }} className="btn btn-secondary btn-lg">
                        💸 Transfer Cash
                    </button>
                    <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-lg">
                        + Add Wallet/Bank
                    </button>
                </div>
            </div>

            {/* Add Wallet Form */}
            {showForm && (
                <div className="card mb-lg">
                    <h3 className="mb-md">Add New Wallet/Bank</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-md mb-md">
                            <div>
                                <label className="form-label">Wallet / Account Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., ADCB Current Account"
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Type *</label>
                                <select
                                    className="form-input"
                                    value={formData.wallet_type}
                                    onChange={(e) => setFormData({ ...formData, wallet_type: e.target.value })}
                                >
                                    <option value="bank">Bank Account</option>
                                    <option value="digital">Digital Wallet</option>
                                </select>
                            </div>
                            {formData.wallet_type === 'bank' && (
                                <div>
                                    <label className="form-label">Bank Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.bank_name}
                                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                        placeholder="e.g., ADCB, Emirates NBD, FAB..."
                                    />
                                </div>
                            )}
                            <div>
                                <label className="form-label">Initial Balance (Dhs) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={formData.balance}
                                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-md mb-md">
                            <div>
                                <label className="form-label">Client (Optional)</label>
                                <select
                                    className="form-input"
                                    value={formData.client}
                                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                >
                                    <option value="">-- No Client (General Wallet) --</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                                <small style={{ color: 'var(--gray-600)', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                                    Select a client to create a client-specific wallet
                                </small>
                            </div>
                            <div>
                                <label className="form-label">Status</label>
                                <select
                                    className="form-input"
                                    value={formData.is_active ? 'active' : 'inactive'}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-md">
                            <button type="submit" className="btn btn-primary">Add Wallet/Bank</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}


            {/* Fund Transfer Form */}
            {showTransfer && (
                <div className="card mb-lg" style={{ borderLeft: '4px solid var(--primary)', background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 100%)' }}>
                    <h3 className="mb-md">💸 Transfer Cash</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-md)' }}>
                        Transfer cash balance to your selected bank account.
                    </p>
                    <form onSubmit={handleTransfer}>
                        <div className="grid grid-cols-2 gap-md mb-md">

                            <div>
                                <label className="form-label">To Bank Name *</label>
                                <select
                                    className="form-input"
                                    value={transferData.to_wallet_id}
                                    onChange={(e) => setTransferData({ ...transferData, to_wallet_id: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select Destination Bank --</option>
                                    {activeWalletsList.map(w => (
                                        <option key={w.id} value={w.id}>{w.name} ({Number(w.balance).toFixed(2)} Dhs)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Amount (Dhs) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className="form-input"
                                    value={transferData.amount}
                                    onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Notes (Optional)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={transferData.notes}
                                    onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
                                    placeholder="e.g., Monthly bank deposit"
                                />
                            </div>
                        </div>
                        <div className="flex gap-md">
                            <button type="submit" className="btn btn-primary" disabled={transferLoading}>
                                {transferLoading ? 'Processing...' : '✅ Confirm Transfer'}
                            </button>
                            <button type="button" onClick={() => setShowTransfer(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}


            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-md mb-lg">
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Balance</div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--success)' }}>{totalBalance.toFixed(2)} Dhs</div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Active Wallets</div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary)' }}>{activeWalletsList.length}</div>
                </div>
                <div className="card" style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xs)' }}>Total Wallets</div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--info)' }}>{wallets.length}</div>
                </div>
            </div>

            {/* Wallet Cards */}
            <div className="grid grid-cols-2 gap-md">
                {wallets.map(wallet => (
                    <div key={wallet.id} className="card">
                        <div className="flex items-center justify-between mb-md">
                            <div>
                                <h3 style={{ margin: 0 }}>{wallet.name}</h3>
                                {wallet.bank_name && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '2px' }}>
                                        🏦 {wallet.bank_name}
                                    </div>
                                )}
                            </div>
                            {wallet.is_active ? (
                                <span className="badge badge-success">Active</span>
                            ) : (
                                <span className="badge badge-secondary">Inactive</span>
                            )}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--spacing-sm)' }}>
                            Type: <span className="badge badge-info">{wallet.wallet_type}</span>
                            {wallet.client_name && (
                                <span style={{ marginLeft: 'var(--spacing-sm)' }}>
                                    Client: <span className="badge badge-primary">{wallet.client_name}</span>
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--success)', marginBottom: 'var(--spacing-md)' }}>
                            {Number(wallet.balance).toFixed(2)} Dhs
                        </div>
                        <button onClick={() => handleDelete(wallet.id)} className="btn btn-sm btn-danger">
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            {wallets.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--gray-500)' }}>
                    No wallets or banks found. Add one to get started.
                </div>
            )}

            {/* Recent Transfers History */}
            <div className="mt-xl">
                <div className="flex items-center justify-between mb-md">
                    <h2 style={{ fontSize: '1.5rem' }}>📑 Recent Transfers History</h2>
                </div>
                <div className="card">
                    {transfers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--gray-500)' }}>
                            No transfer history found.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...transfers].reverse().slice(0, 10).map((transfer) => (
                                        <tr key={transfer.id}>
                                            <td>{new Date(transfer.date).toLocaleDateString()}</td>
                                            <td>{transfer.description}</td>
                                            <td style={{ color: 'var(--info)', fontWeight: 600 }}>
                                                {Number(transfer.amount).toFixed(2)} Dhs
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletsBanks;
