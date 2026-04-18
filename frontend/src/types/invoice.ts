export interface InvoiceItem {
    id?: number;
    description: string;
    quantity: number;
    rate: number;
    rate_fils?: number; // Fils portion of rate (0-99)
    amount: number;
    amount_fils?: number; // Fils portion of amount (0-99)
    card_payment?: number; // Government / Card payment cost
    payment_done?: boolean; // Item-level payment verification checkbox
}

export interface Invoice {
    id?: number;
    invoice_number: string;
    invoice_date: string;
    due_date?: string | null;
    client?: number | null;
    client_name: string;
    company_name?: string;
    company_email?: string;
    company_mobile?: string;
    company_phone?: string;
    company_po_box?: string;
    company_address?: string;
    payment_method?: string;
    subtotal: number;
    total_amount: number;
    amount_paid?: number;
    balance_due?: number;
    total_in_words?: string;
    notes?: string;
    status: 'draft' | 'sent' | 'paid' | 'cancelled' | 'quotation' | 'work_order';
    commission_to?: string;
    commission_amount?: number;
    created_at?: string;
    updated_at?: string;
    items: InvoiceItem[];
}

export interface InvoiceListItem {
    id?: number;
    invoice_number: string;
    invoice_date: string;
    due_date?: string | null;
    client_name: string;
    total_amount: number;
    amount_paid?: number;
    balance_due?: number;
    status: 'draft' | 'sent' | 'paid' | 'cancelled';
    items_count: number; // Count of items in the invoice
    created_at: string;
}

export interface InvoiceStats {
    total_invoices: number;
    draft: number;
    sent: number;
    paid: number;
    total_revenue: number;
    total_due: number;
}
