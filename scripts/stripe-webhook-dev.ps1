# Forward Stripe test webhooks to local FitConnect (port 3001).
# Usage:
#   1. pnpm dev          (terminal 1)
#   2. pnpm stripe:listen (terminal 2 - copy whsec to STRIPE_WEBHOOK_SECRET)
#   3. pnpm stripe:trigger (terminal 3)

param(
  [int]$Port = 3001
)

$ErrorActionPreference = "Stop"
$forward = "localhost:$Port/api/stripe/webhook"

. (Join-Path $PSScriptRoot "stripe-load-env.ps1")

if (-not $env:STRIPE_API_KEY) {
  Write-Host "Missing STRIPE_SECRET_KEY in .env.local" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "FitConnect Stripe webhook tunnel" -ForegroundColor Cyan
Write-Host "Forwarding to: http://$forward" -ForegroundColor Gray
Write-Host ""
Write-Host "Copy whsec_... from output into .env.local as STRIPE_WEBHOOK_SECRET" -ForegroundColor Yellow
Write-Host "Then restart pnpm dev." -ForegroundColor Yellow
Write-Host ""

stripe listen --forward-to $forward
