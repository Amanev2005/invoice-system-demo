"""
Management command: restore_db
Restores a PostgreSQL database from a .sql backup file using psql.
Usage: python manage.py restore_db <backup_file_path> --confirm
"""
import os
import subprocess
import logging
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Restore PostgreSQL database from a SQL backup file'

    def add_arguments(self, parser):
        parser.add_argument('backup_file', type=str, help='Path to the SQL backup file')
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm that you want to overwrite the database',
        )

    def handle(self, *args, **options):
        backup_file = options['backup_file']
        confirm = options.get('confirm', False)

        if not confirm:
            raise CommandError(
                'You must pass --confirm to proceed. This will OVERWRITE all current data!'
            )

        if not os.path.exists(backup_file):
            raise CommandError(f'Backup file not found: {backup_file}')

        db = settings.DATABASES['default']
        db_name = db.get('NAME', 'invoice_system')
        db_user = db.get('USER', 'postgres')
        db_password = db.get('PASSWORD', '')
        db_host = db.get('HOST', 'localhost')
        db_port = db.get('PORT', '5432')

        # Find psql
        import shutil
        psql = shutil.which('psql')
        
        if not psql:
            psql_paths = [
                r'C:\Program Files\PostgreSQL\18\bin\psql.exe',
                r'C:\Program Files\PostgreSQL\17\bin\psql.exe',
                r'C:\Program Files\PostgreSQL\16\bin\psql.exe',
                r'C:\Program Files\PostgreSQL\15\bin\psql.exe',
                r'C:\Program Files\PostgreSQL\14\bin\psql.exe',
                r'C:\Program Files\PostgreSQL\13\bin\psql.exe',
            ]
            for path in psql_paths:
                if os.path.exists(path):
                    psql = path
                    break

        if not psql:
            raise CommandError('psql not found. Please install PostgreSQL client tools or add them to your PATH.')

        env = os.environ.copy()
        env['PGPASSWORD'] = db_password

        # Drop and recreate schema for clean restore
        self.stdout.write('Clearing current database schema...')
        drop_cmd = [
            psql,
            '-h', db_host,
            '-p', str(db_port),
            '-U', db_user,
            '-d', db_name,
            '-c', 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
        ]
        
        try:
            subprocess.run(drop_cmd, env=env, capture_output=True, text=True, timeout=60)
            self.stdout.write(self.style.SUCCESS('Database schema cleared.'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Could not clear schema: {str(e)}. Proceeding with restore...'))

        self.stdout.write('Starting database restore...')
        logger.warning(f'Database restore initiated from: {backup_file}')

        cmd = [
            psql,
            '-h', db_host,
            '-p', str(db_port),
            '-U', db_user,
            '-d', db_name,
            '-f', backup_file,
        ]

        try:
            result = subprocess.run(cmd, env=env, capture_output=True, text=True, timeout=600)
            if result.returncode != 0:
                error = result.stderr.strip()
                raise CommandError(f'Restore failed: {error}')

            self.stdout.write(self.style.SUCCESS(f'Database restored successfully from: {os.path.basename(backup_file)}'))
            logger.info(f'Database restore completed from: {backup_file}')

        except subprocess.TimeoutExpired:
            raise CommandError('Restore timed out after 10 minutes')
        except CommandError:
            raise
        except Exception as e:
            raise CommandError(f'Restore error: {str(e)}')
