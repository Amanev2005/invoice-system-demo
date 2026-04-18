from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import EmailHistory, CompanySettings
from .pdf_utils import generate_invoice_pdf

def send_invoice_email(invoice, recipient_email, user=None):
    """
    Send an invoice via email and log the attempt
    Uses company email and password from settings database
    Attaches invoice as PDF
    """
    try:
        company_settings = CompanySettings.get_instance()
        company_name = company_settings.company_name or 'Invoice System'
        company_email = company_settings.company_email or settings.EMAIL_HOST_USER
        company_email_password = company_settings.company_email_password or settings.EMAIL_HOST_PASSWORD
        
        # Validate email configuration
        if not company_email or company_email == 'noreply@invoicesystem.local':
            error_msg = "Email not configured. Please set company email in Settings."
            EmailHistory.objects.create(
                invoice=invoice,
                recipient_email=recipient_email,
                status='failed',
                error_message=error_msg,
                sent_by=user.username if user else 'system'
            )
            return False, error_msg
        
        if not company_email_password:
            error_msg = "Email password not configured. Please set Gmail App Password in Settings."
            EmailHistory.objects.create(
                invoice=invoice,
                recipient_email=recipient_email,
                status='failed',
                error_message=error_msg,
                sent_by=user.username if user else 'system'
            )
            return False, error_msg
        
        subject = f"Invoice #{invoice.invoice_number} from {company_name}"
        
        # Use company email as sender with company name
        from_email = f"{company_name} <{company_email}>"
        
        # Context for template
        context = {
            'invoice': invoice,
            'company_name': company_name,
            'company_settings': company_settings,
            'company_logo_url': company_settings.logo.url if company_settings.logo else None,
        }
        
        # Render HTML content
        html_content = render_to_string('email_template.html', context)
        text_content = strip_tags(html_content)
        
        # Create custom SMTP connection with company credentials
        connection = get_connection(
            backend='django.core.mail.backends.smtp.EmailBackend',
            host=settings.EMAIL_HOST,
            port=settings.EMAIL_PORT,
            username=company_email,
            password=company_email_password,
            use_tls=settings.EMAIL_USE_TLS,
            use_ssl=settings.EMAIL_USE_SSL,
        )
        
        msg = EmailMultiAlternatives(
            subject,
            text_content,
            from_email,
            [recipient_email],
            connection=connection
        )
        msg.attach_alternative(html_content, "text/html")
        
        # Generate and attach PDF
        try:
            pdf_buffer = generate_invoice_pdf(invoice)
            pdf_filename = f"Invoice_{invoice.invoice_number}.pdf"
            msg.attach(pdf_filename, pdf_buffer.read(), 'application/pdf')
        except Exception as pdf_error:
            print(f"Warning: Could not generate PDF: {pdf_error}")
            # Continue sending email without PDF
        
        msg.send()
        
        # Log success
        EmailHistory.objects.create(
            invoice=invoice,
            recipient_email=recipient_email,
            status='success',
            sent_by=user.username if user else 'system'
        )
        
        # Update invoice status if it was draft
        if invoice.status == 'draft':
            invoice.status = 'sent'
            invoice.save()
            
        return True, "Email sent successfully with PDF attachment"
        
    except Exception as e:
        # Log failure with detailed error
        error_msg = str(e)
        
        # Provide helpful error messages
        if '535' in error_msg or 'authentication' in error_msg.lower():
            error_msg = "Gmail authentication failed. Please verify you're using an App Password (not regular password) in Settings."
        elif 'connection' in error_msg.lower():
            error_msg = "Cannot connect to email server. Check your internet connection."
        
        EmailHistory.objects.create(
            invoice=invoice,
            recipient_email=recipient_email,
            status='failed',
            error_message=error_msg,
            sent_by=user.username if user else 'system'
        )
        return False, error_msg





