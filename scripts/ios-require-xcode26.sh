#!/usr/bin/env bash
# Fail closed unless Xcode 26+ and iOS/watchOS 26 SDKs are selected.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "BLOCKED: Xcode 26 gate requires macOS."
  exit 2
fi
exec node "$ROOT/scripts/ios-require-xcode26.mjs"
