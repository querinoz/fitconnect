# Implementation plan — Zenith ecosystem integration (living)

**Branch of record:** `feat/fitconnect-roadmap-v10-v11` (contains V10–V12 + IA)  
**Note:** `feat/elite-os-v2` exists remotely; **do not reset** active V12 tip onto it without an explicit merge plan.

## Phase 0 — DONE (2026-09-24)

| Item | Status |
| --- | --- |
| Legal third-party matrix | done |
| GymMane feature analysis (no GPL copy) | done |
| Agent skills matrix (selective) | done |
| Karpathy engineering rule | done |
| Cross-platform design contract | done |
| Offline training gap map | done |

## Phase 1 — Process (human Cursor installs)

| Item | Status | Owner |
| --- | --- | --- |
| Superpowers / Matt TDD skills in **user** Cursor | human-required | Developer machine |
| ECC selective modules (if needed) | blocked pending conflict review | — |
| Find Skills CLI optional | optional | — |
| Anthropic skills vendor | **forbidden** | — |

## Phase 2 — Offline training increments

| Item | Status |
| --- | --- |
| Sync state vocabulary tests | **done** (`SyncStatusVocabulary` + unit test) |
| Rest timer notification | **done** (`WorkoutNotificationPort.restTimer` + runtime bridge + unit tests) |
| Health Connect workout write | **done** (opt-in writer + loop filter on reader + unit tests; UI consent surface pending) |
| WorkoutShareCard confirm-gated | **done** (domain + PRIVATE default + confirmShare) |
| Export ZIP harden | **done** (`GuidedWorkoutExporter` JSON/CSV/ZIP + multi-session manifest) |

## Phase 3 — Web glass (selective)

| Item | Status |
| --- | --- |
| `ZenithGlass` abstraction | **done** (native frost + `@supports` fallback; QuickLiquid not required) |
| QuickLiquid MIT evaluate + integrate (nav/FAB only) | pending (optional enhancement) |
| OriginKit targeted fetch (API key / daily limit) | human-required if key needed |
| Lighthouse ≥90 campaign | pending (prod still behind branch) |

## Phase 4 — Native foundations

| Item | Status |
| --- | --- |
| Android M3 Expressive + Zenith tokens audit | in-progress (already Compose/M3) |
| Wear Material3 isolation audit | pending |
| iOS Liquid Glass chrome (when Mac runtime) | blocked-external on Windows |

## Phase 5 — Release / external

| Item | Status |
| --- | --- |
| Xiaomi ADB physical | blocked-external |
| Play signing keystore | human-required |
| Production deploy of V12 APIs/routes | human-required / CI |
| Wire HC write opt-in toggle in athlete Settings UI | **done** (`athlete_hc_write_opt_in` + completion side-effect) |
| Rest notification POST_NOTIFICATIONS runtime prompt QA | pending (device) |

## Done definition (ecosystem)

Not “install libraries.” Complete when: offline guarantees tested, legal matrix clean, skills selective, platforms coherent, release gates honest.
