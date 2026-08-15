# qa/android — wraps Gradle. Does not invent emulator PASS.
# Usage (repo root): powershell -File qa/android/run.ps1
$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location (Join-Path $Root "android")
& .\gradlew.bat :app:assembleDebug :geo:testDebugUnitTest :telemetry:testDebugUnitTest :foundation:testDebugUnitTest
exit $LASTEXITCODE
