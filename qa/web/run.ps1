# qa/web — targeted web tests for the mobile cockpit. Not a full turbo test.
$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $Root
pnpm --filter @fitconnect/web exec vitest run components/mobile/elite-mobile-cockpit.test.tsx components/dashboard/mobile-app-preview.test.tsx
exit $LASTEXITCODE
