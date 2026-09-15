#!/usr/bin/env bash
# Archive FitConnect (iOS + Watch + Widgets) and upload to App Store Connect / TestFlight.
# Requires macOS + Xcode + App Store Connect API key env vars. Never echo secrets.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "BLOCKED: TestFlight archive needs GitHub Actions macos-15 or Xcode Cloud — not Windows."
  exit 2
fi

export FITCONNECT_REQUIRE_UPLOAD_SECRETS="${FITCONNECT_REQUIRE_UPLOAD_SECRETS:-1}"
python3 "$ROOT/scripts/ios-inject-ci-secrets.py"

if ! command -v xcodegen >/dev/null; then
  brew install xcodegen
fi

KEY_PATH="${APP_STORE_CONNECT_API_KEY_PATH:-${RUNNER_TEMP:-/tmp}/AuthKey.p8}"
ARCHIVE="${RUNNER_TEMP:-/tmp}/FitConnect.xcarchive"
EXPORT_DIR="${RUNNER_TEMP:-/tmp}/FitConnectExport"
EXPORT_PLIST="$ROOT/iosApp/AppStore/ExportOptions.generated.plist"
BUILD_NO="${CURRENT_PROJECT_VERSION:-${GITHUB_RUN_NUMBER:-1}}"

if [[ ! -f "$KEY_PATH" ]]; then
  echo "FAIL: App Store Connect API key file was not written"
  exit 1
fi
if [[ ! -f "$EXPORT_PLIST" ]]; then
  echo "FAIL: ExportOptions.generated.plist missing"
  exit 1
fi
if [[ ! -f "$ROOT/iosApp/GoogleService-Info.plist" ]]; then
  echo "FAIL: GoogleService-Info.plist was not injected"
  exit 1
fi

cd "$ROOT/iosApp"
xcodegen generate

AUTH=(
  -allowProvisioningUpdates
  -authenticationKeyPath "$KEY_PATH"
  -authenticationKeyID "$APP_STORE_CONNECT_API_KEY_ID"
  -authenticationKeyIssuerID "$APP_STORE_CONNECT_ISSUER_ID"
)

echo "== resolve Swift packages =="
xcodebuild -resolvePackageDependencies -project FitConnect.xcodeproj -scheme FitConnect "${AUTH[@]}"

echo "== archive Release (generic iOS) build ${BUILD_NO} =="
xcodebuild \
  -project FitConnect.xcodeproj \
  -scheme FitConnect \
  -destination 'generic/platform=iOS' \
  -configuration Release \
  -archivePath "$ARCHIVE" \
  CURRENT_PROJECT_VERSION="$BUILD_NO" \
  MARKETING_VERSION=1.0.0 \
  "${AUTH[@]}" \
  archive

APP="$ARCHIVE/Products/Applications/FitConnect.app"
if [[ ! -d "$APP" ]]; then
  echo "FAIL: FitConnect.app missing from archive"
  exit 1
fi
if [[ ! -d "$APP/PlugIns/FitConnectWidgets.appex" ]]; then
  echo "FAIL: FitConnectWidgets.appex not embedded — WidgetKit / Live Activity would be missing"
  exit 1
fi

WATCH_APP="$(find "$APP" -name 'FitConnect Watch.app' -o -name 'FitConnectWatch.app' | head -n 1 || true)"
if [[ -z "$WATCH_APP" ]]; then
  echo "FAIL: watchOS companion missing from archive"
  exit 1
fi

echo "== validate Release entitlements =="
ENT_DUMP="$(mktemp)"
codesign -d --entitlements :- "$APP" >"$ENT_DUMP" 2>/dev/null || true
python3 - "$ENT_DUMP" <<'PY'
import sys
from pathlib import Path
text = Path(sys.argv[1]).read_text(encoding="utf-8", errors="replace")
if len(text) < 40:
    print("FAIL could not dump codesign entitlements from the archive")
    sys.exit(1)
needles = [
    "com.apple.developer.healthkit",
    "com.apple.developer.applesignin",
    "group.com.fitconnect.ios",
]
missing = [n for n in needles if n not in text]
if missing:
    print("FAIL archive entitlements missing: " + ", ".join(missing))
    sys.exit(1)
if "aps-environment" in text and "production" not in text:
    print("FAIL Release archive aps-environment must be production for TestFlight")
    sys.exit(1)
print("entitlements OK (HealthKit, Sign in with Apple, App Group, APS production)")
PY

echo "== upload archive to App Store Connect =="
mkdir -p "$EXPORT_DIR"
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE" \
  -exportPath "$EXPORT_DIR" \
  -exportOptionsPlist "$EXPORT_PLIST" \
  "${AUTH[@]}"

echo "TESTFLIGHT UPLOAD SUBMITTED — App Store Connect will process the build (often 5–30 min)."
echo "Then: App Store Connect → Apps → FitConnect → TestFlight → Internal Testing → add tester."
