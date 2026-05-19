#!/usr/bin/env bash
# FitConnect — stop dev/prod server and free port (Unix / WSL / Git Bash)
PORT="${1:-3001}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$ROOT/.fitconnect/dev.pid"
PROD_PID="$ROOT/.next/prod.pid"
QUIET="${QUIET:-0}"
STRICT="${STRICT:-0}"

log() { [[ "$QUIET" == "1" ]] || echo "$*"; }

kill_tree() {
  local pid="$1"
  [[ -z "$pid" || ! "$pid" =~ ^[0-9]+$ ]] && return
  local child
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do
    kill_tree "$child"
  done
  kill -9 "$pid" 2>/dev/null || true
}

stop_pid_file() {
  local file="$1"
  [[ -f "$file" ]] || return
  local proc_id
  proc_id="$(tr -d '[:space:]' < "$file")"
  if [[ -n "$proc_id" ]]; then
    log "Stopping PID $proc_id ($(basename "$file"))"
    kill_tree "$proc_id"
  fi
  rm -f "$file"
}

port_in_use() {
  if command -v ss >/dev/null 2>&1 && ss -tln 2>/dev/null | grep -q ":${PORT} "; then
    return 0
  fi
  if command -v lsof >/dev/null 2>&1 && lsof -ti:"$PORT" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

free_port() {
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${PORT}/tcp" 2>/dev/null || true
  fi

  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids=$(lsof -ti:"$PORT" 2>/dev/null || true)
    if [[ -n "$pids" ]]; then
      log "Freeing port $PORT (PIDs: $(echo "$pids" | tr '\n' ' '))"
      echo "$pids" | xargs -r kill -9 2>/dev/null || true
    fi
  fi

  if command -v ss >/dev/null 2>&1; then
    local pids
    pids=$(ss -tlnp 2>/dev/null | grep ":${PORT} " | grep -oE 'pid=[0-9]+' | cut -d= -f2 || true)
    if [[ -n "$pids" ]]; then
      log "Freeing port $PORT (ss PIDs: $(echo "$pids" | tr '\n' ' '))"
      echo "$pids" | xargs -r kill -9 2>/dev/null || true
    fi
  fi

  for pattern in \
    "next dev -p ${PORT}" \
    "next dev -p${PORT}" \
    "next start -p ${PORT}" \
    "next start -p${PORT}" \
    "node.*next.*${PORT}"; do
    local pids
    pids=$(pgrep -f "$pattern" 2>/dev/null || true)
    if [[ -n "$pids" ]]; then
      log "Stopping next/node (pattern: $pattern)"
      echo "$pids" | xargs -r kill -9 2>/dev/null || true
    fi
  done
}

stop_pid_file "$PID_FILE"
stop_pid_file "$PROD_PID"
free_port

for _ in $(seq 1 10); do
  port_in_use || break
  free_port
  sleep 0.5
done

if command -v docker >/dev/null; then
  docker ps -q --filter "publish=$PORT" 2>/dev/null | xargs -r docker stop 2>/dev/null || true
  docker ps -aq --filter "name=fitconnect" 2>/dev/null | xargs -r docker rm -f 2>/dev/null || true
fi

if port_in_use; then
  log "Warning: port $PORT is still in use."
  if command -v ss >/dev/null 2>&1; then
    ss -tlnp 2>/dev/null | grep ":${PORT} " || true
  fi
  if grep -qi microsoft /proc/version 2>/dev/null; then
    log "WSL tip: a Windows process may hold this port. From PowerShell run:"
    log "  npm run env:stop"
    log "  or: Get-NetTCPConnection -LocalPort $PORT | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force }"
  fi
  log "Or use another port: PORT=3002 make start"
  [[ "$STRICT" == "1" ]] && exit 1
fi

[[ "$QUIET" == "1" ]] || echo "Stopped."
