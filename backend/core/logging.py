import logging
from datetime import datetime
from django.conf import settings
import os

def setup_security_logging():
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(settings.BASE_DIR, 'logs')
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Configure security logger
    security_logger = logging.getLogger('security')
    security_logger.setLevel(logging.INFO)

    # File handler for security events
    security_log_file = os.path.join(log_dir, 'security.log')
    handler = logging.FileHandler(security_log_file)
    handler.setLevel(logging.INFO)

    # Format for security logs
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s - IP: %(ip)s - User: %(user)s'
    )
    handler.setFormatter(formatter)
    security_logger.addHandler(handler)

    return security_logger

# Usage example:
logger = setup_security_logging()
logger.info(
    'Login attempt',
    extra={
        'ip': request.META.get('REMOTE_ADDR'),
        'user': email_or_username
    }
) 