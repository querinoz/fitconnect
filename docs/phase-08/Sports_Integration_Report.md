# Phase 08 — Sports Integration Report

## Boundary
**Telemetry provides data. Sports Engine interprets sport context.** The bridge (`SportsTelemetryBridge`, in `:telemetry`) speaks plain sport keys; `:app` resolves keys to `SportId` via the Sports registry and records `MetricSample`s into the Sports `MetricsEngine`. `:telemetry` has no dependency on `:sports` and vice versa.

## Per-sport metric mapping (bridge)
| Sport | Canonical metrics surfaced |
|---|---|
| running | pace, cadence, heart rate, power, elevation, distance |
| cycling | power, cadence, speed, heart rate, elevation |
| swimming | stroke-rate (cadence), distance, heart rate |
| football | distance, speed, heart rate |
| default | heart rate, calories, distance |

`sessionMetrics(workout)` derives session-level values from a normalized `WorkoutSession` (including computed pace = duration/km) and filters to the sport's relevant set.

## Flow
```
WorkoutSession (normalized, deduped, provenance)
  → SportsTelemetryBridge.sessionMetrics
    → :app resolves sportKey → SportId (registry.discover)
      → sports MetricsEngine.record(MetricSample(source = "telemetry"))
        → PerformanceEngine / analytics consume as before
```

Readiness inputs (HRV/sleep/resting HR) flow separately through `AthleteTelemetryFacade.readinessVitals` → `ReadinessInputs` → sports `PerformanceEngine` — calculations unchanged, data source upgraded.

Verified: `CapabilityAndFacadeTest.sportsBridgeMapsWorkoutToSportMetrics` (HR/distance passthrough + pace derivation: 3600 s / 12 km = 300 s/km).
