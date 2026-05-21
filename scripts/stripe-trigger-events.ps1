# Trigger sample Stripe test events (uses STRIPE_SECRET_KEY from .env.local).
# Run while `pnpm stripe:listen` and `pnpm dev` are active.

$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "stripe-load-env.ps1")

if (-not $env:STRIPE_API_KEY) {
  Write-Host "Missing STRIPE_SECRET_KEY in .env.local" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Triggering FitConnect test events..." -ForegroundColor Cyan
Write-Host ""

$events = @(
  "checkout.session.completed",
  "payment_intent.succeeded",
  "customer.subscription.created"
)

foreach ($event in $events) {
  Write-Host "stripe trigger $event" -ForegroundColor Green
  stripe trigger $event
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed. Try: pnpm stripe:login" -ForegroundColor Red
    exit $LASTEXITCODE
  }
  Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "Done. Check stripe listen terminal for HTTP 200." -ForegroundColor Cyan
Write-Host ""
