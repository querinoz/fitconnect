# FitConnect environment doctor (Windows)
param()
$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Score([string]$name, [string]$status, [string]$detail) {
    $color = switch ($status) {
        "PASS" { "Green" }
        "WARN" { "Yellow" }
        "FAIL" { "Red" }
        default { "DarkYellow" }
    }
    Write-Host ("  {0,-16} {1,-16} {2}" -f $name, $status, $detail) -ForegroundColor $color
}

Write-Host ""
Write-Host "FITCONNECT DOCTOR" -ForegroundColor Cyan
Write-Host ""

$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) { Score "Node" "PASS" (node -v) } else { Score "Node" "FAIL" "not on PATH" }

$pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
if ($pnpm) { Score "pnpm" "PASS" (pnpm -v) } else { Score "pnpm" "FAIL" "not on PATH" }

$git = Get-Command git -ErrorAction SilentlyContinue
if ($git) { Score "Git" "PASS" ((git --version) -replace "git version ","") } else { Score "Git" "FAIL" "not on PATH" }

$py = Get-Command python -ErrorAction SilentlyContinue
if ($py) { Score "Python" "PASS" ((python --version) 2>&1) } else { Score "Python" "WARN" "needed for android:qr" }

$java = Get-Command java -ErrorAction SilentlyContinue
if ($java) { Score "Java" "PASS" ((java -version 2>&1 | Select-Object -First 1) -join "") } else { Score "Java" "WARN" "Gradle may still bundle a JDK" }

$sdk = $env:ANDROID_HOME
if (-not $sdk) { $sdk = $env:ANDROID_SDK_ROOT }
if (-not $sdk) { $sdk = "$env:LOCALAPPDATA\Android\Sdk" }
if (Test-Path $sdk) { Score "Android SDK" "PASS" $sdk } else { Score "Android SDK" "FAIL" "not found" }

$adb = Get-Command adb -ErrorAction SilentlyContinue
if ($adb) {
    $devs = (adb devices 2>&1 | Select-Object -Skip 1 | Where-Object { $_ -match "device$" })
    if ($devs) { Score "ADB" "PASS" ($devs -join ", ") } else { Score "ADB" "WARN" "no devices" }
} else { Score "ADB" "WARN" "not on PATH" }

$emu = Join-Path $sdk "emulator\emulator.exe"
if (Test-Path $emu) {
    $accel = & $emu -accel-check 2>&1 | Out-String
    if ($accel -match "accel:\s*0" -or $accel -match "is operational") {
        Score "Emulator" "PASS" "acceleration OK"
    } else {
        Score "Emulator" "FAIL" "hypervisor missing - PENDING_HUMAN BIOS/AEHD"
    }
} else { Score "Emulator" "FAIL" "emulator.exe missing" }

$gw = Join-Path $Root "android\gradlew.bat"
if (Test-Path $gw) { Score "Gradle" "PASS" "android/gradlew.bat" } else { Score "Gradle" "FAIL" "missing" }

$maestro = Get-Command maestro -ErrorAction SilentlyContinue
if ($maestro) { Score "Maestro" "PASS" "on PATH" } else { Score "Maestro" "WARN" "not on PATH; UI flows not executable" }

$gcloud = Get-Command gcloud -ErrorAction SilentlyContinue
if ($gcloud) { Score "gcloud" "PASS" "on PATH" } else { Score "gcloud" "PENDING_HUMAN" "not required for LOCAL_DEMO" }

Write-Host ""
Write-Host "Kotlin compiles via Android Gradle Plugin."
Write-Host ""
