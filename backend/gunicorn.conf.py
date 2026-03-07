# Gunicorn config for Render free tier (~512MB RAM).
# Reduces workers to avoid OOM; increases timeout for cold starts.
import multiprocessing
import os

workers = int(os.getenv("GUNICORN_WORKERS", "2"))
timeout = int(os.getenv("GUNICORN_TIMEOUT", "120"))
keepalive = 5
worker_class = "sync"

# Log to stdout for Render logs
accesslog = "-"
errorlog = "-"
loglevel = "info"
