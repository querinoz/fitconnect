# FitConnect — environment status (Windows)
param([int]$Port = 3001)

$Root = Split-Path -Parent $PSScriptRoot
$PidFile = Join-Path $Root ".fitconnect\dev.pid"
$BaseUrl = "http://localhost:$Port"

Write-Host ""
Write-Host "FitConnect status (port $Port)" -ForegroundColor Cyan
Write-Host "----------------------------------------"

if (Test-Path $PidFile) {
  $procId = (Get-Content $PidFile -Raw).Trim()
  $running = Get-Process -Id ([int]$procId) -ErrorAction SilentlyContinue
  if ($running) {
    Write-Host "Dev server PID:  $procId  ($($running.ProcessName))" -ForegroundColor Green
  } else {
    Write-Host "Dev server PID:  $procId  (stale - not running)" -ForegroundColor Yellow
  }
} else {
  Write-Host "Dev server PID:  (none - run make start)" -ForegroundColor DarkGray
}

$portUse = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($portUse) {
  $owners = $portUse | Select-Object -ExpandProperty OwningProcess -Unique
  Write-Host "Port ${Port}:       LISTEN (PID $($owners -join ', '))" -ForegroundColor Green
} else {
  Write-Host "Port ${Port}:       free" -ForegroundColor DarkGray
}

$routes = @("/", "/dashboard", "/coach/dashboard", "/discover", "/signin")
Write-Host ""
Write-Host "HTTP checks:" -ForegroundColor Cyan
foreach ($path in $routes) {
  $url = "$BaseUrl$path"
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
    $color = if ($r.StatusCode -eq 200) { "Green" } else { "Yellow" }
    Write-Host ("  {0,-28} {1}" -f $path, $r.StatusCode) -ForegroundColor $color
  } catch {
    Write-Host ("  {0,-28} FAIL" -f $path) -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "Docker:" -ForegroundColor Cyan
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "  Docker not installed (skipped)" -ForegroundColor DarkGray
} else {
  $null = docker info 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  Docker not running" -ForegroundColor DarkGray
  } else {
    $containers = docker ps --filter "name=fitconnect" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
    if ($containers -and ($containers | Measure-Object -Line).Lines -gt 1) {
      $containers
    } else {
      Write-Host "  No fitconnect containers running" -ForegroundColor DarkGray
    }
  }
}

if (Test-Path (Join-Path $Root "node_modules")) {
  Write-Host ""
  Write-Host "node_modules:  present" -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "node_modules:  missing (make start will install)" -ForegroundColor Yellow
}

Write-Host ""
