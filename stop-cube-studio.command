#!/bin/zsh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
DOCKER_DIR="$ROOT/install/docker"
LOCAL_DIR="$ROOT/.local-run"

stop_pid_file() {
  local file="$1"
  if [[ -f "$file" ]]; then
    local pid
    pid="$(cat "$file")"
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
      echo "Stopped PID $pid"
    fi
    rm -f "$file"
  fi
}

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  (
    cd "$DOCKER_DIR"
    DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose down || true
  )
fi

stop_pid_file "$LOCAL_DIR/backend.pid"
stop_pid_file "$LOCAL_DIR/frontend.pid"

for port in 3000 5001; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    lsof -tiTCP:"$port" -sTCP:LISTEN | xargs -r kill >/dev/null 2>&1 || true
    echo "Stopped process on port $port"
  fi
done

echo "Cube Studio stop complete."
