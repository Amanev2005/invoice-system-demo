from pathlib import Path
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'invoices',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # required for admin & PDFs later
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ROOT_URLCONF = 'config.urls'

# Database Configuration
import dj_database_url

DATABASE_URL = os.getenv('DATABASE_URL')
DB_HOST = os.getenv('DB_HOST')

if DATABASE_URL:
    print("✓ Using PostgreSQL Database (via DATABASE_URL)")
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True
        )
    }
elif DB_HOST:
    print("✓ Using PostgreSQL Database (via individual DB_* variables)")
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'postgres'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': DB_HOST,
            'PORT': os.getenv('DB_PORT', '5432'),
            'CONN_MAX_AGE': 600,
        }
    }
else:
    print("⚠️ WARNING: DATABASE_URL or DB_HOST not found. Using SQLite Database.")
    print("⚠️ IMPORTANT: Data saved to SQLite on Render will be LOST when the server sleeps or restarts!")
    # Fallback to SQLite for development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3'
        }
    }


LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Dubai'
STATIC_URL = '/static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
CORS_ALLOW_ALL_ORIGINS = True

# Media files (uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Email Configuration - Dynamic from Database
import os

# SMTP Configuration for Gmail
# Email credentials are now stored in CompanySettings model
# This provides fallback configuration if settings not available

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False

# Fallback credentials (will be overridden by CompanySettings)
EMAIL_HOST_USER = os.environ.get('EMAIL_USER', 'noreply@invoicesystem.local')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_PASSWORD', '')

DEFAULT_FROM_EMAIL = f'Invoice System <{EMAIL_HOST_USER}>'

