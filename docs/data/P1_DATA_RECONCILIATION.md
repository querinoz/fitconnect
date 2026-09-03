# P1-DATA reconciliation

**Date:** 2026-09-02
**HEAD:** `7ee6811` â€” **016 and 017 are not on HEAD** (untracked files on disk).

001â€“015 were **not rewritten**.

---

## A. Is 016 real?

**YES.** `supabase/migrations/016_p1_data_canonical.sql`

Creates `data_schema_meta`, `activities` (with generated `shareable`), route points, readiness snapshots, badges, notifications, domain events, connected devices. Units documented in SQL: meters, ms, bpm, kcal, timestamptz UTC.

## B. Is 017 real?

**YES.** `supabase/migrations/017_strength_workout_engine.sql`

Strength plans/routines/sets/progression_states + RLS. Links `activity_id` â†’ `activities.id`. Does not modify 001â€“016.

## C. Complete?

Engineering-complete as SQL + TypeScript contracts (`packages/types/src/canonical.ts`). Not a product UI freeze. Wear still uses local `wear-*` IDs until P7.

## D. Internally consistent?

Identity: `identity_profiles.id` = Firebase UID = application `userId` (migration 012). 016 `activities.user_id` is `text` matching that UID.

HRV: `readiness_snapshots.hrv_ms` + `READINESS_UNITS.hrv = ms_rmssd` (RMSSD-style milliseconds, not SDNN / ln(RMSSD)).

kcal: explicit `calories_kcal` (not kJ). Helper `kjToKcal` for legacy Android mislabel.

## E. Applied anywhere?

Historical apply of **016** on project `beuiammeedpovdkmhluw` (live RLS tests 2026-09-02 still pass against activities). **017** is not required for P1-AUTH; treat live apply as **PENDING_HUMAN** unless inventory script is re-run.

## F. Tests

- `apps/web/tests/data/p1-data-contracts.test.ts` â€” 7/7 PASS (2026-09-02)
- `apps/web/tests/data/p1-data-activities-rls.integration.test.ts` â€” 3/3 PASS with `P0_SEC_LIVE_RLS=1`, role `authenticated`, `rolbypassrls=false`

## G. Conflicting numbers?

No second `016`/`017`. Sequence 001â€“017 is unique.

## H. Prisma disagreement?

Deliberate. Prisma `User` remains a **privileged server mapper** (cuid). Comment in `prisma/schema.prisma` states it must not authorize user-scoped reads. Canonical user identity is `identity_profiles.id`.

## I. Android / Web types?

`CanonicalIdentityKeys` and `ACTIVITY_UNITS` / `READINESS_UNITS` are the shared contract. Android session/Wear IDs still need P7 reconcile â€” documented, not silently invented.

---

## ASCEND (do not build v2)

| Store | Status |
|-------|--------|
| `public.ascend_events` + `ascend_progress` via `lib/progression/supabase-repository.ts` | **Canonical write/read** for activity-derived XP |
| `lib/progression/server-store.ts` | **IN_MEMORY_DEMO** adapter â€” pending removal after P4-ASCEND |
| `lib/gamification/store.ts` | **LOCAL_DEMO** Zustand â€” not SoT |
| Android `InMemoryAscendStore` / `AscendEngine` | **LOCAL_DEMO adapter** â€” scoring/offline queue, not Postgres SoT |

P1-AUTH did not add a fourth identity or XP store.

---

## Status

| Item | Status |
|------|--------|
| 016 on disk | REAL |
| 017 on disk | REAL |
| 016 on git HEAD | **NO** â€” PENDING commit authorization |
| Canonical contracts | DOCUMENTED + unit tested |
| Live activities RLS (today) | PASS |
