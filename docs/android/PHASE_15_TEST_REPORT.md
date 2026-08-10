# PHASE_15_TEST_REPORT.md

**Date:** 2026-08-10  
**Command:** `.\gradlew.bat test` then `:app:assembleDebug`  
**Result:** BUILD SUCCESSFUL

## Counts

| Metric | Value |
|--------|-------|
| TOTAL unit tests (TEST-*.xml sum) | **141** |
| Failures | **0** |
| Errors | **0** |
| Baseline Phase 14 | 135 |
| Delta | +6 |

### Added / expanded this phase

| Suite | Tests | Purpose |
|-------|-------|---------|
| `LiveSessionPreviewMachineTest` | 3 | LOCAL_DEMO session FSM |
| `OnboardingPrefsTest` | 2 | Athlete/coach onboarding prefs |
| `GeoEngineTest.bookingRevisionsBumpOnCreate` | 1 | Booking list mutation observability |
| `GeoEngineTest` Tomás offline search | (existing nearby test) | Identity consistency |

## Module snapshots (selected)

| Suite | tests | fail |
|-------|-------|------|
| AiEngineTest | 17 | 0 |
| LocalAuthRepositoryTest | 11 | 0 |
| GeoEngineTest | 8 | 0 |
| SportsIntelligenceTest | 13 | 0 |
| LiveSessionPreviewMachineTest | 3 | 0 |
| OnboardingPrefsTest | 2 | 0 |
| LocalAthleteRepositoryTest | 3 | 0 |
| LocalCoachRepositoryTest | 4 | 0 |
| NavGuardTest | 5 | 0 |
| AppDestinationTest | 2 | 0 |

## Build

| Artifact | Result |
|----------|--------|
| `:app:assembleDebug` | PASS |
| APK | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Size | ~16.29 MB |
| Package | `com.fitconnect.android.debug` |
| Timestamp | 2026-08-10T19:14:01+01:00 |

## Not run / not claimed

| Check | Status |
|-------|--------|
| Maestro CLI | Absent (`where maestro` failed) |
| Instrumented / device UI | No adb devices |
| Firebase Test Lab | PENDING_HUMAN |
| Release signing | PENDING_HUMAN / fail-closed |
| Performance profiler | UNVERIFIED |

## Cleanup

No files deleted solely on “looks unused”. Design catalog empty `onClick` retained (showcase). Community engine orphans left pending reference proof.
