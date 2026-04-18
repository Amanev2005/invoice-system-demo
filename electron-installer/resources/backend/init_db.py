#!/usr/bin/env python
"""
Database initialization script for Invoice System
Creates PostgreSQL database and runs migrations
"""
import os
import sys
import django
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from pathlib import Path

# Add the backend directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(BASE_DIR / '.env')

def create_database():
    """Create the PostgreSQL database if it doesn't exist"""
    db_name = os.getenv('DB_NAME', 'invoice_system')
    db_user = os.getenv('DB_USER', 'invoice_user')
    db_password = os.getenv('DB_PASSWORD', '')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    
    print(f"Connecting to PostgreSQL server at {db_host}:{db_port}...")
    
    try:
        # Connect to PostgreSQL server (not to a specific database)
        conn = psycopg2.connect(
            dbname='postgres',
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Creating database '{db_name}'...")
            cursor.execute(f'CREATE DATABASE {db_name}')
            print(f"Database '{db_name}' created successfully!")
        else:
            print(f"Database '{db_name}' already exists.")
        
        cursor.close()
        conn.close()
        return True
        
    except psycopg2.Error as e:
        print(f"Error connecting to PostgreSQL: {e}")
        print("\nPlease ensure:")
        print("1. PostgreSQL is running")
        print("2. Database credentials in .env are correct")
        print("3. User has permission to create databases")
        return False

def run_migrations():
    """Run Django migrations"""
    print("\nRunning Django migrations...")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()
    
    from django.core.management import execute_from_command_line
    
    # Run migrations
    execute_from_command_line(['manage.py', 'migrate'])
    print("Migrations completed successfully!")

def create_superuser():
    """Create default superuser if it doesn't exist"""
    print("\nChecking for superuser...")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()
    
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    if not User.objects.filter(username='admin').exists():
        print("Creating default superuser (username: admin, password: admin)...")
        User.objects.create_superuser('admin', 'admin@invoicesystem.local', 'admin')
        print("Superuser created! Please change the password after first login.")
    else:
        print("Superuser already exists.")

def main():
    """Main initialization function"""
    print("=" * 60)
    print("Invoice System - Database Initialization")
    print("=" * 60)
    
    # Check if using PostgreSQL
    db_engine = os.getenv('DB_ENGINE', 'sqlite')
    if db_engine != 'postgresql':
        print("Database engine is not PostgreSQL. Skipping database creation.")
        print("Running migrations only...")
        run_migrations()
        return
    
    # Create database
    if not create_database():
        print("\nDatabase creation failed. Please fix the issues and try again.")
        sys.exit(1)
    
    # Run migrations
    try:
        run_migrations()
    except Exception as e:
        print(f"\nMigration failed: {e}")
        sys.exit(1)
    
    # Create superuser
    try:
        create_superuser()
    except Exception as e:
        print(f"\nSuperuser creation failed: {e}")
        print("You can create it manually later using: python manage.py createsuperuser")
    
    print("\n" + "=" * 60)
    print("Database initialization completed successfully!")
    print("=" * 60)

if __name__ == '__main__':
    main()
