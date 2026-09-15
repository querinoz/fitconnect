#!/bin/sh
# Xcode Cloud — confirm generated project + Xcode 26 / iOS 26 SDK before xcodebuild.
set -eu
cd "${CI_PRIMARY_REPOSITORY_PATH}/iosApp"
test -f FitConnect.xcodeproj/project.pbxproj
ver="$(xcodebuild -version | awk '/Xcode/{print $2; exit}')"
major="${ver%%.*}"
if [ -z "$major" ] || [ "$major" -lt 26 ]; then
  echo "FAIL: App Store Connect requires Xcode 26+ (since 28 Apr 2026). This image reports Xcode ${ver:-unknown}."
  echo "Fix: App Store Connect → Xcode Cloud → workflow → Environment → Latest Release Xcode 26."
  exit 1
fi
echo "Xcode Cloud pre-xcodebuild: FitConnect.xcodeproj present (Xcode $ver)"
