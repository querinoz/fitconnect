# 17 — Human action plan

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`  
**Do not paste secrets into chat.**

Human work is **P10-HUMAN-INFRA** and device enablement. Engineering must not fake PASS.

## Ordered (when engineering reaches P10, plus earlier device needs)

1. Enable hypervisor (VT-x/AEHD) **or** use a physical phone — AVD was historically `accel: 6`
2. Firebase project: Android + Web apps, SHA-1, SHA-256, Email/Password, Google
3. Place `android/app/google-services.json` (gitignored)
4. Web `NEXT_PUBLIC_FIREBASE_*` on Vercel
5. Supabase production URL + anon key; **never** service_role on clients
6. Enable Supabase Third-Party Firebase Auth + `role: authenticated` claim
7. Apply SQL migrations including `012_firebase_identity.sql`
8. `NEXT_PUBLIC_DEMO_MODE=false` in production
9. Strava: real verify token (no `fitconnect-dev`), QStash in production
10. Upstash for rate limits
11. Release keystore + Play App Signing
12. FCM / Crashlytics / Play Integrity (enforce later, after metrics)
13. Privacy Policy + Terms **published URLs**
14. Store listing assets + testers
15. Physical Wear pairing when P7 starts
16. Stripe/LiveKit/Sentry/PostHog/Convex only if those products stay in v1

## Out of cycle

- Apple Sign-In / Apple Developer
- Mass skill installation
- Higgsfield landing film

## Auth checklist (existing)

`docs/auth/HUMAN_AUTH_CONFIGURATION.md` — 17 steps. Still valid. Do not duplicate secrets into this file.
