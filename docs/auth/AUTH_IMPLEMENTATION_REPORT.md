# P1-AUTH implementation report

**Date:** 2026-08-29 (supersedes 2026-08-20 PENDING_HUMAN stamp for engineering)

## Verdicts

| Gate | Status |
| --- | --- |
| P1-AUTH | **BLOCKED** (see `P1_AUTH_EXIT.md`) |
| AUTH_ENGINEERING | **PASS** |
| PRODUCTION_AUTH | **PENDING_HUMAN** / **BLOCKED** (no Firebase keys on this machine) |
| LOCAL_AUTH | **PASS** (debug-only; fail-closed in release) |
| WEB_ANDROID_IDENTITY | **PASS** (same UID model) |
| REAL_DEVICE | **BLOCKED** |

Canonical identity unchanged from P1-DATA:

1. Firebase Auth issues the user.
2. Firebase UID = `identity_profiles.id`.
3. Supabase Data API + RLS via Firebase ID token.
4. Supabase Auth is **not** a second live IdP.

## Agent changes this session

- Closed AuthGate / MobileAppLauncher demo bypass when demo mode is off.
- Middleware fail-closes protected routes if Firebase is unconfigured and demo is off.
- tRPC uses Firebase `requireAuth`.
- Identity bootstrap upsert for concurrent first login.
- Auth phase helpers + security matrix tests.
- Android AuthViewModel uses `SYNCHRONIZING` after successful sign-in/up.

## Expo

Not revived.
