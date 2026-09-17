# V8.5 Sport + Nutrition QA Matrix

**Branch:** `feat/zenith-v8-5-sport-intelligence`  
**Baseline:** `c78c2fd` (untouched)  
**Updated:** 2026-09-17

| Area | Status | Evidence |
|------|--------|----------|
| Sport Identity | PASS | Migration 036 + `/api/v1/sports/identity` + form + Android `HttpSportsIdentityRemote` |
| Sport Registry | PASS | 25 sports; multi-sport journey tests |
| Training Today | PASS | API loads identity + nutrition context |
| Session Composer | PASS | Blocks + explainable adaptation |
| Progression | PASS | SI + `@fitconnect/utils` bridge |
| Active Workout | REUSE | TRAIN machine offline/crash |
| Workout Persistence | PASS | `/api/v1/training/completions` confirm-gated |
| Workout History | PASS | list completions API |
| Nutrition Profile | PASS | `/api/v1/nutrition/profile` |
| Nutrition Targets | PASS | ESTIMATE + stored mass/goal |
| Meal Planner | PASS | weekly + swaps |
| Recipes | PASS | seed + reconcile |
| Grocery | PASS | pantry-aware |
| Food Search | PASS | federated adapters |
| PortFIR | PARTIAL | seed + `PORTFIR_PROXY_URL` adapter |
| USDA | PARTIAL | seed + live when `USDA_FDC_API_KEY` |
| Open Food Facts | PASS (adapter) | live barcode/search server-side |
| Hydration | PARTIAL | target hydrationMl |
| Nutrition Safety | PASS | LEA/combat/high-risk/allergen |
| TRAIN × Nutrition | PASS | today API nutritionContext |
| Ascend × Nutrition | PARTIAL | context via targets; Ascend UI optional |
| Athlete Dashboard | PASS | TodaySportNutritionCard |
| Coach Dashboard | PASS | `/api/v1/coach/athlete-today` + ACL |
| AI Training | PARTIAL | MCP get_today_session / get_sport_profile |
| AI Nutrition | PARTIAL | MCP targets/plan/search/recipe |
| MCP | PASS (read tools) | 57-test suite includes MCP |
| MCP Security | PASS | no silent diary writes; confirm gates |
| Android | PASS (unit) | sports compile + V85 tests |
| WearOS Build | PASS (code) | WearWorkoutCompanion |
| WearOS Device | NOT VERIFIED | `adb devices` empty |
| Accessibility | PARTIAL | form + large START targets |
| Reduced Motion | REUSE | Zenith tokens |
| E2E Playwright | PENDING | domain journey unit covers core path |
| Offline | REUSE + QUEUED | completions queue when DB missing |
| Sync | PARTIAL | SYNCED/QUEUED honesty |
| Performance | PASS policy | no full catalog preload; OFF skip when local hits |
| Production Preview | PENDING | not deployed this cycle |

## Verification

| Command | Result |
|---------|--------|
| vitest sport+nutrition+mcp | **57/57 PASS** |
| web typecheck | **PASS** |
| `:sports:testDebugUnitTest` SportIntelligenceV85 | **PASS** |
| adb devices | empty → Wear **NOT VERIFIED** |

## Status

**V8.5 COMPLETE — EXTERNAL VERIFICATION PENDING**

External: Wear physical device, Playwright full UI journey, Vercel preview deploy, live PortFIR proxy credentials.
