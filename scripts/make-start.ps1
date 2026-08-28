# FitConnect - start dev environment (Windows)
param(
  [int]$Port = 3001,
  [switch]$NoBrowser,
  [switch]$NoSmoke,
  [switch]$SkipSetup
)

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "       FITCONNECT ELITE OS          " -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host "[BOOT] FitConnect Elite OS local start"
Write-Host "[PHONE] not started here - make android-wear-test / make android-emulator"
Write-Host "[WATCH] not started here - Wear AVD may be UNAVAILABLE"
Write-Host "[SYNC] UNVERIFIED until a reachable FitConnect Wear node exists"
Write-Host "[BACKEND] Next.js on :$Port"
Write-Host "[READY] after this script finishes (web only)"
Write-Host ""

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$WebDir = Join-Path $Root "apps\web"
Set-Location $Root

$StateDir = Join-Path $Root ".fitconnect"
$PidFile = Join-Path $StateDir "dev.pid"
$OutLog = Join-Path $Root ".dev.out.log"
$ErrLog = Join-Path $Root ".dev.err.log"
$BaseUrl = "http://localhost:$Port"

function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }

if (-not $SkipSetup) {
  & "$PSScriptRoot\make-setup.ps1"
  if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

New-Item -ItemType Directory -Force -Path $StateDir | Out-Null

Write-Step "Stopping any existing dev server on port $Port"
& "$PSScriptRoot\make-stop.ps1" -Port $Port -Quiet -Strict
if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) {
  Write-Host "Port $Port is still in use. Run npm run env:stop or use -Port 3002" -ForegroundColor Red
  exit 1
}

Write-Step "Starting Next.js dev server on $BaseUrl"
$env:PORT = "$Port"
$pnpmCmd = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
if ($pnpmCmd) {
  $proc = Start-Process -FilePath $pnpmCmd.Source -ArgumentList "exec", "next", "dev", "-p", "$Port", "-H", "0.0.0.0" `
    -WorkingDirectory $WebDir -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog
} else {
  $npx = (Get-Command npx.cmd -ErrorAction Stop).Source
  $proc = Start-Process -FilePath $npx -ArgumentList "next", "dev", "-p", "$Port", "-H", "0.0.0.0" `
    -WorkingDirectory $WebDir -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog
}
$proc.Id | Out-File -Encoding utf8 $PidFile

Write-Step "Waiting for server to be ready"
$ready = $false
for ($i = 0; $i -lt 90; $i++) {
  Start-Sleep -Seconds 1
  try {
    $r = Invoke-WebRequest -Uri $BaseUrl -UseBasicParsing -TimeoutSec 3
    if ($r.StatusCode -eq 200) { $ready = $true; break }
  } catch { }
  if ($proc.HasExited) {
    Write-Host "Dev server exited early. Last log lines:" -ForegroundColor Red
    Get-Content $ErrLog -Tail 30 -ErrorAction SilentlyContinue
    exit 1
  }
}

if (-not $ready) {
  Write-Host "Server did not become ready within 90s. Check $ErrLog" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "FitConnect is running at $BaseUrl" -ForegroundColor Green
Write-Host "  PID: $($proc.Id)  |  logs: .dev.out.log / .dev.err.log"
Write-Host "  Routes: /  /dashboard  /coach/dashboard  /community  /settings/wearables"
Write-Host ""

if (-not $NoSmoke) {
  Write-Step "Running smoke tests"
  node scripts/smoke-test.mjs $BaseUrl
  node scripts/mobile-pwa-check.mjs $BaseUrl
  if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) {
    Write-Host "Smoke tests failed - server is up but some checks did not pass." -ForegroundColor Yellow
  }
}

if (-not $NoBrowser) {
  Write-Step "Opening app in browser"
  $urls = @(
    "$BaseUrl/",
    "$BaseUrl/dashboard",
    "$BaseUrl/coach/dashboard",
    "$BaseUrl/discover"
  )
  foreach ($u in $urls) { Start-Process $u }
}

Write-Host ""
Write-Host "Demo sign-in: Athlete/Athlete | Coach/Coach | Admin/Admin" -ForegroundColor DarkGray
Write-Host "Stop with: make stop or npm run env:stop" -ForegroundColor DarkGray
