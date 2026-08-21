# Phase 08 — Athlete Integration Report

## Entry point: `AthleteTelemetryFacade` (via `AthleteContainer.telemetry`)

| Athlete OS surface | Telemetry consumption |
|---|---|
| Readiness (Home) | `LocalAthleteRepository.home()` reads `readinessVitals()` (HRV, sleep, resting HR) and feeds `ReadinessInputs` → Sports `PerformanceEngine`. Deterministic baseline values remain only as fallback when no provider has synced. |
| Recovery screen | `recovery()` reads the same normalized vitals |
| Telemetry Center (`athlete/telemetry`, deep link `fitconnect://app/athlete/telemetry`) | devices + state + last sync, sample count, metric coverage, latest HR/HRV/sleep/weight, 14-day HRV & sleep charts (daily aggregates), imported workouts with merged provenance ("via garmin + strava") |
| Profile → Connected devices | `DeviceCenter.devices()` with Connect / Sync now actions + "Open Telemetry Center" |
| Calculations in UI? | **None.** UI renders `TelemetryOverview`, `AggregateSeries`, `DeviceEntry` — all computed in `:telemetry` |

## Rules held
- No provider types imported by any athlete UI file (grep-verified).
- The legacy `athlete/wearables/Wearables.kt` gateway was deleted; `AthleteContainer` now exposes `TelemetryContainer` instead.
- Readiness math stays in `:sports` `PerformanceEngine`; telemetry only supplies normalized inputs.

Verified: `LocalAthleteRepositoryTest` (repo wiring with real `DefaultTelemetryContainer`), `CapabilityAndFacadeTest.athleteFacadeExposesVitalsAndOverview`, Maestro flow `smoke-telemetry-center.yaml`.
