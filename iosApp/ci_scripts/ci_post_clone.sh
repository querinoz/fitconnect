#!/bin/sh
# Xcode Cloud — runs after git clone, before xcodebuild.
# XcodeGen project is not committed; this script generates it.
set -eu
cd "${CI_PRIMARY_REPOSITORY_PATH}"

if command -v brew >/dev/null 2>&1; then
  brew install xcodegen
else
  echo "FAIL: Homebrew missing on Xcode Cloud image"
  exit 1
fi

export CURRENT_PROJECT_VERSION="${CI_BUILD_NUMBER:-1}"
# Optional Xcode Cloud workflow env (set in App Store Connect → Xcode Cloud → Environment):
# APPLE_TEAM_ID, IOS_GOOGLE_SERVICE_INFO_PLIST
python3 scripts/ios-inject-ci-secrets.py

cd iosApp
xcodegen generate
test -f FitConnect.xcodeproj/project.pbxproj
echo "Xcode Cloud post-clone: XcodeGen project ready"
