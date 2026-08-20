# 02 — Architecture audit

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`

## Frozen architecture (do not invent a second one)

| Concern | Decision | ADR / rule |
| --- | --- | --- |
| Mobile product | Native Android Compose, not Expo | ADR-005 |
| Web | Next.js PWA | ADR-010 |
| Wear | Wear OS + Data Layer | ADR-010 |
| Design tokens | `--eos-*` only for new UI | ADR-001 / Elite OS |
| Fitness providers | `FitnessProvider` + Health Connect core | AGENTS.md |
| Strava | Own-athlete only; never social; never ML training | AGENTS.md §1 |
| DB | Supabase Postgres | ADR-009 |
| Metrics | Elite Core (Rust) for physiology | ADR-006 |
| Maps | MapLibre + OpenFreeMap (when real GPS exists) | ADR-008 |
| Realtime | Convex = app events; Supabase = presence/chat; no Broadcast in production | ADR-002 / this plan |
| Identity (target) | Firebase Auth UID + Supabase third-party JWT + RLS | This plan + `docs/auth/*` |

## Violations still in the tree

1. **Dual schema:** Prisma 19 models vs 12 Supabase SQL migrations. Identity 012 is SQL-canonical; training/social still split.
2. **Dual XP:** `android/ascend` vs `apps/web/lib/gamification`.
3. **Dual readiness:** `apps/web/lib/readiness/compute.ts` vs historical `apps/mobile/lib/readiness.ts` (frozen app) vs Android copies — target `@fitconnect/utils`.
4. **Dual realtime:** CI sets `NEXT_PUBLIC_REALTIME_PROVIDER=broadcast`; Convex exists but is not default.
5. **Dual Strava policy:** Android `StravaPathAllowlist` bans club/kudos/comments/explore; web `packages/strava-integration/src/endpoints.ts` still **allows** them.
6. **Prisma privileged bypass:** User-facing rows must not go through service-role Prisma on the device. Server jobs only, explicit, audited.

## Ports that are correct and must be reused

- Android `AuthRepository` / `FirebaseAuthRepository` / `SessionSnapshot`
- Android `FitnessProvider` + social SQL barrier on `shareable`
- Web `requireAuth` / `requireAthleteId` (bind to self)
- `@fitconnect/strava-integration` as the **only** Strava HTTP client — after allowlist is fixed

## Forbidden architecture

- Firebase Auth **and** Supabase Auth as two live IdPs
- Expo revival
- Google Fit remnants (none found; keep it that way)
- Strava in feed/ranking/map-shared/coach roster
- Service role in APK or browser
- `auth.uid()` uuid equality against Firebase text UIDs

## Composition

```
Firebase UID
    → Supabase JWT (third-party)
    → PostgREST + RLS
    → identity_profiles / product tables

Health Connect (core) + other FitnessProvider adapters
    → workout_sessions.shareable generated column
    → social queries WHERE shareable = true
    → Strava rows never shareable
```
