import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InvoiceForm from '../components/InvoiceForm';
import { invoiceAPI } from '../services/api';
import { Invoice } from '../types/invoice';

const EditInvoice: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoice();
    }, [id]);

    const loadInvoice = async () => {
        try {
            const response = await invoiceAPI.getById(parseInt(id!));
            setInvoice(response.data);
        } catch (error) {
            console.error('Error loading invoice:', error);
            alert('Failed to load invoice');
            navigate('/invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: Partial<Invoice>) => {
        try {
            await invoiceAPI.update(parseInt(id!), data);
            alert('Invoice updated successfully!');
            navigate(`/invoices/${id}`);
        } catch (error: any) {
            console.error('Error updating invoice:', error);
            alert('Failed to update invoice: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-2xl)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!invoice) {
        return <div>Invoice not found</div>;
    }

    return (
        <div>
            <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>
                Edit Invoice {invoice.invoice_number}
            </h1>
            <InvoiceForm
                initialData={invoice}
                onSubmit={handleSubmit}
                submitLabel="Update Invoice"
            />
        </div>
    );
};

export default EditInvoice;
