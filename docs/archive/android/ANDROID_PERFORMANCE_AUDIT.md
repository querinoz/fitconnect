# ANDROID_PERFORMANCE_AUDIT.md

**Date:** 2026-08-09

## MEASURED

| Item | Result |
|------|--------|
| `:app:assembleDebug` after clean | Completes (see final report timing) |
| Unit test suite size | See final report count |
| StartupTracer marks | Logged in FitConnectApplication (foundation/shell) |

## NOT MEASURED (no device / profiler session)

| Item | Status |
|------|--------|
| Cold start TTI on Pixel | NOT MEASURED |
| Frame jank / Compose recomposition counts | NOT MEASURED |
| Map memory with MapLibre SDK | N/A — in-memory controller |
| Battery / FCM wakeups | NOT MEASURED |
| APK/AAB size (release signed) | NOT MEASURED (unsigned release blocked) |

## Engineering observations (not benchmarks)

- Feature containers are lazy — good for splash.  
- EncryptedSecureStore deferred via `by lazy`.  
- Community seed runs once per container (`AtomicBoolean`).  
- Avoid polling; connectivity is callback-based.

## Verdict

**PERFORMANCE: UNVERIFIED** for release numbers.  
**PERFORMANCE engineering hygiene: PASS** (no invented FPS/ms claims).
