# P1-AUTH — Test matrix

**Evidence date:** 2026-09-02 (this phase). Historical 2026-08-29 rows are superseded where noted.

## Middleware / HTML

| TEST | EXPECTED | ACTUAL | EVIDENCE | STATUS |
|------|----------|--------|----------|--------|
| DEMO_MODE unset | fail-closed (not demo) | `isDemoModeEnv(undefined)===false` | `middleware-auth.test.ts` | PASS |
| DEMO_MODE=true | gate `open` | `open` | unit | PASS (LOCAL_DEMO) |
| DEMO_MODE=false + Firebase missing | `auth_unavailable` → `/signin?error=auth_not_configured` | redirect in `middleware.ts` | unit + code | PASS |
| DEMO_MODE=false + Firebase present, no cookie | require Firebase JWT cookie | redirect `/signin` | code | PASS (engineering) |
| malformed cookie `not-a-jwt` | not a session | `hasFirebaseSessionCookie` false | unit | PASS |
| demo-session cookie with Firebase gate | ignored | comment + tests | PASS |
| `?demo=` with DEMO_MODE=false | no auto-login | `AuthGate` uses `isDemoModeEnv` | code | PASS (engineering) |

## Protected API

| TEST | EXPECTED | ACTUAL | EVIDENCE | STATUS |
|------|----------|--------|----------|--------|
| demo on | demo-user | `require-auth.test.ts` | PASS (explicit demo) |
| demo off, Firebase missing | 503 `auth_not_configured` | `require-auth.unconfigured.test.ts` 2/2 | PASS |
| missing token | 401 | `require-auth.prod.test.ts` | PASS |
| malformed Bearer | 401 | prod test | PASS |
| athlete IDOR other athlete | 403 | prod test | PASS |
| coach IDOR other coach | 403 | prod test | PASS |
| user.id = Firebase `sub` | not `demo-user` / `a-ines` | prod test | PASS |
| tRPC | same `requireAuth` | `app/api/trpc/[trpc]/route.ts` | PASS (code) |
| unsigned JWT in production verify | reject | `firebase-verify.test.ts` alg:none | PASS |

## Identity / roles

| TEST | EXPECTED | ACTUAL | EVIDENCE | STATUS |
|------|----------|--------|----------|--------|
| UID = identity_profiles.id | 1:1 | `CanonicalIdentityKeys` tests | PASS (contract) |
| client cannot assign admin | DENY | `canAssignAppRole` | PASS |
| athlete cannot switch to coach | DENY | role-policy | PASS |
| unknown UID | no arbitrary user | RLS empty sub DENY | PASS (live) |

## Android

| TEST | EXPECTED | ACTUAL | EVIDENCE | STATUS |
|------|----------|--------|----------|--------|
| signed out | no session | `LocalAuthRepositoryTest` / mapper IDLE | PASS (unit) |
| logout clears session | `isLoggedIn=false` | `FirebaseAuthRepositoryTest.logoutClearsSession` | PASS (unit) |
| token refresh fail | REFRESH_FAILED, no invented user | `tokenRefreshFailureDoesNotInventSession` | PASS (unit) |
| network / offline | CONNECTION_REQUIRED | `CompositeAuthRepositoryTest` | PASS (unit) |
| release without live IdP | refuse credentials | `releaseWithoutLiveRefusesCredentials` | PASS (unit) |
| no anonymous production fallback | `allowLocalAuth=false` | ProductionConfigGate + composite | PASS (unit) |
| live email instrumentation | UID stable across logout | `P1AuthSessionInstrumentationTest` | PENDING_HUMAN (adb empty 2026-09-02) |
| Google Credential Manager production | real Google client | — | PENDING_HUMAN |

## RLS / IDOR (live, today)

Command:

```text
P0_SEC_LIVE_RLS=1
node --env-file=.env.local vitest run tests/integration/identity-rls.integration.test.ts tests/data/p1-data-activities-rls.integration.test.ts
```

CERT: `current_user=authenticated`, `rolsuper=false`, `rolbypassrls=false`. Project ref logged as hostname only.

| TEST | STATUS |
|------|--------|
| A cannot read B profile | PASS |
| A cannot update B | PASS |
| A cannot delete B | PASS |
| role self-elevate admin | PASS (DENY) |
| empty sub DENY | PASS |
| activities IDOR + Strava not social | PASS |
| ASCEND idempotent XP | PASS |

2026-09-01 RLS PASS is **historical**. Today (2026-09-02) re-verified.

## CI

| TEST | STATUS |
|------|--------|
| Job `Auth · DEMO_MODE=false` in `.github/workflows/ci.yml` | PASS (file) |
| Job executed on GitHub | UNVERIFIED (no push this phase) |
| Local equivalent `pnpm --filter @fitconnect/web test:auth-prod` | **76/76 PASS** |
| Global CI `NEXT_PUBLIC_DEMO_MODE=true` | still present on other jobs (explicit demo) |
