# Probe emulator only — never fake a device.
$sdk = $env:ANDROID_HOME; if (-not $sdk) { $sdk = $env:ANDROID_SDK_ROOT }; if (-not $sdk) { $sdk = "$env:LOCALAPPDATA\Android\Sdk" }
$emu = Join-Path $sdk "emulator\emulator.exe"
if (-not (Test-Path $emu)) {
    Write-Host "EMULATOR = FAIL (binary missing)"
    exit 1
}
$accel = & $emu -accel-check 2>&1 | Out-String
Write-Host $accel
if ($accel -match "hypervisor driver is not installed" -or $accel -match "accel:\s*[1-9]") {
    Write-Host "EMULATOR = FAIL (PENDING_HUMAN: enable VT-x/AMD-V + AEHD)"
    exit 1
}
$adb = Get-Command adb -ErrorAction SilentlyContinue
if ($adb) {
    $list = adb devices
    Write-Host $list
    if ($list -notmatch "device$") {
        Write-Host "EMULATOR = FAIL (no adb device)"
        exit 1
    }
}
Write-Host "EMULATOR = PASS"
exit 0
