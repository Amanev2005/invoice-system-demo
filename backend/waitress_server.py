"""
Waitress WSGI Server for Windows
Alternative to Gunicorn which doesn't support Windows
"""
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Import Django application
import django
django.setup()

from waitress import serve
from config.wsgi import application

if __name__ == '__main__':
    host = os.getenv('SERVER_HOST', '0.0.0.0')
    port = int(os.getenv('SERVER_PORT', '8000'))
    
    print('=' * 60)
    print('Invoice System - Production Server (Waitress)')
    print('=' * 60)
    print(f'Starting server on {host}:{port}')
    print('Press Ctrl+C to stop')
    print('=' * 60)
    
    serve(
        application,
        host=host,
        port=port,
        threads=8,  # Number of threads
        url_scheme='http',
        ident='Invoice System'
    )
