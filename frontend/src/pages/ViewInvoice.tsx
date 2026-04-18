import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
import { Invoice } from '../types/invoice';

import PaymentDialog from '../components/PaymentDialog';
import EmailDialog from '../components/EmailDialog';
import EmailHistory from '../components/EmailHistory';

const ViewInvoice: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [refreshHistory, setRefreshHistory] = useState(0);
    const [companySettings, setCompanySettings] = useState<any>(null);

    useEffect(() => {
        if (id) {
            loadInvoice();
        }
        // Fetch live company settings so print uses current data
        fetch('http://127.0.0.1:8000/api/settings/')
            .then(r => r.json())
            .then(data => setCompanySettings(data))
            .catch(() => { });
    }, [id]);

    const loadInvoice = async () => {
        if (!id) {
            alert('Invalid invoice ID');
            navigate('/invoices');
            return;
        }

        try {
            const response = await invoiceAPI.getById(parseInt(id));
            setInvoice(response.data);
        } catch (error) {
            console.error('Error loading invoice:', error);
            alert('Failed to load invoice');
            navigate('/invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSuccess = () => {
        loadInvoice(); // Refresh invoice to update status
        setRefreshHistory(prev => prev + 1); // Refresh history
        alert('Email sent successfully!');
    };

    const handlePaymentSuccess = () => {
        loadInvoice();
        alert('Payment recorded successfully!');
    };

    const printInvoice = () => {
        const cs = companySettings || {};
        const companyName = cs.company_name || invoice?.company_name || 'Rashid Typing & Document Clearing';
        const companyEmail = cs.company_email || invoice?.company_email || '';
        const companyMobile = cs.company_mobile || invoice?.company_mobile || '050-7441282';
        const companyPhone = cs.company_phone || invoice?.company_phone || '06-7670165';
        const companyPoBox = cs.company_po_box || invoice?.company_po_box || 'P.o Box: 7647';
        const companyAddress = cs.company_address || invoice?.company_address || 'Opp. Tasheel, Salama, U.A.Q - UAE';
        const logoUrl = cs.logo_url || null;

        const splitAmt = (amount: number) => {
            const dhs = Math.floor(amount);
            const fils = Math.round((amount - dhs) * 100);
            return { dhs, fils };
        };

        const emptyRows = Math.max(0, 10 - (invoice?.items?.length || 0));

        const itemRows = (invoice?.items || []).map(item => {
            const rate = splitAmt(item.rate);
            const amount = splitAmt(item.amount);
            return `
            <tr style="border-bottom:1px solid #111;">
                <td style="padding:4px 6px;border-right:1px solid #111;">${item.description}</td>
                <td style="padding:4px 6px;text-align:center;border-right:1px solid #111;">${item.quantity}</td>
                <td style="padding:4px 6px;text-align:center;border-right:1px solid #111;">${rate.dhs}</td>
                <td style="padding:4px 6px;text-align:center;border-right:1px solid #111;">${rate.fils}</td>
                <td style="padding:4px 6px;text-align:center;border-right:1px solid #111;">${amount.dhs}</td>
                <td style="padding:4px 6px;text-align:center;">${amount.fils}</td>
            </tr>`;
        }).join('');

        const emptyRowsHtml = Array(emptyRows).fill(`
            <tr style="border-bottom:1px solid #111;">
                <td style="padding:4px 6px;height:24px;border-right:1px solid #111;">&nbsp;</td>
                <td style="border-right:1px solid #111;"></td>
                <td style="border-right:1px solid #111;"></td>
                <td style="border-right:1px solid #111;"></td>
                <td style="border-right:1px solid #111;"></td>
                <td></td>
            </tr>`).join('');

        const totalAmt = splitAmt(Number(invoice?.total_amount || 0));

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${invoice?.invoice_number}</title>
  <style>
    @media print { body { margin:0; } button { display:none; } }
    body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; max-width: 700px; margin: 0 auto; }
    h1 { font-size:16px; margin:4px 0; }
    table { width:100%; border-collapse:collapse; border:1px solid #111; margin-bottom:12px; }
    th, td { padding:4px 6px; }
    th { background:#f0f0f0; }
    .center { text-align:center; }
    .right { text-align:right; }
    .bold { font-weight:bold; }
    .border-r { border-right:1px solid #111; }
    .border-b { border-bottom:1px solid #111; }
    .flex-between { display:flex; justify-content:space-between; margin-bottom:8px; }
    .sig-section { display:flex; justify-content:space-between; margin-top:20px; font-size:11px; }
  </style>
</head>
<body>
  <div style="text-align:center;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:8px;">
    <div style="font-size:11px;direction:rtl;">راشد للطباعات وتخليص للمعاملات</div>
    ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="max-height:50px;margin:4px auto;display:block;" />` : ''}
    <h1>${companyName}</h1>
    <div style="font-size:11px;line-height:1.5;">
      E-mail: ${companyEmail}<br/>
      Mob: ${companyMobile} | Tel: ${companyPhone}<br/>
      ${companyPoBox}<br/>
      ${companyAddress}
    </div>
  </div>

  <div style="border:1px solid #111;padding:6px;margin-bottom:8px;text-align:center;font-size:11px;">
    <div style="direction:rtl;font-size:10px;">فاتورة نقد /على الحساب</div>
    <strong>${invoice?.payment_method || 'CASH/DEBIT MEMO'}</strong>
  </div>

  <div class="flex-between" style="font-size:13px;">
    <div><strong>No: ${invoice?.invoice_number}</strong></div>
    <div><strong>Date:</strong> ${invoice?.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('en-GB') : ''}</div>
  </div>

  <div style="margin-bottom:8px;font-size:13px;"><strong>Mr./M/s:</strong> ${invoice?.client_name}</div>

  <table>
    <thead>
      <tr class="border-b">
        <th rowspan="2" class="border-r center" style="width:40%"><div>Description</div><div style="direction:rtl">التفاصيل</div></th>
        <th rowspan="2" class="border-r center" style="width:10%"><div>Qty</div><div style="direction:rtl">العدد</div></th>
        <th colspan="2" class="border-r center border-b">Rate السعر</th>
        <th colspan="2" class="center border-b">Amount المبلغ</th>
      </tr>
      <tr class="border-b">
        <th class="border-r center" style="width:12%"><div>Dhs.</div><div style="direction:rtl">درهم</div></th>
        <th class="border-r center" style="width:12%"><div>Fils.</div><div style="direction:rtl">فلس</div></th>
        <th class="border-r center" style="width:12%"><div>Dhs.</div><div style="direction:rtl">درهم</div></th>
        <th class="center" style="width:12%"><div>Fils.</div><div style="direction:rtl">فلس</div></th>
      </tr>
    </thead>
    <tbody>${itemRows}${emptyRowsHtml}</tbody>
    <tfoot>
      <tr style="border-top:2px solid #111;background:#f0f0f0;">
        <td colspan="4" style="padding:6px;font-weight:bold;border-right:1px solid #111;">
          Total: ${invoice?.total_in_words || Number(invoice?.total_amount || 0).toFixed(2) + ' Dhs Only'}
        </td>
        <td colspan="2" style="padding:6px;text-align:center;font-weight:bold;font-size:14px;">
          ${totalAmt.dhs} . ${totalAmt.fils}
        </td>
      </tr>
    </tfoot>
  </table>

  <div class="sig-section">
    <div style="width:45%;">Receiver's Sign.............................................<br/><span style="direction:rtl;display:block;margin-top:4px;">التوقيع المستلم</span></div>
    <div style="width:45%;text-align:right;">Signature.............................................<br/><span style="direction:rtl;display:block;margin-top:4px;">التوقيع</span></div>
  </div>

  ${invoice?.notes ? `<div style="margin-top:12px;padding:8px;background:#f9f9f9;border-radius:4px;"><strong>Notes:</strong><p style="margin:4px 0 0 0;">${invoice.notes}</p></div>` : ''}

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

        const w = window.open('', '_blank', 'width=800,height=900');
        if (w) {
            w.document.write(html);
            w.document.close();
        } else {
            alert('Popup blocked! Please allow popups for this page and try again.');
        }
    };

    const splitAmount = (amount: number) => {
        const dhs = Math.floor(amount);
        const fils = Math.round((amount - dhs) * 100);
        return { dhs, fils };
    };

    // Calculate totals for profit row
    const totalCardPayment = (invoice?.items || []).reduce((s, i: any) => s + (Number(i.card_payment) || 0), 0);
    const profit = Number(invoice?.total_amount || 0) - totalCardPayment;

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
            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-lg no-print">
                <Link to="/invoices" className="btn btn-secondary">
                    ← Back to Invoices
                </Link>
                <div className="flex gap-md">
                    {invoice.balance_due! > 0 && (
                        <button
                            className="btn btn-success"
                            onClick={() => setIsPaymentOpen(true)}
                            style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                        >
                            ✅ Received
                        </button>
                    )}
                    <button
                        className="btn btn-secondary"
                        onClick={() => setIsEmailOpen(true)}
                    >
                        📧 Send Email
                    </button>
                    <Link to={`/invoices/${id}/edit`} className="btn btn-primary">
                        ✏️ Edit Invoice
                    </Link>
                    <button className="btn btn-secondary" onClick={printInvoice}>
                        🖨️ Print / Save PDF
                    </button>
                </div>
            </div>

            <EmailDialog
                isOpen={isEmailOpen}
                onClose={() => setIsEmailOpen(false)}
                invoiceId={invoice.id!}
                clientEmail={invoice.company_email || ''}
                onSuccess={handleEmailSuccess}
            />

            <PaymentDialog
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                invoiceId={invoice.id!}
                invoiceNumber={invoice.invoice_number}
                totalAmount={Number(invoice.total_amount)}
                outstandingAmount={Number(invoice.balance_due)}
                onSuccess={handlePaymentSuccess}
            />

            {/* Invoice Display */}
            <div className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-xl)' }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    borderBottom: '2px solid var(--gray-900)',
                    paddingBottom: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-md)'
                }}>
                    <div style={{ fontSize: '0.75rem', marginBottom: 'var(--spacing-xs)', direction: 'rtl' }}>
                        راشد للطباعات وتخليص للمعاملات
                    </div>
                    {companySettings?.logo_url && (
                        <img src={companySettings.logo_url} alt="Logo" style={{ maxHeight: '50px', margin: '4px auto', display: 'block' }} />
                    )}
                    <h1 style={{ fontSize: '1.25rem', margin: '0', fontWeight: 'bold' }}>
                        {companySettings?.company_name || invoice.company_name || 'Rashid Typing & Document Clearing'}
                    </h1>
                    <div style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-xs)', lineHeight: 1.4 }}>
                        E-mail: {companySettings?.company_email || invoice.company_email || 'rashidhuaq@gmail.com'}<br />
                        Mob: {companySettings?.company_mobile || invoice.company_mobile || '050-7441282'} | Tel: {companySettings?.company_phone || invoice.company_phone || '06-7670165'}<br />
                        {companySettings?.company_po_box || invoice.company_po_box || 'P.o Box: 7647'}<br />
                        {companySettings?.company_address || invoice.company_address || 'Opp. Tasheel, Salama, U.A.Q - UAE'}
                    </div>
                </div>

                {/* Payment Method and Invoice Info */}
                <div style={{
                    border: '1px solid var(--gray-900)',
                    padding: 'var(--spacing-sm)',
                    marginBottom: 'var(--spacing-md)',
                    textAlign: 'center',
                    fontSize: '0.75rem'
                }}>
                    <div style={{ direction: 'rtl', fontSize: '0.7rem' }}>فاتورة نقد /على الحساب</div>
                    <strong>{invoice.payment_method || 'CASH/DEBIT MEMO'}</strong>
                </div>

                <div className="flex justify-between" style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                    <div>
                        <strong>No: {invoice.invoice_number}</strong>
                    </div>
                    <div>
                        <strong>Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString('en-GB')}
                    </div>
                </div>

                {/* Client Info */}
                <div style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                    <strong>Mr./M/s:</strong> {invoice.client_name}
                </div>

                {/* Items Table */}
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: 'var(--spacing-md)',
                    fontSize: '0.75rem',
                    border: '1px solid var(--gray-900)'
                }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--gray-900)' }}>
                            <th rowSpan={2} style={{
                                padding: 'var(--spacing-xs)',
                                textAlign: 'center',
                                borderRight: '1px solid var(--gray-900)',
                                width: '40%'
                            }}>
                                <div>Description</div>
                                <div style={{ direction: 'rtl' }}>التفاصيل</div>
                            </th>
                            <th rowSpan={2} style={{
                                padding: 'var(--spacing-xs)',
                                textAlign: 'center',
                                borderRight: '1px solid var(--gray-900)',
                                width: '10%'
                            }}>
                                <div>Qty</div>
                                <div style={{ direction: 'rtl' }}>العدد</div>
                            </th>
                            <th colSpan={2} style={{
                                padding: 'var(--spacing-xs)',
                                textAlign: 'center',
                                borderRight: '1px solid var(--gray-900)',
                                borderBottom: '1px solid var(--gray-900)'
                            }}>
                                <div>Rate</div>
                                <div style={{ direction: 'rtl' }}>السعر</div>
                            </th>
                            <th colSpan={2} style={{
                                padding: 'var(--spacing-xs)',
                                textAlign: 'center'
                            }}>
                                <div>Total Amount</div>
                                <div style={{ direction: 'rtl' }}>المبلغ</div>
                            </th>
                            <th className="no-print" style={{
                                padding: 'var(--spacing-xs)',
                                textAlign: 'center',
                                borderLeft: '1px solid var(--gray-900)',
                                color: '#92400e',
                                backgroundColor: '#fffbeb'
                            }}>
                                Card Pyt
                            </th>
                            <th className="no-print" style={{
                                padding: 'var(--spacing-xs)',
                                textAlign: 'center',
                                borderLeft: '1px solid var(--gray-900)',
                                color: '#15803d',
                                backgroundColor: '#f0fdf4'
                            }}>
                                ✓ Done
                            </th>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--gray-900)' }}>
                            <th style={{
                                padding: 'var(--spacing-xs)',
                                textAlign: 'center',
                                borderRight: '1px solid var(--gray-900)',
                                width: '12%'
                            }}>
                                <div>Dhs.</div>
                                <div style={{ direction: 'rtl' }}>درهم</div>
                            </th>
                            <th style={{
                                padding: 'var(--spacing-xs)',
                                textAlign: 'center',
                                borderRight: '1px solid var(--gray-900)',
                                width: '12%'
                            }}>
                                <div>Fils.</div>
                                <div style={{ direction: 'rtl' }}>فلس</div>
                            </th>
                            <th style={{
                                padding: 'var(--spacing-xs)',
                                textAlign: 'center',
                                borderRight: '1px solid var(--gray-900)',
                                width: '12%'
                            }}>
                                <div>Dhs.</div>
                                <div style={{ direction: 'rtl' }}>درهم</div>
                            </th>
                            <th style={{
                                padding: 'var(--spacing-xs)',
                                textAlign: 'center',
                                width: '12%'
                            }}>
                                <div>Fils.</div>
                                <div style={{ direction: 'rtl' }}>فلس</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => {
                            const rate = splitAmount(item.rate);
                            const amount = splitAmount(item.amount);
                            return (
                                <tr key={index} style={{ borderBottom: '1px solid var(--gray-900)' }}>
                                    <td style={{ padding: 'var(--spacing-xs)', borderRight: '1px solid var(--gray-900)' }}>
                                        {item.description}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-xs)', textAlign: 'center', borderRight: '1px solid var(--gray-900)' }}>
                                        {item.quantity}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-xs)', textAlign: 'center', borderRight: '1px solid var(--gray-900)' }}>
                                        {rate.dhs}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-xs)', textAlign: 'center', borderRight: '1px solid var(--gray-900)' }}>
                                        {rate.fils}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-xs)', textAlign: 'center', borderRight: '1px solid var(--gray-900)' }}>
                                        {amount.dhs}
                                    </td>
                                    <td style={{ padding: 'var(--spacing-xs)', textAlign: 'center' }}>
                                        {amount.fils}
                                    </td>
                                    <td className="no-print" style={{ padding: 'var(--spacing-xs)', textAlign: 'center', borderLeft: '1px solid var(--gray-900)', color: '#92400e', backgroundColor: '#fffbeb' }}>
                                        {Number((item as any).card_payment || 0).toFixed(2)}
                                    </td>
                                    <td className="no-print" style={{ padding: 'var(--spacing-xs)', textAlign: 'center', borderLeft: '1px solid var(--gray-900)' }}>
                                        {(item as any).payment_done ? '✅' : ''}
                                    </td>
                                </tr>
                            );
                        })}
                        {/* Empty rows for spacing */}
                        {[...Array(Math.max(0, 10 - invoice.items.length))].map((_, i) => (
                            <tr key={`empty-${i}`} style={{ borderBottom: '1px solid var(--gray-900)' }}>
                                <td style={{ padding: 'var(--spacing-xs)', height: '24px', borderRight: '1px solid var(--gray-900)' }}>&nbsp;</td>
                                <td style={{ borderRight: '1px solid var(--gray-900)' }}></td>
                                <td style={{ borderRight: '1px solid var(--gray-900)' }}></td>
                                <td style={{ borderRight: '1px solid var(--gray-900)' }}></td>
                                <td style={{ borderRight: '1px solid var(--gray-900)' }}></td>
                                <td></td>
                                <td className="no-print" style={{ borderLeft: '1px solid var(--gray-900)' }}></td>
                                <td className="no-print" style={{ borderLeft: '1px solid var(--gray-900)' }}></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ borderTop: '2px solid var(--gray-900)', backgroundColor: 'var(--gray-100)' }}>
                            <td colSpan={4} style={{
                                padding: 'var(--spacing-sm)',
                                textAlign: 'left',
                                fontWeight: 'bold',
                                fontSize: '0.875rem',
                                borderRight: '1px solid var(--gray-900)'
                            }}>
                                <strong>Total: {invoice.total_in_words || `${Number(invoice.total_amount).toFixed(2)} Dhs Only`}</strong>
                            </td>
                            <td colSpan={2} style={{
                                padding: 'var(--spacing-sm)',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '1rem'
                            }}>
                                {Number(invoice.total_amount).toFixed(2)}
                            </td>
                            <td className="no-print" style={{ padding: 'var(--spacing-sm)', textAlign: 'center', borderLeft: '1px solid var(--gray-900)', color: '#92400e', fontWeight: 600, backgroundColor: '#fffbeb' }}>
                                {totalCardPayment.toFixed(2)}
                            </td>
                            <td className="no-print"></td>
                        </tr>
                        <tr className="no-print" style={{ backgroundColor: '#f0fdf4', borderTop: '1px solid #bbf7d0' }}>
                            <td colSpan={4} style={{ padding: 'var(--spacing-sm)', textAlign: 'left', fontWeight: 'bold', color: '#15803d', borderRight: '1px solid var(--gray-900)' }}>
                                💰 Profit (Total − Card Pyt)
                            </td>
                            <td colSpan={4} style={{ padding: 'var(--spacing-sm)', textAlign: 'center', fontWeight: 'bold', color: '#15803d', fontSize: '1rem' }}>
                                {profit.toFixed(2)} Dhs
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Signature */}
                <div className="flex justify-between" style={{ marginTop: 'var(--spacing-lg)', fontSize: '0.75rem' }}>
                    <div style={{ width: '45%' }}>
                        Receiver's Sign.............................................
                        <div style={{ direction: 'rtl', marginTop: 'var(--spacing-xs)' }}>التوقيع المستلم</div>
                    </div>
                    <div style={{ width: '45%', textAlign: 'right' }}>
                        Signature.............................................
                        <div style={{ direction: 'rtl', marginTop: 'var(--spacing-xs)' }}>التوقيع</div>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div style={{
                        marginTop: 'var(--spacing-lg)',
                        padding: 'var(--spacing-md)',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem'
                    }} className="no-print">
                        <strong>Notes:</strong>
                        <p style={{ margin: 'var(--spacing-sm) 0 0 0' }}>
                            {invoice.notes}
                        </p>
                    </div>
                )}

                {/* Status Badge */}
                <div className="no-print" style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
                    <span className={`badge badge-${invoice.status}`} style={{ fontSize: '0.875rem', padding: 'var(--spacing-sm) var(--spacing-lg)' }}>
                        Status: {invoice.status.toUpperCase()}
                    </span>
                </div>

                {/* Email History */}
                <div className="no-print">
                    <EmailHistory invoiceId={invoice.id!} refreshTrigger={refreshHistory} />
                </div>

                {/* Link to Payment History */}
                <div className="no-print" style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
                    <Link to="/payment-history" className="btn btn-secondary">
                        📊 View All Payment History
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ViewInvoice;
