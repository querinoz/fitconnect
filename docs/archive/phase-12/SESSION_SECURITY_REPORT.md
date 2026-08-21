# Phase 12 — Session Security Report

## Session types

| Session | Storage | Path |
|---------|---------|------|
| Web Supabase | HTTP-only cookies via `@supabase/ssr` | `apps/web/lib/auth/supabase/` |
| Web demo | `DEMO_SESSION_COOKIE` | `lib/auth/demo-session.ts` |
| Android auth | `SessionStore` + EncryptedSharedPreferences | `android/foundation/session/` |
| Training session (domain) | API + local repos | `Session` model |

## Android session lifecycle

1. Sign-in → `SessionStore` persists tokens, role, user ID
2. NavGuard checks `sessionStore.isLoggedIn()` + permissions
3. Logout → `AccountIsolationController.wipeForLogout()`:
   - `syncQueue.clear()`
   - `keyValueStore.remove(LAST_USER_KEY)`
   - `sessionStore.clear()`
4. Account switch → queue cleared if `LAST_USER_KEY` ≠ new user

## Web session lifecycle

- Middleware validates Supabase session on protected prefixes
- API routes call `requireAuth()` per request (stateless validation)
- Demo: explicit env + cookie allowlist

## Security properties

| Property | Android | Web |
|----------|---------|-----|
| Token encryption at rest | EncryptedSharedPreferences | Cookie flags (SSR) |
| Logout clears local state | Yes + queue | Supabase signOut |
| Session fixation | N/A local | Supabase handles |
| Concurrent sessions | Not restricted | Not restricted |

## Training session authorization

- Web `/api/v1/sessions` uses auth helpers
- Coach viewing athlete session requires roster relationship — **server audit open**

## Residual risks

- Local Android tokens forgeable on rooted device
- Demo cookie when demo mode enabled
- No global session revocation list (until server IdP)

## Verdict

**Logout/account-switch isolation: implemented.** Web session validation **fail-closed when Supabase configured**. Production Android **requires real IdP** for session authority.
