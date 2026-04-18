import React, { useState } from 'react';

export interface FilterOptions {
    status: string;
    dateFrom: string;
    dateTo: string;
    amountMin: string;
    amountMax: string;
    ordering: string;
}

interface FilterPanelProps {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
    onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
    filters,
    onFilterChange,
    onClearFilters
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleChange = (field: keyof FilterOptions, value: string) => {
        onFilterChange({ ...filters, [field]: value });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div
                className="card-header"
                style={{
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 style={{ margin: 0, fontSize: '1rem' }}>
                    🔍 Filters {hasActiveFilters && <span style={{ color: 'var(--primary)' }}>●</span>}
                </h3>
                <span style={{ fontSize: '1.2rem' }}>{isExpanded ? '▼' : '▶'}</span>
            </div>

            {isExpanded && (
                <div style={{ padding: 'var(--spacing-lg)' }}>
                    <div className="grid grid-cols-3 gap-md">
                        {/* Status Filter */}
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="draft">Draft</option>
                                <option value="sent">Sent</option>
                                <option value="paid">Paid</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Date From */}
                        <div className="form-group">
                            <label className="form-label">Date From</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filters.dateFrom}
                                onChange={(e) => handleChange('dateFrom', e.target.value)}
                            />
                        </div>

                        {/* Date To */}
                        <div className="form-group">
                            <label className="form-label">Date To</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filters.dateTo}
                                onChange={(e) => handleChange('dateTo', e.target.value)}
                            />
                        </div>

                        {/* Amount Min */}
                        <div className="form-group">
                            <label className="form-label">Min Amount (Dhs)</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="0.00"
                                value={filters.amountMin}
                                onChange={(e) => handleChange('amountMin', e.target.value)}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        {/* Amount Max */}
                        <div className="form-group">
                            <label className="form-label">Max Amount (Dhs)</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="0.00"
                                value={filters.amountMax}
                                onChange={(e) => handleChange('amountMax', e.target.value)}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        {/* Sort By */}
                        <div className="form-group">
                            <label className="form-label">Sort By</label>
                            <select
                                className="form-select"
                                value={filters.ordering}
                                onChange={(e) => handleChange('ordering', e.target.value)}
                            >
                                <option value="">Default (Newest First)</option>
                                <option value="-invoice_date">Date (Newest)</option>
                                <option value="invoice_date">Date (Oldest)</option>
                                <option value="-total_amount">Amount (High to Low)</option>
                                <option value="total_amount">Amount (Low to High)</option>
                                <option value="invoice_number">Invoice # (A-Z)</option>
                                <option value="-invoice_number">Invoice # (Z-A)</option>
                                <option value="client_name">Client (A-Z)</option>
                                <option value="-client_name">Client (Z-A)</option>
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <div style={{ marginTop: 'var(--spacing-md)' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={onClearFilters}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilterPanel;
