# Human auth configuration checklist

Do **not** paste secrets into chat. Configure these in Firebase Console, Google Cloud, Supabase, and Vercel/EAS secrets.

## Required steps

1. Create/select Firebase project.
2. Register Android app (`com.fitconnect.android` — confirm in Gradle).
3. Register Web app.
4. Add SHA-1 (debug + release + Play App Signing).
5. Add SHA-256 (debug + release + Play App Signing).
6. Enable Google provider.
7. Enable Email/Password provider.
8. Download `google-services.json` into `android/app/` (gitignored).
9. Configure Web Firebase environment (`NEXT_PUBLIC_FIREBASE_*`).
10. Configure Supabase Third-Party Firebase Auth (Firebase as issuer; see Supabase docs).
11. Set required custom JWT claim `role: "authenticated"` on Firebase users (blocking Cloud Function / Identity Platform). After signup, clients already force-refresh the ID token.
12. Apply production RLS: `supabase/migrations/012_firebase_identity.sql` (and prior migrations). Confirm `FORCE ROW LEVEL SECURITY` remains on identity tables.
13. Confirm production Supabase URL (`NEXT_PUBLIC_SUPABASE_URL`).
14. Confirm publishable/anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). Never ship `SUPABASE_SERVICE_ROLE_KEY` to Android or the browser.
15. Configure Google OAuth support/contact information on the consent screen.
16. Test one real Google account on Android + Web (same Firebase UID).
17. Test one real email/password account on Android + Web (same Firebase UID).

## After configuration

- Set `NEXT_PUBLIC_DEMO_MODE=false` in production.
- Android release: `allowLocalAuth=false` (already gated by `ProductionConfigGate` when enforce is on).
- Confirm App Check Play Integrity (prod) / debug provider (emulator) before enabling enforcement.

## Explicitly later

- Apple Sign-In (HUMAN_CONFIGURATION).
- Production FCM / Crashlytics / Performance enforcement.
- Play signing key rotation.
