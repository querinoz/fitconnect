#!/usr/bin/env bash
# FitConnect — stop dev server and free port (Unix / Git Bash)
PORT="${1:-3001}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$ROOT/.fitconnect/dev.pid"
QUIET="${QUIET:-0}"

log() { [[ "$QUIET" == "1" ]] || echo "$*"; }

if [[ -f "$PID_FILE" ]]; then
  proc_id="$(cat "$PID_FILE" | tr -d '[:space:]')"
  if [[ -n "$proc_id" ]] && kill -0 "$proc_id" 2>/dev/null; then
    log "Stopping dev process PID $proc_id"
    kill "$proc_id" 2>/dev/null || true
    sleep 1
    kill -9 "$proc_id" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
fi

if command -v lsof >/dev/null; then
  pids=$(lsof -ti:"$PORT" 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    log "Freeing port $PORT"
    echo "$pids" | xargs kill -9 2>/dev/null || true
  fi
elif command -v fuser >/dev/null; then
  fuser -k "${PORT}/tcp" 2>/dev/null || true
fi

if command -v docker >/dev/null; then
  docker ps -q --filter "publish=$PORT" 2>/dev/null | xargs -r docker stop 2>/dev/null || true
  docker ps -aq --filter "name=fitconnect" 2>/dev/null | xargs -r docker rm -f 2>/dev/null || true
fi

[[ "$QUIET" == "1" ]] || echo "Stopped."
