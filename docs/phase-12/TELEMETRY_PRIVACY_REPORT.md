# Phase 12 — Telemetry Privacy Report

## Implementation

**Primary:** `android/telemetry/src/main/java/com/fitconnect/android/telemetry/privacy/TelemetryPrivacy.kt`

## Consent model

| Scope | Purpose | Default |
|-------|---------|---------|
| `PROVIDER_CONNECTION` | Import from Health Connect / wearables | Explicit grant required |
| `COACH_SHARING` | Share metrics with assigned coach | Explicit grant; athlete-only mutation |
| `ANALYTICS` | Product analytics (separate from provider) | Not conflated with health import |

## Phase 12 fix: coach sharing

```kotlin
// shareWithCoach — actorId must equal athleteId
if (actorId != athleteId) {
    audit += AuditEntry(..., "coach_share_denied:actor_mismatch", ...)
    return false
}
```

**Before:** Coach or client could potentially mutate sharing on behalf of athlete.  
**After:** Only the athlete identity may grant/revoke coach sharing.

## Read path

- `coachMayRead(coachId, athleteId, metric)` — checks `sharedMetrics` map keyed by `athleteId:coachId`
- Every read attempt audit-logged

## Deletion

- `deleteProviderData(athleteId, provider)` — GDPR-style source deletion with audit entry

## Web parity

- Readiness/HRV API routes use `requireAthleteId`
- Strava sync scoped to integration athlete cookie

## Gaps

| Gap | Notes |
|-----|-------|
| Server-side coach share API | Android-only enforcement today for native telemetry store |
| Consent UI persistence | Must sync to server when backend live |
| Metric-level minimization | Coach may receive full shared set — review granularity |

## Tests

- Telemetry unit tests in `android/telemetry/src/test/`
- Phase 08 privacy baseline: `docs/phase-08/Privacy_Report.md`

## Verdict

**Coach sharing consent mutation: fail-closed on actor mismatch.** Audit trail present. **Server enforcement** still required for multi-device consistency.
