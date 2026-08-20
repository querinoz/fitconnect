# 18 — Technology decisions (frozen)

**Date:** 2026-08-20  
**Phase lock:** `P0-DOCS`

If a future prompt conflicts with this table, **stop and ask**.

| Topic | Decision |
| --- | --- |
| Identity | Firebase Auth; UID is the stable key |
| Session to API | Firebase ID token as Bearer / httpOnly cookie |
| Product database | Supabase Postgres |
| Authorization | RLS; `firebase_uid()` = JWT `sub` (text) |
| Bridge | Official Supabase third-party Firebase Auth — no custom JWT factory on device |
| Prisma | Server/admin only; never user-facing bypass of RLS |
| Demo | Explicit flag only; production fail-closed |
| Mobile | Android Compose; Expo frozen |
| Wear | Wear OS; certify later |
| Health data core | Health Connect via `FitnessProvider` |
| Strava | Own athlete, webhook+FCM, 85% rate brake, banned endpoints |
| Realtime prod | Convex events; Supabase presence/chat; **no** Broadcast default |
| Maps | MapLibre + OpenFreeMap after real GPS |
| Metrics | Elite Core Rust |
| Payments | Real Stripe before go-live or hide flows |
| Social v1 | shareable-only; no Stories/Reels |
| Apple | Later HUMAN_CONFIGURATION |
| Skills | Minimal set; no bulk install in P0-DOCS |

## Schema path (P1-DATA wording)

**One schema path for product data:** Postgres as source of truth, **RLS always on**, Prisma only as a privileged server mapper onto the **same** tables — not a second schema. P1-DATA must converge Prisma and `supabase/migrations`, not add a third store.

## Realtime path (P3)

`NEXT_PUBLIC_REALTIME_PROVIDER=convex` in production. Broadcast is LOCAL_DEMO / CI-today, not ship default.
