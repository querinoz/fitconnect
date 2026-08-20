# 01 — Repository inventory

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`  
**Scope:** read-only map of what exists. No deletions in this phase.

## Monorepo

| Path | Role | Status |
| --- | --- | --- |
| `apps/web` | Next.js 15 App Router, Vercel production | Active |
| `apps/mobile` | Expo 52 | **Frozen (ADR-005)** — do not revive |
| `android/` | Native Kotlin/Compose product | Active |
| `android/wear` | Wear OS | Partial; few tests |
| `packages/` | 11 packages (api-client, types, db, ai, strava-integration, realtime-client, design-tokens, maps, utils, config, elite-core-wasm) | Mixed maturity |
| `prisma/schema.prisma` | 19+ Prisma models | Server/privileged path |
| `supabase/migrations/` | 12 SQL files (`001`–`012`) | Product + identity SQL |
| `convex/` | Generated + presence/messages | Not canonical for product rows |
| `docs/` | Large historical phase reports | Reference; this folder supersedes them for sequencing |

## Android Gradle modules

`app`, `foundation`, `athlete`, `coach`, `community`, `ascend`, `ai`, `core-capture`, `core/fitness`, `sports`, `geo`, `telemetry`, `design`, `design-ui`, `shared`, `wear`

## Canonical product surfaces (v1)

| Surface | Nav (athlete) | Notes |
| --- | --- | --- |
| Android Athlete | Today · Analysis · Achievements · Profile + Train FAB | IA 2026-08-20; no 5th tab |
| Android Coach | Coach OS modules | Production data still incomplete |
| Web PWA | Dashboard / coach / sessions / profile | i18n 6 locales; dashboards still EN-heavy |
| Wear | Data Layer partial | Physical watch HUMAN |

## Identity / data (current engineering, not production-verified)

| Concern | Intended canonical | Current reality |
| --- | --- | --- |
| Identity | Firebase Auth UID | Android Firebase-first; web Firebase engineering present; production config HUMAN |
| Product DB | Supabase Postgres + RLS | Dual Prisma vs SQL; `012_firebase_identity.sql` unapplied to live project |
| Authorization | RLS | Policies written for identity tables; live two-user Postgres **not verified here** (no Docker) |
| Demo | Explicit `LOCAL_DEMO` / `NEXT_PUBLIC_DEMO_MODE=true` | CI default demo **on** for most jobs |

## Integrations present in code

Strava (mature package), Health Connect (Android core), placeholders/catalog for Whoop/Oura/Garmin/Apple Health, Stripe demo, LiveKit fallback, PostHog client, Firebase FCM/Crashlytics/App Check **prepared** without production credentials.

## Tests (order-of-magnitude)

- Web Vitest: strong (300+ unit tests)
- Playwright: 12 specs under `apps/web/tests/e2e/`
- Android: foundation/athlete/fitness unit tests exist; Wear almost none
- Maestro: present; blocked without AVD/device
- Mobile Expo tests: ignore (frozen)

## Do not treat as product

- `apps/mobile`
- `docs/mockups` HTML (design artifacts)
- Historical `docs/phase-*` scores without re-verification
- Convex generated clients as source of truth for USER/ACTIVITY rows
