# FitConnect — full environment cleanup (Windows)
param(
  [int]$Port = 3001,
  [switch]$Deep
)

$ErrorActionPreference = "SilentlyContinue"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "==> Stopping processes and freeing port $Port" -ForegroundColor Cyan
& "$PSScriptRoot\make-stop.ps1" -Port $Port -Quiet

Write-Host "==> Removing Docker containers and images (fitconnect*)" -ForegroundColor Cyan
docker ps -aq --filter "name=fitconnect" 2>$null | ForEach-Object { docker rm -f $_ 2>$null | Out-Null }
docker ps -aq --filter "ancestor=fitconnect" 2>$null | ForEach-Object { docker rm -f $_ 2>$null | Out-Null }
$ids = docker ps -aq --filter "publish=$Port" 2>$null
if ($ids) { $ids | ForEach-Object { docker rm -f $_ 2>$null | Out-Null } }

Write-Host "==> Clearing Next.js build cache" -ForegroundColor Cyan
Remove-Item -Recurse -Force "$Root\.next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$Root\out" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$Root\dist" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$Root\build" -ErrorAction SilentlyContinue

Write-Host "==> Removing dev state and logs" -ForegroundColor Cyan
Remove-Item -Recurse -Force "$Root\.fitconnect" -ErrorAction SilentlyContinue
Remove-Item -Force "$Root\.dev.out.log", "$Root\.dev.err.log" -ErrorAction SilentlyContinue
Remove-Item -Force "$Root\*.tsbuildinfo" -ErrorAction SilentlyContinue

if ($Deep) {
  Write-Host "==> Deep clean: removing node_modules" -ForegroundColor Yellow
  Remove-Item -Recurse -Force "$Root\node_modules" -ErrorAction SilentlyContinue
}

# Verify port is free
Start-Sleep -Seconds 1
$still = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($still) {
  Write-Host "Warning: port $Port may still be in use." -ForegroundColor Yellow
} else {
  Write-Host "Port $Port is free." -ForegroundColor Green
}

Write-Host "Environment clean. Run 'make start' to boot again." -ForegroundColor Green
