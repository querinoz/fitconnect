# V8.5 End-to-End Journey

## Primary acceptance path

1. PROFILE → select sport + goal + level → SAVE → `/api/v1/sports/identity`
2. DASHBOARD → TODAY card (session + readiness honesty + nutrition ESTIMATE)
3. TRAIN → TodaySportEngine loads identity → compose session → START (legacy plan bridge)
4. ACTIVE → existing TRAIN machine (offline + crash restore)
5. FINISH → POST `/api/v1/training/completions` with `confirm:true`
6. NUTRITION → profile → targets ESTIMATE → meal-plan → recipe → grocery
7. FOOD → search via adapters → CONFIRM → POST `/api/v1/nutrition/log`
8. AI/MCP → `get_today_session`, `get_sport_profile`, `get_nutrition_targets`, `generate_meal_plan`, `search_food`, `get_recipe`
9. COACH → `/api/v1/coach/athlete-today` — nutrition only if `share_with_coach`

## Automated evidence

| Suite | Result |
|-------|--------|
| `lib/sport-intelligence` + `lib/nutrition` + `lib/mcp/gateway` | **57/57 PASS** |
| Web typecheck | PASS |
| Android `SportIntelligenceV85Test` | PASS (prior + compile) |
| Wear adb | NOT VERIFIED (no device) |

## Domain journey test

`lib/sport-intelligence/journey.test.ts` covers multi-sport differentiation + profile→complete→meal→log memory path.
