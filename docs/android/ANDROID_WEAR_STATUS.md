# ANDROID_WEAR_STATUS

**Date:** 2026-08-15

```
WEAR_ENGINEERING_READY = YES
WEAR_DEVICE_TEST       = PENDING_HUMAN
PHONE_WATCH_DATALAYER  = NOT_BOUND
```

## Module

| Item | Value |
|------|--------|
| Gradle | `:wear` |
| applicationId | `com.fitconnect.android.wear` |
| minSdk | 30 |
| standalone | `true` (watch can launch without phone; **not** a claim that sync works) |
| APK | `android/wear/build/outputs/apk/debug/wear-debug.apk` |
| SHA-256 | `76E51897A69D5A5E26A995BA5C7AA6006AF0BA03EDB44CF4E09F601E8142EFC5` |
| assemble | PASS (`:wear:assembleDebug`) |

## What the watch does (LOCAL_DEMO)

`WearMainActivity` hosts `LiveActivityEngine`:

- Home labels: FitConnect, readiness stub `78`, `LOCAL_DEMO`
- START / PAUSE / RESUME / END
- Elapsed time + simulated HR / zone

This is **not** hardware HR, GPS, or a copy of the phone app.

## Phone ↔ watch

| Port | Implementation |
|------|----------------|
| `WearableCompanionPort` | `NoWearCompanion` → `NOT_PAIRED` |
| `WearWorkoutControlPort` | `NoWearWorkoutControl` no-op |
| DataLayer / `MessageClient` | not wired |

Starting an activity on the phone does **not** start the watch (and vice versa).

## What was not executed

- Wear emulator / physical watch
- Play Services Wearable pairing
- Battery traces
- Watch face (out of product scope)

Do not mark Wear as production-ready until a human pairs a device and replaces `NoWearCompanion`.
