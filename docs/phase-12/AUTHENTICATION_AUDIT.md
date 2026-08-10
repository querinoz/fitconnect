# Phase 12 — Authentication Audit

## Web

| Check | Status | Evidence |
|-------|--------|----------|
| Demo mode fail-closed | PASS | `isDemoMode()` → `NEXT_PUBLIC_DEMO_MODE === "true"` in `apps/web/lib/auth/supabase/client.ts` |
| Middleware demo detection | PASS | `isDemoModeEnv()` in `apps/web/lib/auth/middleware-auth.ts` |
| Protected routes require session | PASS (when configured) | `middleware.ts` + `shouldEnforceSupabaseAuth` |
| API routes use `requireAuth()` | PARTIAL | Applied on v1 routes using `require-auth.ts`; audit remaining routes |
| Supabase not configured → 503 | PASS | `requireAuth` returns `auth_not_configured` |

### Web gaps

- Demo session cookie path still exists for marketing (`lib/auth/demo-session.ts`) — acceptable only when demo explicitly enabled.
- tRPC context historically had `user: null` — verify each router before prod.

## Android

| Check | Status | Evidence |
|-------|--------|----------|
| Provider-agnostic port | PASS | `AuthRepository` interface |
| Local adapter documented as non-prod | PASS | KDoc on `LocalAuthRepository` |
| Never ADMIN from email | PASS | Role assignment in `signIn` — coach only via `allowLocalCoachElevation` |
| Coach elevation debug-only | PASS | `AppContainer`: `allowLocalCoachElevation = config.isDebuggable` |
| Password min length | PASS | 8 chars minimum |
| Logout isolation | PASS | `AccountIsolationController.wipeForLogout()` |
| Account switch detection | PASS | `wipeForAccountSwitch` clears queue on user change |
| Anonymous sign-in | PASS (limited) | `UserRole.ANONYMOUS` — no app shell access |
| Demo credentials UI | PASS | Shown only when `isDebuggable` in `FitConnectNavHost.kt` |

### Android gaps (critical)

| Gap | Risk | Required before Play Store |
|-----|------|---------------------------|
| `LocalAuthRepository` in production graph | Forgeable tokens, no server truth | Replace with Supabase/OAuth PKCE adapter |
| OAuth providers stubbed locally | Fake `@oauth.local` emails | Real Google/Apple token exchange |
| Biometric unlock | Local session replay | CryptoObject-bound keys |
| Magic link | Log-only | Server-verified tokens |

## Tests

- `android/foundation/src/test/.../LocalAuthRepositoryTest.kt` — coach elevation, anonymous role
- `apps/web/lib/auth/middleware-auth.test.ts` — demo env parsing
- `apps/web/lib/api/require-auth.test.ts` — athlete binding

## Verdict

**Web:** Authentication posture acceptable when `NEXT_PUBLIC_DEMO_MODE` is unset/false and Supabase is configured.  
**Android:** Authentication **not production-ready** — local adapter acceptable for dev/QA only.
