# 23 — Security QA

Static audit + targeted verification. Live two-user RLS testing against Postgres
was **not** run (no database reachable from this session) — that remains the
P0-SEC exit gate.

## P0-1 — Firebase ID tokens accepted without signature verification — **FIXED**

**Status:** FIXED, regression-tested (11/11 dedicated asserts + the owner's full
suite: 381 passed).

### The defect

`apps/web/lib/auth/firebase-id-token.ts:26-51` — `parseFirebaseIdToken` split the
token on `.`, base64-decoded segment 1, and validated only that `sub` was a
non-empty string and `exp` was in the future. **The third segment — the signature
— was discarded.** The docstring defended this by saying Supabase PostgREST
verifies downstream; that is true only for routes that hand the token to Supabase.
Prisma-backed routes never touch PostgREST and inherited no verification at all.

`apps/web/lib/api/require-auth.ts:44` used the result as the authenticated
principal for every `/api/v1` route. `apps/web/app/api/v1/identity/session/route.ts:22`
used it before writing the token into the httpOnly session cookie.

`firebase-id-token.ts:53-62` exported `encodeUnsignedTestJwt`, producing
`{"alg":"none"}` tokens — the exploit tool, shipped in production source.

### Exploit

```
POST /api/v1/identity/session
{"idToken":"<base64url {"alg":"none"}>.<base64url {"sub":"<victim uid>","exp":<now+3600>}>.x"}
→ 200 {"ok":true,"uid":"<victim uid>"}  + Set-Cookie session
GET  /api/v1/athletes/<victim uid>/readiness   → victim's HRV, sleep, recovery
GET  /api/v1/messages                          → victim's private messages
GET  /api/v1/sessions                          → victim's schedule
```

Role lookup (`lookupIdentityRole`) goes through PostgREST, which *does* verify, so
it failed and defaulted to `"athlete"` — admin impersonation was blocked. Every
athlete and coach account was readable.

### The fix

New `apps/web/lib/auth/firebase-verify.ts` — `verifyFirebaseIdToken()`:

- RS256 signature verified against Google's published JWKS
  (`securetoken@system.gserviceaccount.com`).
- `iss` pinned to `https://securetoken.google.com/<projectId>`, `aud` pinned to
  `<projectId>`.
- `exp` / `iat` / `auth_time` checked with 60 s skew tolerance.
- Key cache honouring the endpoint's `Cache-Control: max-age`, with a single
  forced refresh when a `kid` is not found (key rotation).
- **Fails closed everywhere:** no project id → `null`; JWKS unreachable → `null`;
  malformed → `null`. Never throws, never returns unverified claims.
- **Zero new dependencies** — Web Crypto, so it runs in both the Node and Edge
  runtimes and the lockfile is untouched.

`parseFirebaseIdToken` is relabelled UNSAFE and is no longer used for any access
decision. `encodeUnsignedTestJwt` now throws outside `NODE_ENV=test`.

Test seam: `__setFirebaseTokenVerifierForTests`, installed in
`tests/setup/vitest.setup.ts` so existing authorization tests (which test IDOR and
role binding, not Google's crypto) keep running without network. The real
signature path is covered by `lib/auth/firebase-verify.test.ts`, which removes the
seam and uses genuine RSA keys.

### Evidence

`lib/auth/firebase-verify.test.ts` — 10 tests, green in the owner's vitest run.
Independent harness against the real implementation file: **11/11**, including
`REJECTS alg:none impersonation`, `rejects a token signed by an unpublished key`,
and `rejects a payload swapped after signing`.

## P1-1 — `/api/v1/sessions/[id]/feedback` — unauthenticated write — **FIXED**

Had no `requireAuth`, no ownership check and no rate limit, and wrote
`body.athleteExternalId` verbatim to Prisma (defaulting to the demo athlete
`"a-ines"`). Anyone could POST forged RPE rows against any athlete on any session;
RPE ≥ 8 drives `lighterDayRecommended`, so this corrupted coaching decisions, with
unbounded DB-write amplification as a bonus.

**Fixed:** `enforceRateLimit("highcost")` + `requireAthleteId`; the row is written
under the authenticated athlete.

## P1-2 — `/api/v1/realtime/bridge` — open pub/sub relay — **FIXED**

Both GET and POST were unauthenticated. Channel names are predictable
(`athlete:<externalId>`), so an attacker could poll another athlete's live vitals
and POST fabricated readings into that athlete's and their coach's dashboards.

**Fixed:** `requireAuth` on both verbs plus `isOwnChannel()` — a caller may only
touch `<kind>:<their own uid>`.

**Note:** this route has **zero callers** in `apps/web`, `android/` or `packages/`.
It is a SAFE_DELETE candidate; it was locked down rather than deleted because
deletion should be a deliberate decision, not a side effect of a security pass.

## P1-3 — `fc-demo-session` cookie bypassed the production page gate — **FIXED**

`apps/web/lib/auth/demo-session.ts:18` accepts any id starting with `user-`.
`middleware.ts` consulted that cookie **inside** the branch that only runs when
`shouldEnforceFirebaseAuth()` is true — i.e. when demo mode is OFF and Firebase is
configured. So on a production deploy,
`document.cookie = "fc-demo-session=user-x; Path=/"` walked into `/dashboard`,
`/coach`, `/admin` and every other protected path.

**Fixed:** the demo-cookie branch is removed from the enforcing path. Genuine demo
deployments still short-circuit earlier at `shouldEnforceFirebaseAuth`.

## P0-2 — Stripe webhook silently disabled replay protection — **FIXED**

`lib/stripe/webhook-handler.ts:9-10` — `claimStripeEvent` returned `true` when
`getPrisma()` was null. With no `DATABASE_URL`, every event reported as newly
claimed, so **duplicate Stripe events were processed without bound**, and every
subscription write was dropped while the route still answered 200.
`.env.local` has `DATABASE_URL` commented out today.

**Fixed:** `isStripePersistenceAvailable()` + a production guard in
`processStripeWebhookEvent` — in production security mode with no persistence the
handler returns `degraded: "persistence_unavailable"` and the route answers **503**
so Stripe backs off and retries instead of marking the event delivered. Demo and
local behaviour is unchanged. Two regression tests added.

## Open — not fixed in this run

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| P0-3 | P0 | `prisma migrate deploy` cannot build the schema — only 6 of 22 models have a migration, and `20260518120000_production_indexes/migration.sql:2-4` indexes `"Session"` and `"ReadinessSnapshot"`, which no migration creates | `prisma/migrations/` |
| P1-4 | P1 | 11 user-data tables have RLS **enabled with zero policies and no FORCE** — the Prisma owner role bypasses RLS entirely, so app code is the only barrier | `supabase/migrations/004,005,006,008,009` |
| P1-5 | P1 | `reviews` and `coach_profiles` are world-readable via `USING (true)`; `reviews` carries `athlete_id` + free-text body, readable with the public anon key | `010_reviews.sql:15`, `002_coaches.sql:13` |
| P1-6 | P1 | Athlete can self-elevate to coach: `user_roles` has a delete policy and an insert policy allowing `coach`, with no UPDATE policy — delete-then-reinsert is the escalation path | `013_p0_sec.sql:53-56` + `012:145-151` |
| P2-1 | P2 | Rate-limit bucket key trusts the attacker-supplied `x-athlete-id` header — rotate it, get a fresh bucket | `lib/security/rate-limit.ts:60-62` |
| P2-2 | P2 | `hasFirebaseSessionCookie` accepts any three-dot string (`a.b.c`) as a page-gate session | `lib/auth/middleware-auth.ts:52-53` |
| P3-1 | P3 | `autoVerify="true"` App Link for `fitconnect-phi.vercel.app/app` with no `.well-known/assetlinks.json` — verification silently fails, link opens a chooser a malicious app can join | `AndroidManifest.xml:61-69` |

## Verified NOT vulnerable

- No real credential is committed to tracked source. `git ls-files | grep -i env`
  returns only `.env.example` and `.env.test.example`; `.env.local` is untracked.
- `SUPABASE_SERVICE_ROLE_KEY` never appears client-side — only in build tooling.
- `NEXT_PUBLIC_DEMO_MODE` **fails safe**: every consumer uses `=== "true"`, so
  unset means off.
- Stripe webhook signature verification is correct and fails closed in production.
- Android release builds cannot mint a local identity — `ALLOW_LOCAL_AUTH` is
  debug-only and `ProductionConfigGate` hard-fails a release that has it on.
- tRPC is the best-defended surface in the repo (and also dead code).
