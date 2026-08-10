# Run Maestro Android suite (debug APK must be installed).
# Usage: powershell -File android/scripts/run-maestro-local.ps1
# Optional: -Flow 01_authentication.yaml

param(
    [string]$Flow = "",
    [string]$AppId = "com.fitconnect.android.debug"
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$maestroDir = Join-Path $root "maestro\android"

function Require-Cmd($name) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        Write-Error "$name not found. Install Maestro: https://maestro.mobile.dev/getting-started/installing-maestro"
    }
}

Require-Cmd maestro
Require-Cmd adb

$devices = adb devices | Select-String -Pattern "`tdevice$"
if (-not $devices) {
    Write-Error "No adb device/emulator attached. Start an AVD or connect USB debugging."
}

Write-Host "Installing debug APK if present..."
$apk = Join-Path $root "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apk) {
    adb install -r $apk | Out-Host
} else {
    Write-Warning "APK missing — run: cd android; .\gradlew :app:assembleDebug"
}

if ($Flow) {
    $path = Join-Path $maestroDir $Flow
    maestro test $path
    exit $LASTEXITCODE
}

$required = @(
    "01_authentication.yaml",
    "02_athlete_home.yaml",
    "03_athlete_navigation.yaml",
    "03_athlete_onboarding.yaml",
    "04_coach_dashboard.yaml",
    "05_booking.yaml",
    "06_realtime.yaml",
    "07_map.yaml",
    "08_offline.yaml",
    "09_profile_settings.yaml",
    "10_full_athlete_journey.yaml",
    "11_full_coach_journey.yaml",
    "12_map.yaml",
    "13_telemetry.yaml",
    "14_offline.yaml",
    "15_settings.yaml",
    "16_logout.yaml",
    "17_error_recovery.yaml",
    "18_deep_links.yaml"
)

$failed = 0
foreach ($f in $required) {
    $path = Join-Path $maestroDir $f
    Write-Host "`n=== Maestro $f ==="
    maestro test $path
    if ($LASTEXITCODE -ne 0) { $failed++ }
}

if ($failed -gt 0) {
    Write-Error "$failed Maestro flow(s) failed"
} else {
    Write-Host "All required Maestro flows passed (appId=$AppId)."
}
