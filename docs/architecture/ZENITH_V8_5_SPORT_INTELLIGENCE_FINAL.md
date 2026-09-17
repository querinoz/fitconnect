# Zenith V8.5 — Sport Intelligence Final

**Branch:** `feat/zenith-v8-5-sport-intelligence`  
**Frozen baseline:** `c78c2fd` (untouched)  
**Status:** see `docs/qa/V8_5_SPORT_NUTRITION_QA.md`

## Product journey (implemented)

```
PROFILE (Sports Identity Form)
  → SERVER /api/v1/sports/identity (+ memory fallback)
  → LOCAL CACHE
  → DASHBOARD TodaySportNutritionCard
  → TRAIN TodaySportEngine
  → SESSION (compose + adaptation WHY/DATA/CONFIDENCE)
  → ACTIVE (existing TRAIN machine)
  → COMPLETION /api/v1/training/completions (confirm:true)
  → NUTRITION targets + meal plan + recipes + grocery
  → FOOD lookup (PortFIR→USDA→OFF adapters)
  → LOG /api/v1/nutrition/log (confirm:true)
  → AI/MCP (read tools; no silent writes)
  → COACH /api/v1/coach/athlete-today (nutrition opt-in)
```

## Persistence

Migration `036_sport_intelligence_nutrition.sql`:

- `athlete_sports_profiles`
- `nutrition_profiles`
- `nutrition_food_logs`
- `sport_training_completions`

When Postgres is not configured, repositories use honest **memory** backend (`backend: "memory"`, sync `QUEUED`).

## WearOS device

`adb devices` empty → **NOT VERIFIED** (code + unit honesty tests exist).

## Acceptance

Train / Nutrition / Dashboard / MCP unit journey tests pass. Production preview and Wear device smoke remain external verification.
