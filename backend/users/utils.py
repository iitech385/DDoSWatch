from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.mail import EmailMessage

def get_email_template(verification_code):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }}
            .email-container {{
                max-width: 600px;
                margin: 20px auto;
                background: linear-gradient(145deg, #2b002b, #000000);
                border-radius: 10px;
                padding: 30px;
                color: white;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }}
            .logo {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .logo img {{
                width: 150px;
            }}
            .verification-code {{
                background: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                font-size: 32px;
                letter-spacing: 8px;
                margin: 25px 0;
                color: #ee82ee;
                font-weight: bold;
            }}
            .message {{
                text-align: center;
                line-height: 1.6;
                margin-bottom: 25px;
            }}
            .footer {{
                text-align: center;
                font-size: 12px;
                color: #cccccc;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid rgba(255,255,255,0.1);
            }}
            .button {{
                display: inline-block;
                padding: 15px 30px;
                background: linear-gradient(45deg, #ee82ee, #9400d3);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                margin: 20px 0;
                transition: transform 0.3s ease;
            }}
            .warning {{
                font-size: 12px;
                color: #ffcccc;
                margin-top: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="logo">
                <img src="https://your-domain.com/logo.png" alt="DDoS Watch Global Logo">
            </div>
            <div class="message">
                <h1>Verify Your Email</h1>
                <p>Welcome to DDoS Watch Global! Please use the verification code below to complete your registration:</p>
            </div>
            <div class="verification-code">
                {verification_code}
            </div>
            <div class="message">
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this verification code, please ignore this email.</p>
            </div>
            <div class="warning">
                Never share this code with anyone. Our team will never ask for your verification code.
            </div>
            <div class="footer">
                © 2024 DDoS Watch Global. All rights reserved.<br>
                This is an automated message, please do not reply.
            </div>
        </div>
    </body>
    </html>
    """

def send_email_async(subject, verification_code, from_email, recipient_list):
    try:
        html_content = f"""
        <html>
            <body style="margin: 0; padding: 0; background: linear-gradient(145deg, #2b002b, #000000); min-height: 100vh; font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 40px auto; padding: 30px; text-align: center; background: rgba(255,255,255,0.05); border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <h1 style="color: white; font-size: 28px; margin-bottom: 30px;">DDoS Watch Global</h1>
                    <p style="color: #ee82ee; font-size: 18px; margin-bottom: 30px;">Please verify your email address</p>
                    <div style="background: rgba(255,255,255,0.1); padding: 25px; margin: 30px 0; border-radius: 10px;">
                        <p style="color: #cccccc; font-size: 16px; margin-bottom: 15px;">Your verification code is:</p>
                        <div style="font-size: 36px; letter-spacing: 8px; color: #ee82ee; font-weight: bold; margin: 20px 0;">
                            {verification_code}
                        </div>
                    </div>
                    <p style="color: white; font-size: 14px; margin: 25px 0;">This code will expire in 10 minutes</p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <p style="color: #ffcccc; font-size: 12px; line-height: 1.5;">
                            For security reasons, never share this code with anyone.<br>
                            DDoS Watch Global will never ask for your verification code.
                        </p>
                    </div>
                    <div style="margin-top: 30px; color: #666666; font-size: 12px;">
                        © 2024 DDoS Watch Global. All rights reserved.
                    </div>
                </div>
            </body>
        </html>
        """
        
        email = EmailMessage(
            subject,
            html_content,
            from_email,
            recipient_list,
            headers={'Content-Type': 'text/html'}
        )
        email.content_subtype = "html"
        email.send()
        
    except Exception as e:
        print(f"Email sending failed: {str(e)}") 