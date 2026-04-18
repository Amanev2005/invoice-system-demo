import React from 'react';
import { api } from '../services/api';

const ExportButtons: React.FC = () => {
    const handleExport = async (format: 'csv' | 'excel') => {
        try {
            const response = await api.get(`export_${format}/`, {
                responseType: 'blob',
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoices.${format === 'csv' ? 'csv' : 'xlsx'}`);

            // Append to html link element page
            document.body.appendChild(link);

            // Start download
            link.click();

            // Clean up and remove the link
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
        } catch (error: any) {
            console.error(`Error exporting ${format}:`, error);

            // If error response is a blob, read it as text
            let errorMessage = `Failed to export to ${format.toUpperCase()}. Please try again.`;

            if (error.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const errorData = JSON.parse(text);
                    errorMessage = errorData.traceback || errorData.error || errorMessage;
                    console.error('Backend error:', errorData);
                } catch (e) {
                    console.error('Could not parse error blob:', e);
                }
            } else if (error.response?.data) {
                errorMessage = error.response.data.traceback || error.response.data.error || errorMessage;
            }

            alert(errorMessage);
        }
    };

    return (
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button
                onClick={() => handleExport('csv')}
                className="btn btn-secondary btn-sm"
                title="Export to CSV"
            >
                📄 CSV
            </button>
            <button
                onClick={() => handleExport('excel')}
                className="btn btn-secondary btn-sm"
                title="Export to Excel"
            >
                📊 Excel
            </button>
        </div>
    );
};

export default ExportButtons;
