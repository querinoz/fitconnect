# FitConnect — Vercel link & deploy (run from repo root)
# Requires: Node 20+, pnpm, Vercel account
param(
  [switch]$Production,
  [switch]$SkipEnv
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "`n=== FitConnect Vercel setup ===" -ForegroundColor Cyan
Write-Host "1) Login (browser device flow if needed)"
pnpm dlx vercel@latest login

Write-Host "`n2) Link project (Root Directory = apps/web in Vercel UI if prompted)"
Set-Location apps\web
pnpm dlx vercel@latest link --yes

if (-not $SkipEnv) {
  Write-Host "`n3) Push production env vars (demo-safe defaults)"
  $vars = @{
    "NEXT_PUBLIC_DEMO_MODE" = "true"
    "NEXT_PUBLIC_REALTIME_PROVIDER" = "broadcast"
  }
  foreach ($k in $vars.Keys) {
    $v = $vars[$k]
    Write-Host "  setting $k"
    pnpm dlx vercel@latest env add $k production preview development --force --yes 2>$null
    # vercel env add is interactive; use echo pipe on Unix. On Windows:
    echo $v | pnpm dlx vercel@latest env add $k production 2>$null
  }
  Write-Host "  Tip: add DATABASE_URL / SUPABASE_* from .env.example via Vercel dashboard when ready."
}

Write-Host "`n4) Deploy"
if ($Production) {
  pnpm dlx vercel@latest --prod
} else {
  pnpm dlx vercel@latest
}

Set-Location ..\..
Write-Host "`nDone. Connect GitHub: Vercel dashboard -> Project -> Git -> querinoz/fitconnect, Root Directory apps/web" -ForegroundColor Green
