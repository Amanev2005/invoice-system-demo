import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Fix: ActivityLog fields (model_name, description, ip_address, object_id, timestamp)
    were accidentally placed on the Supplier model in migration 0012.
    This migration:
    1. Adds the fields back to ActivityLog
    2. Removes the incorrectly placed fields from Supplier
    """

    dependencies = [
        ('invoices', '0014_workorder_notes_workorder_payment_method_and_more'),
    ]

    operations = [
        # Step 1: Restore fields to ActivityLog
        migrations.AddField(
            model_name='activitylog',
            name='model_name',
            field=models.CharField(default='', help_text='Model that was affected', max_length=100),
        ),
        migrations.AddField(
            model_name='activitylog',
            name='object_id',
            field=models.IntegerField(blank=True, help_text='ID of the affected object', null=True),
        ),
        migrations.AddField(
            model_name='activitylog',
            name='description',
            field=models.TextField(default=''),
        ),
        migrations.AddField(
            model_name='activitylog',
            name='ip_address',
            field=models.GenericIPAddressField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='activitylog',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterModelOptions(
            name='activitylog',
            options={'ordering': ['-timestamp']},
        ),

        # Step 2: Remove the misplaced fields from Supplier
        migrations.RemoveField(
            model_name='supplier',
            name='model_name',
        ),
        migrations.RemoveField(
            model_name='supplier',
            name='object_id',
        ),
        migrations.RemoveField(
            model_name='supplier',
            name='description',
        ),
        migrations.RemoveField(
            model_name='supplier',
            name='ip_address',
        ),
        migrations.RemoveField(
            model_name='supplier',
            name='timestamp',
        ),
    ]
