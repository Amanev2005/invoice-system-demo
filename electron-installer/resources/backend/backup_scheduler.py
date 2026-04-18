"""
Automatic Database Backup Scheduler

Supports multiple daily backup times configurable from CompanySettings.
Default times: 2:00 AM, 6:00 AM, 2:00 PM, 6:00 PM
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.core.management import call_command
import logging
import atexit

logger = logging.getLogger(__name__)

# Single global scheduler instance
scheduler = BackgroundScheduler()
_scheduler_started = False


def run_backup():
    """Execute database backup"""
    try:
        logger.info('Starting scheduled database backup...')
        call_command('backup_db', retention_days=30)
        logger.info('Scheduled backup completed successfully')
    except Exception as e:
        logger.error(f'Scheduled backup failed: {str(e)}')


def refresh_backup_schedule():
    """
    Clear all existing backup jobs and reschedule based on current
    CompanySettings.auto_backup_times.
    Safe to call at any time (startup, settings save, etc.).
    """
    global _scheduler_started

    # Start the scheduler if not already running
    if not _scheduler_started:
        try:
            scheduler.start()
            atexit.register(lambda: scheduler.shutdown(wait=False))
            _scheduler_started = True
        except Exception:
            pass  # Already started

    # Remove all existing backup jobs
    for job in scheduler.get_jobs():
        if job.id.startswith('auto_backup_'):
            job.remove()

    # Read settings from DB
    try:
        from invoices.models import CompanySettings
        settings = CompanySettings.get_instance()
        enabled = settings.enable_auto_backup
        times_str = settings.auto_backup_times or ''
    except Exception as e:
        logger.warning(f'Could not read backup settings, using defaults: {e}')
        enabled = True
        times_str = '02:00, 06:00, 14:00, 18:00'

    if not enabled:
        logger.info('Auto backup is disabled in settings.')
        return

    # Parse times and schedule jobs
    times = [t.strip() for t in times_str.split(',') if t.strip()]
    scheduled = []

    for time_str in times:
        try:
            parts = time_str.split(':')
            hour = int(parts[0])
            minute = int(parts[1]) if len(parts) > 1 else 0

            if not (0 <= hour <= 23 and 0 <= minute <= 59):
                logger.warning(f'Invalid backup time skipped: {time_str}')
                continue

            job_id = f'auto_backup_{hour:02d}{minute:02d}'
            scheduler.add_job(
                run_backup,
                trigger=CronTrigger(hour=hour, minute=minute),
                id=job_id,
                name=f'Auto Backup at {hour:02d}:{minute:02d}',
                replace_existing=True,
            )
            scheduled.append(f'{hour:02d}:{minute:02d}')
        except (ValueError, IndexError) as e:
            logger.warning(f'Invalid backup time format "{time_str}": {e}')

    if scheduled:
        logger.info(f'Backup scheduler configured: {", ".join(scheduled)}')
    else:
        logger.warning('No valid backup times configured.')


def start_backup_scheduler():
    """Entry point – called from Django AppConfig.ready()"""
    try:
        refresh_backup_schedule()
    except Exception as e:
        logger.error(f'Failed to start backup scheduler: {e}')
