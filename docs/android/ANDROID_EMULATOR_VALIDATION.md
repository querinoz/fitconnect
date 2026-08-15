# ANDROID_EMULATOR_VALIDATION.md

**Date:** 2026-08-10  
**Mode:** Emulator-first LOCAL_DEBUG validation  
**Commit:** working tree (uncommitted)

## Environment discovery

| Item | Result |
|------|--------|
| ANDROID_HOME / ANDROID_SDK_ROOT | `C:\Users\duhqu\AppData\Local\Android\Sdk` |
| adb | present (1.0.41 / platform-tools) |
| emulator | present |
| avdmanager / sdkmanager | present (cmdline-tools latest) |
| AVD | `fitconnect_phone` (Pixel 7, google_apis_playstore/x86_64, Android 17 / API 37 image) |

## Emulator start attempt — EVIDENCE

```
ERROR | x86_64 emulation currently requires hardware acceleration!
CPU Acceleration status: Android Emulator hypervisor driver is not installed on this machine
emulator -accel-check → accel: 6 (AEHD not installed)
systeminfo → Virtualization Enabled In Firmware: No
```

Actions attempted:

1. Start `fitconnect_phone` (default + `-gpu swiftshader_indirect`) → **failed** (accel required).
2. Installed SDK package `extras;google;Android_Emulator_Hypervisor_Driver` (files present under `extras/google/...`).
3. Ran `silent_install.bat` / elevated RunAs → **AEHD still not installed** (`accel: 6`).
4. `adb devices` remained empty — **no emulator ever reached `device` state**.

## Human-owned machine prerequisites (cannot be completed by agent alone)

1. Enable **Virtualization (VT-x / AMD-V)** in BIOS/UEFI firmware.  
2. Reboot. Confirm `systeminfo` shows `Virtualization Enabled In Firmware: Yes`.  
3. Install AEHD with admin rights:  
   `Android\Sdk\extras\google\Android_Emulator_Hypervisor_Driver\silent_install.bat`  
4. Confirm `emulator -accel-check` is healthy.  
5. Re-run: start AVD → `adb install` → launch → Maestro.

## Gates

| Gate | Status |
|------|--------|
| EMULATOR_LAUNCH | **BLOCKED** (hypervisor / firmware VT-x) |
| LOCAL_DEMO_EMULATOR | **BLOCKED** (no boot) |
| VISUAL_EMULATOR | **BLOCKED** (no screenshots — none fabricated) |
| MAESTRO_EMULATOR | **BLOCKED** (no device; Maestro CLI also previously absent) |
| UNIT_TESTS | **PASS 141/141** |
| assembleDebug | **PASS** |
| INSTALL / LAUNCH / CRASH on emulator | **NOT EXECUTED** |

## APK (built; not emulator-installed)

| Field | Value |
|-------|--------|
| Path | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Package | `com.fitconnect.android.debug` |
| Launch Activity | `com.fitconnect.android.MainActivity` |
| Size | 17081393 |
| SHA-256 | `63c9ca5e092d5dd7fad8999250a3f4599b341e7f0515ff781cbd8343d4d90db1` |
| version | 0.1.0-rc.1 (13) |

## Code fix prepared (LOCAL_DEMO isolation — not emulator-proven)

`android/app/src/debug/AndroidManifest.xml` removes Firebase auto-init / FCM services from **debug** when `google-services.json` is absent (merged debug manifest no longer contains `FirebaseInitProvider` / FCM service entries). Release fail-closed unchanged.

## Distinction

| Emulator can close (when accel works) | Still PENDING_HUMAN / LOCKED |
|---------------------------------------|------------------------------|
| LOCAL_DEBUG_LAUNCH | PHYSICAL_DEVICE_CERTIFICATION |
| LOCAL_DEMO functional QA | PRODUCTION_AUTH / FCM_PRODUCTION |
| VISUAL / Maestro on emulator | TEST_LAB / PRODUCTION_SIGNING / PLAY |

## Log artifacts

- `qa/reports/android-emulator-stderr.log` — acceleration failure  
- `qa/reports/android-emulator-stdout.log`  
- `qa/reports/android-emulator-assemble.log`

## Final state

```
EMULATOR_LAUNCH = BLOCKED
LOCAL_DEMO_EMULATOR = BLOCKED
VISUAL_EMULATOR = BLOCKED
MAESTRO_EMULATOR = BLOCKED
UNIT_TESTS = PASS (141/141)
PRODUCTION_* = PENDING_HUMAN
PLAY = LOCKED
```
