# Open Gym — Current Gap (reassessed 2026-09-04)

**Mode:** AUDIT ONLY · **DO NOT IMPLEMENT** Open Gym features from this document.
**Purpose:** Reclassify gap vs FitConnect **after** Workout Wave 2 / P2 outdoor — for awareness only.
**Canonical older matrix:** [`OPEN_GYM_FEATURE_GAP.md`](./OPEN_GYM_FEATURE_GAP.md) (2026-09-02 — partially stale).

**Rule:** schema or engine file ≠ FULL product capability. Core product readiness > feature expansion.

---

## Status vocabulary

| STATUS | Meaning |
|--------|---------|
| FULL | Shipped product capability with durable path |
| PARTIAL | Engine and/or UI exist; gaps remain |
| MISSING | Not product-usable |
| REJECTED | Intentionally out of FitConnect principles |
| STUB | Schema/API stub only |

---

## Reassessment highlights (delta vs 2026-09-02)

| ID | Feature | Prior (2026-09-02) | **Current (2026-09-04)** | Notes |
|----|---------|--------------------|--------------------------|-------|
| D | Guided workout | **MISSING** | **PARTIAL** | Wave 2 ENGINEERING PASS: runtime, Room store, StrengthWorkoutScreen, sync handlers. Not Open Gym feature-complete (progression UI, media library, etc.). |
| E | Keep screen awake | MISSING | **PARTIAL** | `WorkoutWakePolicy` present in sports guided — verify device behavior NOT_VERIFIED |
| — | Offline workout | MISSING (no Room) | **PARTIAL** | Room guided + outdoor stores exist; full offline product claim NOT_VERIFIED |
| H/I/F/G | Progression / explain / supersets / timed | PARTIAL | **PARTIAL** | Engine/tests still ahead of full athlete UX parity |
| Y | Rest notifications | MISSING | **MISSING** | FCM product FORBIDDEN now |
| AB | Theming | FULL (own system) | **FULL** | Elite OS / neu-glass — do not copy Open Gym colors |
| AE | No telemetry | REJECTED | **REJECTED** | Unchanged |
| Z | Passkeys | NOT_RELEVANT | **NOT_RELEVANT** | Unchanged |

Other rows from `OPEN_GYM_FEATURE_GAP.md` (library, muscle map, import/export, weekly plan, etc.) remain **PARTIAL / MISSING / STUB** as previously classified unless listed above — **not re-verified line-by-line this audit**.

---

## Counts (honest, approximate after delta)

| STATUS | Approx |
|--------|--------|
| FULL | 1+ (theming; guided still PARTIAL) |
| PARTIAL | ↑ (guided + offline + wake moved up) |
| MISSING | ↓ slightly |
| REJECTED | 1 |
| NOT_RELEVANT | 1 |

---

## Product decision

**Do not open Open Gym scope as the next phase.**
Highest remaining Open Gym *value* items still sit behind: physical outdoor evidence, a11y, and identity-honest sync — not a greenfield gym feature sprint.
