# P0-SEC final report

**Date:** 2026-08-20  
**Phase:** P0-SEC  
**Production:** still **NO-GO**

This report does not rewrite `docs/master-plan/12_SECURITY_AUDIT.md`. That file keeps the original findings. This document records what was changed, what was tested, and what a human still must do.

## Verdict

| Gate | Result |
| ---- | ------ |
| Strava privacy | **PASS** (code + unit/API tests) |
| Web allowlist | **PASS** |
| Status route | **PASS** |
| RLS (SQL + FORCE) | **PASS** (migration files + snapshot tests) |
| RLS live two-user Postgres | **BLOCKED** — no `DATABASE_URL`, Docker CLI not installed |
| IDOR (API / auth binding) | **PASS** |
| Account deletion | **PASS** for app data; Firebase Auth **PENDING_HUMAN** |
| Terms/Privacy technical consistency | **PASS**; legal review **PENDING_HUMAN** |
| Webhook fail-closed | **PASS** |
| Rate limiting | **PASS** (architecture; production Redis **PENDING_HUMAN**) |
| Regression (web unit + typecheck + lint + build + Android compile/unit) | **PASS** for what ran |
| E2E Playwright / HTTP smoke | **NOT RUN** |
| Full exit stamp `P0-SEC PASS` | **NO** — live Postgres IDOR was not executed |

Agent-fixable P0 items from the audit are implemented. The frozen exit gate still requires live RLS evidence. That evidence is not agent-fixable on this workstation.

**Do not start P1-DATA until a human or CI runs the skipped identity RLS tests against real Postgres.**

## 1. Strava third-party data

Default deny. Only the owning authenticated athlete may read Strava-owned records.

- `canAccessStravaOwnedRecord` — owner match only; coaches User A/B denied
- `listActivitiesForCoach` throws `strava_not_shareable`
- `GET /api/v1/integrations/strava/coach` always 403
- Activity GET checks `row.athleteExternalId` against the bound athlete
- Generated `shareable` column remains `provider <> 'STRAVA'` (migration `011`)
- Android social barrier tests remain the model for feeds

## 2. Web allowlist parity

Web `STRAVA_BANNED_PATHS` matches Android `StravaPathAllowlist`:

- `/clubs/{id}/activities|admins|members`
- `/segments/explore`
- `/activities/{id}/kudos|comments`

Proxy returns 403 `endpoint_forbidden`. Client `request()` / `proxyRequest()` call `assertStravaPathAllowed`.

## 3. Status route

`GET /api/v1/integrations/status` uses `requireAthleteId`. Unauthenticated → 401. Other athleteId → 403. Response is connection metadata + activity **count** only. No tokens, no activity arrays, no sync logs, no `client_secret`.

Not a public route.

## 4. RLS / IDOR

- Identity tables: `012_firebase_identity.sql` (FORCE RLS, `firebase_uid()`, no service-role in client)
- `013_p0_sec.sql`: own-row DELETE, `account_deletion_requests`, FORCE RLS on `workout_sessions` / community tables when present
- API IDOR tests: Strava, status, push register, video token, AI readiness, account delete
- Prisma uses a privileged server role and **does not substitute for RLS**
- Live two-user test file: `apps/web/tests/integration/identity-rls.integration.test.ts` — **skipped** here (`skipIf(!DATABASE_URL)`)
- `workout_sessions.user_id` as uuid vs Firebase text UID is **P1-DATA**, not remapped in P0-SEC

## 5. Account deletion

`POST /api/v1/account/delete` with `{ confirm: "DELETE" }`:

| Check | Behavior |
| ----- | -------- |
| Authentication | Firebase session required |
| Authorization | Deletes **only** `auth.user.id` |
| Confirmation | Literal `DELETE` |
| Demo | 403 `demo_forbidden` |
| App identity | RLS client deletes own profile / role / prefs / onboarding |
| Strava | `purgeStravaForAthlete` |
| Social | No shareable Strava rows by generated column |
| Squad | None persisted in P0 |
| Notifications | No P0 notification store to wipe |
| Firebase Auth user | **PENDING_HUMAN** (Admin SDK) |
| Audit | `account_deletion_requests` retained |

UI: `/settings/privacy`, Android athlete Settings + coach Profile. LOCAL_DEMO adapter refuses deletion.

## 6. Terms / Privacy

`/privacy` and `/terms` describe **current software behavior**. Footer links point at those URLs. Counsel must rewrite copy before real users. Marked **PENDING_HUMAN**.

Covered technically: identity, Health Connect intent, location not production-certified, Strava own-athlete, social/squad not production GO, analytics/FCM/Firebase/Supabase, deletion path.

## 7. Webhooks

| Endpoint | Verification | Missing secret | Invalid |
| -------- | ------------ | -------------- | ------- |
| Strava GET challenge | `hub.verify_token` vs env | 503 | 403 |
| Strava POST | Token must be configured; JSON schema; known connection; enqueue only with QStash + job secret | 503 | 400 |
| Strava sync job | `Authorization: Bearer INTEGRATION_AUTH_SECRET` only | 401 | 401 |
| Ingestion | Bearer `INGESTION_WEBHOOK_SECRET` or `INTEGRATION_AUTH_SECRET` | 503 | 401 |
| Stripe (production) | `stripe-signature` + `STRIPE_WEBHOOK_SECRET` | 503 | 400 |

Strava does not ship an HMAC on webhook POST. Replay of a well-formed body for a known `owner_id` can enqueue a duplicate sync; mitigation is QStash + job secret + rate limit + idempotent sync. Unsigned `upstash-signature` headers are **not** trusted.

QStash publish forwards `Upstash-Forward-Authorization: Bearer <INTEGRATION_AUTH_SECRET>`.

LOCAL_DEMO is isolated. No insecure production fallback.

## 8. Rate limiting

Upstash Redis (`@upstash/ratelimit`). Production without Redis → **503** `rate_limit_not_configured`. Demo skips.

| Bucket | Limit | Window | Scope | Routes (min) |
| ------ | ----- | ------ | ----- | ------------ |
| auth | 20 | 1 m | ip | identity session, push register |
| identity | 60 | 1 m | ip+user | profile, role, onboarding |
| leads | 5 | 1 m | ip | `/api/v1/leads` |
| webhook | 60 | 1 m | ip | Strava webhook, Stripe webhook |
| ingestion | 30 | 1 m | ip | ingestion webhook |
| strava | 30 | 1 m | ip+user | status, activity, sync, connect, disconnect, v3 proxy, coach tombstone |
| account-delete | 5 | 1 h | ip+user | `/api/v1/account/delete` |
| highcost | 20 | 1 m | ip+user | AI readiness, video token, readiness compute |

429 body: `{ error: "rate_limited", bucket, retryAfter }` + `Retry-After`.

Social mutation HTTP APIs are not a P0 persistence surface; none were found to rate-limit.

## Remaining HUMAN

1. Live Postgres two-user RLS (`identity-rls.integration.test.ts`) on a non-superuser role
2. Firebase Auth account delete
3. Legal review of Terms/Privacy
4. Hosted secrets + apply `013_p0_sec.sql`
5. P1-DATA uuid/UID product-table alignment

## Next phase

Not executed. After live RLS evidence: **P1-DATA**.
