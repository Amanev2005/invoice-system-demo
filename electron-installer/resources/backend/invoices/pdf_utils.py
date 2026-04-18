from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, Frame, PageTemplate
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from django.conf import settings
from io import BytesIO
import os
import arabic_reshaper
from bidi.algorithm import get_display
import math

# Register Arial font for Arabic support
try:
    # Try common Windows font paths
    font_path = os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts', 'arial.ttf')
    if os.path.exists(font_path):
        pdfmetrics.registerFont(TTFont('Arial', font_path))
        pdfmetrics.registerFont(TTFont('Arial-Bold', os.path.join(os.environ.get('WINDIR', 'C:\\Windows'), 'Fonts', 'arialbd.ttf')))
    else:
        # Fallback or linux path could be added here
        print("Warning: Arial font not found, Arabic might not render correctly")
except Exception as e:
    print(f"Error registering font: {e}")

def get_arabic_text(text):
    """Reshape and reorder Arabic text for correct display"""
    if not text:
        return ""
    reshaped_text = arabic_reshaper.reshape(text)
    bidi_text = get_display(reshaped_text)
    return bidi_text

def generate_invoice_pdf(invoice):
    """
    Generate a PDF for the given invoice matching the print design
    Returns a BytesIO buffer containing the PDF
    """
    buffer = BytesIO()
    
    # Define margins to match print layout (minimal margins)
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4, 
        topMargin=15*mm, 
        bottomMargin=15*mm,
        leftMargin=10*mm,
        rightMargin=10*mm
    )
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Get company settings
    from invoices.models import CompanySettings
    company_settings = CompanySettings.get_instance()
    
    # --- styles ---
    style_center = ParagraphStyle(
        'Center', 
        parent=styles['Normal'], 
        alignment=TA_CENTER, 
        fontName='Arial-Bold',
        fontSize=14,
        leading=16
    )
    style_normal = ParagraphStyle(
        'NormalArial',
        parent=styles['Normal'],
        fontName='Arial',
        fontSize=9,
        alignment=TA_CENTER,
        leading=12
    )
    style_arabic = ParagraphStyle(
        'Arabic',
        parent=styles['Normal'],
        fontName='Arial',
        fontSize=10,
        alignment=TA_CENTER,
        leading=12
    )

    # --- Header Section ---
    # Arabic Company Name (Top)
    # The frontend has: "راشد للطباعات وتخليص للمعاملات"
    # We can hardcode it or add it to settings later if needed. 
    # For now, using the text from the screenshot
    elements.append(Paragraph(get_arabic_text("راشد للطباعات وتخليص للمعاملات"), style_arabic))
    
    # English Company Name
    elements.append(Paragraph(company_settings.company_name, style_center))
    
    # Contact Info
    contact_info = []
    if company_settings.company_email:
        contact_info.append(f"E-mail: {company_settings.company_email}")
    
    phones = []
    if company_settings.company_mobile:
        phones.append(f"Mob: {company_settings.company_mobile}")
    if company_settings.company_phone:
        phones.append(f"Tel: {company_settings.company_phone}")
    if phones:
        contact_info.append(" | ".join(phones))
        
    if company_settings.company_po_box:
        contact_info.append(company_settings.company_po_box)
        
    if company_settings.company_address:
        contact_info.append(company_settings.company_address)
        
    for info in contact_info:
        elements.append(Paragraph(info, style_normal))
        
    elements.append(Spacer(1, 5*mm))
    
    # Horizontal Line
    elements.append(Paragraph("_" * 90, style_center)) # Simple line simulation or use Graphics
    elements.append(Spacer(1, 4*mm))
    
    # --- Title Box ---
    # Box with "CASH/DEBIT MEMO" and Arabic
    title_data = [
        [Paragraph(get_arabic_text("فاتورة نقد /على الحساب"), style_arabic)],
        [Paragraph(f"<b>{invoice.payment_method or 'CASH/DEBIT MEMO'}</b>", style_center)]
    ]
    
    title_table = Table(title_data, colWidths=[180*mm])
    title_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(title_table)
    elements.append(Spacer(1, 6*mm))
    
    # --- Invoice Info Row ---
    # No: INV-0005                         Date: 11/02/2026
    
    date_str = invoice.invoice_date.strftime('%d/%m/%Y')
    
    # Table for No and Date line
    info_data = [
        [
            Paragraph(f"<b>No: {invoice.invoice_number}</b>", ParagraphStyle('Left', fontName='Arial', fontSize=10)), 
            Paragraph(f"<b>Date: {date_str}</b>", ParagraphStyle('Right', fontName='Arial', fontSize=10, alignment=TA_RIGHT))
        ]
    ]
    info_table = Table(info_data, colWidths=[95*mm, 95*mm])
    info_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 2*mm))
    
    # Client Name Row
    elements.append(Paragraph(f"<b>Mr./M/s:</b> {invoice.client_name}", ParagraphStyle('Client', fontName='Arial', fontSize=10)))
    elements.append(Spacer(1, 4*mm))
    
    # --- Items Table ---
    # Structure:
    # Description (Merged) | Qty (Merged) | Rate (Authorized Dhs | Fils) | Amount (Dhs | Fils)
    
    # Headers
    desc_header = [Paragraph("<b>Description</b>", style_normal), Paragraph(get_arabic_text("التفاصيل"), style_arabic)]
    qty_header = [Paragraph("<b>Qty</b>", style_normal), Paragraph(get_arabic_text("العدد"), style_arabic)]
    
    rate_header = [Paragraph("<b>Rate</b>", style_normal), Paragraph(get_arabic_text("السعر"), style_arabic)]
    amount_header = [Paragraph("<b>Amount</b>", style_normal), Paragraph(get_arabic_text("المبلغ"), style_arabic)]
    
    dhs_sub = [Paragraph("<b>Dhs.</b>", style_normal), Paragraph(get_arabic_text("درهم"), style_arabic)]
    fils_sub = [Paragraph("<b>Fils.</b>", style_normal), Paragraph(get_arabic_text("فلس"), style_arabic)]
    
    # Complex Header Row Construction
    # We will simulate the merged headers by having a 2-row header
    
    # Row 1 and 2 content
    # But ReportLab Table spans are a bit tricky with data list.
    # It's easier to create content and use spanned cells style.
    
    data = []
    
    # Row 0: Top level headers
    # Col 0: Desc, Col 1: Qty, Col 2-3: Rate, Col 4-5: Amount
    data.append([
        desc_header, # 0
        qty_header,  # 1
        rate_header, # 2 (spans to 3)
        '',          # 3
        amount_header, # 4 (spans to 5)
        ''           # 5
    ])
    
    # Row 1: Sub headers for Rate and Amount
    data.append([
        '', '', 
        dhs_sub, fils_sub, 
        dhs_sub, fils_sub
    ])
    
    # Table Data Rows
    # Add empty rows to ensuring styling matches (e.g. 10 rows min)
    min_rows = 10
    items = list(invoice.items.all())
    
    def split_amount(amt):
        dhs = int(amt)
        fils = round((amt - dhs) * 100)
        return dhs, fils
    
    total_dhs = 0
    total_fils = 0 # Just for checking, actual total connects from model
    
    row_style_normal = ParagraphStyle('RowNormal', fontName='Arial', fontSize=9, alignment=TA_LEFT)
    row_style_center = ParagraphStyle('RowCenter', fontName='Arial', fontSize=9, alignment=TA_CENTER)
    
    for item in items:
        rate_dhs, rate_fils = split_amount(item.rate)
        amt_dhs, amt_fils = split_amount(item.amount)
        
        data.append([
            Paragraph(item.description, row_style_normal),
            Paragraph(str(item.quantity), row_style_center),
            Paragraph(str(rate_dhs), row_style_center),
            Paragraph(str(rate_fils), row_style_center),
            Paragraph(str(amt_dhs), row_style_center),
            Paragraph(str(amt_fils), row_style_center),
        ])
        
    # Fill remaining rows
    for _ in range(max(0, min_rows - len(items))):
        data.append(['', '', '', '', '', ''])
        
    # Footer Row (Total)
    # Merged first 4 columns for "Total text"
    # Then Total Amount Dhs and Fils? Or just one total?
    # Screenshot shows "1000.22" centered under Amount column. 
    # But usually Amount column is split. Let's merge the last two for the total number.
    
    total_text = f"<b>Total: {invoice.total_in_words or str(invoice.total_amount) + ' Dhs Only'}</b>"
    total_val = f"<b>{invoice.total_amount:.2f}</b>"
    
    data.append([
        Paragraph(total_text, ParagraphStyle('TotalText', fontName='Arial', fontSize=10)),
        '', '', '', # Spanned
        Paragraph(total_val, ParagraphStyle('TotalVal', fontName='Arial', fontSize=11, alignment=TA_CENTER)),
        '' # Spanned
    ])
    
    # Column Widths
    # Total width approx 190mm
    # Desc: 40%, Qty: 10%, Rate: 24% (12+12), Amount: 24% (12+12)
    # 190mm * 0.4 = 76mm
    # 190mm * 0.1 = 19mm
    # 190mm * 0.12 = 22.8mm
    
    col_widths = [76*mm, 19*mm, 23*mm, 23*mm, 24*mm, 24*mm]
    
    t = Table(data, colWidths=col_widths, repeatRows=2)
    
    # Styles
    layout_style = [
        # Grid
        ('GRID', (0, 0), (-1, -2), 0.5, colors.black), # All grid for headers and items
        ('BOX', (0, -1), (-1, -1), 1, colors.black),   # Box around total row
        
        # Header Spans
        ('SPAN', (0, 0), (0, 1)), # Desc
        ('SPAN', (1, 0), (1, 1)), # Qty
        ('SPAN', (2, 0), (3, 0)), # Rate
        ('SPAN', (4, 0), (5, 0)), # Amount
        
        # Header Alignment
        ('ALIGN', (0, 0), (-1, 1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, 1), 'MIDDLE'),
        
        # Total Row Spans
        ('SPAN', (0, -1), (3, -1)), # Total Text spans 4 cols
        ('SPAN', (4, -1), (5, -1)), # Total Value spans 2 cols
        
        # Total Row alignments
        ('ALIGN', (0, -1), (0, -1), 'LEFT'),
        ('ALIGN', (4, -1), (5, -1), 'CENTER'),
        ('VALIGN', (0, -1), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, -1), (0, -1), 6),
        
        # Fonts
        ('FONTNAME', (0, 0), (-1, -1), 'Arial'),
    ]
    
    t.setStyle(TableStyle(layout_style))
    elements.append(t)
    elements.append(Spacer(1, 15*mm))
    
    # --- Footer Signatures ---
    # Receiver's Sign .......... Signature ...........
    
    sign_data = [
        [
            Paragraph("Receiver's Sign.............................................", ParagraphStyle('Left', fontName='Arial', fontSize=9)),
            Paragraph("Signature.............................................", ParagraphStyle('Right', fontName='Arial', fontSize=9, alignment=TA_RIGHT))
        ],
        [
             Paragraph(get_arabic_text("التوقيع المستلم"), ParagraphStyle('RightAR', fontName='Arial', fontSize=9, alignment=TA_LEFT)), # RTL force left align visually? No alignment aligns the box.
             Paragraph(get_arabic_text("التوقيع"), ParagraphStyle('LeftAR', fontName='Arial', fontSize=9, alignment=TA_RIGHT))
        ]
    ]
    
    sign_table = Table(sign_data, colWidths=[95*mm, 95*mm])
    sign_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 1), 'LEFT'),
        ('ALIGN', (1, 0), (1, 1), 'RIGHT'),
    ]))
    elements.append(sign_table)
    
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
