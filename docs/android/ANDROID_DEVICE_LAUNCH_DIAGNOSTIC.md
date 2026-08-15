# ANDROID_DEVICE_LAUNCH_DIAGNOSTIC.md

**DATE:** 2026-08-10  
**COMMIT:** working tree  
**DEVICE_AVAILABLE (physical):** NO (`adb devices` empty)  
**EMULATOR_AVAILABLE:** AVD exists (`fitconnect_phone`) but **cannot boot** — see below  

## DEVICE_MODEL / ANDROID_VERSION

N/A on agent session — emulator did not reach `adb device` state.

## APK

| Field | Value |
|-------|--------|
| Path | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Package | `com.fitconnect.android.debug` |
| Launch Activity | `com.fitconnect.android.MainActivity` |
| SHA-256 | `63c9ca5e092d5dd7fad8999250a3f4599b341e7f0515ff781cbd8343d4d90db1` |

## LAUNCH_ACTIVITY

Confirmed via source + merged debug manifest + `aapt dump badging`:

- MAIN + LAUNCHER + `exported=true`
- Application: `FitConnectApplication`

## ROOT_CAUSE (two layers)

### A) Emulator cannot run on this PC (proven)

```
x86_64 emulation currently requires hardware acceleration!
Android Emulator hypervisor driver is not installed
Virtualization Enabled In Firmware: No
emulator -accel-check → 6
```

Therefore: **no install/launch/logcat on emulator in this session.**

### B) Prior physical-phone “won’t open” (static suspect; not logcat-proven)

DEBUG APK previously merged **FirebaseInitProvider + FCM services** without `google-services.json`.  
Violates LOCAL_DEMO “no Firebase required at startup.”

**FIX applied:** `android/app/src/debug/AndroidManifest.xml` (`tools:node="remove"` for InitProvider + FCM service/receiver).  
Merged debug manifest verified: those components removed; MainActivity launcher retained.

Cannot claim this fixed the physical phone without device retest / logcat.

## EVIDENCE

| Check | Result |
|-------|--------|
| adb devices | empty (no emulator, no phone) |
| emulator start | FAIL (accel) |
| unit tests | 141/141 |
| assembleDebug | PASS |
| logcat | **not captured** (no device) |

## FIX

| File | Change |
|------|--------|
| `android/app/src/debug/AndroidManifest.xml` | Remove Firebase auto-init + FCM from debug |

## TEST_RESULTS / REGRESSION

- `:app:assembleDebug` PASS  
- `test` tally **141/141**  
- DEVICE_LAUNCH / EMULATOR_LAUNCH = **BLOCKED**

## STATUS

```
DEVICE_LAUNCH = BLOCKED
EMULATOR_LAUNCH = BLOCKED
```

Do not convert to PASS without a running device/emulator and successful `am start` + clean logcat.
