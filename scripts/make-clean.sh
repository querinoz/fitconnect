#!/usr/bin/env bash
# FitConnect — full environment cleanup (Unix / Git Bash)
set -euo pipefail

PORT="${PORT:-3001}"
DEEP="${DEEP:-0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Stopping processes and freeing port $PORT"
QUIET=1 bash "$ROOT/scripts/make-stop.sh" "$PORT"

if command -v docker >/dev/null; then
  echo "==> Removing Docker containers (fitconnect*)"
  docker ps -aq --filter "name=fitconnect" 2>/dev/null | xargs -r docker rm -f 2>/dev/null || true
  docker ps -aq --filter "publish=$PORT" 2>/dev/null | xargs -r docker rm -f 2>/dev/null || true
fi

echo "==> Clearing Next.js build cache"
rm -rf .next out dist build

echo "==> Removing dev state and logs"
rm -rf .fitconnect .dev.out.log .dev.err.log
rm -f *.tsbuildinfo 2>/dev/null || true

if [[ "$DEEP" == "1" ]]; then
  echo "==> Deep clean: removing node_modules"
  rm -rf node_modules
fi

if command -v lsof >/dev/null; then
  if lsof -ti:"$PORT" >/dev/null 2>&1; then
    echo "Warning: port $PORT may still be in use."
  else
    echo "Port $PORT is free."
  fi
fi

echo "Environment clean. Run 'make start' to boot again."
