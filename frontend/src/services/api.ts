import axios from 'axios';
import { Invoice, InvoiceListItem, InvoiceStats } from '../types/invoice';
import { API_ENDPOINTS } from '../config/api';

export const api = axios.create({
  baseURL: API_ENDPOINTS.INVOICES,
});

// Invoice CRUD operations
export const invoiceAPI = {
  // Get all invoices with optional query parameters
  getAll: (params?: any) => api.get<InvoiceListItem[]>('', { params }),

  // Get single invoice by ID
  getById: (id: number) => api.get<Invoice>(`${id}/`),

  // Create new invoice
  create: (data: Partial<Invoice>) => api.post<Invoice>('', data),

  // Update invoice
  update: (id: number, data: Partial<Invoice>) => api.put<Invoice>(`${id}/`, data),

  // Partial update
  patch: (id: number, data: Partial<Invoice>) => api.patch<Invoice>(`${id}/`, data),

  // Delete invoice
  delete: (id: number) => api.delete(`${id}/`),

  // Get statistics
  getStats: (month?: string) => {
    const params = month ? { month } : {};
    return api.get<InvoiceStats>('stats/', { params });
  },
};

// Client API
export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  trn_no?: string;
  vat_no?: string;
  credit_limit: number;
  credit_terms: number;
  current_balance: number;
  credit_balance: number;
  debit_balance: number;
  advance_balance: number;
  invoice_count: number;
  overdue_amount: number;
  created_at: string;
  updated_at: string;
}

export const clientAPI = {
  getAll: (params?: any) => axios.get<Client[]>(API_ENDPOINTS.CLIENTS, { params }),
  getById: (id: number) => axios.get<Client>(`${API_ENDPOINTS.CLIENTS}${id}/`),
  create: (data: Partial<Client>) => axios.post<Client>(API_ENDPOINTS.CLIENTS, data),
  update: (id: number, data: Partial<Client>) => axios.put<Client>(`${API_ENDPOINTS.CLIENTS}${id}/`, data),
  delete: (id: number, params?: any) => axios.delete(`${API_ENDPOINTS.CLIENTS}${id}/`, { params }),
  getInvoices: (id: number) => axios.get<InvoiceListItem[]>(`${API_ENDPOINTS.CLIENTS}${id}/invoices/`),
  getStatement: (id: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return axios.get(`${API_ENDPOINTS.CLIENTS}${id}/statement/?${params.toString()}`);
  },
};

// Payment API
export interface Payment {
  id: number;
  invoice: number;
  invoice_id?: number | null;
  invoice_number: string;
  client_name: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  notes: string;
  created_at: string;
  created_by: string;
}

export const paymentAPI = {
  getAll: (params?: any) => axios.get<Payment[]>(API_ENDPOINTS.PAYMENTS, { params }),
  getById: (id: number) => axios.get<Payment>(`${API_ENDPOINTS.PAYMENTS}${id}/`),
  create: (data: Partial<Payment>) => axios.post<Payment>(API_ENDPOINTS.PAYMENTS, data),
  update: (id: number, data: Partial<Payment>) => axios.patch<Payment>(`${API_ENDPOINTS.PAYMENTS}${id}/`, data),
  delete: (id: number) => axios.delete(`${API_ENDPOINTS.PAYMENTS}${id}/`),
};

// Supplier API
export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  balance: number;
  status: 'active' | 'inactive';
}

export const supplierAPI = {
  getAll: (params?: any) => axios.get<Supplier[]>(API_ENDPOINTS.SUPPLIERS, { params }),
  getById: (id: number) => axios.get<Supplier>(`${API_ENDPOINTS.SUPPLIERS}${id}/`),
  create: (data: Partial<Supplier>) => axios.post<Supplier>(API_ENDPOINTS.SUPPLIERS, data),
  update: (id: number, data: Partial<Supplier>) => axios.put<Supplier>(`${API_ENDPOINTS.SUPPLIERS}${id}/`, data),
  delete: (id: number) => axios.delete(`${API_ENDPOINTS.SUPPLIERS}${id}/`),
};

// Credit Transaction API
export interface CreditTransaction {
  id: number;
  client: number;
  client_name?: string;
  amount: number;
  date: string;
  transaction_type: 'credit' | 'debit';
  payment_method: string;
  reference?: string;
  remarks?: string;
  is_advance: boolean;
  wallet?: number;
}

export const creditTxAPI = {
  getAll: (params?: any) => axios.get<CreditTransaction[]>(API_ENDPOINTS.CREDIT_TRANSACTIONS, { params }),
  getById: (id: number) => axios.get<CreditTransaction>(`${API_ENDPOINTS.CREDIT_TRANSACTIONS}${id}/`),
  create: (data: Partial<CreditTransaction>) => axios.post<CreditTransaction>(API_ENDPOINTS.CREDIT_TRANSACTIONS, data),
  update: (id: number, data: Partial<CreditTransaction>) => axios.patch<CreditTransaction>(`${API_ENDPOINTS.CREDIT_TRANSACTIONS}${id}/`, data),
  delete: (id: number) => axios.delete(`${API_ENDPOINTS.CREDIT_TRANSACTIONS}${id}/`),
};
