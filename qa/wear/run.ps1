# qa/wear — Wear OS debug assemble. Device test remains PENDING_HUMAN.
$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location (Join-Path $Root "android")
& .\gradlew.bat :wear:assembleDebug :telemetry:testDebugUnitTest --tests com.fitconnect.android.telemetry.wear.WearSessionLinkTest
exit $LASTEXITCODE
