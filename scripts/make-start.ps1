# FitConnect — start dev environment (Windows)
param(
  [int]$Port = 3001,
  [switch]$NoBrowser,
  [switch]$NoSmoke
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$StateDir = Join-Path $Root ".fitconnect"
$PidFile = Join-Path $StateDir "dev.pid"
$OutLog = Join-Path $Root ".dev.out.log"
$ErrLog = Join-Path $Root ".dev.err.log"
$BaseUrl = "http://localhost:$Port"

function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is required. Install from https://nodejs.org/" -ForegroundColor Red
  exit 1
}

New-Item -ItemType Directory -Force -Path $StateDir | Out-Null

Write-Step "Stopping any existing dev server on port $Port"
& "$PSScriptRoot\make-stop.ps1" -Port $Port -Quiet | Out-Null

if (-not (Test-Path (Join-Path $Root "node_modules"))) {
  Write-Step "Installing dependencies (npm install)"
  npm install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Step "Starting Next.js dev server on $BaseUrl"
$npm = (Get-Command npm.cmd -ErrorAction Stop).Source
$proc = Start-Process -FilePath $npm -ArgumentList "run", "dev" `
  -WorkingDirectory $Root -PassThru -WindowStyle Hidden `
  -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog
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
Write-Host ""

if (-not $NoSmoke) {
  Write-Step "Running smoke tests"
  npm run smoke:all
  if ($LASTEXITCODE -ne 0) {
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
