# Phase 12 — Account Deletion Audit

## Requirements

GDPR/CCPA: user can request full account deletion with cascade of personal data.

## Android

| Action | Implementation | Status |
|--------|----------------|--------|
| Logout | `AuthRepository.logout()` → isolation wipe | PASS |
| Delete session locally | `deleteSession()` | PASS |
| Server account delete | Not in LocalAuth | **Missing** |
| Telemetry purge | `deleteProviderData()` per provider | PASS (local) |
| Queue wipe on logout | `AccountIsolationController` | PASS |

## Web

| Action | Path | Status |
|--------|------|--------|
| Supabase user delete | Admin API / user settings | **Not audited** |
| Strava disconnect | `/api/v1/integrations/strava/disconnect` | Partial |
| Stripe customer | Dashboard / API | **Not wired** |
| Prisma cascade | Schema `onDelete` rules | **Review needed** |

## Expected cascade (target)

1. Authenticate user
2. Revoke OAuth (Strava, etc.)
3. Delete push tokens
4. Anonymize or delete messages (legal hold exception)
5. Delete athlete/coach profile rows
6. Delete auth user in Supabase
7. Confirm email / audit log

## Phase 12 scope

Account deletion **not newly implemented** — isolation on logout reduces **shared-device** risk but is **not** full erasure.

## Gaps

| Gap | Severity |
|-----|----------|
| No self-service delete in UI | High (compliance) |
| Orphan Strava tokens on user delete | High |
| Community posts after delete | Medium — anonymize vs delete |
| Coach roster references | Medium |

## Verdict

**Logout isolation: PASS.** **Full account deletion: FAIL** — open compliance debt before EU/US production users.
