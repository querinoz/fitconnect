# Next Implementation Plan

**Date:** 2026-09-03
**Status:** P2-CORE remainder **engineering PASS** — see [P2_CORE_RESULT.md](P2_CORE_RESULT.md).

**NEXT AUTHORIZED PHASE (do not auto-start):** P2-GPS (outdoor activity → durable activities), after optional HC device smoke / coach bookings APIs if required for launch.

This document remains the longer roadmap. Wave 2 + P2-CORE engineering are in place; production remains **NO-GO**.

This document remains the longer roadmap. Historical “recommended next = RECONCILE” below is **done**.

---

## Recommended next phase

**Name:** `RECONCILE â†’ P1-AUTH`

Not Guided Workout yet. Not P2-GPS. Not Watch.

### Why this, not Workout-Engine Wave 2 first

Guided Workout is the highest **user-value** missing feature. It still writes `user_id`, `activities`, and ASCEND events. Those require a **frozen identity contract**. That contract is P1-AUTH + committed P1-DATA (`016` on the branch).

Starting Wave 2 on a dirty tree with untracked `016`/`017` and uncommitted Firebase auth would recreate the â€œfile exists = feature doneâ€ failure.

---

## PHASE 0 â€” Worktree freeze (ops, not product)

| | |
|--|--|
| **Objective** | One reviewable history; no mixed PRs |
| **Dependencies** | Human: authorize commits (agent does not commit in this audit) |
| **Order** | 1) P1-DATA (`016`, `canonical.ts`, tests, `docs/data/*`) 2) Strength Wave 1 (`017`, ProgressionEngine, `docs/product/*`) 3) P1-AUTH files separately 4) HC telemetry leftover separately 5) Leave Instagram/brand out unless asked |
| **Tests** | Status clean per commit; no secret files (`.env.vercel`, `.env.local.backup-*`) |
| **Exit** | Remote-tracking commits exist; `016` on branch; secrets uncommitted |

## PHASE 1 â€” P1-AUTH (canonical next engineering)

| | |
|--|--|
| **Objective** | Production-like auth contract: demo off in a CI job; Firebase UID maps to `identity_profiles`; no demo bypass on `/api/v1/*` in that job |
| **Dependencies** | PHASE 0; P0-SEC remains PASS; HUMAN Firebase config for production slice |
| **Areas** | `apps/web/lib/auth/*`, `middleware.ts`, Android `AuthViewModel` / gateway (already dirty), `docs/auth/P1_*` |
| **Do not** | Implement Google/Apple full production without HUMAN keys; do not replace Firebase with passkeys |
| **Tests** | Auth matrix unit; emulator email flow; identity RLS regression |
| **Exit** | `P1-AUTH` stamp with executable evidence; PRODUCTION_AUTH may remain PENDING_HUMAN |

## PHASE 2 â€” WORKOUT-ENGINE Wave 2 (product)

| | |
|--|--|
| **Objective** | Guided Workout on Android: PREP â†’ ACTIVE â†’ REST â†’ finish â†’ one `activities` row â†’ one XP event |
| **Dependencies** | PHASE 1 identity; apply `017` to Postgres; ProgressionEngine |
| **Areas** | `StrengthWorkoutScreen`, wakelock, rest timer, set log, Train FAB |
| **Tests** | Unit + instrumentation TEST 001â€“007 subset; no duplicate XP |
| **Exit** | Athlete can complete a strength session offline-queue then sync |

## PHASE 3 â€” P2-CORE remainder

Health Connect sleep/steps + durable store decision; Coach remote data; remove Today engineering noise.

## PHASE 4 â€” P2-GPS

FusedLocation + FGS + persist route points. **Do not claim LIVE GPS before this.**

## Later (do not start now)

P3-REALTIME Â· P4-ASCEND unify Â· P5-SOCIAL persist default Â· P6-SQUAD Â· P7-WATCH ID reconcile Â· P8 a11y/perf Â· P10 HUMAN infra Â· P11 QA Â· P12 release

---

## Dependency graph

```
WORKTREE RECONCILE
        â†“
   P1-DATA on git (016)
        â†“
      P1-AUTH
        â†“
   017 applied
        â†“
 WORKOUT DOMAIN UI (guided)
        â†“
   activity.completed
        â†“
      ASCEND (existing bus)
        â†“
 Coach analytics / Squad (authorized)
        â†“
     P2-GPS â†’ Watch IDs â†’ Realtime default
```

---

## What NOT to implement yet

- openGym UI clone / nutrition app
- Stories/Reels
- Passkeys as IdP replacement
- Expo thaw
- `android/` â†’ `apps/android/`
- MapLibre production tiles
- Muscle map / heatmap / importers (Wave 3â€“4)
- Production GO

---

## Path to production (shortest safe)

1. Reconcile git
2. P1-AUTH engineering + HUMAN Firebase
3. Guided Workout + HC durable sync
4. P2-GPS if outdoor is in launch slice
5. CI demo-off job + P11 matrix
6. P10 signing/Play/legal
7. GO decision â€” currently **NO-GO**
