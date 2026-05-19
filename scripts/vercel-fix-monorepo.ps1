# Fix Vercel monorepo project settings for fitconnect (Root Directory = apps/web)
$ErrorActionPreference = "Stop"

$authPath = Join-Path $env:APPDATA "xdg.data\com.vercel.cli\auth.json"
if (-not (Test-Path $authPath)) {
  $authPath = Join-Path $env:LOCALAPPDATA "com.vercel.cli\auth.json"
}
if (-not (Test-Path $authPath)) {
  Write-Error "Run 'pnpm dlx vercel login' first."
}

$token = (Get-Content $authPath -Raw | ConvertFrom-Json).token
$projectId = "prj_pKMuoSnikUhpD7aufvMinPFn1Ar0"

$body = @{
  rootDirectory = "apps/web"
  installCommand = "cd ../.. && pnpm install --frozen-lockfile"
  buildCommand = "cd ../.. && pnpm turbo build --filter=@fitconnect/web"
  outputDirectory = ".next"
  framework = "nextjs"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method PATCH `
  -Uri "https://api.vercel.com/v9/projects/$projectId" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body | Out-Null

Write-Host "Updated querinoz/fitconnect -> Root Directory: apps/web" -ForegroundColor Green
Write-Host "Deploy from repo root: pnpm deploy:vercel:prod"
