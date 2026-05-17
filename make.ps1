# Windows wrapper — same targets as Makefile (no GNU make required)
# Usage: .\make.ps1 start | stop | clean | status
param(
  [Parameter(Position = 0)]
  [ValidateSet("start", "stop", "clean", "clean-deep", "status", "help")]
  [string]$Command = "help",
  [int]$Port = 3001
)

$Root = $PSScriptRoot
$scripts = Join-Path $Root "scripts"

switch ($Command) {
  "start" {
    & "$scripts\make-start.ps1" -Port $Port
    exit $LASTEXITCODE
  }
  "stop" {
    & "$scripts\make-stop.ps1" -Port $Port
    exit $LASTEXITCODE
  }
  "clean" {
    & "$scripts\make-clean.ps1" -Port $Port
    exit $LASTEXITCODE
  }
  "clean-deep" {
    & "$scripts\make-clean.ps1" -Port $Port -Deep
    exit $LASTEXITCODE
  }
  "status" {
    & "$scripts\make-status.ps1" -Port $Port
    exit $LASTEXITCODE
  }
  default {
    Write-Host @"
FitConnect — use: .\make.ps1 <command>

  start       Start dev server, smoke tests, open browser tabs
  stop        Stop dev server and free port $Port
  clean       Stop, Docker cleanup, clear .next and logs
  clean-deep  clean + remove node_modules
  status      Port, PID, HTTP health checks

Or install GNU make and run: make start
"@
  }
}
