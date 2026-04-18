import csv
import pandas as pd
from django.http import HttpResponse
from .models import Invoice

def export_invoices_csv():
    """Export all invoices to CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="invoices.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Invoice Number', 'Date', 'Client', 'Total Amount', 
        'Status', 'Created At', 'Items Count'
    ])
    
    invoices = Invoice.objects.all().order_by('-invoice_date')
    
    for invoice in invoices:
        writer.writerow([
            invoice.invoice_number,
            invoice.invoice_date,
            invoice.client_name,
            invoice.total_amount,
            invoice.status,
            invoice.created_at,
            invoice.items.count()
        ])
        
    return response

def export_invoices_excel():
    """Export all invoices to Excel with details"""
    # Create a list of dictionaries for the DataFrame
    data = []
    
    invoices = Invoice.objects.prefetch_related('items').all().order_by('-invoice_date')
    
    for invoice in invoices:
        # If invoice has no items, add a row with just invoice details
        if not invoice.items.exists():
            data.append({
                'Invoice Number': invoice.invoice_number,
                'Date': invoice.invoice_date,
                'Client': invoice.client_name,
                'Status': invoice.status,
                'Total Amount': invoice.total_amount,
                'Item Description': '',
                'Quantity': '',
                'Rate': '',
                'Item Amount': ''
            })
            continue
            
        # Add a row for each item
        for item in invoice.items.all():
            data.append({
                'Invoice Number': invoice.invoice_number,
                'Date': invoice.invoice_date,
                'Client': invoice.client_name,
                'Status': invoice.status,
                'Total Amount': invoice.total_amount,
                'Item Description': item.description,
                'Quantity': item.quantity,
                'Rate': item.rate,
                'Item Amount': item.amount
            })
    
    df = pd.DataFrame(data)
    
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="invoices.xlsx"'
    
    df.to_excel(response, index=False, engine='openpyxl')
    
    return response
