#!/bin/zsh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
DOCKER_DIR="$ROOT/install/docker"
LOCAL_DIR="$ROOT/.local-run"
LOG_DIR="$LOCAL_DIR/logs"
LOCAL_CONFIG="$LOCAL_DIR/cube_runtime_config.py"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"
BACKEND_PID_FILE="$LOCAL_DIR/backend.pid"
FRONTEND_PID_FILE="$LOCAL_DIR/frontend.pid"

mkdir -p "$LOG_DIR" \
  "$ROOT/aihub" \
  "$DOCKER_DIR/kubeconfig" \
  "$DOCKER_DIR/file" \
  "$DOCKER_DIR/data/mysql"

docker_login_url="http://127.0.0.1/login/?username=admin&login_url=http://127.0.0.1/frontend/group/project_group/org_group"
local_login_url="http://127.0.0.1:3000/login/?username=admin&login_url=http://127.0.0.1:3000/frontend/group/project_group/org_group"

is_listening() {
  local port="$1"
  lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
}

docker_ready() {
  command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1
}

write_local_config() {
  mkdir -p "$LOCAL_DIR"
  cat > "$LOCAL_CONFIG" <<PY
from install.docker.config import *
SQLALCHEMY_DATABASE_URI = 'sqlite:///$DOCKER_DIR/dev.sqlite'
for _name in ['SQLALCHEMY_POOL_SIZE','SQLALCHEMY_POOL_TIMEOUT','SQLALCHEMY_POOL_RECYCLE','SQLALCHEMY_MAX_OVERFLOW']:
    globals().pop(_name, None)
CACHE_CONFIG = {'CACHE_TYPE': 'SimpleCache'}
ENABLE_CORS = True
WTF_CSRF_ENABLED = False
PY
}

ensure_local_admin() {
  write_local_config
  PYTHONPATH="$LOCAL_DIR:$ROOT" MYAPP_CONFIG="cube_runtime_config" "$ROOT/.venv/bin/python" - <<'PY'
from myapp import app, appbuilder, db

with app.app_context():
    db.create_all()
    if not appbuilder.sm.find_user(username="admin"):
        appbuilder.sm.add_user(
            username="admin",
            first_name="admin",
            last_name="user",
            email="admin@example.com",
            role=appbuilder.sm.find_role("Admin"),
            password="Uuas12@ad!min09",
        )
PY
}

start_local_backend() {
  if is_listening 5001; then
    echo "Local backend already running on 5001"
    return
  fi

  echo "Starting local backend on 5001 in Terminal..."
  osascript <<OSA
tell application "Terminal"
  do script "cd '$ROOT'; export PYTHONPATH='$LOCAL_DIR:$ROOT'; export MYAPP_CONFIG='cube_runtime_config'; '$ROOT/.venv/bin/python' -c \"from myapp import app; app.run(host='127.0.0.1', port=5001, debug=False)\" 2>&1 | tee '$BACKEND_LOG'"
  activate
end tell
OSA
}

start_local_frontend() {
  if is_listening 3000; then
    echo "Local frontend already running on 3000"
    return
  fi

  echo "Starting local frontend on 3000 in Terminal..."
  osascript <<OSA
tell application "Terminal"
  do script "cd '$ROOT/myapp/frontend'; export REACT_APP_PROXY_TARGET='http://127.0.0.1:5001'; npm run start 2>&1 | tee '$FRONTEND_LOG'"
  activate
end tell
OSA
}

wait_for_port() {
  local port="$1"
  local name="$2"
  local retries=60

  while (( retries > 0 )); do
    if is_listening "$port"; then
      echo "$name is ready on $port"
      return 0
    fi
    sleep 2
    ((retries--))
  done

  echo "$name failed to start on $port"
  return 1
}

start_with_docker() {
  echo "Trying Docker Compose startup..."
  (
    cd "$DOCKER_DIR"
    DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose up -d
  )
}

open_url() {
  local url="$1"
  open "$url"
}

echo "Project root: $ROOT"

if docker_ready; then
  if start_with_docker; then
    echo "Docker startup succeeded."
    open_url "$docker_login_url"
    echo "Opened: $docker_login_url"
    exit 0
  fi
  echo "Docker startup failed. Falling back to local startup."
else
  echo "Docker is not ready. Falling back to local startup."
fi

ensure_local_admin
start_local_backend
wait_for_port 5001 "Local backend"
start_local_frontend
wait_for_port 3000 "Local frontend"
open_url "$local_login_url"

echo "Opened: $local_login_url"
echo "Backend log: $BACKEND_LOG"
echo "Frontend log: $FRONTEND_LOG"
