# Phase 12 — API Security Report

## Surface inventory

Primary REST API: `apps/web/app/api/v1/**`  
Integrations: `apps/web/app/api/v1/integrations/strava/**`  
Stripe: `apps/web/app/api/stripe/**`  
Strava package proxy: `@fitconnect/strava-integration`

## Controls

| Control | Implementation |
|---------|----------------|
| Auth helper | `requireAuth()`, `requireAthleteId()`, `requireCoachId()` |
| Demo fail-closed | `isDemoMode()` strict equality |
| Strava athlete binding | Cookie `fc-athlete-id` + mismatch reject |
| QStash jobs | `verifyQStashJob()` — signature in prod |
| Integration bearer | `INTEGRATION_AUTH_SECRET` + `x-athlete-id` header |
| Middleware | Protected page prefixes; API relies on route handlers |

## Route audit (sample)

| Route | Auth | ID binding | Notes |
|-------|------|------------|-------|
| `/api/v1/readiness` | `requireAthleteId` | Self | OK |
| `/api/v1/sessions` | `requireAthleteId` / coach | Self | OK |
| `/api/v1/messages` | `requireAuth` | Review thread IDs | Partial |
| Strava connect/callback/sync | `resolveIntegrationAthlete` | Cookie | OK |
| Stripe checkout | Mixed demo/live | N/A | Demo fallback — see PAYMENT doc |

## Vulnerabilities addressed (Phase 12)

1. Open `?athleteId=` on authenticated routes → bound to session user
2. Strava routes trusting query param over session → 403 mismatch
3. Demo mode truthy env values (`"1"`, `"yes"`) → only `"true"` enables demo

## Open items

| Item | Severity | Path |
|------|----------|------|
| Not all 30+ API routes audited | Medium | `apps/web/app/api/` |
| Rate limiting | Medium | Upstash env vars documented but not universal |
| CORS on integration proxy | Low | Strava package allowlist |
| Error body leakage | Low | Standardize `{ error: code }` without stack traces |

## Recommendations

1. CI script: fail if new `/api/v1/` route lacks `requireAuth` or documented public exception
2. Enable Upstash rate limits on auth, leads, ingestion endpoints
3. Replace demo Stripe routes with feature flag separate from auth demo

## Verdict

**Critical IDOR class on athlete-scoped v1 routes: addressed** where helpers are used. **Full route coverage audit: incomplete.**
