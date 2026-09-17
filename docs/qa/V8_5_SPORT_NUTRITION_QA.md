# V8.5 Sport + Nutrition QA Matrix

**Branch:** `feat/zenith-v8-5-sport-intelligence`  
**Baseline:** `c78c2fd`  
**Updated:** 2026-09-17

| Area | Status | Evidence |
|------|--------|----------|
| Training Domain | IN PROGRESS | `lib/sport-intelligence/*` + tests |
| Sport Registry | PASS | 25 sports, unit tests |
| Session Engine | PASS (compose) / reuse active machine | composer + `lib/train/machine.ts` |
| Exercise Library | REUSE | `lib/train/catalog.ts` |
| Progression Engine | PASS | unit tests |
| Active Workout | REUSE | existing TRAIN UI |
| Offline Workout | REUSE | localStorage persistence |
| Crash Recovery | REUSE | restore snapshot |
| Nutrition Domain | IN PROGRESS | types + planning + food seed |
| Food Database | PARTIAL | PortFIR/USDA/OFF seed + caveats |
| Meal Planner | NOT STARTED | — |
| Recipes | NOT STARTED | — |
| Grocery | NOT STARTED | — |
| Hydration | PARTIAL | target hydrationMl |
| Nutrition Safety | PASS | LEA / combat / high-risk tests |
| AI Training | NOT STARTED | — |
| AI Nutrition | NOT STARTED | — |
| MCP | PARTIAL | routes exist; tool aliases pending |
| Dashboard | NOT STARTED | — |
| Android | IN PROGRESS | parallel agent |
| WearOS Build | IN PROGRESS | parallel agent |
| WearOS Device | NOT VERIFIED | no adb |
| Unit (new) | PASS | 33 tests sport+nutrition+train-core |
| Typecheck web | PASS | tsc |
| E2E | PENDING | — |
| Lighthouse | PENDING (no prod ship yet) | — |
| Security | PASS | nutrition POST blocked; auth on APIs |

## Status

**V8.5 DEVELOPMENT IN PROGRESS — EXTERNAL WORK CONTINUES**

Foundation landed on `feat/zenith-v8-5-sport-intelligence` (web domain + TRAIN Today + nutrition safety + MCP tools). Remaining: meal planner/recipes/grocery UI, sports identity persistence, Android/Wear companion completion, athlete/coach dashboard wiring, E2E journeys, live food API proxies.
