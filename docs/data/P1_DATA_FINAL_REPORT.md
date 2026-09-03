# P1-DATA â€” Final report

**Date:** 2026-09-01
**Branch:** `feat/elite-os-v2` @ `7ee6811`
**Author:** engineering agent (P1-DATA reconciliation pass)
**Exit:** [`P1_DATA_EXIT_GATE.md`](./P1_DATA_EXIT_GATE.md)

---

## Executive summary

P1-DATA establishes **one canonical Postgres schema** (`016`) and **cross-platform contracts** (`@fitconnect/types/canonical.ts`) for identity, activities, readiness, ASCEND, squad, social v1, notifications, devices, and domain events.

**Live RLS evidence** passes on project `beuiammeedpovdkmhluw` under `authenticated` role (not BYPASSRLS).

**Remaining gaps** are explicit: web dashboard still reads Prisma for demo paths; Android uses in-memory workout store; Wear IDs not reconciled; community web layer not wired to SQL; Health Connect sync persistence incomplete.

---

## CURRENT DATA ARCHITECTURE

```
Firebase UID â†’ identity_profiles â†’ Postgres RLS
Canonical activity = public.activities (UUID)
ASCEND SoT = ascend_events / ascend_progress / user_badges
Social v1 = community_posts / post_reactions
Squad = squad_challenges / members / contributions
Events = domain_events (event_id)
```

Prisma = privileged Strava/coaching/Stripe overlay only.

---

## PROBLEMS FOUND

1. Dual schema: Prisma cuid `User` vs Firebase `identity_profiles`.
2. `workout_sessions` (uuid) incompatible with Firebase JWT â€” deprecated.
3. Triple readiness paths â€” canonical = `readiness_snapshots`.
4. Dual XP clients: Zustand (LOCAL_DEMO) + Android AscendStore vs `ascend_events`.
5. Web `db/repository.ts` still Prisma-first for dashboard.
6. Community web in-memory (`server-posts.ts`) vs SQL `014`.
7. Wear local `wear-*` ids â€” not reconciled (P7).
8. Android `InMemoryWorkoutSessionStore` â€” no durable persistence yet.
9. Health Connect: read path partial; Room/WorkManager not shipped.
10. P1-DATA artifacts (`016`, `canonical.ts`, docs) **untracked** in git â€” must be committed.

---

## CANONICAL DECISIONS

| Domain | SoT |
|--------|-----|
| Identity | `identity_profiles` + `user_roles` |
| Activity | `activities` + `activity_route_points` |
| Readiness | `readiness_snapshots` + `@fitconnect/utils` formula |
| XP | `ascend_events` (idempotent `event_id`) |
| Badges | `badge_definitions` + `user_badges` |
| Notifications | `user_notifications` |
| Devices | `connected_devices` |
| Events | `domain_events` |
| Strava privacy | DB generated `shareable` + RLS |

**Units:** meters, milliseconds, bpm, kcal, timestamptz UTC.

---

## MIGRATIONS

| Range | Status |
|-------|--------|
| `001`â€“`015` | Preserved â€” not modified |
| `016_p1_data_canonical.sql` | Applied on dev project; **untracked in git** |

---

## VERIFICATION (2026-09-01)

| Command | Result |
|---------|--------|
| `vitest tests/data/p1-data-contracts.test.ts` | **6/6 PASS** |
| `vitest tests/data/p1-data-activities-rls.integration.test.ts` | **3/3 PASS** |
| `vitest tests/integration/identity-rls.integration.test.ts` | **5/5 PASS** (P0 regression) |
| `vitest tests/auth/p1-auth-security-matrix.test.ts` | **5/5 PASS** |
| `gradlew :athlete:testDebugUnitTest :core:fitness:testDebugUnitTest` | **BUILD SUCCESSFUL** |
| `CERT_ROLE` | `authenticated`, `rolbypassrls=false` |

**Not run this pass:** full `pnpm test`, `pnpm build`, Wear build, cross-platform manual test (Android create â†’ Web verify).

---

## ANDROID / WEB / WATCH

| Surface | Contract status | Notes |
|---------|-----------------|-------|
| Android fitness domain | **PASS** (types/units aligned) | Persistence in-memory |
| Android HC | **PARTIAL** | Wave 7 read path committed |
| Web API `/api/v1/workout-sessions` | **PASS** | Uses `activities` |
| Web dashboard repo | **FAIL** (dual path) | Prisma `db/repository.ts` |
| Web progression | **PASS** | `supabase-repository.ts` |
| Wear | **BLOCKED** | Local session ids until P7 |

---

## DOCUMENTATION DELIVERED

| Doc | Status |
|-----|--------|
| `P1_DATA_ARCHITECTURE.md` | Updated 2026-09-01 |
| `P1_DATA_SCHEMA_RECONCILIATION.md` | **New** |
| `P1_DATA_WORKTREE_RECONCILIATION.md` | **New** |
| `P1_DATA_MIGRATION.md` | Existing |
| `P1_DATA_CONTRACTS.md` | Existing |
| `P1_DATA_RLS.md` | Existing |
| `P1_DATA_REALTIME.md` | **New** |
| `P1_DATA_OFFLINE.md` | **New** |
| `P1_DATA_EXIT_GATE.md` | Updated |
| `P1_DATA_FINAL_REPORT.md` | This file |

---

## P1-DATA VERDICT

**Engineering gate: PASS** â€” schema, contracts, RLS, and idempotency tests provide executable evidence.

**Caveats (do not confuse with production GO):**

- Untracked migration/types/docs must be committed
- Web dashboard dual-path remains
- Android/Wear offline persistence incomplete
- Production credentials PENDING_HUMAN

**NEXT_PHASE:** P1-AUTH (after human review + commit of P1-DATA artifacts)

**PRODUCTION:** Still **NO-GO**
