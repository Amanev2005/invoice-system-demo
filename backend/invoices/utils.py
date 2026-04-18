from .models import ActivityLog

def log_activity(action, model_name, object_id=None, description='', ip_address=None):
    """
    Utility function to log user activity
    """
    try:
        ActivityLog.objects.create(
            action=action,
            model_name=model_name,
            object_id=object_id,
            description=description,
            ip_address=ip_address
        )
    except Exception as e:
        print(f"Error logging activity: {e}")
