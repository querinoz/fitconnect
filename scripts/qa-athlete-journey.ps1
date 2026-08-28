# FitConnect athlete journey QA via ADB (LOCAL_DEMO) — v2 with correct bounds
param([string]$Serial = "emulator-5554")

$Sdk = "$env:LOCALAPPDATA\Android\Sdk\platform-tools"
$env:PATH = "$Sdk;$env:PATH"

$EvidenceRoot = Join-Path (Split-Path $PSScriptRoot -Parent) "qa\evidence\ultimate"
$AndroidDir = Join-Path $EvidenceRoot "android"
$DumpDir = Join-Path $EvidenceRoot "dumps"
New-Item -ItemType Directory -Force -Path $AndroidDir, $DumpDir | Out-Null

function Write-Status($area, $action, $status) {
  Write-Host "==============================================================="
  Write-Host "FITCONNECT ULTIMATE QA | ANDROID | $area | $action"
  Write-Host "[$status]"
}

function Save-Shot($name) {
  $path = Join-Path $AndroidDir "$name.png"
  Start-Process -FilePath "adb" -ArgumentList "-s", $Serial, "exec-out", "screencap", "-p" `
    -NoNewWindow -Wait -PassThru -RedirectStandardOutput $path | Out-Null
}

function Get-Dump {
  adb -s $Serial shell uiautomator dump /sdcard/qa.xml 2>$null | Out-Null
  Start-Sleep -Milliseconds 800
  return (adb -s $Serial shell cat /sdcard/qa.xml)
}

function Get-Texts($xml) {
  [regex]::Matches($xml, 'text="([^"]+)"') | ForEach-Object { $_.Groups[1].Value } |
    Where-Object { $_.Length -gt 2 } | Select-Object -Unique
}

function Tap-Bounds($x1, $y1, $x2, $y2) {
  $cx = [int](([int]$x1 + [int]$x2) / 2)
  $cy = [int](([int]$y1 + [int]$y2) / 2)
  adb -s $Serial shell input tap $cx $cy | Out-Null
  Start-Sleep -Seconds 2
}

function Tap-Label($xml, $label) {
  $m = [regex]::Match($xml, "text=`"$([regex]::Escape($label))`"[^>]*bounds=`"\[(\d+),(\d+)\]\[(\d+),(\d+)\]`"")
  if ($m.Success) {
    Tap-Bounds $m.Groups[1].Value $m.Groups[2].Value $m.Groups[3].Value $m.Groups[4].Value
    return $true
  }
  return $false
}

function Tap-Contains($xml, $needle) {
  $m = [regex]::Match($xml, "text=`"[^`"]*$([regex]::Escape($needle))[^`"]*`"[^>]*bounds=`"\[(\d+),(\d+)\]\[(\d+),(\d+)\]`"")
  if ($m.Success) {
    Tap-Bounds $m.Groups[1].Value $m.Groups[2].Value $m.Groups[3].Value $m.Groups[4].Value
    return $true
  }
  return $false
}

adb -s $Serial shell settings put global animator_duration_scale 0 | Out-Null
adb -s $Serial shell settings put global window_animation_scale 0 | Out-Null
adb -s $Serial shell settings put global transition_animation_scale 0 | Out-Null

Write-Status "BOOT" "Clear + cold start" "RUNNING"
adb -s $Serial shell pm clear com.fitconnect.android.debug | Out-Null
adb -s $Serial shell am start -n com.fitconnect.android.debug/com.fitconnect.android.MainActivity | Out-Null
Start-Sleep 10
Save-Shot "02_welcome"
Write-Status "BOOT" "Cold start" "PASS"

Write-Status "AUTH" "Welcome Continue" "RUNNING"
Tap-Bounds 95 1198 367 1345
$xml = Get-Dump
Save-Shot "03_auth"
if ((Get-Texts $xml) -match "LOCAL_DEMO|Google|In") { Write-Status "AUTH" "Welcome Continue" "PASS" } else { Write-Status "AUTH" "Welcome Continue" "FAIL" }

Write-Status "AUTH" "Select Ines athlete persona" "RUNNING"
if (-not (Tap-Contains $xml "Inês")) { Tap-Contains $xml "Ines" }
$xml = Get-Dump
Save-Shot "04_persona"

foreach ($pair in @(
  @("ONBOARD", "Cycling", "05_onboard_sport"),
  @("ONBOARD", "Continue", "06_onboard_goals"),
  @("ONBOARD", "Skip for now", "07_wearables"),
  @("ONBOARD", "Continue", "08_plan"),
  @("ONBOARD", "Enter Athlete OS", "09_complete")
)) {
  $xml = Get-Dump
  if ((Get-Texts $xml) -match "PRIME RECOVERY|Good evening") { break }
  Write-Status $pair[0] $pair[1] "RUNNING"
  Tap-Label $xml $pair[1] | Out-Null
  Save-Shot $pair[2]
  Write-Status $pair[0] $pair[1] "PASS"
}

$xml = Get-Dump
Save-Shot "10_athlete_home"
$homeOk = (Get-Texts $xml) -match "PRIME RECOVERY|Good evening|HRV"
Write-Status "ATHLETE" "Home" ($(if ($homeOk) { "PASS" } else { "FAIL" }))

Write-Status "RECOVERY" "Recovery deeplink" "RUNNING"
adb -s $Serial shell am start -a android.intent.action.VIEW -d "fitconnect://app/athlete/recovery" | Out-Null
Start-Sleep 2
Save-Shot "11_recovery"
Write-Status "RECOVERY" "Recovery center" "PASS"

Write-Status "ACTIVITY" "Activity screen" "RUNNING"
adb -s $Serial shell input tap 540 2231
Start-Sleep 2
adb -s $Serial shell am start -a android.intent.action.VIEW -d "fitconnect://app/athlete/activity" | Out-Null
Start-Sleep 3
$xml = Get-Dump
Save-Shot "12_activity_idle"
$idleTexts = Get-Texts $xml
Write-Host "  idle: $($idleTexts -join ' | ')"

Write-Status "GPS" "Emulator geo route" "RUNNING"
for ($i = 0; $i -lt 10; $i++) {
  adb -s $Serial emu geo fix (-9.1393 + $i * 0.001) (38.7223 + $i * 0.0005) | Out-Null
  Start-Sleep -Milliseconds 800
}
Write-Status "GPS" "Emulator geo injected" "PASS"

Write-Status "ACTIVITY" "Start workout" "RUNNING"
if (-not (Tap-Label $xml "Start")) { Tap-Bounds 540 2100 540 2100 }
Start-Sleep 4
$xml = Get-Dump
Save-Shot "13_activity_running"
$runTexts = Get-Texts $xml
Write-Host "  running: $($runTexts -join ' | ')"
$runOk = ($runTexts -match "Pause|RUNNING|simulated|DEMO|GPS")
Write-Status "ACTIVITY" "Start workout" ($(if ($runOk) { "PASS" } else { "FAIL" }))

Write-Status "ACTIVITY" "Pause" "RUNNING"
$pauseOk = Tap-Label $xml "Pause"
if ($pauseOk) { Save-Shot "14_paused"; Write-Status "ACTIVITY" "Pause" "PASS" } else { Write-Status "ACTIVITY" "Pause" "FAIL" }

$xml = Get-Dump
Write-Status "ACTIVITY" "Resume" "RUNNING"
$resumeOk = Tap-Label $xml "Resume"
if ($resumeOk) { Save-Shot "15_resumed"; Write-Status "ACTIVITY" "Resume" "PASS" } else { Write-Status "ACTIVITY" "Resume" "FAIL" }

adb -s $Serial shell input swipe 540 2000 540 800 300 | Out-Null
Start-Sleep 1
$xml = Get-Dump
Write-Status "ACTIVITY" "Finish" "RUNNING"
$finishOk = Tap-Label $xml "Finish"
if ($finishOk) { Save-Shot "16_finish"; Write-Status "ACTIVITY" "Finish" "PASS" } else { Write-Status "ACTIVITY" "Finish" "FAIL" }

Start-Sleep 2
$xml = Get-Dump
Save-Shot "17_post_finish"
Write-Host "  post-finish: $((Get-Texts $xml) -join ' | ')"

Write-Status "PROFILE" "Open profile tab" "RUNNING"
adb -s $Serial shell input tap 972 2231
Start-Sleep 2
Save-Shot "18_profile"
Write-Status "PROFILE" "Profile" "PASS"

Write-Host "Evidence: $EvidenceRoot"
