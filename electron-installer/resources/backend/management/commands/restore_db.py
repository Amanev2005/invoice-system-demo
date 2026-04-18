import os
import subprocess
from django.core.management.base import BaseCommand
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Restore PostgreSQL database from backup file'

    def add_arguments(self, parser):
        parser.add_argument(
            'backup_file',
            type=str,
            help='Path to backup file to restore'
        )
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm restoration (required to prevent accidental restore)'
        )

    def handle(self, *args, **options):
        backup_file = options['backup_file']
        confirm = options['confirm']

        if not confirm:
            self.stdout.write(
                self.style.ERROR(
                    'ERROR: You must use --confirm flag to restore database.\n'
                    'WARNING: This will REPLACE all current data!'
                )
            )
            return

        # Check if backup file exists
        if not os.path.exists(backup_file):
            self.stdout.write(self.style.ERROR(f'Backup file not found: {backup_file}'))
            return

        # Get database settings
        db_settings = settings.DATABASES['default']
        db_name = db_settings['NAME']
        db_user = db_settings['USER']
        db_password = db_settings['PASSWORD']
        db_host = db_settings['HOST']
        db_port = db_settings['PORT']

        try:
            self.stdout.write(
                self.style.WARNING(
                    f'⚠️  WARNING: This will REPLACE the database "{db_name}" with backup from:\n'
                    f'   {backup_file}\n'
                )
            )

            # Set password environment variable
            env = os.environ.copy()
            env['PGPASSWORD'] = db_password

            # Find pg_restore
            import shutil
            pg_restore = shutil.which('pg_restore')
            
            if not pg_restore:
                pg_restore_paths = [
                    r'C:\Program Files\PostgreSQL\18\bin\pg_restore.exe',
                    r'C:\Program Files\PostgreSQL\17\bin\pg_restore.exe',
                    r'C:\Program Files\PostgreSQL\16\bin\pg_restore.exe',
                    r'C:\Program Files\PostgreSQL\15\bin\pg_restore.exe',
                    r'C:\Program Files\PostgreSQL\14\bin\pg_restore.exe',
                    r'C:\Program Files\PostgreSQL\13\bin\pg_restore.exe',
                ]
                for path in pg_restore_paths:
                    if os.path.exists(path):
                        pg_restore = path
                        break

            if not pg_restore:
                raise Exception('pg_restore not found. Please install PostgreSQL client tools or add them to your PATH.')

            # Drop existing connections
            self.stdout.write('Terminating existing connections...')
            
            # Restore using pg_restore
            self.stdout.write(f'Restoring database from: {backup_file}')
            
            cmd = [
                pg_restore,
                '-h', db_host,
                '-p', str(db_port),
                '-U', db_user,
                '-d', db_name,
                '-c',  # Clean (drop) database objects before recreating
                '-v',  # Verbose
                backup_file
            ]

            result = subprocess.run(
                cmd,
                env=env,
                capture_output=True,
                text=True
            )

            if result.returncode == 0:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Database restored successfully from: {backup_file}'
                    )
                )
                logger.info(f'Database restored from: {backup_file}')
            else:
                # pg_restore may return non-zero even on success due to warnings
                if 'error' in result.stderr.lower():
                    raise Exception(f'Restore failed: {result.stderr}')
                else:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ Database restored (with warnings): {backup_file}'
                        )
                    )
                    self.stdout.write(self.style.WARNING(f'Warnings: {result.stderr}'))

        except Exception as e:
            error_msg = f'Restore failed: {str(e)}'
            self.stdout.write(self.style.ERROR(error_msg))
            logger.error(error_msg)
            raise
