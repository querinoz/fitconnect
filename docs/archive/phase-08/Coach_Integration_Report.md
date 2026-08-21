# Phase 08 — Coach Integration Report

## Entry point: `CoachTelemetryFacade` (via `CoachContainer.coachTelemetry`)

| Coach OS surface | Telemetry consumption |
|---|---|
| Athlete detail → "Telemetry (athlete-authorized)" | `athleteTelemetry(coachId, athleteId)` → shared metric set, latest value per shared metric, 14-day trend delta |
| Empty state | "No telemetry shared with you. The athlete controls sharing from their Telemetry Center." — coach never sees a hint of unshared data |
| Recovery / readiness / training load / sleep | available exactly when the athlete shares those `MetricType`s |
| Data coverage & quality | shared metric set is the coverage; quality flags ride on provenance in the store |
| Privacy state | absence of metrics **is** the privacy state; every read passes `coachMayRead` and is audit-trailed |

## Authorization model
- Sharing is athlete-initiated (`shareWithCoach`), per coach, per metric.
- Revocation is immediate and verified by test.
- The coach module has no reference to `TelemetryStore` or providers — only the filtered facade.

## Demo wiring
Debug builds seed a Health Connect sync for roster athlete `a1` and share HRV / sleep / recovery / resting HR / training load with `coach-1` through the same public APIs (see `FitConnectApplication.bootstrapDemoTelemetry`). Roster ids (`a1..a4`) vs athlete-app id (`ath-1`) unification is logged in Technical_Debt.md.

Verified: `PrivacyAndDeviceCenterTest.coachSeesOnlySharedMetrics`, `revocationIsRespectedImmediately`, `auditTrailRecordsAccessAndConsent`; coach module unit suites still green.
