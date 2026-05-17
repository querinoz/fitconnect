#!/usr/bin/env bash
# FitConnect — environment status (Unix / Git Bash)
PORT="${PORT:-3001}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$ROOT/.fitconnect/dev.pid"
BASE_URL="http://localhost:$PORT"

echo ""
echo "FitConnect status (port $PORT)"
echo "----------------------------------------"

if [[ -f "$PID_FILE" ]]; then
  proc_id="$(cat "$PID_FILE" | tr -d '[:space:]')"
  if kill -0 "$proc_id" 2>/dev/null; then
    echo "Dev server PID:  $proc_id  (running)"
  else
    echo "Dev server PID:  $proc_id  (stale)"
  fi
else
  echo "Dev server PID:  (none — run make start)"
fi

if command -v lsof >/dev/null && lsof -ti:"$PORT" >/dev/null 2>&1; then
  echo "Port $PORT:       LISTEN"
else
  echo "Port $PORT:       free"
fi

echo ""
echo "HTTP checks:"
routes=("/" "/dashboard" "/coach/dashboard" "/discover" "/signin")
for path in "${routes[@]}"; do
  code=$(curl -sf -o /dev/null -w "%{http_code}" "$BASE_URL$path" 2>/dev/null || echo "FAIL")
  printf "  %-28s %s\n" "$path" "$code"
done

echo ""
echo "Docker:"
if command -v docker >/dev/null && docker info >/dev/null 2>&1; then
  docker ps --filter "name=fitconnect" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "  No fitconnect containers"
else
  echo "  Docker not available"
fi

echo ""
if [[ -d "$ROOT/node_modules" ]]; then
  echo "node_modules:  present"
else
  echo "node_modules:  missing"
fi
echo ""
