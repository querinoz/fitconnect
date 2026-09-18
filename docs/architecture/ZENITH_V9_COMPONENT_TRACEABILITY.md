# Zenith V9 — Component Traceability (wave 1)

| Component | Source | Code | Screen | Domain | Data | State | Interaction | Motion | A11y | Test |
|-----------|--------|------|--------|--------|------|-------|-------------|--------|------|------|
| NutritionExperience | V9 | `components/nutrition/nutrition-experience.tsx` | `/nutrition` | nutrition | targets API + foods API + log API | LOADING/AVAILABLE/EMPTY/ERROR | search, select, confirm log | none yet | labels + roles | `v9-nutrition.spec.ts` |
| Foods API | V9 | `api/v1/nutrition/foods/route.ts` | — | nutrition | PortFIR/USDA/OFF via lookup | 400/401/200/500 | GET only | — | auth gate | e2e API |
| TodaySportNutritionCard | V8.5+V9 | `dashboard/os/today-sport-nutrition-card.tsx` | Dashboard | sport+nutrition | readiness + targets ESTIMATE | AVAILABLE/UNAVAILABLE | sport chips, TRAIN/Nutrition/Ascend links | — | buttons | prior + v9 e2e |
| Profile Goals row | Android V9 | `ProfileScreen.kt` | Profile | athlete goals | repository goals | EMPTY/list | opens dialog | — | dialog | Wear honesty adjacent |
| WearWorkoutCompanion | V8.5+V9 | `WearWorkoutCompanion.kt` | Wear | train companion | phone link + metric availability | CONNECTED/SYNCING/… | glance only | haptics | heading | `WearWorkoutCompanionHonestyTest` |
| EliteButton | EOS | `elite-button.tsx` | many | UI | — | loading/disabled | click | — | min-h-11 | elite-os.test |

## Wave 3 additions

| Component | Source | Screen | Domain | Data | State | Interaction | Motion | A11y | Test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MealPlanExperience | components/nutrition/meal-plan-experience.tsx | /nutrition/meals | meal-planner + meal-swap | targets?view=meal-plan | LOADING/AVAILABLE/EMPTY/ERROR/UNAVAILABLE | detail + swap confirm | Zenith tokens | buttons/labels | e2e + unit |
| GroceryExperience | components/nutrition/grocery-experience.tsx | /nutrition/grocery | grocery.buildGroceryList | meal-plan grocery | same + purchased | check/add/remove/regen | tokens | checkbox aria | e2e + unit |
| RecipeExperience | components/nutrition/recipe-experience.tsx | /nutrition/recipes | recipes | targets?view=recipes | same | open/log/favorite | tokens | labels | e2e + unit |
| meal-swap route | app/api/v1/nutrition/meal-swap | API | meal-swap | FOOD_SEED | confirm gate | suggest/apply | n/a | n/a | unit + e2e |
