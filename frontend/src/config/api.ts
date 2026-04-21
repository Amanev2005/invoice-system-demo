/// <reference types="vite/client" />
// This will use the current host for API calls, making it work on LAN
// In Electron (file://), hostname is empty, so we default to 127.0.0.1
const hostname = (!window.location.hostname || window.location.hostname === 'localhost')
    ? '127.0.0.1'
    : window.location.hostname;

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${hostname}:8000`;

export const API_ENDPOINTS = {
    BASE: `${API_BASE_URL}/api`,
    INVOICES: `${API_BASE_URL}/api/invoices/`,
    CLIENTS: `${API_BASE_URL}/api/clients/`,
    PAYMENTS: `${API_BASE_URL}/api/payments/`,
    SUPPLIERS: `${API_BASE_URL}/api/suppliers/`,
    EMPLOYEES: `${API_BASE_URL}/api/employees/`,
    WORK_ORDERS: `${API_BASE_URL}/api/work-orders/`,
    DASHBOARD: `${API_BASE_URL}/api/dashboard/`,
    SETTINGS: `${API_BASE_URL}/api/settings/`,
    CREDIT_TRANSACTIONS: `${API_BASE_URL}/api/credit-transactions/`,
};

export default API_BASE_URL;
