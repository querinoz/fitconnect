---
name: android-emulator-skill
description: FitConnect-local Android emulator + Gradle verification. Use for assembleDebug, unit tests, adb, dumpsys gfxinfo, and AVD lifecycle. Default AVD is fitconnect_phone.
---

# Android emulator (FitConnect)

Do not create extra AVDs unless honeycomb (or another Canvas) shows jank on `fitconnect_phone`.

## Default device

- AVD: `fitconnect_phone`
- Package (debug): `com.fitconnect.android.debug`
- Gradle: `android/` with `.\gradlew.bat`

## Health

```powershell
adb devices
emulator -list-avds
```

Boot only if no device is connected:

```powershell
emulator -avd fitconnect_phone
```

Wait for `adb wait-for-device` and `sys.boot_completed`.

## Build / install

```powershell
cd android
.\gradlew.bat :app:assembleDebug
adb -s emulator-5554 install -r app\build\outputs\apk\debug\app-debug.apk
adb -s emulator-5554 shell am start -n com.fitconnect.android.debug/com.fitconnect.android.MainActivity
```

## Frame-time gate (honeycomb)

Reset, interact, then dump:

```powershell
adb shell dumpsys gfxinfo com.fitconnect.android.debug reset
# navigate Home, scroll
adb shell dumpsys gfxinfo com.fitconnect.android.debug framestats
```

Budget: honeycomb draw ≤ **1.5ms/frame**. If jank, keep atmosphere **Off** or static mesh — do not add a Pixel 4a AVD unless this device already failed.

## Screenshots

```powershell
adb exec-out screencap -p > docs/qa/elite-os-v2-home.png
```
