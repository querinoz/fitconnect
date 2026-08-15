# qa/cross-platform — android subset + web cockpit tests. Emulator not implied.
$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
& (Join-Path $Root "qa\web\run.ps1")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& (Join-Path $Root "qa\android\run.ps1")
exit $LASTEXITCODE
