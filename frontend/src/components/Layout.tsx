import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface LayoutProps {
    children: React.ReactNode;
}

interface MenuItem {
    path?: string;
    icon?: string;
    label: string;
    children?: MenuItem[];
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [companyName, setCompanyName] = useState('Invoice System');
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['Transactions', 'Report']);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const fetchCompanySettings = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.SETTINGS);
                if (response.data) {
                    setCompanyName(response.data.company_name || 'Invoice System');
                    setCompanyLogo(response.data.logo_url);
                }
            } catch (error) {
                console.error('Error fetching company settings:', error);
            }
        };
        fetchCompanySettings();
    }, []);

    // Auto-collapse sidebar on navigation (for mobile/hamburger feel)
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarCollapsed(true);
        }
    }, [location.pathname]);

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const toggleMenu = (label: string) => {
        if (expandedMenus.includes(label)) {
            setExpandedMenus(expandedMenus.filter(m => m !== label));
        } else {
            setExpandedMenus([...expandedMenus, label]);
        }
    };

    const menuItems: MenuItem[] = [
        { path: '/', label: 'Dashboard' },
        { path: '/cash-balance', label: 'Cash Balance' },
        { path: '/clients', label: 'Client' },
        { path: '/invoices', label: 'Invoices' },
        { path: '/drafts', label: 'Drafts' },
        { path: '/quotations', label: 'Quotations' },
        { path: '/work-orders', label: 'Work Order' },
        { path: '/leads', label: 'Leads' },
        { path: '/notify-client', label: 'Notify Client' },
        {
            label: 'Transactions',
            children: [
                { path: '/payment-history', label: 'Payment History' },
                { path: '/suppliers?balance_gt=0', label: 'Payable' },
                { path: '/clients?balance_gt=0', label: 'Receivable' },
                { path: '/wallets-banks', label: 'Wallets/Banks' },
                { path: '/commissions', label: 'Commissions' },
                { path: '/expenses', label: 'Expenses' }
            ]
        },
        {
            label: 'Report',
            children: [
                { path: '/reports', label: 'Profit Report' },
                { path: '/clients', label: 'Client Statement' },
                { path: '/reports/cash-book', label: 'Cash Book' },
                { path: '/reports/daily', label: 'Daily Report' },
                { path: '/reports/daily-sheet', label: 'Daily Sheet' },
                { path: '/reports/invoice-draft', label: 'Inv. / Draft Report' },
                { path: '/reports/item-wise', label: 'Item Wise Report' },
                { path: '/reports/commission-payable', label: 'Commission Payable Report' },
                { path: '/reports/user-commission', label: 'User Commission Report' },
                { path: '/reports/supplier-commission', label: 'Supplier Commission' },
                { path: '/reports/salary', label: 'Salary Report' },
                { path: '/reports/wallet-bank', label: 'Wallet/Bank Report' },
                { path: '/reports/supplier', label: 'Supplier Report' },
                { path: '/reports/collection', label: 'Collection Report' },
                { path: '/reports/expense', label: 'Expense Report' }
            ]
        },
        { path: '/staff-portal', label: 'Staff Portal' },
        { path: '/activity-log', label: 'Activity Log' },
        { path: '/backup', label: 'Backup' },
        { path: '/settings', label: 'Settings' },
    ];

    const renderMenuItem = (item: MenuItem, index: number) => {
        if (item.children) {
            const isExpanded = expandedMenus.includes(item.label);
            return (
                <div key={index}>
                    <div
                        onClick={() => toggleMenu(item.label)}
                        className="sidebar-nav-item"
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            {item.icon && <span className="sidebar-nav-icon">{item.icon}</span>}
                            <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{isExpanded ? '▼' : '▶'}</span>
                    </div>
                    {isExpanded && (
                        <div style={{ paddingLeft: 'calc(var(--spacing-md) + 24px)', borderLeft: '1px solid var(--gray-200)', margin: '0 0 var(--spacing-sm) var(--spacing-lg)' }}>
                            {item.children.map((child, childIndex) => (
                                <Link
                                    key={childIndex}
                                    to={child.path!}
                                    className={`sidebar-nav-item sub-item ${isActive(child.path!) ? 'active' : ''}`}
                                    style={{ fontSize: '0.875rem', padding: 'var(--spacing-sm) var(--spacing-md)' }}
                                >
                                    {child.icon && <span className="sidebar-nav-icon" style={{ fontSize: '1rem' }}>{child.icon}</span>}
                                    <span>{child.label}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={index}
                to={item.path!}
                className={`sidebar-nav-item ${isActive(item.path!) ? 'active' : ''}`}
            >
                {item.icon && <span className="sidebar-nav-icon">{item.icon}</span>}
                <span>{item.label}</span>
            </Link>
        );
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            {/* Top Bar */}
            <header className="top-bar">
                <div className="flex items-center gap-md">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hamburger-btn"
                        aria-label="Toggle Menu"
                    >
                        ☰
                    </button>
                    <div className="top-bar-logo">
                        {companyLogo ? (
                            <img src={companyLogo} alt="Logo" />
                        ) : (
                            <span style={{ fontSize: '1.5rem' }}>🧾</span>
                        )}
                        <span className="top-bar-title">{companyName}</span>
                    </div>
                </div>
                <div className="top-bar-actions no-print">
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/settings')}>
                        ⚙️ Settings
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1 }}>
                {/* Mobile Overlay */}
                {!sidebarCollapsed && window.innerWidth < 1024 && (
                    <div className="sidebar-overlay" onClick={() => setSidebarCollapsed(true)}></div>
                )}

                <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                    <nav className="sidebar-nav">
                        {menuItems.map((item, index) => renderMenuItem(item, index))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className={`main-content ${!sidebarCollapsed ? 'main-push-content' : ''}`}>
                    <div className="page-container">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
