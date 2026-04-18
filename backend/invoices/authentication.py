from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import secrets

@api_view(['POST'])
def forgot_password(request):
    """
    Handle forgot password requests by sending a password reset email
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate a password reset token (in production, store this in database with expiry)
    reset_token = secrets.token_urlsafe(32)
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    
    # Email content
    subject = 'Password Reset Request - Invoice System'
    message = f"""
Hello,

You have requested to reset your password for the Invoice System.

Click the link below to reset your password:
{reset_link}

This link will expire in 24 hours.

If you did not request this password reset, please ignore this email.

Best regards,
Invoice System Team
    """
    
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #3b82f6;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>You have requested to reset your password for the Invoice System.</p>
                <p>Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" 
                       style="background-color: #3b82f6; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    Or copy and paste this link into your browser:<br>
                    <a href="{reset_link}">{reset_link}</a>
                </p>
                <p style="color: #666; font-size: 14px;">
                    This link will expire in 24 hours.
                </p>
                <p style="color: #666; font-size: 14px;">
                    If you did not request this password reset, please ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">
                    Best regards,<br>
                    Invoice System Team
                </p>
            </div>
        </body>
    </html>
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return Response({
            'message': 'Password reset email sent successfully',
            'email': email
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to send email: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
