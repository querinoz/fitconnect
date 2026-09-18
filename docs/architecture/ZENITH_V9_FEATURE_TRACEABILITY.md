# Zenith V9 — Feature Traceability

**Branch:** `feat/zenith-v9-product-excellence`  
**Frozen baseline:** `c78c2fd` (untouched)  
**V8.5 baseline:** `48a43bd`

| Feature | Domain | API | DB | Web | Mobile | WearOS | AI/MCP | Tests |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Nutrition targets | `planning-engine` | `GET /api/v1/nutrition/targets` | profile repo | NutritionExperience | Android Goals dialog | n/a | get_nutrition_targets | unit + e2e |
| Meal plan | `meal-planner` | `targets?view=meal-plan` | suggestion only | MealPlanExperience | via web PWA | n/a | generate_meal_plan | unit + e2e |
| Meal swap | `meal-swap` | `POST /api/v1/nutrition/meal-swap` | session only | Swap panel confirm | — | — | — | unit + e2e confirm gate |
| Grocery | `grocery.buildGroceryList` | meal-plan grocery payload | session check-off | GroceryExperience | — | — | — | unit reconcile + e2e |
| Recipes | `recipes` | `targets?view=recipes` | seed catalog | RecipeExperience | — | — | get_recipe | unit + e2e |
| Food search | PortFIR/USDA/OFF | `GET /api/v1/nutrition/foods` | cache/adapters | hub search | — | — | search_food | unit adapters + e2e |
| Food log | `diary` confirm gate | `POST /api/v1/nutrition/log` | food logs | Confirm log | — | — | log_food (confirm) | diary tests + e2e |
| Dashboard TODAY | sport-intel + nutrition | readiness + targets | identity cache | TodaySportNutritionCard | athlete OS | honesty states | get_today_session | e2e dashboard |
| TRAIN fueling context | adaptation + targets | targets ESTIMATE | — | today-sport-engine | Compose TRAIN | Wear companion | — | unit wear honesty |
| Sport identity | sport-registry | profile persist | identity store | Profile + dashboard chips | Profile Goals | — | MCP athlete scope | v8.5 journey |

**Honesty rules:** no fake biometrics; no silent diary writes; Strava never social; ESTIMATE labels preserved.
