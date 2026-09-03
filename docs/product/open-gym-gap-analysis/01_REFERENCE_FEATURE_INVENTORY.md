# openGym â€” Reference Feature Inventory

**Date:** 2026-09-01
**Reference:** [openGym](https://github.com/arvids-unavailable/openGym) (upstream: DuarteSantos8/openGym)
**License:** GNU AGPL v3.0 (documented publicly)
**Method:** Public README, changelog, product site â€” **no source code copied**

---

## Product summary

Self-hosted / standalone Android gym tracker: weekly plans, guided workouts, set logging, body-weight history, progression rules, import/export, muscle analytics, passkeys (self-hosted), native reminders.

---

## Feature inventory (reference)

| ID | Area | Reference capability |
|----|------|---------------------|
| A | Body weight | History chart, goal line, gains/losses vs goal |
| B | Weekly plan | Routine library, weekday schedule, exercise search/filter/categories/media/instructions |
| C | Rescheduling | Move single occurrence without mutating master template |
| D | Guided workouts | Session opens with targets prefilled; exercise order, sets, rest, PR state |
| E | Keep awake | Screen on during active workout; release on finish/cancel |
| F | Supersets | Back-to-back pair; rest after pair |
| G | Timed exercises | Work timer + rest timer; plank/hang/carry |
| H | Progression | Linear, Greyskull LP, double progression, time progression; routine + exercise override |
| I | Progression explain | Every target shows rationale ("why this number") |
| J | Failed reps | Missed reps do not advance load |
| K | Stall / deload | Stall detection, deload, reset; planned deload routines |
| L | Bodyweight progression | Rep-based; weighted bodyweight mode |
| M | Reps per side | Unilateral exercises; even-step targets |
| N | Cardio | Duration/speed/distance â€” not weightÃ—reps |
| O | Estimated 1RM | Per-exercise curve; source set shown |
| P | RPE / RIR | Optional per-set effort; informational |
| Q | Exercise library | Search, filter, equipment, muscles, media (~140MB media noted) |
| R | Equipment filter | Composable filters |
| S | Custom exercises | User-created; full parity in plans/history |
| T | Plan sharing | Export routine/schedule JSON/PDF; merge import; no private health |
| U | Import history | FitNotes, Strong, Hevy, Apple Health weight |
| V | Export / backup | Versioned JSON; restore |
| W | Activity heatmap | Year view training duration |
| X | Muscle map | Front/back, period filters, volume gaps |
| Y | Push notifications | Rest timer, workout reminder, native on Android |
| Z | Passkeys | WebAuthn on self-hosted |
| AA | Admin | User management (self-hosted) |
| AB | Theming | Light/dark/accent |
| AC | Multilingual | i18n |
| AD | Guest / local | Standalone APK â€” all data on device |
| AE | No telemetry | Product principle (FitConnect: **do not replicate blindly**) |

### Reference differentiators (ideas only)

- AI Coach plan design (optional OpenAI) â€” FitConnect has separate AI roadmap
- Warm-up sets excluded from 1RM/progression
- Greyskull LP with AMRAP top set
- Sideload APK / self-hosted Docker flavors

---

## FitConnect mapping intent

| Reference strength | FitConnect native target |
|--------------------|--------------------------|
| Workout engine | `ProgressionEngine` + strength session FSM |
| Body metrics | `BodyCompositionRepository` + Profile/Readiness |
| Plan builder | Coach Programs + `training_plans` (Postgres) |
| ASCEND | Single XP path via `activity.completed` â€” **no second XP system** |
| Design | Elite OS / Voltline â€” **no visual clone** |
