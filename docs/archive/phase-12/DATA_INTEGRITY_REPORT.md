# Phase 12 — Data Integrity Report

## Concerns

Unauthorized or accidental modification of training data, programs, sessions, offline queue, and sync payloads.

## Controls

| Mechanism | Location | Purpose |
|-----------|----------|---------|
| Auth-bound writes | Web `requireAthleteId` | Actor must match subject |
| AI WRITE denial | `AiPermissionGate` | No auto-mutation |
| Offline queue ordering | `DurableSyncQueue` | Phase 11 durability |
| Idempotent Stripe webhooks | `claimStripeEvent` | Prevent double processing |
| Sync idempotency | Target — not universal | Open |
| Prisma transactions | Server routes | Atomic multi-row updates |

## Android local integrity

- Local repos scoped to session user ID
- Account switch clears stale outbox — prevents cross-user replay
- **Rooted device** can tamper local DB — server must validate on sync

## Telemetry integrity

- Consent records append-only list with timestamps
- Audit trail on coach read checks

## Strava sync

- OAuth-bound athlete in integration routes
- Token encryption at rest (strava-integration)

## Gaps

| Gap | Risk |
|-----|------|
| No HMAC on offline queue entries | Tampering on rooted device |
| Conflict merge without version vectors | Lost updates |
| Community post edit authz | Not audited |

## Tests

- `ProgramBuilderLogicTest.kt`
- `LocalAthleteRepositoryTest.kt`
- Stripe webhook integration test

## Verdict

**Server-authoritative integrity model assumed** but not fully enforced. Phase 12 improves **client-side stale data isolation**. **End-to-end sync integrity audit open.**
