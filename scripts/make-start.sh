#!/usr/bin/env bash
# FitConnect — start dev environment (Unix / Git Bash)
set -euo pipefail

PORT="${PORT:-3001}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STATE_DIR="$ROOT/.fitconnect"
PID_FILE="$STATE_DIR/dev.pid"
OUT_LOG="$ROOT/.dev.out.log"
ERR_LOG="$ROOT/.dev.err.log"
BASE_URL="http://localhost:$PORT"

NO_BROWSER="${NO_BROWSER:-0}"
NO_SMOKE="${NO_SMOKE:-0}"

step() { echo "==> $*"; }

command -v node >/dev/null || { echo "Node.js required"; exit 1; }

mkdir -p "$STATE_DIR"

step "Stopping any existing dev server on port $PORT"
bash "$ROOT/scripts/make-stop.sh" "$PORT" 2>/dev/null || true

if [[ ! -d node_modules ]]; then
  step "Installing dependencies"
  npm install
fi

step "Starting Next.js dev server on $BASE_URL"
nohup npm run dev >"$OUT_LOG" 2>"$ERR_LOG" &
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
echo ""

if [[ "$NO_SMOKE" != "1" ]]; then
  step "Running smoke tests"
  npm run smoke:all || echo "Smoke tests reported failures (server is up)."
fi

if [[ "$NO_BROWSER" != "1" ]]; then
  step "Opening app surfaces in browser"
  urls=(
    "$BASE_URL/"
    "$BASE_URL/signin"
    "$BASE_URL/feed"
    "$BASE_URL/coach/dashboard"
    "$BASE_URL/mobile"
    "$BASE_URL/mobile/qr"
  )
  if command -v xdg-open >/dev/null; then
    for u in "${urls[@]}"; do xdg-open "$u" 2>/dev/null || true; done
  elif command -v open >/dev/null; then
    for u in "${urls[@]}"; do open "$u" 2>/dev/null || true; done
  fi
fi

# Optional: open PWA on Android emulator if adb + device are available
if command -v adb >/dev/null && adb devices 2>/dev/null | awk 'NR>1 && $2=="device"{found=1} END{exit !found}'; then
  step "Android emulator detected — opening FitConnect PWA"
  bash "$ROOT/scripts/android-emulator-open.sh" /mobile || true
else
  echo ""
  echo "Android: no emulator/adb detected (optional)."
  echo "  Boot Android Studio emulator, then: make android"
fi

echo ""
echo "Surfaces:"
echo "  Landing   $BASE_URL/"
echo "  Athlete   $BASE_URL/feed"
echo "  Coach     $BASE_URL/coach/dashboard"
echo "  Mobile    $BASE_URL/mobile"
echo "  QR        $BASE_URL/mobile/qr"
echo "  Emulator  http://10.0.2.2:$PORT/mobile  (via make android)"
echo ""
echo "Demo sign-in: ines@fitconnect.local / Athlete | Coach/Coach | Admin/Admin"
