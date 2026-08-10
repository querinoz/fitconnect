# Phase 08 — Privacy Report

`TelemetryPrivacyManager` — health data is treated as highly sensitive.

| Requirement | Implementation |
|---|---|
| Consent | `grantProviderConsent` recorded per provider; `DeviceCenter.connect` grants, `disconnect` revokes |
| Permission state | `ProviderConnectionState` (PERMISSION_REQUIRED / PERMISSION_DENIED / AUTH_EXPIRED) |
| Data sharing state | per-coach, per-metric sharing sets (`shareWithCoach(athleteId, coachId, metrics)`) |
| Revocation | `revokeCoachSharing` / `revokeProviderConsent` — effective immediately; verified by test |
| Deletion | `deleteProviderData` removes all records from a provider (store + source index), audit-trailed |
| Export | normalized store queries are pageable per athlete — export is a paged read, no special path needed |
| Data minimization | coach reads only explicitly shared metrics; analytics consent is a separate scope; observability carries zero health values |
| Least privilege | `CoachTelemetryFacade` re-checks `coachMayRead` per metric per read — unauthorized metrics never appear |
| Audit trail | every consent change and every coach read check appended to `AuditEntry` log, queryable per athlete |

Enforcement point: Coach OS can only reach telemetry through `CoachTelemetryFacade`, which filters through the privacy manager. There is no store handle exposed to `:coach` UI.

Verified by `PrivacyAndDeviceCenterTest` (5 tests): coach sees only shared metrics, revocation immediate, audit trail records consent + reads, connect/disconnect consent lifecycle, sync without consent refused.
