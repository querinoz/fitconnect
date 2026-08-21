# P1-AUTH implementation report

Date: 2026-08-20

## Verdicts

| Gate | Status |
| --- | --- |
| P1-AUTH | **PENDING_HUMAN** (engineering complete; production credentials absent) |
| LOCAL_AUTH | **PASS** (unit tests; demo fail-closed preserved) |
| AUTH_ENGINEERING | **PASS** |
| PRODUCTION_AUTH | **PENDING_HUMAN** |
| GOOGLE_LOCAL | **PASS** (Credential Manager + Firebase credential path implemented; emulator Google not claimed) |
| GOOGLE_PRODUCTION | **PENDING_HUMAN** |
| EMAIL_PRODUCTION | **PENDING_HUMAN** |
| WEB_ANDROID_IDENTITY | **PASS** (same Firebase UID model; live cross-device test PENDING_HUMAN) |

## Canonical identity

**One** FitConnect identity:

1. Firebase Auth issues the user (Email/Password, Google).
2. Firebase UID is the stable external key (`identity_profiles.id` text).
3. Supabase Data API receives the Firebase ID token as the access token.
4. RLS uses `public.firebase_uid()` = `auth.jwt() ->> 'sub'` (never `auth.uid()` uuid cast).

Supabase Auth is **not** a second live IdP. The previous web `authBackend(): "supabase"` path is removed. Unconfigured production is fail-closed (`auth_not_configured` / AuthShell unconfigured), not silent demo.

## What was implemented

### Android

- Existing `FirebaseAuthRepository` remains the identity adapter.
- Credential Manager Google ID token → Firebase credential (already present).
- Sign-out: isolation wipe + Firebase `signOut` + Credential Manager `clearCredentialState`.
- `AuthSession` conceptual type maps onto existing `SessionSnapshot` / `AuthUser`.
- After sign-in: bootstrap `POST /api/v1/identity/profile`.
- Role selection: `PUT /api/v1/identity/role` (ATHLETE/COACH only).
- Onboarding: local DataStore cache + server `onboarding_state`.
- `SupabaseAuthRepository` is no longer wired as a live IdP.
- FCM `registerForPush()` after real (non-demo) sign-in.

### Web

- Firebase Web SDK: email sign-up/in, Google popup, password reset, `browserLocalPersistence`.
- HttpOnly cookie `fc-firebase-id` for middleware + API routes.
- Elite OS `AuthShell` / `OAuthRow` kept (no FirebaseUI).
- Demo passwords work **only** when `NEXT_PUBLIC_DEMO_MODE=true`.

### Not in this phase

- Apple production.
- Expo (`apps/mobile` remains frozen).
- Blind App Check enforcement.

## Evidence labels

- Firebase Emulator was **not** required for the unit suite. Do not confuse LOCAL_AUTH with production Google.
- `android/app/google-services.json` is absent on this machine → do not claim production Google PASS.

## Remaining P0 (outside complete identity slice)

- Broader Strava allowlist on web still includes banned paths in `packages/strava-integration`.
- Coach Strava list route is now fail-closed (`strava_not_shareable`).
- Account deletion / legal hrefs remain open product P0s.
