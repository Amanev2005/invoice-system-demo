from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from invoices.models import Invoice, CompanySettings
from invoices.email_utils import send_invoice_email

class Command(BaseCommand):
    help = 'Send payment reminder emails for invoices due in 5 days'

    def handle(self, *args, **kwargs):
        # Calculate the date 5 days from now
        reminder_date = timezone.now().date() + timedelta(days=5)
        
        # Find invoices due on that date that are not paid
        invoices_to_remind = Invoice.objects.filter(
            due_date=reminder_date,
            status__in=['draft', 'sent'],  # Not paid
        ).exclude(
            balance_due=0  # Exclude fully paid invoices
        )
        
        company_settings = CompanySettings.get_instance()
        sent_count = 0
        failed_count = 0
        
        for invoice in invoices_to_remind:
            # Get client email
            recipient_email = None
            if invoice.client and invoice.client.email:
                recipient_email = invoice.client.email
            
            if not recipient_email:
                self.stdout.write(
                    self.style.WARNING(
                        f'Skipping invoice {invoice.invoice_number}: No client email'
                    )
                )
                continue
            
            # Send reminder email
            try:
                success, message = send_reminder_email(invoice, recipient_email)
                if success:
                    sent_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Sent reminder for invoice {invoice.invoice_number} to {recipient_email}'
                        )
                    )
                else:
                    failed_count += 1
                    self.stdout.write(
                        self.style.ERROR(
                            f'Failed to send reminder for invoice {invoice.invoice_number}: {message}'
                        )
                    )
            except Exception as e:
                failed_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        f'Error sending reminder for invoice {invoice.invoice_number}: {str(e)}'
                    )
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nPayment reminders sent: {sent_count}'
            )
        )
        if failed_count > 0:
            self.stdout.write(
                self.style.WARNING(
                    f'Failed to send: {failed_count}'
                )
            )


def send_reminder_email(invoice, recipient_email):
    """
    Send a payment reminder email for an invoice
    """
    from django.core.mail import EmailMultiAlternatives, get_connection
    from django.template.loader import render_to_string
    from django.utils.html import strip_tags
    from django.conf import settings
    from invoices.pdf_utils import generate_invoice_pdf
    
    try:
        company_settings = CompanySettings.get_instance()
        company_name = company_settings.company_name or 'Invoice System'
        company_email = company_settings.company_email or settings.EMAIL_HOST_USER
        company_email_password = company_settings.company_email_password or settings.EMAIL_HOST_PASSWORD
        
        # Validate email configuration
        if not company_email or not company_email_password:
            return False, "Email not configured"
        
        subject = f"Payment Reminder: Invoice #{invoice.invoice_number} Due in 5 Days"
        from_email = f"{company_name} <{company_email}>"
        
        # Create reminder email content
        days_until_due = (invoice.due_date - timezone.now().date()).days
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1e40af;">Payment Reminder</h2>
                <p>Dear {invoice.client_name},</p>
                <p>This is a friendly reminder that the following invoice will be due in <strong>{days_until_due} days</strong>:</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Invoice Number:</strong> {invoice.invoice_number}</p>
                    <p style="margin: 5px 0;"><strong>Invoice Date:</strong> {invoice.invoice_date.strftime('%d/%m/%Y')}</p>
                    <p style="margin: 5px 0;"><strong>Due Date:</strong> {invoice.due_date.strftime('%d/%m/%Y')}</p>
                    <p style="margin: 5px 0;"><strong>Amount Due:</strong> AED {invoice.balance_due:.2f}</p>
                </div>
                
                <p>Please ensure payment is made by the due date to avoid any late fees.</p>
                <p>The invoice is attached to this email for your reference.</p>
                
                <p>If you have already made the payment, please disregard this reminder.</p>
                
                <p>Thank you for your business!</p>
                
                <p style="margin-top: 30px;">
                    Best regards,<br>
                    <strong>{company_name}</strong><br>
                    {company_settings.company_email}<br>
                    {company_settings.company_mobile}
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = strip_tags(html_content)
        
        # Create SMTP connection
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
        
        # Attach PDF
        try:
            pdf_buffer = generate_invoice_pdf(invoice)
            pdf_filename = f"Invoice_{invoice.invoice_number}.pdf"
            msg.attach(pdf_filename, pdf_buffer.read(), 'application/pdf')
        except Exception as pdf_error:
            print(f"Warning: Could not generate PDF: {pdf_error}")
        
        msg.send()
        return True, "Reminder sent successfully"
        
    except Exception as e:
        return False, str(e)
