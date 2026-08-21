# Phase 12 — IDOR Test Report

**Insecure Direct Object Reference** — accessing another user's resources by tampering with IDs in URLs, params, or cookies.

## Methodology

1. Static review of ID resolution helpers
2. Unit tests where present
3. Manual test matrix (documented; not full automated E2E in CI)

## Web — `requireAthleteId`

**File:** `apps/web/lib/api/require-auth.ts`

| Case | Input | Expected | Result |
|------|-------|----------|--------|
| Prod, no param | Authenticated athlete A | `athleteId = A.id` | PASS (unit test) |
| Prod, param = self | `?athleteId=A` | `athleteId = A.id` | PASS |
| Prod, param ≠ self | `?athleteId=B` | 403 `forbidden` | PASS (unit test) |
| Prod, admin + param B | Admin session | `athleteId = B` | PASS (by design) |
| Demo mode | Any param | Param or default demo ID | PASS (intentionally permissive) |

**Routes using pattern:** `/api/v1/readiness`, `/api/v1/athletes/[athleteId]/readiness`, `/api/v1/sessions`, `/api/v1/messages`, Strava integration routes (via `resolveIntegrationAthlete`).

## Web — Strava `resolveIntegrationAthlete`

**File:** `apps/web/lib/integrations/strava/route-auth.ts`

| Case | Input | Expected | Result |
|------|-------|----------|--------|
| Prod, no cookie | — | 401 | PASS |
| Prod, cookie A, param B | mismatch | 403 `athlete_mismatch` | PASS |
| Prod, cookie A, header B | mismatch | 403 | PASS |
| Prod, cookie only | — | cookie value | PASS |
| Demo | any | permissive | PASS |

## Android — local data stores

Local repositories (athlete/coach) key by session user ID from `SessionStore`. No cross-user read if session is consistent.

**Residual:** Rooted device can patch `SessionStore` — not an IDOR in network sense but local privilege escalation.

## Android — AI tools

| Case | Expected | Result |
|------|----------|--------|
| Athlete calls tool with `targetAthleteId = other` | Denied | PASS (`AiEngineTest`, gate logic) |
| Athlete calls tool with `targetAthleteId = null` | Bound to self, allowed for SELF tools | PASS (`AiToolRuntime` bind-before-authz) |
| Coach calls tool for unassigned athlete | Denied | PASS |

## Not tested (debt)

- Full Playwright crawl of all `/api/v1/*` with two Supabase test users
- GraphQL/tRPC endpoints if exposed without same helpers
- Community post IDs (`android/community/`)

## Verdict

**Core athlete IDOR paths on web: mitigated.** Strava integration param/cookie mismatch: **mitigated.** Android AI IDOR: **mitigated.** Full API enumeration pen-test: **pending**.
