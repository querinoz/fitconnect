# P1-AUTH â€” Architecture

**Date:** 2026-08-29
**Preserves:** P1-DATA (`016`), P0-SEC RLS/IDOR

## Canonical authority

```text
PRODUCTION AUTH PROVIDER = Firebase Auth
     â†“
AUTHENTICATED SUBJECT = Firebase UID (JWT sub)
     â†“
CANONICAL IDENTITY = identity_profiles.id (text = Firebase UID)
     â†“
CANONICAL PROFILE = identity_profiles (+ user_preferences, onboarding_state)
     â†“
ROLE = user_roles (athlete|coach; admin server-only)
     â†“
APPLICATION ACCESS = REST/tRPC requireAuth + Postgres RLS
```

**Not independent identities:** Prisma `User` cuid, legacy `profiles` uuid, Zustand user id, `LocalDemoIdentity.ath-1`, demo `Coach/Athlete`.

## Provider split

| System | Role |
| --- | --- |
| Firebase Auth | IdP (email/password, Google; Apple later) |
| Supabase Postgres | Product DB + RLS (`firebase_uid()`) |
| Supabase Auth | **Not** live IdP (legacy callback only) |
| Prisma User | Privileged server/admin mapper only |

## Session lifecycle

### Web
1. Firebase SDK (`browserLocalPersistence`)
2. `POST /api/v1/identity/session` â†’ HttpOnly `fc-firebase-id`
3. API: Bearer preferred, else cookie â†’ `verifyFirebaseIdToken`
4. Bootstrap `identity_profiles` (upsert, race-safe)
5. Logout: Zustand clear + DELETE session + Firebase `signOut`

### Android
1. Firebase Auth + EncryptedSharedPreferences session mirror
2. OkHttp Bearer + 401 TokenAuthenticator refresh
3. Bootstrap via `/api/v1/identity/*`
4. Release: `allowLocalAuth=false` + `ProductionConfigGate`

## Auth phases

Web: `INITIALIZING | AUTHENTICATED | UNAUTHENTICATED | REFRESHING | ERROR` (`lib/auth/auth-phase.ts`).
Android UI: `IDLE | AUTHENTICATING | VERIFYING | SYNCHRONIZING | SUCCESS | ERROR | â€¦`

## Demo / fail-closed

- Demo only when `NEXT_PUBLIC_DEMO_MODE=true` **exactly**.
- With demo **off**: `?demo=` UI auto-login **disabled**; MobileAppLauncher demos **disabled**; middleware fail-closes protected HTML if Firebase unconfigured (`auth_unavailable`).
- APIs: missing Firebase config â†’ `503 auth_not_configured`; bad token â†’ `401`.

## Expo

`apps/mobile` remains **frozen**. Native Android is `android/`.
