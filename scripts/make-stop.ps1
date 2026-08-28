# FitConnect - stop dev/prod server and free port (Windows)
param(
  [int]$Port = 3001,
  [switch]$Quiet,
  [switch]$Strict
)

$ErrorActionPreference = "SilentlyContinue"
$Root = Split-Path -Parent $PSScriptRoot
$PidFile = Join-Path $Root ".fitconnect\dev.pid"
$ProdPid = Join-Path $Root ".next\prod.pid"

function Log($msg) { if (-not $Quiet) { Write-Host $msg } }

function Stop-Tree([int]$ProcId) {
  Get-CimInstance Win32_Process -Filter "ParentProcessId=$ProcId" -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Tree $_.ProcessId }
  Stop-Process -Id $ProcId -Force -ErrorAction SilentlyContinue
}

foreach ($file in @($PidFile, $ProdPid)) {
  if (-not (Test-Path $file)) { continue }
  $procId = (Get-Content $file -Raw).Trim()
  if ($procId -match '^\d+$') {
    Log "Stopping PID $procId ($([IO.Path]::GetFileName($file)))"
    Stop-Tree ([int]$procId)
  }
  Remove-Item $file -Force -ErrorAction SilentlyContinue
}

Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
  Where-Object {
    $_.CommandLine -and (
      $_.CommandLine -match "next dev -p\s*$Port" -or
      $_.CommandLine -match "next start -p\s*$Port" -or
      $_.CommandLine -match "next dev -p$Port"
    )
  } |
  ForEach-Object {
    Log "Stopping next process PID $($_.ProcessId)"
    Stop-Tree $_.ProcessId
  }

for ($i = 0; $i -lt 10; $i++) {
  $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if (-not $conns) { break }
  $conns | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
    Log "Freeing port $Port (PID $_)"
    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Milliseconds 500
}

$container = docker ps -q --filter "publish=$Port" 2>$null
if ($container) {
  Log "Stopping Docker container on port $Port"
  docker stop $container 2>$null | Out-Null
}

foreach ($name in @("fitconnect", "fitconnect-app")) {
  $id = docker ps -q --filter "name=$name" 2>$null
  if ($id) {
    Log "Stopping container $name"
    docker stop $id 2>$null | Out-Null
  }
}

$still = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($still) {
  Log "Warning: port $Port is still in use."
  $still | Select-Object OwningProcess, State | Format-Table
  Log "Or use another port: `$env:PORT=3002; npm run env:start"
  if ($Strict) { exit 1 }
}

if (-not $Quiet) { Write-Host "Stopped." -ForegroundColor Green }
exit 0
