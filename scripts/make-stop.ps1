# FitConnect — stop dev server and free port (Windows)
param(
  [int]$Port = 3001,
  [switch]$Quiet
)

$ErrorActionPreference = "SilentlyContinue"
$Root = Split-Path -Parent $PSScriptRoot
$PidFile = Join-Path $Root ".fitconnect\dev.pid"

function Log($msg) { if (-not $Quiet) { Write-Host $msg } }

if (Test-Path $PidFile) {
  $procId = (Get-Content $PidFile -Raw).Trim()
  if ($procId -match '^\d+$') {
    Log "Stopping dev process PID $procId"
    Stop-Process -Id ([int]$procId) -Force -ErrorAction SilentlyContinue
    Get-CimInstance Win32_Process -Filter "ParentProcessId=$procId" |
      ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  }
  Remove-Item $PidFile -Force
}

$conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($conns) {
  $conns | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
    Log "Freeing port $Port (PID $_)"
    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
  }
}

$container = docker ps -q --filter "publish=$Port" 2>$null
if ($container) {
  Log "Stopping Docker container on port $Port"
  docker stop $container 2>$null | Out-Null
}

$named = @("fitconnect", "fitconnect-app")
foreach ($name in $named) {
  $id = docker ps -q --filter "name=$name" 2>$null
  if ($id) {
    Log "Stopping container $name"
    docker stop $id 2>$null | Out-Null
  }
}

if (-not $Quiet) { Write-Host "Stopped." -ForegroundColor Green }
