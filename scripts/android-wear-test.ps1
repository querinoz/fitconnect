# Wear OS test runner (Windows)

$ErrorActionPreference = "Continue"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Android = Join-Path $Root "android"
$ReportDir = Join-Path $Root "docs\android\wear"
$QaDir = Join-Path $Root "qa\reports\wear"
New-Item -ItemType Directory -Force -Path $QaDir | Out-Null

function Write-Gate($name, $status) {
  Write-Host ("[{0}] {1}" -f $name, $status)
}

Write-Host ""
Write-Host "FITCONNECT ELITE OS — android-wear-test"
Write-Host ""

$sdk = $env:ANDROID_HOME
if (-not $sdk) { $sdk = $env:ANDROID_SDK_ROOT }
if (-not $sdk) { $sdk = Join-Path $env:LOCALAPPDATA "Android\Sdk" }
Write-Gate "BOOT" "SDK=$sdk"

$emuBin = Join-Path $sdk "emulator\emulator.exe"
$adbBin = Join-Path $sdk "platform-tools\adb.exe"
$sdkMgr = Join-Path $sdk "cmdline-tools\latest\bin\sdkmanager.bat"
if (-not (Test-Path $sdkMgr)) {
  $alt = Get-ChildItem -Path (Join-Path $sdk "cmdline-tools") -Recurse -Filter "sdkmanager.bat" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($alt) { $sdkMgr = $alt.FullName }
}

$phoneSerial = $null
$wearSerial = $null
$wearEmu = "UNAVAILABLE"
$phoneEmu = "UNAVAILABLE"
$sync = "UNVERIFIED"
$gps = "UNVERIFIED"

if (Test-Path $adbBin) {
  $devices = & $adbBin devices
  Write-Host $devices
  foreach ($line in $devices) {
    if ($line -match "^(emulator-\d+)\s+device") {
      if (-not $phoneSerial) { $phoneSerial = $Matches[1]; $phoneEmu = "PASS" }
      elseif (-not $wearSerial) { $wearSerial = $Matches[1] }
    }
  }
}

$avds = @()
if (Test-Path $emuBin) {
  $avds = & $emuBin -list-avds
  Write-Host "AVDs:" $avds
}

$wearAvd = @($avds | Where-Object { $_ -match "wear|watch" }) | Select-Object -First 1
if (-not $wearAvd -and ($avds -contains "fitconnect_wear")) { $wearAvd = "fitconnect_wear" }
if (-not $wearAvd) {
  Write-Gate "WATCH" "UNAVAILABLE (no Wear AVD)"
} else {
  Write-Gate "WATCH" "AVD=$wearAvd"
  if (-not $wearSerial -and (Test-Path $emuBin)) {
    Write-Host "Starting Wear AVD $wearAvd on port 5600 (if not already running)"
    Start-Process -FilePath $emuBin -ArgumentList "-avd", $wearAvd, "-port", "5600", "-no-snapshot" -WindowStyle Hidden
  }
}

Write-Gate "PHONE" $phoneEmu
Write-Gate "WATCH" $(if ($wearSerial) { "device $wearSerial" } else { $wearEmu })
Write-Gate "SYNC" $sync
Write-Gate "BACKEND" "not required for local engine tests"

Set-Location $Android
Write-Host "==> unit tests"
& .\gradlew.bat --offline :shared:test :core-capture:testDebugUnitTest :telemetry:testDebugUnitTest :wear:assembleDebug :app:assembleDebug :athlete:testDebugUnitTest :coach:testDebugUnitTest
$gradleExit = $LASTEXITCODE
if ($gradleExit -ne 0) {
  Write-Host "Offline gradle failed — retry with network"
  & .\gradlew.bat :shared:test :core-capture:testDebugUnitTest :telemetry:testDebugUnitTest :wear:assembleDebug :app:assembleDebug
  $gradleExit = $LASTEXITCODE
}

if ($phoneSerial -and (Test-Path (Join-Path $Android "app\build\outputs\apk\debug\app-debug.apk"))) {
  Write-Host "==> install phone APK on $phoneSerial"
  & $adbBin -s $phoneSerial install -r "app\build\outputs\apk\debug\app-debug.apk"
  Write-Host "==> GPS fixture inject (TEST_FIXTURE, not LIVE)"
  & $adbBin -s $phoneSerial emu geo fix -9.139300 38.722300
  $gps = "EMULATOR_INJECTED"
  $shot = Join-Path $QaDir "phone.png"
  & $adbBin -s $phoneSerial shell screencap -p /sdcard/fitconnect-wear-qa.png
  & $adbBin -s $phoneSerial pull /sdcard/fitconnect-wear-qa.png $shot
}

if ($wearSerial -and (Test-Path (Join-Path $Android "wear\build\outputs\apk\debug\wear-debug.apk"))) {
  & $adbBin -s $wearSerial install -r "wear\build\outputs\apk\debug\wear-debug.apk"
  $wearEmu = "PASS"
  $sync = "UNVERIFIED"
}

Write-Gate "READY" $(if ($gradleExit -eq 0) { "UNIT/BUILD attempted" } else { "BUILD FAIL" })
Write-Host "WEAR_EMULATOR=$wearEmu GPS=$gps SYNC=$sync GRADLE=$gradleExit"
exit $gradleExit
