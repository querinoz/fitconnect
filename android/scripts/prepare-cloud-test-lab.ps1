# Prepare / validate Firebase Test Lab tooling without requiring human auth.
# Usage: powershell -File android/scripts/prepare-cloud-test-lab.ps1

$ErrorActionPreference = "Continue"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$outDir = Join-Path $root "docs\phase-13r"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$statusPath = Join-Path $outDir "CLOUD_TEST_AUTH.md"

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("# CLOUD_TEST_AUTH")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
[void]$sb.AppendLine("")

$gcloud = Get-Command gcloud -ErrorAction SilentlyContinue
if ($gcloud) {
    [void]$sb.AppendLine("- gcloud: FOUND ($($gcloud.Source))")
    $ver = (& gcloud version 2>&1 | Out-String).Trim()
    [void]$sb.AppendLine('```')
    [void]$sb.AppendLine($ver)
    [void]$sb.AppendLine('```')
    $auth = (& gcloud auth list 2>&1 | Out-String)
    if ($auth -match "ACTIVE") {
        [void]$sb.AppendLine("- CLOUD_TEST_AUTH: CONFIGURED (active account present)")
        [void]$sb.AppendLine("- GATE: UNLOCKED for Test Lab submit (still requires project + billing)")
    } else {
        [void]$sb.AppendLine("- CLOUD_TEST_AUTH: PENDING_HUMAN")
        [void]$sb.AppendLine("- Action: gcloud auth login then gcloud config set project <PROJECT_ID>")
    }
} else {
    [void]$sb.AppendLine("- gcloud: MISSING")
    [void]$sb.AppendLine("- CLOUD_TEST_AUTH: PENDING_HUMAN")
    [void]$sb.AppendLine("- Install: https://cloud.google.com/sdk/docs/install")
}

[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Matrix (ready when auth + APK exist)")
[void]$sb.AppendLine("")
[void]$sb.AppendLine('```powershell')
[void]$sb.AppendLine("cd android")
[void]$sb.AppendLine(".\gradlew :app:assembleDebug")
[void]$sb.AppendLine('$apk = Resolve-Path .\app\build\outputs\apk\debug\app-debug.apk')
[void]$sb.AppendLine("gcloud firebase test android run ``")
[void]$sb.AppendLine("  --type instrumentation ``")
[void]$sb.AppendLine("  --app `$apk ``")
[void]$sb.AppendLine("  --device model=Pixel2,version=30,locale=en,orientation=portrait ``")
[void]$sb.AppendLine("  --timeout 15m")
[void]$sb.AppendLine('```')
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Maestro-on-device local alternative: android/scripts/run-maestro-local.ps1")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("This script never claims Test Lab PASS without authenticated submit evidence.")

[System.IO.File]::WriteAllText($statusPath, $sb.ToString())
Write-Host "Wrote $statusPath"
Get-Content $statusPath
