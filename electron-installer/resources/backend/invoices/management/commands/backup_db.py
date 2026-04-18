"""
Management command: backup_db
Creates a PostgreSQL database backup using pg_dump.
Usage: python manage.py backup_db [--retention_days N]
"""
import os
import subprocess
import logging
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.conf import settings

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create a PostgreSQL database backup using pg_dump'

    def add_arguments(self, parser):
        parser.add_argument(
            '--retention_days',
            type=int,
            default=30,
            help='Delete backups older than this many days (default: 30)',
        )

    def handle(self, *args, **options):
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        os.makedirs(backup_dir, exist_ok=True)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'backup_{timestamp}.sql'
        file_path = os.path.join(backup_dir, filename)

        # Get DB settings
        db = settings.DATABASES['default']
        db_name = db.get('NAME', 'invoice_system')
        db_user = db.get('USER', 'postgres')
        db_password = db.get('PASSWORD', '')
        db_host = db.get('HOST', 'localhost')
        db_port = db.get('PORT', '5432')

        # Find pg_dump
        import shutil
        pg_dump = shutil.which('pg_dump')
        
        if not pg_dump:
            pg_dump_paths = [
                r'C:\Program Files\PostgreSQL\18\bin\pg_dump.exe',
                r'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe',
                r'C:\Program Files\PostgreSQL\16\bin\pg_dump.exe',
                r'C:\Program Files\PostgreSQL\15\bin\pg_dump.exe',
                r'C:\Program Files\PostgreSQL\14\bin\pg_dump.exe',
                r'C:\Program Files\PostgreSQL\13\bin\pg_dump.exe',
            ]
            for path in pg_dump_paths:
                if os.path.exists(path):
                    pg_dump = path
                    break

        if not pg_dump:
            self.stderr.write('pg_dump not found. Please install PostgreSQL client tools or add them to your PATH.')
            return

        env = os.environ.copy()
        env['PGPASSWORD'] = db_password

        cmd = [
            pg_dump,
            '-h', db_host,
            '-p', str(db_port),
            '-U', db_user,
            '-c',        # clean (drop objects before creating)
            '--if-exists',
            '-F', 'p',   # plain SQL format
            '-f', file_path,
            db_name,
        ]

        try:
            result = subprocess.run(cmd, env=env, capture_output=True, text=True, timeout=300)
            if result.returncode != 0:
                error = result.stderr.strip()
                self.stderr.write(f'Backup failed: {error}')
                logger.error(f'Backup failed: {error}')
                return

            file_size = os.path.getsize(file_path)
            self.stdout.write(self.style.SUCCESS(
                f'Backup created: {filename} ({file_size / 1024:.1f} KB)'
            ))
            logger.info(f'Backup created: {filename}')

            # Cleanup old backups
            retention_days = options.get('retention_days', 30)
            cutoff = datetime.now() - timedelta(days=retention_days)
            deleted = 0
            for f in os.listdir(backup_dir):
                if f.startswith('backup_') and f.endswith('.sql'):
                    fpath = os.path.join(backup_dir, f)
                    mtime = datetime.fromtimestamp(os.path.getmtime(fpath))
                    if mtime < cutoff:
                        os.remove(fpath)
                        deleted += 1
            if deleted:
                self.stdout.write(f'Cleaned up {deleted} old backup(s)')

        except subprocess.TimeoutExpired:
            self.stderr.write('Backup timed out after 5 minutes')
        except Exception as e:
            self.stderr.write(f'Backup error: {str(e)}')
            logger.error(f'Backup error: {str(e)}')
