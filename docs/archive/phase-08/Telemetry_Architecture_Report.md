# Phase 08 — Telemetry Architecture Report

## Module: `:telemetry` (`com.fitconnect.android.telemetry`)

Provider-agnostic telemetry platform. Depends only on `:foundation`. UI-free.

```
telemetry/
├── domain/        Canonical models (TelemetrySample, WorkoutSession, SleepSession,
│                  LocationSample, BloodPressureSample, BodyComposition, Provenance,
│                  MetricType, ProviderId, DataQuality)
├── units/         TelemetryUnit, UnitConverter (explicit table), CanonicalUnits
├── time/          TelemetryInstant (epoch + zone offset), TelemetryClock, TimeRange
├── quality/       DataQualityEngine — flags, never mutates values
├── capability/    ProviderCapabilities + CapabilityRegistry
├── provider/      TelemetryProvider contract, ProviderException taxonomy,
│                  8 adapters (HealthConnect, Garmin, WHOOP, Oura, Fitbit, Polar,
│                  SamsungHealth, Strava), SimulatedProviderSource
├── store/         TelemetryStore port + InMemoryTelemetryStore (indexed, paginated)
├── sync/          TelemetrySyncEngine (checkpoint, retry/backoff, offline queue),
│                  DeduplicationEngine, BackgroundSyncPolicy
├── aggregate/     AggregationEngine (hourly/daily/weekly/monthly, rolling avg, percentile)
├── privacy/       TelemetryPrivacyManager (consent, coach sharing, audit trail, deletion)
├── observability/ TelemetryObservability (operational counters only)
├── devices/       DeviceCenter (connection UX backbone)
├── integration/   AthleteTelemetryFacade, CoachTelemetryFacade, SportsTelemetryBridge
├── wear/          WearableCompanionPort, WearWorkoutControlPort (+ NoWearCompanion)
└── di/            TelemetryContainer / DefaultTelemetryContainer
```

## Data flow

```
Provider adapter → ProviderPage (canonical models + provenance)
  → SyncEngine (retry, pagination, checkpoint)
    → DataQualityEngine (assess + flag; INVALID rejected & counted)
    → DeduplicationEngine (workouts merged, provenance preserved)
    → TelemetryStore (idempotent upsert by record id + source index)
      → AggregationEngine → Facades → Athlete OS / Coach OS / Sports Engine
```

## Absolute rule enforcement
- Providers are only constructed inside `DefaultTelemetryContainer`.
- UI consumes `DeviceEntry`, `TelemetryOverview`, `AggregateSeries`, `CoachAthleteTelemetry` — never provider types.
- Grep-verified: no `*Provider` class referenced under any `ui/` package.
- `ProviderId` appears in UI only as an opaque handle passed back to `DeviceCenter`.

## Dependency direction
`:app → :athlete/:coach → :telemetry → :foundation`. `:telemetry` does not depend on `:sports` or `:geo`; the `SportsTelemetryBridge` speaks in plain sport keys, and `:app` performs the registry lookup when feeding the Sports Engine.

## Simulated mode
Vendor SDKs/OAuth credentials are not available in this build. Every adapter runs against `SimulatedProviderSource` (deterministic per provider+athlete+day → idempotent re-sync, stable source ids). The provider contract, capability matrix, failure taxonomy, permission/consent flows and sync semantics are final; swapping in a real SDK touches exactly one adapter class.
