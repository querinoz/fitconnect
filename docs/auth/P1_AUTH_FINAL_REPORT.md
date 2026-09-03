# P1-AUTH EXIT REPORT

**Date:** 2026-08-31 (full automated execution)

## Executive Summary

Configuration, Gradle, emulator install/start, and Firebase initialization are **PASS**. Live **Supabase Third-Party Firebase JWT bridge** is **FAIL** (401/403 against production Data API). In-app Android email login on emulator is **BLOCKED** (Compose state not drivable via ADB alone). **P1-AUTH = BLOCKED** · **P2-CORE = LOCKED**.

## Configuration diagnostic

```powershell
node scripts/p1-auth-config-diagnostic.mjs
```

```json
{
  "AUTH_PROVIDER": "FIREBASE",
  "DEMO_MODE": "DISABLED",
  "FIREBASE_WEB_CONFIG": "PRESENT",
  "ANDROID_GOOGLE_SERVICES": "PRESENT",
  "SUPABASE_DATA_API": "PRESENT",
  "PRODUCTION_AUTH_READY": true
}
```

## Live bridge probe

```powershell
node scripts/p1-auth-live-bridge-check.mjs
```

| Check | Result |
| --- | --- |
| Firebase signup/signin (REST, production project) | PASS |
| Firebase UID / issuer | PASS |
| Supabase `/auth/v1/user` | **403** |
| Supabase `/rest/v1/identity_profiles` | **401** |
| Hint | `CHECK_THIRD_PARTY_FIREBASE_AND_ROLE_CLAIM` |

## RLS / IDOR (live)

```powershell
# Load .env.local into shell, then:
$env:P0_SEC_LIVE_RLS='1'
pnpm --filter @fitconnect/web exec vitest run tests/integration/identity-rls.integration.test.ts tests/data/p1-data-activities-rls.integration.test.ts --fileParallelism=false
```

**8/8 PASS** — `authenticated` role, `rolbypassrls=false`.

## Android

| Check | Result |
| --- | --- |
| Gradle 9.5.0 / AGP 9.3.1 | PASS |
| `:app:assembleDebug` | PASS |
| `:foundation:testDebugUnitTest` | PASS |
| `:core:fitness:testDebugUnitTest` | PASS |
| `signingReport` | PASS |
| Emulator install + launch | PASS |
| Firebase initialization | PASS |
| In-app email/password | BLOCKED (ADB/Compose) |

## Regression (monorepo)

| Check | Result | Notes |
| --- | --- | --- |
| `pnpm typecheck` | FAIL | Pre-existing `@fitconnect/strava-integration` TS error |
| `pnpm test` | FAIL | Pre-existing `health-contract.integration.test.ts` |
| `pnpm build` | PASS | |
| Auth unit suite | PASS | 56/56 (+ 8 live RLS when env loaded) |

## Final gate

```text
P1-AUTH = BLOCKED
P2-CORE = LOCKED
```

### Human blocker

Supabase Dashboard → **Authentication → Third-Party Auth → Firebase**: enable issuer for project `fitconnect-5d2ba` and ensure JWT carries `role: "authenticated"` for PostgREST. Re-run `node scripts/p1-auth-live-bridge-check.mjs` until `SUPABASE_BRIDGE=PASS`.
