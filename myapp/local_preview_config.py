import os

from install.docker.config import *  # noqa
from sqlalchemy.pool import QueuePool


# Keep local preview isolated from the Docker/MySQL/Redis defaults.
DATA_DIR = os.path.join(os.path.expanduser("~"), ".cube-studio-preview")
os.makedirs(DATA_DIR, exist_ok=True)

SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(DATA_DIR, 'cube-studio-preview.db')}"
SQLALCHEMY_ENGINE_OPTIONS = {
    "connect_args": {"check_same_thread": False},
    "poolclass": QueuePool,
}
CACHE_CONFIG = {"CACHE_TYPE": "null"}
SOCKETIO_MESSAGE_QUEUE = None

# Local preview does not run background workers.
class LocalPreviewCeleryConfig:
    broker_url = "memory://"
    result_backend = "cache+memory://"
    imports = ("myapp.tasks",)
    task_ignore_result = True
    enable_utc = False
    timezone = "Asia/Shanghai"


CELERY_CONFIG = LocalPreviewCeleryConfig
