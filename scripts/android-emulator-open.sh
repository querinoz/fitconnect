#!/usr/bin/env bash
# FitConnect — open the PWA on a running Android emulator (Chrome)
# Requires: adb on PATH, emulator already booted
set -euo pipefail

PORT="${PORT:-3001}"
PATH_SUFFIX="${1:-/mobile}"

# Prefer LAN IP so emulator can reach host; fall back to special alias 10.0.2.2
detect_host() {
  if [[ -n "${FITCONNECT_HOST:-}" ]]; then
    echo "$FITCONNECT_HOST"
    return
  fi
  # Android emulator → host machine loopback
  echo "10.0.2.2"
}

command -v adb >/dev/null || {
  echo "[Android] adb not found — install Android SDK platform-tools"
  echo "          Then: adb devices  (must show an emulator)"
  exit 1
}

DEVICES=$(adb devices | awk 'NR>1 && $2=="device" {print $1}')
if [[ -z "$DEVICES" ]]; then
  echo "[Android] No emulator/device connected."
  echo "          Start Android Studio emulator first, then re-run:"
  echo "          make android"
  exit 1
fi

HOST="$(detect_host)"
URL="http://${HOST}:${PORT}${PATH_SUFFIX}"

echo "[01/03] Dev server expected at http://localhost:${PORT}"
if ! curl -sf -o /dev/null "http://127.0.0.1:${PORT}/"; then
  echo "[Android] Web server not reachable on port ${PORT}."
  echo "          Run: make start   (or npm run dev)"
  exit 1
fi

echo "[02/03] Opening Chrome on emulator → ${URL}"
# Launch Chrome with the FitConnect URL (PWA / mobile shell)
adb shell am start -a android.intent.action.VIEW \
  -d "$URL" \
  com.android.chrome >/dev/null 2>&1 \
  || adb shell am start -a android.intent.action.VIEW -d "$URL"

echo "[03/03] Done"
echo ""
echo "  Emulator URL:  $URL"
echo "  Host URL:      http://localhost:${PORT}${PATH_SUFFIX}"
echo "  Sign-in:       ines@fitconnect.local / Athlete"
echo "                 (or Athlete / Athlete)"
echo ""
echo "  Tip: For physical phone on same Wi-Fi, open /mobile/qr and use your LAN IP."
