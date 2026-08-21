# Phase 08 — Telemetry Audit Report

Scope: entire repository, focused on `android/` (the rebuild target). Web/Expo references noted for context only.

## Findings (before Phase 08)

| Location | What existed | Classification |
|---|---|---|
| `android/athlete/wearables/Wearables.kt` | `WearableGateway` + `ArchitectureWearableGateway`: vendor enum, connect/disconnect/sync stubs, no data model, no capabilities, no provenance | **REMOVE_CANDIDATE → removed** (replaced by `:telemetry` DeviceCenter) |
| `android/athlete/data/AthleteRepository.kt` | Hardcoded HRV 64 ms, sleep 86, resting HR 48 fed into `ReadinessInputs` | **MIGRATED** — now reads `AthleteTelemetryFacade.readinessVitals()` with deterministic fallback |
| `android/coach/domain/Models.kt` + `CoachRepository.kt` | Seeded roster readiness/recovery/hrv numbers in `RosterAthlete` / `AthleteDetail` | **LEGACY** — display-only seed data; coach telemetry section now comes from `CoachTelemetryFacade` (kept for roster list UX; debt logged) |
| `android/sports/performance/PerformanceEngine.kt` | `ReadinessInputs` consumer (hrvMs, sleepQuality, restingHr) | **CORE** — unchanged consumer; now fed from telemetry |
| `android/sports/domain/Definitions.kt` | `WearableCapability` enum on sport definitions | **CORE** — sport-level capability description, not provider logic |
| `android/foundation/permissions/Permissions.kt` | Generic runtime permission model | **CORE** — reused |
| Web (`packages/strava-integration`, readiness libs) | Mature Strava OAuth/webhook/proxy | Out of Android scope; the Android `StravaProvider` adapter mirrors its metric surface |

## Searched terms
Health data, heart rate, HRV, sleep, steps, calories, distance, GPS, workout data, recovery, readiness, VO2 max, respiratory rate, SpO2, body temperature, weight, body composition, training load, stress, device connections, wearable integrations, Health Connect, Google Fit, Garmin, WHOOP, Oura, Fitbit, Samsung Health, Polar, Strava, Apple Health, Bluetooth, BLE, background sync.

## Conclusion
No canonical telemetry model, no provider abstraction, no sync engine, no provenance, no unit/time system existed on Android. Phase 08 built all of it in a new `:telemetry` module; the single legacy surface (`Wearables.kt`) was deleted after replacement, tests passing, zero remaining references.
