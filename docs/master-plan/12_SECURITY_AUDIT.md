# 12 — Security audit

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`  
**Next code phase:** `P0-SEC`

## Production

**NO-GO** until the P0 list below is closed and re-tested.

## P0-SEC sequence (frozen order)

### 1. Block Strava from third parties

- No coach, feed, ranking, badge, shared map, or other-user profile may read `provider=STRAVA` sessions
- `listActivitiesForCoach` remains a hazard even if the HTTP route returns 403 — remove or hard-fail the service function
- Android social filter + `shareable` column is the model; web must match

### 2. Align web Strava allowlist with Android

Android `StravaPathAllowlist` **bans**:

- `/clubs/{id}/activities|admins|members`
- `/segments/explore`
- `/activities/{id}/kudos|comments`

Web `packages/strava-integration/src/endpoints.ts` and `client.ts` still **allow** those paths. Tests currently expect `segments/explore` to match. Fix allowlist + tests + proxy.

### 3. Integration status fail-closed

`GET /api/v1/integrations/status` must never default to `a-ines` for anonymous users.  
Engineering already calls `requireAthleteId` — **P0-SEC must re-verify** (demo vs prod, no IDOR via query param, no activity leak in JSON).

### 4. Validate RLS

- Identity: `012_firebase_identity.sql` (`FORCE RLS`, own-row, no client ADMIN)
- Product tables: audit every user-owned table for policies vs “RLS on, zero policies” (default deny is good only if intended)
- Two-user IDOR on **real Postgres** (Testcontainers/CI). This machine had **no container runtime** — do not mark live RLS PASS until CI/human runs it
- Prisma is not an RLS substitute

### 5. Account deletion

No `deleteAccount` / GDPR erase path found. Required before real users.

### 6. Terms / Privacy

`apps/web/components/footer.tsx` — Privacy, Terms, Trust & Safety are `href: "#"`. Ship real pages or official URLs.

### 7. Insecure webhook / job fallback

`apps/web/app/api/v1/integrations/strava/webhook/route.ts`:

- `STRAVA_WEBHOOK_VERIFY_TOKEN ?? "fitconnect-dev"` — **forbidden in production**
- If `QSTASH_TOKEN` missing, POSTs `/api/v1/jobs/strava-sync` **without** a machine secret

Fail closed: missing verify token or missing QStash in production → 503, no enqueue.

### 8. Real rate limiting

`@upstash/ratelimit` is a dependency; health checks env presence. **No app-route usage found.** Apply to auth, leads, Strava webhook, identity, ingestion.

## Other P0-adjacent (keep on the list)

- Middleware historically skipped `/api/*` — API must auth itself (do not rely on page middleware)
- `INTEGRATION_AUTH_SECRET` job bypass: server-only, rotate, never in clients
- No Strava `client_secret` in APK (keep)
- Do not log tokens

## P1 overlap (do not steal P0-SEC)

Firebase custom claim `role: authenticated`, production third-party setup — HUMAN, documented in `docs/auth/HUMAN_AUTH_CONFIGURATION.md`. Not an excuse to skip items 1–8.

## Residual from prior engineering session

Treat as **unfinished P0**, not as production PASS:

- Coach HTTP tombstone `strava_not_shareable`
- Status route `requireAthleteId`
- Identity RLS SQL file

---

## REMEDIATION STATUS (P0-SEC)

**Date:** 2026-08-20  
**Do not treat this appendix as a rewrite of the findings above.** Historical P0 items remain listed as they were discovered.

### Status

| Item | Code | Automated tests | Live evidence |
| ---- | ---- | ---------------- | ------------- |
| 1. Strava third-party block | Done | PASS | N/A (unit/API) |
| 2. Web allowlist = Android bans | Done | PASS | N/A (unit/API) |
| 3. Status route auth | Done | PASS | N/A (unit/API) |
| 4. RLS / IDOR | SQL + API IDOR Done | API PASS; live Postgres **SKIPPED** | **BLOCKED** — no `DATABASE_URL`, Docker not installed |
| 5. Account deletion | Done (app data) | PASS | Firebase Auth delete **PENDING_HUMAN** |
| 6. Terms / Privacy technical pages | Done | Build includes `/privacy` `/terms` | Legal copy **PENDING_HUMAN** |
| 7. Webhook fail-closed | Done | PASS | Strava POST has no HMAC (vendor) |
| 8. Distributed rate limiting | Done (Upstash) | PASS (fail-closed without Redis in production) | Production env **PENDING_HUMAN** |

### Changes (summary)

- `listActivitiesForCoach` hard-fails; coach HTTP route remains 403 tombstone
- Own-athlete Strava access only (`canAccessStravaOwnedRecord`); activity GET is owner-bound
- Web `STRAVA_BANNED_PATHS` matches Android `StravaPathAllowlist`
- Status route: authenticated athlete, no tokens / activity payloads / sync logs
- `013_p0_sec.sql`: own-row DELETE, `account_deletion_requests`, FORCE RLS on existing product tables when present
- `POST /api/v1/account/delete` + web Settings Privacy + Android Settings/Profile
- Strava / ingestion / Stripe webhooks fail closed without secrets; QStash jobs require forwarded `INTEGRATION_AUTH_SECRET` (unsigned `upstash-signature` is rejected)
- Upstash rate limits on auth, identity, leads, webhooks, ingestion, Strava, account delete, high-cost APIs

### Test evidence

See `docs/security/P0_SEC_TEST_EVIDENCE.md`.

### Remaining HUMAN items

1. Apply `012` + `013` on hosted Supabase and run two-user Postgres IDOR (`DATABASE_URL` + non-superuser `authenticated` role)
2. Firebase Auth user deletion (Admin SDK / console)
3. Counsel review of `/privacy` and `/terms` (technical pages only today)
4. Production secrets: Upstash Redis, QStash, `INTEGRATION_AUTH_SECRET`, `STRAVA_WEBHOOK_VERIFY_TOKEN`, `INGESTION_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SECRET`
5. `workout_sessions.user_id` uuid vs Firebase UID remains **P1-DATA** (not remapped here)

### Exit

**Agent-fixable P0 blockers: closed.**  
**Live RLS IDOR: BLOCKED on this machine.**  
Production remains **NO-GO**. Do not treat this appendix as a production PASS.

