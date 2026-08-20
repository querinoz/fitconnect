# 16 — Production infrastructure audit

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`

## Hosting

| Piece | State |
| --- | --- |
| Vercel `apps/web` | Deploy pipeline exists; demo/prod env HUMAN |
| GitHub Actions `ci.yml` | lint, typecheck, unit, Playwright (demo) |
| EAS / Expo | Frozen — do not use for v1 store |
| Play Console | HUMAN |
| Supabase project | HUMAN URL/keys; migrations not proven applied |
| Firebase project | `google-services.json` gitignored / often absent |
| Upstash Redis / QStash | Optional; webhook currently degrades unsafely |
| Convex | Optional; CI default broadcast |
| Stripe | Demo |
| LiveKit | Keys or demo fallback |
| Sentry / PostHog | Client snippets; not a substitute for Crashlytics on Android |

## CI demo problem

`.github/workflows/ci.yml`:

- Workflow `env.NEXT_PUBLIC_DEMO_MODE: "true"`
- `NEXT_PUBLIC_REALTIME_PROVIDER: broadcast`
- E2E jobs still pass demo true
- A later job sets demo false in places — **not** the E2E default

P1-AUTH must make a **production-like** CI path: demo false, real auth contract, no silent guest.

## HUMAN (P10) — do not invent values

See `17_HUMAN_ACTION_PLAN.md` and `docs/android/ANDROID_HUMAN_PENDING.md`.

Apple Developer: **out of this cycle**.
