import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Invoice, InvoiceItem } from '../types/invoice';
import { clientAPI, Client } from '../services/api';
import API_BASE_URL, { API_ENDPOINTS } from '../config/api';

interface InvoiceFormProps {
    initialData?: Partial<Invoice>;
    onSubmit: (data: Partial<Invoice>) => Promise<void>;
    submitLabel?: string;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
    initialData,
    onSubmit
}) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Helper function to convert decimal to dhs and fils
    const splitAmount = (amount: number) => {
        const dhs = Math.floor(amount);
        const fils = Math.round((amount - dhs) * 100);
        return { dhs, fils };
    };

    // Convert items from backend format to form format
    const convertItemsForForm = (items?: InvoiceItem[]) => {
        if (!items || items.length === 0) {
            return [{ description: '', quantity: 1, rate: 0, rate_fils: 0, amount: 0, amount_fils: 0, card_payment: 0, payment_done: false }];
        }

        return items.map(item => {
            const rate = splitAmount(item.rate || 0);
            const amount = splitAmount(item.amount || 0);
            return {
                ...item,
                rate: rate.dhs,
                rate_fils: rate.fils,
                amount: amount.dhs,
                amount_fils: amount.fils,
                card_payment: item.card_payment || 0,
                payment_done: item.payment_done || false
            };
        });
    };

    const [clients, setClients] = useState<Client[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [clientInvoices, setClientInvoices] = useState<any[]>([]);
    const [showClientModal, setShowClientModal] = useState(false);
    const [newClient, setNewClient] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        trn_no: '',
        vat_no: '',
        credit_limit: 0,
        credit_terms: 0
    });

    const [formData, setFormData] = useState<Partial<Invoice>>({
        invoice_number: initialData?.invoice_number || '',
        invoice_date: initialData?.invoice_date || new Date().toISOString().split('T')[0],
        due_date: initialData?.due_date || null,
        client: initialData?.client || null,
        client_name: initialData?.client_name || '',
        company_name: initialData?.company_name || 'Rashid Typing & Document Clearing',
        company_email: initialData?.company_email || 'rashidhuaq@gmail.com',
        company_mobile: initialData?.company_mobile || '050-7441282',
        company_phone: initialData?.company_phone || '06-7670165',
        company_po_box: initialData?.company_po_box || 'P.o Box: 7647',
        company_address: initialData?.company_address || 'Opp. Tasheel, Salama, U.A.Q - UAE',
        payment_method: initialData?.payment_method || 'CASH/DEBIT MEMO',
        status: initialData?.status || 'draft',
        notes: initialData?.notes || '',
        items: convertItemsForForm(initialData?.items)
    });

    // Payment State (Only for new invoices)
    const [recordPayment, setRecordPayment] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentMethodRecord, setPaymentMethodRecord] = useState('cash');

    // Credit Limit State
    const [showCreditLimitDialog, setShowCreditLimitDialog] = useState(false);
    const [creditLimitInfo, setCreditLimitInfo] = useState<{
        currentBalance: number;
        creditLimit: number;
        newInvoiceAmount: number;
        totalAfter: number;
        overage: number;
    } | null>(null);
    const [pendingSubmitData, setPendingSubmitData] = useState<any>(null);
    const [showSaveChoiceModal, setShowSaveChoiceModal] = useState(false);
    const [submitDataPending, setSubmitDataPending] = useState<any>(null);


    useEffect(() => {
        loadClients();
        loadEmployees();
        loadCompanySettings();
    }, []);

    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    const loadCompanySettings = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/settings/`);
            // The API might return an array or a single object depending on the ViewSet method
            const settings = Array.isArray(response.data) ? response.data[0] : response.data;

            if (settings) {
                setFormData(prev => ({
                    ...prev,
                    company_name: settings.company_name,
                    company_email: settings.company_email,
                    company_mobile: settings.company_mobile,
                    company_phone: settings.company_phone,
                    company_po_box: settings.company_po_box,
                    company_address: settings.company_address,
                }));
                // Check multiple possible locations for logo_url
                setLogoUrl(settings.logo_url);
            }
        } catch (error) {
            console.error('Error loading company settings:', error);
        }
    };

    const loadClients = async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.CLIENTS);
            setClients(response.data);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const loadEmployees = async () => {
        try {
            const response = await axios.get(`${API_ENDPOINTS.EMPLOYEES}?status=active`);
            setEmployees(response.data);
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    };

    // Load client invoices when client changes
    useEffect(() => {
        if (selectedClient) {
            loadClientInvoices(selectedClient.id);
        } else {
            setClientInvoices([]);
        }
    }, [selectedClient]);

    // Calculate due date when client or invoice date changes
    useEffect(() => {
        if (selectedClient && formData.invoice_date) {
            const invoiceDate = new Date(formData.invoice_date);
            const dueDate = new Date(invoiceDate);
            dueDate.setDate(dueDate.getDate() + selectedClient.credit_terms);
            setFormData(prev => ({ ...prev, due_date: dueDate.toISOString().split('T')[0] }));
        }
    }, [selectedClient, formData.invoice_date]);

    const loadClientInvoices = async (clientId: number) => {
        try {
            const response = await clientAPI.getInvoices(clientId);
            const invoices = response.data;
            // Get last 5 invoices
            setClientInvoices(invoices.slice(0, 5));

            // FEATURE: Automatically load latest non-paid invoice if client has a balance
            const clientBalance = Number(selectedClient?.debit_balance || 0);
            const latestUnpaid = invoices.find((inv: any) => inv.status !== 'paid' && inv.status !== 'voided');

            if (latestUnpaid && clientBalance > 0 && !initialData?.id) {
                try {
                    const { invoiceAPI } = await import('../services/api');
                    const fullInvoiceResponse = await invoiceAPI.getById(latestUnpaid.id as number);
                    const invoiceData = fullInvoiceResponse.data;

                    setFormData({
                        ...formData,
                        id: invoiceData.id,
                        invoice_number: invoiceData.invoice_number,
                        invoice_date: invoiceData.invoice_date,
                        due_date: invoiceData.due_date,
                        client: invoiceData.client,
                        client_name: invoiceData.client_name,
                        payment_method: invoiceData.payment_method,
                        status: invoiceData.status,
                        notes: invoiceData.notes,
                        items: convertItemsForForm(invoiceData.items)
                    });
                    console.log(`Auto-loaded existing unpaid invoice ${invoiceData.invoice_number} for client with balance.`);
                    return;
                } catch (err) {
                    console.error('Error auto-loading invoice:', err);
                }
            }

            // FEATURE: Auto-load items from latest invoice if current items are empty
            const isItemsEmpty = !formData.items ||
                formData.items.length === 0 ||
                (formData.items.length === 1 && !formData.items[0].description && formData.items[0].rate === 0);

            if (isItemsEmpty) {
                const latestInvoiceresponse = await axios.get(`${API_ENDPOINTS.CLIENTS}${clientId}/latest_invoice/`);
                if (latestInvoiceresponse.data && latestInvoiceresponse.data.items) {
                    setFormData(prev => ({
                        ...prev,
                        items: convertItemsForForm(latestInvoiceresponse.data.items)
                    }));

                    // If the latest invoice is the draft we found, we are essentially in "update mode"
                    // but we'll let the user decide via the prompt.
                }
            }
        } catch (error) {
            console.error('Error loading client invoices:', error);
            setClientInvoices([]);
        }
    };


    const handleCreateClient = async () => {
        if (!newClient.name.trim()) {
            alert('Please enter client name');
            return;
        }

        try {
            const response = await clientAPI.create(newClient);
            const createdClient = response.data;

            // Add to clients list
            setClients(prev => [...prev, createdClient]);

            // Auto-select the new client
            setSelectedClient(createdClient);
            handleInputChange('client', createdClient.id);
            handleInputChange('client_name', createdClient.name);

            // Reset and close modal
            setNewClient({ name: '', email: '', phone: '', address: '', trn_no: '', vat_no: '', credit_limit: 0, credit_terms: 0 });
            setShowClientModal(false);

            alert('Client created successfully!');
        } catch (error: any) {
            console.error('Error creating client:', error);
            alert('Failed to create client: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleInputChange = (field: keyof Invoice, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...(formData.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-calculate amount when quantity, rate, or fils changes
        if (field === 'quantity' || field === 'rate' || field === 'rate_fils') {
            const item = newItems[index];
            const rateDhs = item.rate || 0;
            const rateFils = item.rate_fils || 0;
            const totalRate = rateDhs + (rateFils / 100);
            const totalAmount = (item.quantity || 0) * totalRate;

            item.amount = Math.floor(totalAmount);
            item.amount_fils = Math.round((totalAmount - item.amount) * 100);
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...(prev.items || []), { description: '', quantity: 1, rate: 0, rate_fils: 0, amount: 0, amount_fils: 0, card_payment: 0, payment_done: false }]
        }));
    };

    const addQuickService = (name: string, price: number) => {
        const { dhs, fils } = splitAmount(price);
        const newItem = {
            description: name,
            quantity: 1,
            rate: dhs,
            rate_fils: fils,
            amount: dhs,
            amount_fils: fils
        };

        setFormData(prev => {
            // If the first item is empty, replace it
            const items = [...(prev.items || [])];
            if (items.length === 1 && !items[0].description.trim() && items[0].rate === 0) {
                return { ...prev, items: [newItem] };
            }
            return { ...prev, items: [...items, newItem] };
        });
    };

    const removeItem = (index: number) => {
        if ((formData.items?.length || 0) <= 1) {
            alert('Invoice must have at least one item');
            return;
        }
        setFormData(prev => ({
            ...prev,
            items: prev.items?.filter((_, i) => i !== index)
        }));
    };

    const calculateTotal = () => {
        return (formData.items || []).reduce((sum, item) => {
            const itemTotal = (item.amount || 0) + ((item.amount_fils || 0) / 100);
            return sum + itemTotal;
        }, 0);
    };

    const checkCreditLimit = (dataToSubmit: any): boolean => {
        // Only check credit limit for 'sent' or 'paid' invoices with a selected client
        const status = dataToSubmit.status;
        if (!selectedClient || (status !== 'sent' && status !== 'paid')) {
            return true; // Skip validation for drafts, quotations, work orders
        }

        const invoiceTotal = calculateTotal();
        const currentBalance = Number(selectedClient.debit_balance) || 0;
        const creditLimit = Number(selectedClient.credit_limit) || 0;
        const totalAfter = currentBalance + invoiceTotal;

        // If credit limit is exceeded
        if (creditLimit > 0 && totalAfter > creditLimit) {
            setCreditLimitInfo({
                currentBalance,
                creditLimit,
                newInvoiceAmount: invoiceTotal,
                totalAfter,
                overage: totalAfter - creditLimit
            });
            setPendingSubmitData(dataToSubmit);
            setShowCreditLimitDialog(true);
            return false; // Block submission
        }

        return true; // Allow submission
    };

    const handleCreditLimitConfirm = async () => {
        setShowCreditLimitDialog(false);
        if (pendingSubmitData) {
            await executeSubmit(pendingSubmitData);
            setPendingSubmitData(null);
            setCreditLimitInfo(null);
        }
    };

    const handleCreditLimitCancel = () => {
        setShowCreditLimitDialog(false);
        setPendingSubmitData(null);
        setCreditLimitInfo(null);
    };

    const total = calculateTotal();

    const executeSubmit = async (data: any) => {
        setLoading(true);
        try {
            await onSubmit(data);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    const proceedToSubmit = async (data: any) => {
        // Check credit limit before final submission
        if (!checkCreditLimit(data)) {
            return; // Credit limit exceeded, dialog shown
        }
        await executeSubmit(data);
    };

    const handleSubmit = async (e: React.FormEvent, statusOverride?: string) => {
        if (e && e.preventDefault) e.preventDefault();

        // Validation
        if (!formData.client_name) {
            alert('Please enter a client name');
            return;
        }
        if (!formData.items || formData.items.length === 0) {
            alert('Please add at least one item');
            return;
        }

        // Check if all items have descriptions
        const invalidItems = formData.items.filter(item => !item.description.trim());
        if (invalidItems.length > 0) {
            alert('Please fill in all item descriptions');
            return;
        }

        // Convert fils to decimal for backend
        const dataToSubmit = {
            ...formData,
            status: (statusOverride || formData.status) as any,
            due_date: formData.due_date || null, // Convert empty string to null
            items: formData.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                rate: (item.rate || 0) + ((item.rate_fils || 0) / 100),
                amount: (item.amount || 0) + ((item.amount_fils || 0) / 100),
                card_payment: item.card_payment || 0,
                payment_done: item.payment_done || false
            })),
            // Include payment info if selected
            ...(recordPayment ? {
                record_payment: true,
                payment_amount: paymentAmount,
                payment_method_record: paymentMethodRecord
            } : {})
        };

        // Check if we are updating or creating
        if (formData.id) {
            setSubmitDataPending(dataToSubmit);
            setShowSaveChoiceModal(true);
            return;
        }

        // FEATURE: If an existing client is selected, check for unpaid history at save time
        if (formData.client) {
            const latestUnpaid = clientInvoices.find((inv: any) => inv.status !== 'paid' && inv.status !== 'voided');
            if (latestUnpaid) {
                setSubmitDataPending(dataToSubmit);
                setShowSaveChoiceModal(true);
                return;
            }
        }

        await proceedToSubmit(dataToSubmit);
    };

    const handleUpdateExisting = async () => {
        setShowSaveChoiceModal(false);
        if (submitDataPending) {
            let dataToSubmit = { ...submitDataPending };

            // If we're starting as new but chosen to update, find target ID
            if (!dataToSubmit.id) {
                const latestUnpaid = clientInvoices.find((inv: any) => inv.status !== 'paid' && inv.status !== 'voided');
                if (latestUnpaid) {
                    dataToSubmit.id = latestUnpaid.id;
                    dataToSubmit.invoice_number = latestUnpaid.invoice_number;
                }
            }

            await proceedToSubmit(dataToSubmit);
            setSubmitDataPending(null);
        }
    };

    const handleSaveAsNew = async () => {
        setShowSaveChoiceModal(false);
        if (submitDataPending) {
            const newData = {
                ...submitDataPending,
                id: undefined,
                invoice_number: ''
            };
            await proceedToSubmit(newData);
            setSubmitDataPending(null);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Client Creation Modal */}
            {showClientModal && (
                <div className="modal-overlay" onClick={() => setShowClientModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Client</h2>
                            <button type="button" className="modal-close" onClick={() => setShowClientModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Client Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newClient.name}
                                    onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter client name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={newClient.email}
                                    onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="client@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={newClient.phone}
                                    onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="+971 XX XXX XXXX"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <textarea
                                    className="form-textarea"
                                    value={newClient.address}
                                    onChange={(e) => setNewClient(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="Client address"
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Credit Terms (Days)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={newClient.credit_terms}
                                    onChange={(e) => setNewClient(prev => ({ ...prev, credit_terms: parseInt(e.target.value) || 0 }))}
                                    min="0"
                                    placeholder="0"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Credit Limit (AED)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={newClient.credit_limit}
                                    onChange={(e) => setNewClient(prev => ({ ...prev, credit_limit: parseFloat(e.target.value) || 0 }))}
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">TRN No</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newClient.trn_no}
                                        onChange={(e) => setNewClient(prev => ({ ...prev, trn_no: e.target.value }))}
                                        placeholder="Tax Registration Number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">VAT No</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newClient.vat_no}
                                        onChange={(e) => setNewClient(prev => ({ ...prev, vat_no: e.target.value }))}
                                        placeholder="VAT number"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowClientModal(false)}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleCreateClient}>
                                Create Client
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Credit Limit Warning Dialog */}
            {showCreditLimitDialog && creditLimitInfo && (
                <div className="modal-overlay" onClick={handleCreditLimitCancel}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header" style={{ background: 'var(--danger)', color: 'white' }}>
                            <h2>⚠️ Credit Limit Exceeded</h2>
                            <button type="button" className="modal-close" onClick={handleCreditLimitCancel} style={{ color: 'white' }}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--danger-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)' }}>
                                <p style={{ margin: 0, fontWeight: 500, color: 'var(--danger)' }}>
                                    This invoice will exceed the client's credit limit!
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--gray-200)' }}>
                                    <span style={{ color: 'var(--gray-600)' }}>Current Outstanding:</span>
                                    <span style={{ fontWeight: 600 }}>{creditLimitInfo.currentBalance.toFixed(2)} AED</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--gray-200)' }}>
                                    <span style={{ color: 'var(--gray-600)' }}>New Invoice Amount:</span>
                                    <span style={{ fontWeight: 600 }}>{creditLimitInfo.newInvoiceAmount.toFixed(2)} AED</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--gray-200)' }}>
                                    <span style={{ color: 'var(--gray-600)' }}>Credit Limit:</span>
                                    <span style={{ fontWeight: 600 }}>{creditLimitInfo.creditLimit.toFixed(2)} AED</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                    <span style={{ fontWeight: 600 }}>Total After Invoice:</span>
                                    <span style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '1.125rem' }}>{creditLimitInfo.totalAfter.toFixed(2)} AED</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md)', background: 'var(--danger-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--danger)' }}>Overage:</span>
                                    <span style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '1.125rem' }}>+{creditLimitInfo.overage.toFixed(2)} AED</span>
                                </div>
                            </div>

                            <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--warning-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning)' }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                                    Do you want to proceed with this invoice anyway?
                                </p>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleCreditLimitCancel}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleCreditLimitConfirm}
                            >
                                Continue Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Save Choice Modal - Simplified */}
            {showSaveChoiceModal && (
                <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1000 }} onClick={() => setShowSaveChoiceModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', borderRadius: '12px', background: 'white', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>Save Invoice</h2>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                                {formData.id
                                    ? `Updating existing invoice #${formData.invoice_number}`
                                    : `Client has unpaid items history.`
                                }
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(() => {
                                const latestUnpaid = clientInvoices.find((inv: any) => inv.status !== 'paid' && inv.status !== 'voided');
                                const targetNumber = formData.invoice_number || (latestUnpaid ? latestUnpaid.invoice_number : '');

                                return (
                                    <button
                                        type="button"
                                        onClick={handleUpdateExisting}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            borderRadius: '8px',
                                            backgroundColor: '#16a34a',
                                            color: 'white',
                                            border: 'none',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        UPDATE EXISTING ({targetNumber})
                                    </button>
                                );
                            })()}

                            <button
                                type="button"
                                onClick={handleSaveAsNew}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '8px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                SAVE AS NEW INVOICE
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowSaveChoiceModal(false)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    marginTop: '8px',
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* ═══════════════════════════════════════════════════
                    INVOICE DOCUMENT — Invoice-Generator Style
                ═══════════════════════════════════════════════════ */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

                {/* ── HEADER: Logo · INVOICE title · # number ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '36px 40px 28px', borderBottom: '1px solid #f1f5f9' }}>
                    {/* Left — Logo placeholder + company name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ width: '88px', height: '72px', background: 'white', border: logoUrl ? 'none' : '2px dashed #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center', lineHeight: 1.4 }}>📷<br />Logo</span>
                            )}
                        </div>
                        <input
                            type="text"
                            style={{ border: 'none', borderBottom: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', fontWeight: 500, color: '#374151', padding: '2px 0', width: '220px', background: 'transparent' }}
                            value={formData.company_name}
                            onChange={(e) => handleInputChange('company_name', e.target.value)}
                            placeholder="Your Company / Name"
                        />
                    </div>

                    {/* Right — INVOICE + invoice number */}
                    <div style={{ textAlign: 'right' }}>
                        <h1 style={{ fontSize: '2.6rem', fontWeight: 800, margin: '0 0 14px 0', letterSpacing: '3px', color: '#0f172a', fontFamily: 'Georgia, "Times New Roman", serif' }}>INVOICE</h1>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 600 }}>#</span>
                            <input
                                type="text"
                                style={{ border: 'none', borderBottom: '2px solid #e2e8f0', outline: 'none', fontSize: '1rem', fontWeight: 700, textAlign: 'right', width: '100px', color: '#374151', padding: '2px 0', background: 'transparent' }}
                                value={(formData.invoice_number || '').replace(/^INV-?/i, '')}
                                onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                                placeholder="auto"
                            />
                        </div>
                        <div style={{ marginTop: '6px', fontSize: '0.7rem', color: '#94a3b8' }}>
                            {formData.id ? `Updating Invoice ID: ${formData.id}` : 'Leave blank to auto-generate'}
                        </div>
                    </div>
                </div>


                <div style={{ padding: '28px 40px' }}>

                    {/* ── Client Selector ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Client:</span>
                        <select
                            style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '0.875rem', color: '#374151', background: 'white', outline: 'none' }}
                            value={selectedClient?.id || ''}
                            onChange={(e) => {
                                const rawVal = e.target.value;
                                const clientId = rawVal ? parseInt(rawVal) : null;
                                const client = clientId ? clients.find(c => c.id === clientId) || null : null;
                                setSelectedClient(client);
                                handleInputChange('client', clientId);
                                if (client) handleInputChange('client_name', client.name);
                            }}
                        >
                            <option value="">-- No Client (Manual Entry) --</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.name} (Credit: {client.credit_terms} days)
                                </option>
                            ))}
                        </select>
                        <button type="button" onClick={() => setShowClientModal(true)}
                            style={{ padding: '6px 14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            + New Client
                        </button>
                    </div>

                    {/* Credit Info */}
                    {selectedClient && selectedClient.credit_limit > 0 && (
                        <div style={{ marginBottom: '14px', padding: '10px 16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Outstanding: <strong style={{ color: Number(selectedClient.debit_balance) > 0 ? '#ef4444' : '#16a34a' }}>{Number(selectedClient.debit_balance || 0).toFixed(2)} AED</strong></span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Credit Limit: <strong>{Number(selectedClient.credit_limit || 0).toFixed(2)} AED</strong></span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Available: <strong style={{ color: (Number(selectedClient.credit_limit) - Number(selectedClient.debit_balance || 0)) > 0 ? '#16a34a' : '#ef4444' }}>{(Number(selectedClient.credit_limit) - Number(selectedClient.debit_balance || 0)).toFixed(2)} AED</strong></span>
                        </div>
                    )}

                    {/* Recent Invoices */}
                    {selectedClient && clientInvoices.length > 0 && (
                        <div style={{ marginBottom: '14px', padding: '10px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>📋 Recent Invoices:</div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {clientInvoices.map((invoice: any) => (
                                    <span key={invoice.id} style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: '#6366f1', fontWeight: 600 }}>{invoice.invoice_number}</span> — {Number(invoice.total_amount || 0).toFixed(2)} AED &nbsp;
                                        <span style={{ padding: '1px 5px', borderRadius: '3px', fontSize: '0.65rem', background: invoice.status === 'paid' ? '#dcfce7' : '#fef9c3', color: invoice.status === 'paid' ? '#16a34a' : '#854d0e', fontWeight: 600 }}>{invoice.status}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Bill To / Ship To  ·  Date / Payment / Due Date ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', marginBottom: '28px' }}>

                        {/* Left block */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Bill To</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', border: 'none', borderBottom: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', padding: '4px 0', color: '#1e293b', background: 'transparent' }}
                                    value={formData.client_name}
                                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                                    placeholder="Client name"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Ship To</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', border: 'none', borderBottom: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', padding: '4px 0', color: '#1e293b', background: 'transparent' }}
                                    placeholder="(optional)"
                                />
                            </div>
                        </div>

                        {/* Right block — Date / Payment / Due Date stacked */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {[
                                {
                                    label: 'Date', el: (
                                        <input type="date" value={formData.invoice_date}
                                            onChange={(e) => handleInputChange('invoice_date', e.target.value)} required
                                            style={{ border: 'none', borderBottom: '1px solid #e2e8f0', outline: 'none', fontSize: '0.875rem', color: '#1e293b', padding: '4px 0', background: 'transparent', textAlign: 'right' }}
                                        />
                                    )
                                },
                                {
                                    label: 'Payment', el: (
                                        <select value={formData.payment_method}
                                            onChange={(e) => handleInputChange('payment_method', e.target.value)}
                                            style={{ border: 'none', borderBottom: '1px solid #e2e8f0', outline: 'none', fontSize: '0.875rem', color: '#1e293b', background: 'transparent', padding: '4px 0', textAlign: 'right' }}>
                                            <option value="CASH/DEBIT MEMO">CASH / DEBIT MEMO</option>
                                            <option value="CASH">CASH</option>
                                            <option value="BANK TRANSFER">BANK TRANSFER</option>
                                            <option value="CHEQUE">CHEQUE</option>
                                            <option value="CREDIT CARD">CREDIT CARD</option>
                                            <option value="ONLINE PAYMENT">ONLINE PAYMENT</option>
                                            <option value="CREDIT">CREDIT (On Account)</option>
                                            <option value="OTHER">OTHER</option>
                                        </select>
                                    )
                                },
                                {
                                    label: 'Due Date', el: (
                                        <input type="date" value={formData.due_date || ''}
                                            onChange={(e) => handleInputChange('due_date', e.target.value)}
                                            style={{ border: 'none', borderBottom: '1px solid #e2e8f0', outline: 'none', fontSize: '0.875rem', color: '#1e293b', padding: '4px 0', background: 'transparent', textAlign: 'right' }}
                                        />
                                    )
                                }
                            ].map(({ label, el }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, minWidth: '70px' }}>{label}</span>
                                    {el}
                                </div>
                            ))}
                            {selectedClient && (
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                                    Due date auto-calculated from {selectedClient.credit_terms}-day credit terms
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Quick Add Services ── */}
                    <div className="no-print" style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>⚡ Quick Add Services:</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {[
                                { name: 'ID Card Typing', price: 100 },
                                { name: 'Medical Typing', price: 290 },
                                { name: 'ICA Fee', price: 50 },
                                { name: 'Passport Copy', price: 2 },
                                { name: 'Contract Preparation', price: 150 },
                                { name: 'Visa Processing Fee', price: 250 }
                            ].map((srv, idx) => (
                                <button key={idx} type="button" onClick={() => addQuickService(srv.name, srv.price)}
                                    style={{ fontSize: '0.72rem', padding: '4px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '20px', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>
                                    + {srv.name} ({srv.price})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Items Table ── */}
                    <div style={{ borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '16px' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
                                <thead>
                                    <tr style={{ background: '#1e293b' }}>
                                        <th style={{ padding: '13px 16px', textAlign: 'left', color: 'white', fontSize: '0.8rem', fontWeight: 600, width: '32%' }}>Item / Description التفاصيل</th>
                                        <th style={{ padding: '13px 10px', textAlign: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 600, width: '7%' }}>Quantity</th>
                                        <th colSpan={2} style={{ padding: '13px 10px', textAlign: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>Rate السعر</th>
                                        <th colSpan={2} style={{ padding: '13px 10px', textAlign: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>Total Amount</th>
                                        <th style={{ padding: '13px 10px', textAlign: 'center', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600, width: '9%' }}>Card Pyt</th>
                                        <th style={{ padding: '13px 10px', textAlign: 'center', color: '#86efac', fontSize: '0.75rem', fontWeight: 600, width: '7%' }}>✓ Done</th>
                                        <th style={{ width: '36px' }}></th>
                                    </tr>
                                    <tr style={{ background: '#334155' }}>
                                        <td></td><td></td>
                                        <td style={{ padding: '5px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 500 }}>Dhs. درهم</td>
                                        <td style={{ padding: '5px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 500 }}>Fils. فلس</td>
                                        <td style={{ padding: '5px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 500 }}>Dhs. درهم</td>
                                        <td style={{ padding: '5px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 500 }}>Fils. فلس</td>
                                        <td style={{ padding: '5px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 500 }}>Dhs.</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.items?.map((item, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', background: item.payment_done ? '#f0fdf4' : (index % 2 === 0 ? 'white' : '#fafbfc') }}>
                                            <td style={{ padding: '8px 16px' }}>
                                                <input type="text" value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    placeholder="Description of item/service..." required
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem', background: 'transparent', color: '#1e293b' }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <input type="number" value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    onInput={(e) => { const t = e.target as HTMLInputElement; if (t.value.startsWith('0') && t.value.length > 1 && t.value[1] !== '.') t.value = t.value.replace(/^0+/, ''); }}
                                                    min="1" required
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem', textAlign: 'center', background: 'transparent' }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <input type="number" value={item.rate || 0}
                                                    onChange={(e) => handleItemChange(index, 'rate', parseInt(e.target.value) || 0)}
                                                    onInput={(e) => { const t = e.target as HTMLInputElement; if (t.value.startsWith('0') && t.value.length > 1 && t.value[1] !== '.') t.value = t.value.replace(/^0+/, ''); }}
                                                    min="0" required
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem', textAlign: 'right', background: 'transparent' }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <input type="number" value={item.rate_fils || 0}
                                                    onChange={(e) => handleItemChange(index, 'rate_fils', parseInt(e.target.value) || 0)}
                                                    onInput={(e) => { const t = e.target as HTMLInputElement; if (t.value.startsWith('0') && t.value.length > 1 && t.value[1] !== '.') t.value = t.value.replace(/^0+/, ''); }}
                                                    min="0" max="99"
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem', textAlign: 'right', background: 'transparent' }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px', background: '#f8fafc' }}>
                                                <input type="number" value={item.amount || 0} readOnly
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem', textAlign: 'right', background: 'transparent', color: '#374151' }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px', background: '#f8fafc' }}>
                                                <input type="number" value={item.amount_fils || 0} readOnly
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem', textAlign: 'right', background: 'transparent', color: '#374151' }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px', background: '#fffbeb' }}>
                                                <input type="number" value={item.card_payment || 0}
                                                    onChange={(e) => handleItemChange(index, 'card_payment', parseFloat(e.target.value) || 0)}
                                                    min="0" step="0.01"
                                                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.875rem', textAlign: 'right', background: 'transparent', color: '#92400e' }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>
                                                <input type="checkbox" checked={item.payment_done || false}
                                                    onChange={(e) => handleItemChange(index, 'payment_done', e.target.checked)}
                                                    style={{ width: '18px', height: '18px', accentColor: '#16a34a', cursor: 'pointer' }}
                                                    title="Mark payment done"
                                                />
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>
                                                <button type="button" onClick={() => removeItem(index)}
                                                    disabled={(formData.items?.length || 0) <= 1}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, opacity: (formData.items?.length || 0) <= 1 ? 0.25 : 1 }}>
                                                    ×
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ borderTop: '2px solid #1e293b', background: '#f8fafc' }}>
                                        <td colSpan={4} style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Total المجموع</td>
                                        <td colSpan={2} style={{ padding: '10px 10px', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                                            {total.toFixed(2)} Dhs
                                        </td>
                                        <td style={{ padding: '10px 10px', fontWeight: 600, color: '#92400e', fontSize: '0.9rem' }}>
                                            {(formData.items || []).reduce((s, i) => s + Number(i.card_payment || 0), 0).toFixed(2)}
                                        </td>
                                        <td colSpan={2}></td>
                                    </tr>
                                    <tr style={{ background: '#f0fdf4', borderTop: '1px solid #bbf7d0' }}>
                                        <td colSpan={4} style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 600, color: '#15803d', fontSize: '0.9rem' }}>Profit (Total − Card Pyt)</td>
                                        <td colSpan={5} style={{ padding: '8px 10px', fontWeight: 700, fontSize: '1rem', color: '#15803d' }}>
                                            {(Number(total) - (formData.items || []).reduce((s, i) => s + Number(i.card_payment || 0), 0)).toFixed(2)} Dhs
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* + Line Item button */}
                    <div style={{ marginBottom: '28px' }}>
                        <button type="button" onClick={addItem}
                            style={{ padding: '6px 18px', background: 'transparent', border: '1px solid #6366f1', borderRadius: '20px', color: '#6366f1', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                            + Line Item
                        </button>
                    </div>

                    {/* ── Bottom: Notes (left) · Financial Summary (right) ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', marginBottom: '24px' }}>
                        {/* Notes */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Notes — any relevant information not already covered"
                                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', fontSize: '0.85rem', minHeight: '90px', resize: 'vertical', outline: 'none', color: '#374151', fontFamily: 'inherit', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Financial summary */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Subtotal</span>
                                <span style={{ fontWeight: 500, color: '#1e293b' }}>AED {Number(total).toFixed(2)}</span>
                            </div>

                            {/* Payment checkbox */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <input type="checkbox" id="recordPayment" checked={recordPayment}
                                    onChange={(e) => setRecordPayment(e.target.checked)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <label htmlFor="recordPayment" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', cursor: 'pointer', margin: 0 }}>
                                    {initialData ? 'Record Additional Payment' : 'Record Initial Payment'}
                                </label>
                            </div>

                            {recordPayment && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9', gap: '12px' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>Amount Paid (AED)</label>
                                        <input type="number" value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                                            onInput={(e) => { const t = e.target as HTMLInputElement; if (t.value.startsWith('0') && t.value.length > 1 && t.value[1] !== '.') t.value = t.value.replace(/^0+/, ''); }}
                                            min="0" max={initialData ? Number(initialData.balance_due) : calculateTotal()} step="0.01"
                                            style={{ width: '110px', border: 'none', borderBottom: '1px solid #e2e8f0', outline: 'none', fontSize: '0.875rem', textAlign: 'right', padding: '2px 0', background: 'transparent' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9', gap: '12px' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>Payment Method</label>
                                        <select value={paymentMethodRecord} onChange={(e) => setPaymentMethodRecord(e.target.value)}
                                            style={{ border: 'none', borderBottom: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem', color: '#374151', background: 'transparent', padding: '2px 0', textAlign: 'right' }}>
                                            <option value="cash">Cash</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="cheque">Cheque</option>
                                            <option value="credit_card">Credit Card</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '2px solid #1e293b', marginTop: '4px' }}>
                                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Balance Due</span>
                                <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>AED {(Number(total) - Number(recordPayment ? paymentAmount : 0)).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Commission Section ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Commission To (Optional)</label>
                            <select value={formData.commission_to || ''} onChange={(e) => handleInputChange('commission_to', e.target.value)}
                                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px', fontSize: '0.875rem', color: '#374151', background: 'white', outline: 'none' }}>
                                <option value="">Select Employee / Recipient</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                                ))}
                                {formData.commission_to && !employees.find(e => e.name === formData.commission_to) && (
                                    <option value={formData.commission_to}>{formData.commission_to}</option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Commission Amount (AED)</label>
                            <input type="number" value={formData.commission_amount || ''}
                                onChange={(e) => handleInputChange('commission_amount', parseFloat(e.target.value) || 0)}
                                placeholder="0.00" min="0" step="0.01"
                                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px', fontSize: '0.875rem', color: '#374151', background: 'white', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                </div>{/* /padding wrapper */}

                {/* ── Action Buttons ── */}
                <div style={{ padding: '20px 40px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <button type="button" onClick={() => navigate(-1)} disabled={loading}
                        style={{ padding: '8px 20px', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}>
                        Cancel
                    </button>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button type="button" disabled={loading}
                            onClick={(e) => { handleInputChange('status', 'quotation'); const ev = { ...e, preventDefault: () => { } } as any; setTimeout(() => handleSubmit(ev, 'quotation'), 0); }}
                            style={{ padding: '8px 16px', background: '#64748b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}>
                            Save as Quotation
                        </button>
                        <button type="button" disabled={loading}
                            onClick={(e) => { const ev = { ...e, preventDefault: () => { } } as any; setTimeout(() => handleSubmit(ev, 'work_order'), 0); }}
                            style={{ padding: '8px 16px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}>
                            Save as Work Order
                        </button>
                        <button type="button" disabled={loading}
                            onClick={(e) => { const ev = { ...e, preventDefault: () => { } } as any; setTimeout(() => handleSubmit(ev, 'draft'), 0); }}
                            style={{ padding: '8px 16px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}>
                            Save as Draft
                        </button>
                        <button type="button" disabled={loading}
                            onClick={(e) => { const ev = { ...e, preventDefault: () => { } } as any; setTimeout(() => handleSubmit(ev, 'sent'), 0); }}
                            style={{ padding: '10px 28px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', minWidth: '140px' }}>
                            {loading ? 'Saving...' : '✓ Save Invoice'}
                        </button>
                    </div>
                </div>
            </div>{/* /invoice document */}
        </form>
    );
};

export default InvoiceForm;


