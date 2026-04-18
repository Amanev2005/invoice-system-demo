import { useNavigate } from 'react-router-dom';
import InvoiceForm from '../components/InvoiceForm';
import { invoiceAPI, paymentAPI } from '../services/api';
import { Invoice } from '../types/invoice';

export default function CreateInvoice() {
  const navigate = useNavigate();

  const handleSubmit = async (data: Partial<Invoice>) => {
    try {
      // 1. Create or Update Invoice
      let response;
      if (data.id) {
        response = await invoiceAPI.update(data.id, data);
        alert('Invoice updated successfully!');
      } else {
        response = await invoiceAPI.create(data);
        alert('Invoice created successfully!');
      }

      const savedInvoice = response.data;

      // 2. Record Payment if selected
      if ((data as any).record_payment && (data as any).payment_amount > 0) {
        try {
          await paymentAPI.create({
            invoice: savedInvoice.id!,
            amount: (data as any).payment_amount,
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: (data as any).payment_method_record || 'cash',
            reference_number: '',
            notes: data.id ? 'Payment recorded on update' : 'Initial payment recorded at creation',
          });
        } catch (paymentError) {
          console.error('Error recording payment:', paymentError);
          alert('Invoice saved but failed to record payment. Please record it manually.');
        }
      }

      navigate(`/invoices/${savedInvoice.id}`);
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Create New Invoice</h1>
      <InvoiceForm onSubmit={handleSubmit} submitLabel="Create Invoice" />
    </div>
  );
}
