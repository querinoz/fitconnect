#!/bin/sh
# Xcode Cloud — confirm generated project exists before the cloud xcodebuild.
set -eu
cd "${CI_PRIMARY_REPOSITORY_PATH}/iosApp"
test -f FitConnect.xcodeproj/project.pbxproj
echo "Xcode Cloud pre-xcodebuild: FitConnect.xcodeproj present"
