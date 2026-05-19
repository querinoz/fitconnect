# FitConnect — Convex cloud + Vercel env sync
# Run from repo root after: npx convex login

$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "Deploying Convex functions to cloud..." -ForegroundColor Cyan
npx convex deploy --yes 2>$null
if ($LASTEXITCODE -ne 0) {
  npx convex deploy
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

# Read deployment URL from .env.local
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
  Write-Error ".env.local not found. Run 'npx convex dev --once' first."
}

$convexUrl = (Get-Content $envFile | Where-Object { $_ -match '^NEXT_PUBLIC_CONVEX_URL=' }) -replace '^NEXT_PUBLIC_CONVEX_URL=', '' -replace '"', ''
if (-not $convexUrl -or $convexUrl -match '127\.0\.0\.1|localhost') {
  Write-Error "NEXT_PUBLIC_CONVEX_URL is still local. Complete 'npx convex login' and redeploy."
}

Write-Host "Convex URL: $convexUrl" -ForegroundColor Green

Write-Host "Syncing Vercel environment variables..." -ForegroundColor Cyan
echo $convexUrl | pnpm dlx vercel@latest env add NEXT_PUBLIC_CONVEX_URL production --force 2>$null
echo $convexUrl | pnpm dlx vercel@latest env add NEXT_PUBLIC_CONVEX_URL preview --force 2>$null
echo $convexUrl | pnpm dlx vercel@latest env add NEXT_PUBLIC_CONVEX_URL development --force 2>$null

echo "convex" | pnpm dlx vercel@latest env add NEXT_PUBLIC_REALTIME_PROVIDER production --force 2>$null
echo "convex" | pnpm dlx vercel@latest env add NEXT_PUBLIC_REALTIME_PROVIDER preview --force 2>$null
echo "convex" | pnpm dlx vercel@latest env add NEXT_PUBLIC_REALTIME_PROVIDER development --force 2>$null

Write-Host "Redeploying Vercel production..." -ForegroundColor Cyan
pnpm dlx vercel@latest --prod --yes

Write-Host "Done. Verify: curl https://fitconnect-phi.vercel.app/api/health" -ForegroundColor Green
