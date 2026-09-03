# P1-AUTH exit gate

**Date:** 2026-08-29 (final unblock verification attempt)
**Prerequisite:** `P1-DATA = PASS` (migration `016` untouched)
**Do not start P2-CORE.**

## Stamp

```
P1-AUTH = BLOCKED
P2-CORE = LOCKED

AUTOMATED_ENGINEERING = PASS
FIREBASE_CONFIGURATION = MISSING
FIREBASE_WEB_CONFIG = MISSING
ANDROID_GOOGLE_SERVICES = MISSING
FIREBASE_ADMIN = NOT_REQUIRED (JWKS verify) / Admin wipe PENDING_HUMAN
SUPABASE_THIRD_PARTY_FIREBASE_JWT = NOT_VERIFIED (no live Firebase token to probe)
PRODUCTION_AUTH = BLOCKED
ANDROID_UNIT = PASS
REAL_DEVICE = BLOCKED
RLS = PASS
IDOR = PASS
REGRESSION = PASS
```

## Why still BLOCKED (evidence, not assumption)

Commands run this session:

```powershell
node scripts/p1-auth-config-diagnostic.mjs
# â†’ FIREBASE_WEB_CONFIG=MISSING, ANDROID_GOOGLE_SERVICES=MISSING,
#   DEMO_MODE=DISABLED, PRODUCTION_AUTH_READY=false, exit 2

adb devices -l
# â†’ empty list (no device/emulator)

Test-Path android/app/google-services.json
# â†’ MISSING (glob 0 files)

# .env.local presence-only (no secrets printed):
# NEXT_PUBLIC_FIREBASE_* = ABSENT_OR_PLACEHOLDER (all required keys)
# NEXT_PUBLIC_DEMO_MODE = PRESENT (false / 5 chars)
```

Physical device checklist (`P1_AUTH_REAL_DEVICE_TEST.md`): **NOT_RUN** â€” preconditions failed (no `google-services.json`, no `adb` device).

Supabase third-party Firebase JWT: **NOT_VERIFIED** â€” cannot prove JWT `role=authenticated` without a real Firebase ID token against the Data API.

## Automated evidence (still green)

| Check | Result |
| --- | --- |
| Auth unit suite | **62/62 PASS** |
| Live identity + activities IDOR | **8/8 PASS** (`authenticated`, VALID) |
| Android `:foundation` + `:core:fitness` unit | **BUILD SUCCESSFUL** |
| Web `tsc --noEmit` | **PASS** |
| Demo / fake auth | Not used for gate |

## Human blockers (unchanged)

1. **Firebase Production Configuration** â€” fill `NEXT_PUBLIC_FIREBASE_*`, place `android/app/google-services.json`, configure Supabase third-party Firebase issuer + `role: authenticated`. See [`HUMAN_AUTH_CONFIGURATION.md`](./HUMAN_AUTH_CONFIGURATION.md).
2. **Real Android Device Verification** â€” connect device (`adb devices` non-empty), install Firebase-configured APK, execute [`P1_AUTH_REAL_DEVICE_TEST.md`](./P1_AUTH_REAL_DEVICE_TEST.md).

## Architecture (unchanged)

```text
Firebase Auth â†’ Firebase UID â†’ identity_profiles â†’ user_roles â†’ RLS
```

Supabase Auth â‰  IdP Â· Prisma User = privileged-only Â· Expo frozen Â· migration `016` not modified.

## Re-stamp rule

`P1-AUTH = PASS` and `P2-CORE = UNLOCKED` only after:

1. Diagnostic shows `FIREBASE_WEB_CONFIG=PRESENT` and `ANDROID_GOOGLE_SERVICES=PRESENT`
2. Real device checklist executed with evidence
3. Same Firebase UID â†’ `identity_profiles` proven Web + Android
4. RLS/IDOR still PASS
