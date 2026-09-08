# Android Phone Validation — Path A

**Date:** 2026-09-08  
**Package:** `com.fitconnect.android`  
**APK:** `android/app/build/outputs/apk/debug/app-debug.apk`

## Devices

| Device | Serial | Result |
|--------|--------|--------|
| Emulator `sdk_gphone16k_x86_64` | `emulator-5554` | PASS — install + Maestro smoke EXIT 0 |
| Redmi Note 9S (wireless ADB) | intermittent | BLOCKED_DEVICE — disappeared after adb restart / MIUI |

## Commands run

```powershell
adb devices -l
adb -s emulator-5554 install -r app\build\outputs\apk\debug\app-debug.apk
maestro --device emulator-5554 test maestro/smoke/cold_launch.yaml
# Prior wave: athlete/coach/cross-role Maestro EXIT 0
.\gradlew.bat :app:assembleDebug
```

## Runtime

- Cold launch: PASS (smoke)
- Auth welcome / Continue: PASS
- Athlete/Coach shells: PASS (Maestro prior hardening)
- logcat FATAL spot (prior wave): no unresolved FATAL EXCEPTION

## Human action for Redmi

1. Enable USB debugging + wireless debugging  
2. `adb connect <ip>:port`  
3. Re-run install + Maestro athlete journey on physical serial  

Do **not** mark physical-device PASS until `adb devices` shows the Redmi stably.
