# Print (and optionally save) the local Stripe CLI webhook signing secret.
# This is NOT on the API keys page — only from `stripe listen` or this command.

param(
  [switch]$Save
)

$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "stripe-load-env.ps1")

if (-not $env:STRIPE_API_KEY) {
  Write-Host "Add STRIPE_SECRET_KEY (sk_test_...) to .env.local first." -ForegroundColor Red
  exit 1
}

$whsec = stripe listen --print-secret 2>$null
if (-not $whsec -or -not $whsec.StartsWith("whsec_")) {
  Write-Host "Could not get whsec from Stripe CLI." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "STRIPE_WEBHOOK_SECRET (local dev only):" -ForegroundColor Cyan
Write-Host $whsec
Write-Host ""

if ($Save) {
  $envFile = Join-Path (Join-Path $PSScriptRoot "..") ".env.local"
  $webEnvFile = Join-Path (Join-Path $PSScriptRoot "..") "apps/web/.env.local"

  foreach ($file in @($envFile, $webEnvFile)) {
    if (-not (Test-Path $file)) { continue }
    $content = Get-Content $file -Raw
    if ($content -match "STRIPE_WEBHOOK_SECRET=") {
      $content = $content -replace "STRIPE_WEBHOOK_SECRET=.*", "STRIPE_WEBHOOK_SECRET=$whsec"
    } else {
      $content += "`nSTRIPE_WEBHOOK_SECRET=$whsec`n"
    }
    Set-Content -Path $file -Value $content.TrimEnd() + "`n" -NoNewline
    Write-Host "Saved to $file" -ForegroundColor Green
  }
  Write-Host "Restart pnpm dev if it is already running." -ForegroundColor Yellow
} else {
  Write-Host "To save automatically: pnpm stripe:whsec --save" -ForegroundColor Gray
}

Write-Host ""
