import React from 'react';

const ComingSoon: React.FC<{ title: string; description: string }> = ({ title, description }) => {
    return (
        <div>
            <h1>{title}</h1>
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)' }}>🚧</div>
                <h2 style={{ color: 'var(--gray-700)', marginBottom: 'var(--spacing-md)' }}>Coming Soon</h2>
                <p style={{ color: 'var(--gray-500)', maxWidth: '600px', margin: '0 auto' }}>
                    {description}
                </p>
            </div>
        </div>
    );
};

export const WorkOrders: React.FC = () => (
    <ComingSoon
        title="Work Orders"
        description="Manage and track work orders for your projects. This feature is currently under development."
    />
);

export const Leads: React.FC = () => (
    <ComingSoon
        title="Leads"
        description="Track and manage your sales leads. Convert leads to clients and quotations."
    />
);

export const Docer: React.FC = () => (
    <ComingSoon
        title="Doc'er"
        description="Document management system for organizing and storing important files."
    />
);

export const PaymentLinks: React.FC = () => (
    <ComingSoon
        title="Payment Links"
        description="Generate and share payment links with your clients for easy online payments."
    />
);

export const NotifyClient: React.FC = () => (
    <ComingSoon
        title="Notify Client"
        description="Send notifications and reminders to your clients via email or SMS."
    />
);

export const Transactions: React.FC = () => (
    <ComingSoon
        title="Transactions"
        description="View all financial transactions including payments, credits, and debits."
    />
);

export const Services: React.FC = () => (
    <ComingSoon
        title="Services"
        description="Manage your service catalog and pricing."
    />
);

export const StaffPortal: React.FC = () => (
    <ComingSoon
        title="Staff Portal"
        description="Staff management and access control portal."
    />
);

export const Bookmarks: React.FC = () => (
    <ComingSoon
        title="Bookmarks"
        description="Save and organize your frequently accessed pages and records."
    />
);

export const Reports: React.FC = () => (
    <ComingSoon
        title="Reports"
        description="Generate comprehensive business reports and analytics."
    />
);

export const Addons: React.FC = () => (
    <ComingSoon
        title="Add-ons"
        description="Extend your system with additional features and integrations."
    />
);

export const FAQ: React.FC = () => (
    <ComingSoon
        title="FAQ"
        description="Frequently asked questions and help documentation."
    />
);

export const Referral: React.FC = () => (
    <ComingSoon
        title="Referral"
        description="Refer new customers and earn rewards."
    />
);

export const ActivityLog: React.FC = () => (
    <ComingSoon
        title="Activity Log"
        description="Track all system activities and user actions."
    />
);
