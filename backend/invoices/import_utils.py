import pandas as pd
from decimal import Decimal
from datetime import datetime
from .models import Invoice, InvoiceItem

def import_invoices_from_file(file):
    """
    Import invoices from CSV or Excel file
    Returns: (success_count, error_messages)
    """
    try:
        # Determine file type and read into DataFrame
        if file.name.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.name.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file)
        else:
            return 0, ["Unsupported file format. Please upload .csv or .xlsx"]
            
        success_count = 0
        errors = []
        
        # Group by Invoice Number to handle multiple items
        grouped = df.groupby('Invoice Number')
        
        for invoice_number, group in grouped:
            try:
                # Get invoice details from the first row of the group
                first_row = group.iloc[0]
                
                # Check if invoice already exists
                if Invoice.objects.filter(invoice_number=invoice_number).exists():
                    errors.append(f"Invoice {invoice_number} already exists. Skipping.")
                    continue
                
                # Parse date
                date_str = str(first_row['Date'])
                try:
                    invoice_date = pd.to_datetime(date_str).date()
                except:
                    invoice_date = datetime.now().date()
                
                # Create Invoice
                invoice = Invoice.objects.create(
                    invoice_number=invoice_number,
                    invoice_date=invoice_date,
                    client_name=first_row['Client'],
                    status=str(first_row.get('Status', 'draft')).lower(),
                    payment_method='Imported'
                )
                
                # Create Items
                for _, row in group.iterrows():
                    desc = row.get('Item Description', 'Imported Item')
                    if pd.isna(desc) or str(desc).strip() == '':
                        continue
                        
                    qty = int(row.get('Quantity', 1))
                    rate = Decimal(str(row.get('Rate', 0)))
                    
                    InvoiceItem.objects.create(
                        invoice=invoice,
                        description=desc,
                        quantity=qty,
                        rate=rate,
                        amount=qty * rate
                    )
                
                # Calculate totals
                invoice.calculate_total()
                
                # Generate words for total
                from .utils import number_to_words
                invoice.total_in_words = number_to_words(float(invoice.total_amount))
                invoice.save()
                
                success_count += 1
                
            except Exception as e:
                errors.append(f"Error importing {invoice_number}: {str(e)}")
                
        return success_count, errors
        
    except Exception as e:
        return 0, [f"File processing error: {str(e)}"]
