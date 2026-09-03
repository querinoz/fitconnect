# Human auth configuration checklist

**Date:** 2026-08-29
**Do not paste secrets into chat, commits, or screenshots.**

Canonical architecture (do not change):

```text
Firebase Auth (IdP)
  → Firebase UID
  → identity_profiles
  → user_roles
  → Supabase Postgres RLS
```

- Supabase Auth ≠ production IdP
- Prisma `User` = privileged server-only
- Expo `apps/mobile` = frozen (not the Android production path)

---

## PUBLIC CONFIG (Web — safe for `NEXT_PUBLIC_*`)

Set in `apps/web/.env.local` (local) and **Vercel** project env (production/preview):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web SDK |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project id |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Web app id |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional Analytics |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Optional FCM web push |
| `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` | Optional App Check |
| `NEXT_PUBLIC_FIREBASE_APPCHECK_PROVIDER` | `recaptcha` \| `enterprise` |
| `NEXT_PUBLIC_DEMO_MODE` | Must be **`false`** in production |
| `NEXT_PUBLIC_SUPABASE_URL` | Data / RLS plane (not IdP) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable anon key only |

Diagnostic (presence only):

```powershell
node scripts/p1-auth-config-diagnostic.mjs
# or GET /api/v1/auth/config
```

---

## SECRET CONFIG (Server — never ship to browser/APK)

| Variable / secret | Purpose |
| --- | --- |
| `DATABASE_URL` / `DIRECT_URL` | Postgres (migrations, privileged jobs) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server admin only — **never** Android/web |
| `INTEGRATION_AUTH_SECRET` | Machine-to-machine jobs (if used) |
| Stripe / Strava / Redis secrets | Unrelated to IdP; keep server-only |

### Firebase Admin

**Not required** for ID token verification (`requireAuth` uses Google JWKS).
Firebase Admin / service account is only needed later for **server-side Auth user delete** (still PENDING_HUMAN). Do not invent a fake Admin key.

---

## ANDROID CONFIG

| Item | Location / value |
| --- | --- |
| Package name | `com.fitconnect.android` |
| Debug suffix | `com.fitconnect.android.debug` |
| `google-services.json` | **`android/app/google-services.json`** (gitignored) |
| Google Web Client ID | `local.properties` `firebase.webClientId=…` **or** env `FITCONNECT_GOOGLE_WEB_CLIENT_ID` |
| Release gate | `allowLocalAuth=false`, `ProductionConfigGate` enforced on release |

Without `google-services.json`, `BuildConfig.FIREBASE_CONFIGURED=false` → live IdP disabled.

---

## SERVER CONFIG (FitConnect API)

| Concern | Behavior when Firebase web config missing + demo off |
| --- | --- |
| `requireAuth` | `503 auth_not_configured` |
| Middleware protected HTML | Redirect `/signin?error=auth_not_configured` |
| Demo personas / `?demo=` | **Disabled** |
| tRPC | Same Firebase `requireAuth` boundary |

---

## Firebase Console

1. Create/select Firebase project.
2. **Authentication → Sign-in method**
   - Enable **Email/Password**
   - Enable **Google**
3. **Authentication → Settings → Authorized domains**
   - Add production web domain(s) (e.g. Vercel hostname)
4. Register **Web** app → copy web config into `NEXT_PUBLIC_FIREBASE_*`.
5. Register **Android** app
   - Package: `com.fitconnect.android` (and debug package if using separate registration)
   - Add **SHA-1** and **SHA-256** for: debug keystore, release keystore, Play App Signing
6. Download **`google-services.json`** → `android/app/`.
7. Google Cloud OAuth consent screen: support/contact URLs.
8. **Supabase** → Auth → Third-party / Firebase: enable Firebase as issuer (`fitconnect-5d2ba`); ensure JWT gets claim `role: "authenticated"`.
   - Deploy blocking functions: see [`FIREBASE_ROLE_CLAIM.md`](./FIREBASE_ROLE_CLAIM.md)
   - Backfill existing users: `node scripts/p1-auth-firebase-role-backfill.mjs` (requires `GOOGLE_APPLICATION_CREDENTIALS`)
   - Verify: `node scripts/p1-auth-live-bridge-check.mjs` → `JWT_ROLE=authenticated`, exit 0
9. Confirm migrations through **`016`** applied; RLS FORCE remains on identity tables.

---

## Production surfaces

### Vercel

- Set all `NEXT_PUBLIC_FIREBASE_*`
- `NEXT_PUBLIC_DEMO_MODE=false`
- Supabase URL + anon key
- Server secrets (DB, service role, Redis, Strava, Stripe) as encrypted env

### EAS / Expo

- **Not** the production mobile IdP path (`apps/mobile` frozen). Skip for P1-AUTH unblock unless you intentionally revive Expo later.

### Android (Gradle / Play)

- Place `google-services.json`
- Set Google Web Client ID for Credential Manager
- Release signing + Play App Signing SHA fingerprints in Firebase

### Firebase

- Providers + authorized domains + Android SHA fingerprints as above

---

## After configuration (verification)

1. `node scripts/p1-auth-config-diagnostic.mjs` → `FIREBASE_WEB_CONFIG=PRESENT`, `DEMO_MODE=DISABLED`
2. One real **email/password** user: Web + Android → **same Firebase UID**
3. One real **Google** user: Web + Android → **same Firebase UID**
4. Confirm row in `identity_profiles` / `user_roles`
5. Physical device checklist: `docs/auth/P1_AUTH_REAL_DEVICE_TEST.md`
6. Re-run live RLS/IDOR suites
7. Only then re-stamp `P1-AUTH = PASS` with evidence

## Explicitly later

- Apple Sign-In
- Blind App Check enforcement
- Firebase Auth Admin delete
- Production FCM / Crashlytics enforcement
