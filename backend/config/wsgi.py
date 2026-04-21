import os
from django.core.wsgi import get_wsgi_application

# Use 'config.settings' as the default settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()
