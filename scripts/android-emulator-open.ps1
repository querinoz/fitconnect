# FitConnect — open the PWA on a running Android emulator (Chrome)
# Requires: adb on PATH, emulator already booted
param(
  [int]$Port = 3001,
  [string]$Path = "/mobile",
  [string]$HostOverride = ""
)

$ErrorActionPreference = "Stop"

function Write-Step($n, $msg) {
  Write-Host "[$n] $msg" -ForegroundColor Cyan
}

$adb = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adb) {
  Write-Host "[Android] adb not found — install Android SDK platform-tools" -ForegroundColor Red
  Write-Host "          Add platform-tools to PATH, then: adb devices" -ForegroundColor DarkGray
  exit 1
}

$devices = & adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "\tdevice$" }
if (-not $devices) {
  Write-Host "[Android] No emulator/device connected." -ForegroundColor Yellow
  Write-Host "          Start Android Studio emulator first, then:" -ForegroundColor DarkGray
  Write-Host "          make android   or   .\scripts\android-emulator-open.ps1" -ForegroundColor DarkGray
  exit 1
}

# 10.0.2.2 = Android emulator alias for host loopback
$hostName = if ($HostOverride) { $HostOverride } elseif ($env:FITCONNECT_HOST) { $env:FITCONNECT_HOST } else { "10.0.2.2" }
$url = "http://${hostName}:${Port}${Path}"

Write-Step "01/03" "Checking web server on localhost:$Port"
try {
  $null = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 5
} catch {
  Write-Host "[Android] Web server not reachable on port $Port." -ForegroundColor Red
  Write-Host "          Run: make start   or   npm run env:start" -ForegroundColor DarkGray
  exit 1
}

Write-Step "02/03" "Opening Chrome on emulator → $url"
& adb shell am start -a android.intent.action.VIEW -d $url com.android.chrome 2>$null
if ($LASTEXITCODE -ne 0) {
  & adb shell am start -a android.intent.action.VIEW -d $url
}

Write-Step "03/03" "Done"
Write-Host ""
Write-Host "  Emulator URL:  $url" -ForegroundColor Green
Write-Host "  Host URL:      http://localhost:${Port}${Path}"
Write-Host "  Sign-in:       ines@fitconnect.local / Athlete"
Write-Host "                 (or Athlete / Athlete)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Tip: For physical phone on same Wi-Fi, open /mobile/qr and use your LAN IP." -ForegroundColor DarkGray
