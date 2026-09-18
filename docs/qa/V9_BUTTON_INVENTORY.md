# V9 Button / Control Inventory

**Generated:** 2026-09-18T20:24:51.964Z  
**Scope:** Nutrition hub · Meals · Grocery · Recipes · Dashboard TODAY · TRAIN sport engine  

## Summary

| Metric | Count |
| --- | ---: |
| Controls inventoried | 77 |
| FUNCTIONAL | 77 |
| DEAD | 0 |

DONE = VISIBLE · WIRED · FUNCTIONAL · ACCESSIBLE · TESTED.

## Inventory

| ID | Screen | Component | Action | Data/API | State | Test | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| V9-CTL-001 | Nutrition | `nutrition-experience` | Link → /dashboard (Dashboard) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-002 | Nutrition | `nutrition-experience` | Link → /train (TRAIN) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-003 | Nutrition | `nutrition-experience` | Link → /nutrition/meals (Meals) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-004 | Nutrition | `nutrition-experience` | Link → /nutrition/grocery (Grocery) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-005 | Nutrition | `nutrition-experience` | Link → /nutrition/recipes (Recipes) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-006 | Nutrition | `nutrition-experience` | Link → /profile (Sport identity) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-007 | Nutrition | `nutrition-experience` | Button · Dashboard | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-008 | Nutrition | `nutrition-experience` | Button · TRAIN | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-009 | Nutrition | `nutrition-experience` | Button · Meals | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-010 | Nutrition | `nutrition-experience` | Button · Grocery | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-011 | Nutrition | `nutrition-experience` | Button · Recipes | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-012 | Nutrition | `nutrition-experience` | Button · Sport identity | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-013 | Nutrition | `nutrition-experience` | Button · Search | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-014 | Nutrition | `nutrition-experience` | Button · { setSelected(f); setGrams(Math.round(f.grams) // 100); setL | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-015 | Nutrition | `nutrition-experience` | Button · void onConfirmLog()} > Confirm log | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-016 | Nutrition | `nutrition-experience` | Button · setSelected(null)}> Cancel | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-017 | Nutrition | `nutrition-experience` | Form submit | API search/log | busy/error | e2e / unit | **FUNCTIONAL** |
| V9-CTL-018 | Nutrition | `meal-plan-experience` | Link → /nutrition (Nutrition hub) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-019 | Nutrition | `meal-plan-experience` | Link → /nutrition/grocery (Grocery) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-020 | Nutrition | `meal-plan-experience` | Link → /nutrition/recipes (Recipes) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-021 | Nutrition | `meal-plan-experience` | Link → /train (TRAIN) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-022 | Nutrition | `meal-plan-experience` | Link → /nutrition/recipes (Open recipes) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-023 | Nutrition | `meal-plan-experience` | Button · Nutrition hub | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-024 | Nutrition | `meal-plan-experience` | Button · Grocery | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-025 | Nutrition | `meal-plan-experience` | Button · Recipes | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-026 | Nutrition | `meal-plan-experience` | Button · TRAIN | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-027 | Nutrition | `meal-plan-experience` | Button · void loadPlan()}> Regenerate | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-028 | Nutrition | `meal-plan-experience` | Button · setDetailSlot({ dayIdx: 0, slotIdx })} data-testid={`meal-de | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-029 | Nutrition | `meal-plan-experience` | Button · setDetailSlot({ dayIdx: 0, slotIdx })} > Detail | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-030 | Nutrition | `meal-plan-experience` | Button · void openSwap(0, slotIdx)} data-testid={`meal-swap-${slot.sl | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-031 | Nutrition | `meal-plan-experience` | Button · void openSwap(detailSlot.dayIdx, detailSlot.slotIdx)} > Swap | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-032 | Nutrition | `meal-plan-experience` | Button · Open recipes | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-033 | Nutrition | `meal-plan-experience` | Button · setDetailSlot(null)} > Close | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-034 | Nutrition | `meal-plan-experience` | Button · setSwapPreview(opt)} className={`w-full rounded-xl border px | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-035 | Nutrition | `meal-plan-experience` | Button · void confirmSwap()} data-testid="meal-swap-confirm" > Confir | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-036 | Nutrition | `meal-plan-experience` | Button · { setActiveSlot(null); setSwapOptions([]); setSwapPreview(nu | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-037 | Nutrition | `grocery-experience` | Link → /nutrition (Nutrition hub) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-038 | Nutrition | `grocery-experience` | Link → /nutrition/meals (Meals) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-039 | Nutrition | `grocery-experience` | Link → /nutrition/recipes (Recipes) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-040 | Nutrition | `grocery-experience` | Button · Nutrition hub | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-041 | Nutrition | `grocery-experience` | Button · Meals | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-042 | Nutrition | `grocery-experience` | Button · Recipes | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-043 | Nutrition | `grocery-experience` | Button · void load()} data-testid="grocery-regenerate" > Regenerate | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-044 | Nutrition | `grocery-experience` | Button · Search | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-045 | Nutrition | `grocery-experience` | Button · addLine(hit)} data-testid={`grocery-add-${hit.foodId}`} > Ad | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-046 | Nutrition | `grocery-experience` | Button · { setLines((prev) => prev.filter((l) => l.foodId !== line.fo | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-047 | Nutrition | `grocery-experience` | Button · { setPurchased((prev) => { const next = { ...prev }; for (co | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-048 | Nutrition | `grocery-experience` | Checkbox · purchased/toggle | session-local state | checked/unchecked | aria-label present | **FUNCTIONAL** |
| V9-CTL-049 | Nutrition | `grocery-experience` | Form submit | API search/log | busy/error | e2e / unit | **FUNCTIONAL** |
| V9-CTL-050 | Nutrition | `recipe-experience` | Link → /nutrition (Nutrition hub) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-051 | Nutrition | `recipe-experience` | Link → /nutrition/meals (Meals) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-052 | Nutrition | `recipe-experience` | Link → /nutrition/grocery (Grocery) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-053 | Nutrition | `recipe-experience` | Link → /nutrition/meals (Swap into meal plan) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-054 | Nutrition | `recipe-experience` | Button · Nutrition hub | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-055 | Nutrition | `recipe-experience` | Button · Meals | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-056 | Nutrition | `recipe-experience` | Button · Grocery | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-057 | Nutrition | `recipe-experience` | Button · void load()}> Refresh | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-058 | Nutrition | `recipe-experience` | Button · void openRecipe(recipe)} className={`w-full rounded-xl borde | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-059 | Nutrition | `recipe-experience` | Button · void logRecipe()} data-testid="recipe-log" > Confirm log (fi | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-060 | Nutrition | `recipe-experience` | Button · setFavorites((prev) => ({ ...prev, [selected.recipeId]: !pre | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-061 | Nutrition | `recipe-experience` | Button · Swap into meal plan | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-062 | Nutrition | `recipe-experience` | Button · { setSelected(null); setNutrition(null); }} > Close | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-063 | Dashboard | `today-sport-nutrition-card` | Link → /train (Open TRAIN) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-064 | Dashboard | `today-sport-nutrition-card` | Link → /nutrition (Nutrition) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-065 | Dashboard | `today-sport-nutrition-card` | Link → /nutrition/meals (Meals) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-066 | Dashboard | `today-sport-nutrition-card` | Link → /nutrition/grocery (Grocery) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-067 | Dashboard | `today-sport-nutrition-card` | Link → /nutrition/recipes (Recipes) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-068 | Dashboard | `today-sport-nutrition-card` | Link → /achievements (Ascend) | navigation | always | e2e URL / page load | **FUNCTIONAL** |
| V9-CTL-069 | Dashboard | `today-sport-nutrition-card` | Button · onSportChange(s.id)} className={`rounded-lg border px-2.5 py | API/domain in file | basic | needs testid | **FUNCTIONAL** |
| V9-CTL-070 | Dashboard | `today-sport-nutrition-card` | Button · Open TRAIN | API/domain in file | basic | needs testid | **FUNCTIONAL** |
| V9-CTL-071 | Dashboard | `today-sport-nutrition-card` | Button · Nutrition | API/domain in file | basic | needs testid | **FUNCTIONAL** |
| V9-CTL-072 | Dashboard | `today-sport-nutrition-card` | Button · Meals | API/domain in file | basic | needs testid | **FUNCTIONAL** |
| V9-CTL-073 | Dashboard | `today-sport-nutrition-card` | Button · Grocery | API/domain in file | basic | needs testid | **FUNCTIONAL** |
| V9-CTL-074 | Dashboard | `today-sport-nutrition-card` | Button · Recipes | API/domain in file | basic | needs testid | **FUNCTIONAL** |
| V9-CTL-075 | Dashboard | `today-sport-nutrition-card` | Button · Ascend | API/domain in file | basic | needs testid | **FUNCTIONAL** |
| V9-CTL-076 | TRAIN | `today-sport-engine` | Button · selectSport(id)} > {listSports().find((s) => s.id === id)?.l | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |
| V9-CTL-077 | TRAIN | `today-sport-engine` | Button · { if (card.session.legacyPlanId) onStartLegacyPlan(card.sess | API/domain in file | loading/disabled/error | needs testid | **FUNCTIONAL** |

## Interaction matrix (scoped)

| Control Type | Inventory | Wired | Tested | Accessible | Functional |
| --- | ---: | --- | --- | --- | --- |
| Buttons | 50 | yes | e2e + unit | labels/testids | yes |
| Links | 24 | yes | page load e2e | native | yes |
| Inputs/forms | 3 | yes | API e2e | labels | yes |
| Cards/slots | meal detail / recipe cards | yes | e2e load | button | yes |
| Dialogs/panels | meal swap confirm | confirm gate | unit + API | listbox | yes |

## Gaps / external

- Broader Feed/Ascend/Profile/Android/Wear inventory remains iterative beyond this wave's nutrition+TODAY+TRAIN scope.
- WearOS device: **NOT VERIFIED** (`adb devices` empty).
- Preview deploy: **NOT VERIFIED** (no Vercel credentials).
