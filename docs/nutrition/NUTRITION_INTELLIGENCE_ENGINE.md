# Nutrition Intelligence Engine (Zenith V8.5)

## Purpose

Sport-aware, training-day-aware nutrition **estimates** with safety gates — not a calorie-counter CRUD toy, not a doctor.

## Modules

| Module | Path |
|--------|------|
| Types | `apps/web/lib/nutrition/types.ts` |
| Planning / safety | `apps/web/lib/nutrition/planning-engine.ts` |
| Food catalog (source-tagged) | `apps/web/lib/nutrition/sources/food-catalog.ts` |
| API | `GET /api/v1/nutrition/targets` (`view=targets\|foods`) |

## Rules

- Distinguish **ESTIMATE** vs **MEASURED**
- Every food carries `source`, `sourceId`, `confidence`, `sourceTimestamp`, optional `caveat`
- Mutations require explicit confirmation (POST on read endpoint returns 405)
- High-risk / medical context → withhold aggressive prescriptions
- Combat → block acute weight-cut automation
- LEA risk → warn and prevent further restriction

## Priority food sources

1. PortFIR / INSA (PT) — cached illustrative records until live proxy
2. USDA FoodData Central — cached illustrative + production proxy planned
3. Open Food Facts — branded/barcode (confirm before log)
