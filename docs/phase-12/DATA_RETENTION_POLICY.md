# Phase 12 — Data Retention Policy

## Principles

1. **Minimize** — collect only what powers coaching features
2. **Purpose-limit** — health data not used for ads
3. **Delete on request** — account deletion path required for GDPR
4. **Provider-scoped deletion** — athlete can delete imported wearable data

## Retention schedule (target)

| Data type | Retention | Deletion mechanism |
|-----------|-----------|-------------------|
| Session auth tokens | Until logout / expiry | `SessionStore.clear()`, Supabase signOut |
| Offline sync queue | Until flush or logout wipe | `AccountIsolationController` |
| Telemetry raw samples | 90 days rolling (target) | `TelemetryStore` prune — verify config |
| AI audit log | 30 days (target) | In-memory bounded — persistence TBD |
| Strava activities | Until disconnect | Strava disconnect route + Prisma delete |
| Provider import (Android) | Until revoke | `TelemetryPrivacy.deleteProviderData()` |
| Payment records | 7 years (legal) | Stripe + DB — finance policy |
| Push tokens | Until logout or invalid | Server purge job |
| Analytics events | 14 months (PostHog default) | PostHog settings |

## Account deletion

See `ACCOUNT_DELETION_AUDIT.md` — full cascade **not fully implemented**.

## Backups

- Android: backups disabled (`allowBackup=false`)
- Supabase/Postgres: provider-managed — define RPO/RTO in ops runbook
- Vercel: stateless app — no user data in deploy artifact

## Log retention

- Application logs: no tokens (Logger convention)
- Server logs: 30–90 days (ops default)

## Phase 12 status

Retention **policy documented**; automated enforcement **partial** on client, **not verified** server-side.

## Verdict

Use this document as **target policy**. Engineering must wire **scheduled purge jobs** before GDPR go-live.
