"""
Backup Management API ViewSet - Enhanced
Endpoints:
  GET    /api/backups/           - List all backups
  POST   /api/backups/create/    - Create a new backup now
  GET    /api/backups/<name>/download/ - Download a backup file
  POST   /api/backups/upload/    - Upload a backup file
  POST   /api/backups/restore/   - Restore from an uploaded or existing backup
"""

import os
import threading
from datetime import datetime
from django.conf import settings
from django.http import FileResponse, Http404
from django.core.management import call_command
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import logging

logger = logging.getLogger(__name__)

BACKUP_DIR = os.path.join(settings.BASE_DIR, 'backups')


def get_backup_list():
    if not os.path.exists(BACKUP_DIR):
        return []
    backups = []
    for filename in sorted(os.listdir(BACKUP_DIR), reverse=True):
        if filename.startswith('backup_') and filename.endswith('.sql'):
            file_path = os.path.join(BACKUP_DIR, filename)
            file_stat = os.stat(file_path)
            backups.append({
                'filename': filename,
                'size': file_stat.st_size,
                'size_kb': round(file_stat.st_size / 1024, 1),
                'created_at': datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
            })
    return backups


class BackupViewSet(viewsets.ViewSet):
    """API endpoints for database backup management"""
    permission_classes = [AllowAny]  # Allow access without auth for development

    def list(self, request):
        """List all available backups"""
        return Response({'backups': get_backup_list()})

    @action(detail=False, methods=['post'])
    def create_backup(self, request):
        """Create a new database backup now"""
        try:
            logger.info('Manual backup requested via API')
            os.makedirs(BACKUP_DIR, exist_ok=True)
            call_command('backup_db', retention_days=30, verbosity=0)
            backups = get_backup_list()
            latest = backups[0] if backups else None
            return Response({
                'success': True,
                'message': 'Backup created successfully',
                'backup': latest,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f'Manual backup failed: {str(e)}')
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='download/(?P<filename>[^/]+)')
    def download(self, request, filename=None):
        """Download a specific backup file"""
        if not filename or not filename.startswith('backup_') or not filename.endswith('.sql'):
            raise Http404('Invalid backup filename')

        file_path = os.path.join(BACKUP_DIR, filename)
        if not os.path.exists(file_path):
            raise Http404('Backup file not found')

        return FileResponse(
            open(file_path, 'rb'),
            as_attachment=True,
            filename=filename,
            content_type='application/sql',
        )

    @action(detail=False, methods=['post'])
    def upload(self, request):
        """Upload a backup file"""
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        if not uploaded_file.name.endswith('.sql'):
            return Response({'error': 'Only .sql backup files are accepted'}, status=status.HTTP_400_BAD_REQUEST)

        os.makedirs(BACKUP_DIR, exist_ok=True)

        # Give it a timestamped name if not already a backup_* name
        if not uploaded_file.name.startswith('backup_'):
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            save_name = f'backup_uploaded_{timestamp}.sql'
        else:
            save_name = uploaded_file.name

        save_path = os.path.join(BACKUP_DIR, save_name)

        with open(save_path, 'wb') as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)

        return Response({
            'success': True,
            'message': f'File uploaded as {save_name}',
            'filename': save_name,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def restore(self, request):
        """Restore database from a backup file"""
        filename = request.data.get('filename')
        confirm = request.data.get('confirm', False)

        if not confirm:
            return Response({
                'error': 'Confirmation required. Send {"confirm": true} to proceed.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not filename:
            return Response({'error': 'filename is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not filename.startswith('backup_') or not filename.endswith('.sql'):
            return Response({'error': 'Invalid backup filename'}, status=status.HTTP_400_BAD_REQUEST)

        file_path = os.path.join(BACKUP_DIR, filename)
        if not os.path.exists(file_path):
            return Response({'error': 'Backup file not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            logger.warning(f'Database restore initiated via API: {filename}')
            call_command('restore_db', file_path, confirm=True, verbosity=0)
            return Response({
                'success': True,
                'message': f'Database restored from {filename}'
            })
        except Exception as e:
            logger.error(f'Restore failed: {str(e)}')
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
