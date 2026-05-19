#!/usr/bin/env bash
# FitConnect — start dev environment (Unix / Git Bash)
set -euo pipefail

PORT="${PORT:-3001}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
WEB_DIR="$ROOT/apps/web"

STATE_DIR="$ROOT/.fitconnect"
PID_FILE="$STATE_DIR/dev.pid"
OUT_LOG="$ROOT/.dev.out.log"
ERR_LOG="$ROOT/.dev.err.log"
BASE_URL="http://localhost:$PORT"

NO_BROWSER="${NO_BROWSER:-0}"
NO_SMOKE="${NO_SMOKE:-0}"
SKIP_SETUP="${SKIP_SETUP:-0}"

step() { echo "==> $*"; }

if [[ "$SKIP_SETUP" != "1" ]]; then
  bash "$ROOT/scripts/make-setup.sh"
fi

mkdir -p "$STATE_DIR"

step "Stopping any existing dev server on port $PORT"
QUIET=1 STRICT=1 bash "$ROOT/scripts/make-stop.sh" "$PORT"

if ss -tln 2>/dev/null | grep -q ":${PORT} " || { command -v lsof >/dev/null && lsof -ti:"$PORT" >/dev/null 2>&1; }; then
  echo "Port $PORT is still in use after stop."
  echo "Try: make stop   or   PORT=3002 make start"
  if grep -qi microsoft /proc/version 2>/dev/null; then
    echo "From Windows PowerShell: npm run env:stop"
  fi
  exit 1
fi

step "Starting Next.js dev server on $BASE_URL"
export PORT
if command -v pnpm >/dev/null 2>&1; then
  nohup bash -c "cd \"$WEB_DIR\" && pnpm exec next dev -p \"$PORT\" -H 0.0.0.0" >"$OUT_LOG" 2>"$ERR_LOG" &
else
  nohup bash -c "cd \"$WEB_DIR\" && npx next dev -p \"$PORT\" -H 0.0.0.0" >"$OUT_LOG" 2>"$ERR_LOG" &
fi
echo $! >"$PID_FILE"

step "Waiting for server to be ready"
ready=0
for i in $(seq 1 90); do
  sleep 1
  if curl -sf -o /dev/null "$BASE_URL"; then ready=1; break; fi
  if ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Dev server exited early. tail $ERR_LOG:"
    tail -30 "$ERR_LOG" || true
    exit 1
  fi
done

if [[ "$ready" -ne 1 ]]; then
  echo "Server not ready within 90s. See $ERR_LOG"
  exit 1
fi

echo ""
echo "FitConnect is running at $BASE_URL"
echo "  PID: $(cat "$PID_FILE")  |  logs: .dev.out.log / .dev.err.log"
echo "  Routes: /  /dashboard  /coach/dashboard  /community  /settings/wearables"
echo ""

if [[ "$NO_SMOKE" != "1" ]]; then
  step "Running smoke tests"
  node scripts/smoke-test.mjs "$BASE_URL" || true
  node scripts/mobile-pwa-check.mjs "$BASE_URL" || echo "Smoke tests reported failures (server is up)."
fi

if [[ "$NO_BROWSER" != "1" ]]; then
  step "Opening browser"
  urls=("$BASE_URL/" "$BASE_URL/dashboard" "$BASE_URL/coach/dashboard" "$BASE_URL/discover")
  if command -v xdg-open >/dev/null; then
    for u in "${urls[@]}"; do xdg-open "$u" 2>/dev/null || true; done
  elif command -v open >/dev/null; then
    for u in "${urls[@]}"; do open "$u" 2>/dev/null || true; done
  fi
fi

echo "Demo sign-in: Athlete/Athlete | Coach/Coach | Admin/Admin"
echo "Stop with: make stop"
