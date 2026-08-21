# ANDROID_FINAL_EXIT_GATE

**Date:** 2026-08-15  
**Package:** `com.fitconnect.android.debug`

```
ENGINEERING_COMPLETE = FAIL
```

Reason: device-dependent acceptance (emulator boot, UI flows, logcat crash/ANR, visual QA) did not execute. Build and unit tests **did** pass.

## Gates

| Gate | Status | Evidence |
|------|--------|----------|
| `:app:assembleDebug` | PASS | APK SHA-256 `A2692518…80F9E8` |
| `:wear:assembleDebug` | PASS | APK SHA-256 `76E51897…E8142EFC5` |
| `.\gradlew.bat test` | PASS | **152/152**, 0 failures, 0 errors |
| `:app:lintDebug` | PASS (warnings only) | 0 errors, 49 warnings |
| Detekt | NOT CONFIGURED | — |
| Emulator boot `sys.boot_completed=1` | FAIL / BLOCKED | `accel: 6`, AEHD missing |
| `adb install` / `am start` | NOT RUN | no device |
| logcat FATAL/ANR | NOT RUN | no device |
| Maestro flows | NOT RUN | no device; CLI not on PATH |
| Stitch visual | BLOCKED | HTTP 500 |
| Production auth | PENDING_HUMAN | — |
| FCM production | PENDING_HUMAN | — |
| Play / signing | LOCKED / PENDING_HUMAN | debug APK only |

## Product box (honest)

| Flag | Value |
|------|--------|
| BUILD | PASS |
| TESTS | 152/152 |
| EMULATOR | FAIL |
| CRASHES (observed) | 0 (no runtime) |
| ANRs (observed) | 0 (no runtime) |
| ATHLETE … OFFLINE (device) | FAIL — unit/code only |
| WEAR ENGINEERING | PASS (APK + LOCAL_DEMO shell) |
| WEAR DEVICE | PENDING_HUMAN |
| VISUAL QA | FAIL (no screenshots) |
| ACCESSIBILITY | ENGINEERING_READY (touch targets / semantics in components; TalkBack not run) |
| SECURITY | ENGINEERING_READY (no secrets invented; LOCAL_DEMO ≠ PRODUCTION) |
| PERFORMANCE | NOT PROFILED on device; lint unused-resources warnings only |
| PRODUCTION AUTH | PENDING_HUMAN |
| FCM | PENDING_HUMAN |
| TEST LAB | PENDING_HUMAN |
| SIGNING | PENDING_HUMAN |
| PLAY | LOCKED |
| ENGINEERING STATUS | FAIL vs ENGINEERING_COMPLETE bar |

## Install for a human (same Wi-Fi)

```powershell
pnpm android:qr
```

APK copy: `.fitconnect-local-distribution/app.apk`

Do not treat this gate as a Play release.
