import os
import sys

# Gunicorn configuration file
bind = os.getenv('SERVER_HOST', '0.0.0.0') + ':' + os.getenv('SERVER_PORT', '8000')
workers = 4  # Number of worker processes
threads = 2  # Threads per worker
worker_class = 'sync'
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging
accesslog = '-'  # Log to stdout
errorlog = '-'   # Log to stderr
loglevel = 'info'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = 'invoice_system'

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (if needed in future)
# keyfile = None
# certfile = None
