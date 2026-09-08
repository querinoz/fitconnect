# PowerShell Maestro-parity E2E (adb) — hardening evidence.
param([string]$Serial = "emulator-5554")
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
function Dump() {
  & $adb -s $Serial shell uiautomator dump /sdcard/ui.xml | Out-Null
  return (& $adb -s $Serial shell cat /sdcard/ui.xml)
}
function TapExact([string]$label) {
  $xml = Dump
  $pat = [regex]::Escape($label)
  $m = [regex]::Match($xml, "content-desc=`"$pat`"[^>]*bounds=`"\[(\d+),(\d+)\]\[(\d+),(\d+)\]`"")
  if (-not $m.Success) {
    $m = [regex]::Match($xml, "text=`"$pat`"[^>]*bounds=`"\[(\d+),(\d+)\]\[(\d+),(\d+)\]`"")
  }
  if (-not $m.Success) { Write-Host "MISS exact $label"; return $false }
  $cx = [int](([int]$m.Groups[1].Value + [int]$m.Groups[3].Value) / 2)
  $cy = [int](([int]$m.Groups[2].Value + [int]$m.Groups[4].Value) / 2)
  & $adb -s $Serial shell input tap $cx $cy
  Write-Host "TAP exact $label"
  return $true
}
function TapContains([string]$needle) {
  $xml = Dump
  $m = [regex]::Match($xml, "content-desc=`"([^`"]*$([regex]::Escape($needle))[^`"]*)`"[^>]*bounds=`"\[(\d+),(\d+)\]\[(\d+),(\d+)\]`"")
  if (-not $m.Success) {
    $m = [regex]::Match($xml, "text=`"([^`"]*$([regex]::Escape($needle))[^`"]*)`"[^>]*bounds=`"\[(\d+),(\d+)\]\[(\d+),(\d+)\]`"")
  }
  if (-not $m.Success) { Write-Host "MISS $needle"; return $false }
  $cx = [int](([int]$m.Groups[2].Value + [int]$m.Groups[4].Value) / 2)
  $cy = [int](([int]$m.Groups[3].Value + [int]$m.Groups[5].Value) / 2)
  & $adb -s $Serial shell input tap $cx $cy
  Write-Host "TAP $($m.Groups[1].Value)"
  return $true
}
function ShotAthlete([string]$name) {
  & $adb -s $Serial shell screencap -p "/sdcard/$name.png"
  & $adb -s $Serial pull "/sdcard/$name.png" "d:\fitconnect\docs\qa\screenshots\android\athlete\after\$name.png" | Out-Null
}
function ShotCoach([string]$name) {
  & $adb -s $Serial shell screencap -p "/sdcard/$name.png"
  & $adb -s $Serial pull "/sdcard/$name.png" "d:\fitconnect\docs\qa\screenshots\android\coach\after\$name.png" | Out-Null
}

& $adb -s $Serial shell pm clear com.fitconnect.android | Out-Null
Start-Sleep 1
& $adb -s $Serial shell am start -n com.fitconnect.android/.MainActivity | Out-Null
Start-Sleep 3
[void](TapExact "Continue")
Start-Sleep 2
[void](TapContains "running focus")
Start-Sleep 1
for ($i = 0; $i -lt 16; $i++) {
  $xml = Dump
  if ($xml -match "Good evening|This week performance|Today, selected") { Write-Host "HOME"; break }
  if ($xml -match 'content-desc="Enter Athlete OS"') { [void](TapExact "Enter Athlete OS"); Start-Sleep 2; continue }
  if ($xml -match 'content-desc="Skip for now"') { [void](TapExact "Skip for now"); Start-Sleep 1; continue }
  if ($xml -match 'content-desc="Continue"') { [void](TapExact "Continue"); Start-Sleep 1; continue }
  Write-Host "athlete step $i"
}
$xml = Dump
$ok = $xml -match "Good evening|This week|Today"
ShotAthlete "hardening-athlete-home"
Write-Host "ATHLETE_ADB=$ok"
if (-not $ok) { exit 1 }

& $adb -s $Serial shell pm clear com.fitconnect.android | Out-Null
Start-Sleep 1
& $adb -s $Serial shell am start -n com.fitconnect.android/.MainActivity | Out-Null
Start-Sleep 3
[void](TapExact "Continue")
Start-Sleep 2
[void](TapContains "endurance")
Start-Sleep 1
for ($i = 0; $i -lt 16; $i++) {
  $xml = Dump
  if ($xml -match "COACH|coach_overview|Athletes, selected|Home, selected|Athletes") { Write-Host "COACH HOME"; break }
  if ($xml -match 'content-desc="Enter Coach OS"') { [void](TapExact "Enter Coach OS"); Start-Sleep 2; continue }
  if ($xml -match 'content-desc="Skip for now"') { [void](TapExact "Skip for now"); Start-Sleep 1; continue }
  if ($xml -match 'content-desc="Continue"') { [void](TapExact "Continue"); Start-Sleep 1; continue }
  Write-Host "coach step $i"
}
$xml = Dump
$ok2 = $xml -match "Home|Athletes|COACH|Inbox|Calendar"
ShotCoach "hardening-coach-overview"
Write-Host "COACH_ADB=$ok2"
if (-not $ok2) { exit 2 }
Write-Host "CROSS_ROLE_SEQUENTIAL=PASS"
exit 0
