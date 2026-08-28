# Windows wrapper — same targets as Makefile (no GNU make required)
# Usage: .\make.ps1 start | stop | clean | status
param(
  [Parameter(Position = 0)]
  [ValidateSet("start", "fitconnect", "stop", "clean", "clean-deep", "status", "help")]
  [string]$Command = "help",
  [Parameter(Position = 1)]
  [string]$SubCommand = "",
  [int]$Port = 3001
)

$Root = $PSScriptRoot
$scripts = Join-Path $Root "scripts"

switch ($Command) {
  { $_ -in @("start", "fitconnect") } {
    if ($SubCommand -and $SubCommand -ne "fitconnect" -and $Command -eq "start") {
      Write-Error "Unknown target: $SubCommand (did you mean: .\make.ps1 fitconnect ?)"
      exit 1
    }
    & "$scripts\make-start.ps1" -Port $Port
    exit $(if ($null -ne $LASTEXITCODE) { $LASTEXITCODE } else { 0 })
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
