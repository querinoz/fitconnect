# Load STRIPE_SECRET_KEY from .env.local for Stripe CLI commands.
param(
  [string]$EnvFile = (Join-Path (Join-Path $PSScriptRoot "..") ".env.local")
)

if (-not (Test-Path $EnvFile)) { return }

Get-Content $EnvFile | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#")) { return }
  $eq = $line.IndexOf("=")
  if ($eq -lt 1) { return }
  $name = $line.Substring(0, $eq).Trim()
  $value = $line.Substring($eq + 1).Trim().Trim('"').Trim("'")
  if ($name -eq "STRIPE_SECRET_KEY" -and $value -and -not $value.Contains("PASTE")) {
    $env:STRIPE_API_KEY = $value
  }
}
