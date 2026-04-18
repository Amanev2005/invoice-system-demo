import React, { useState, useEffect } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = 'Search invoices...'
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Debounce search to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, onSearch]);

    return (
        <div className="form-group" style={{ marginBottom: 0 }}>
            <input
                type="text"
                className="form-input"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                    minWidth: '300px',
                    paddingLeft: 'var(--spacing-md)'
                }}
            />
        </div>
    );
};

export default SearchBar;
