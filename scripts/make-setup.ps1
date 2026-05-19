# FitConnect - bootstrap local environment (Windows)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is required. Install from https://nodejs.org/" -ForegroundColor Red
  exit 1
}

$envExample = Join-Path $Root ".env.example"
$envLocal = Join-Path $Root ".env.local"

if (-not (Test-Path $envLocal)) {
  if (Test-Path $envExample) {
    Copy-Item $envExample $envLocal
    Write-Step "Created .env.local from .env.example (demo mode defaults)"
  } else {
    Write-Host ".env.example not found - skipping env bootstrap" -ForegroundColor Yellow
  }
} else {
  Write-Step ".env.local present"
}

$webEnvLocal = Join-Path $Root "apps\web\.env.local"
if (-not (Test-Path $webEnvLocal) -and (Test-Path $envLocal)) {
  Copy-Item $envLocal $webEnvLocal
  Write-Step "Synced .env.local to apps/web"
}

if (-not (Test-Path (Join-Path $Root "node_modules"))) {
  Write-Step "Installing pnpm dependencies"
  if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm install
  } else {
    npm install -g pnpm
    pnpm install
  }
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
  Write-Step "node_modules OK"
}

Write-Step "Generating Prisma client"
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
  pnpm run db:generate
} else {
  npm run db:generate
}
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

function Test-RealDatabaseUrl {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return $false }
  $line = Select-String -Path $Path -Pattern '^\s*DATABASE_URL\s*=' | Select-Object -First 1
  if (-not $line) { return $false }
  $value = ($line.Line -replace '^\s*DATABASE_URL\s*=\s*', '').Trim().Trim('"').Trim("'")
  if ([string]::IsNullOrWhiteSpace($value)) { return $false }
  if ($value -match 'user:pass@host') { return $false }
  if ($value -match 'your-project') { return $false }
  return $true
}

if (Test-RealDatabaseUrl $envLocal) {
  Write-Step "DATABASE_URL detected - syncing schema and seeding"
  npm run db:push
  if ($LASTEXITCODE -ne 0) {
    Write-Host "db:push failed - continuing in demo/seed fallback mode" -ForegroundColor Yellow
  } else {
    npm run db:seed
    if ($LASTEXITCODE -ne 0) {
      Write-Host "db:seed failed - continuing with in-memory demo data" -ForegroundColor Yellow
    }
  }
} else {
  Write-Step "No real DATABASE_URL - demo mode (seed data from lib/dashboard/seed.ts)"
}

Write-Host "Setup complete." -ForegroundColor Green
