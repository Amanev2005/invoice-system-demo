import os
import subprocess
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Backup PostgreSQL database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--retention-days',
            type=int,
            default=30,
            help='Number of days to keep backups (default: 30)'
        )

    def handle(self, *args, **options):
        retention_days = options['retention_days']
        
        # Create backups directory if it doesn't exist
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        os.makedirs(backup_dir, exist_ok=True)

        # Generate backup filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = os.path.join(backup_dir, f'backup_{timestamp}.sql')

        # Get database settings
        db_settings = settings.DATABASES['default']
        db_name = db_settings['NAME']
        db_user = db_settings['USER']
        db_password = db_settings['PASSWORD']
        db_host = db_settings['HOST']
        db_port = db_settings['PORT']

        # Set password environment variable for pg_dump
        env = os.environ.copy()
        env['PGPASSWORD'] = db_password

        try:
            # Run pg_dump command
            self.stdout.write(self.style.SUCCESS(f'Starting backup of database: {db_name}'))
            
            cmd = [
                'pg_dump',
                '-h', db_host,
                '-p', str(db_port),
                '-U', db_user,
                '-F', 'c',  # Custom format (compressed)
                '-b',  # Include large objects
                '-v',  # Verbose
                '-f', backup_file,
                db_name
            ]

            result = subprocess.run(
                cmd,
                env=env,
                capture_output=True,
                text=True,
                check=True
            )

            # Check if backup file was created
            if os.path.exists(backup_file):
                file_size = os.path.getsize(backup_file)
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Backup created successfully: {backup_file} ({file_size / 1024 / 1024:.2f} MB)'
                    )
                )
                logger.info(f'Database backup created: {backup_file}')
            else:
                raise Exception('Backup file was not created')

            # Clean up old backups
            self.cleanup_old_backups(backup_dir, retention_days)

        except subprocess.CalledProcessError as e:
            error_msg = f'Backup failed: {e.stderr}'
            self.stdout.write(self.style.ERROR(error_msg))
            logger.error(error_msg)
            raise
        except Exception as e:
            error_msg = f'Backup failed: {str(e)}'
            self.stdout.write(self.style.ERROR(error_msg))
            logger.error(error_msg)
            raise

    def cleanup_old_backups(self, backup_dir, retention_days):
        """Remove backups older than retention_days"""
        self.stdout.write(f'Cleaning up backups older than {retention_days} days...')
        
        cutoff_date = datetime.now() - timedelta(days=retention_days)
        deleted_count = 0

        for filename in os.listdir(backup_dir):
            if filename.startswith('backup_') and filename.endswith('.sql'):
                file_path = os.path.join(backup_dir, filename)
                file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                
                if file_time < cutoff_date:
                    try:
                        os.remove(file_path)
                        deleted_count += 1
                        self.stdout.write(f'  Deleted old backup: {filename}')
                    except Exception as e:
                        self.stdout.write(
                            self.style.WARNING(f'  Failed to delete {filename}: {str(e)}')
                        )

        if deleted_count > 0:
            self.stdout.write(self.style.SUCCESS(f'✓ Deleted {deleted_count} old backup(s)'))
        else:
            self.stdout.write('No old backups to delete')
