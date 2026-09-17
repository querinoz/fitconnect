# Food Data Sources

| Source | Priority | Use | Integration status |
|--------|----------|-----|--------------------|
| PortFIR / INSA Portugal | 1 (PT locale) | Local foods, PT terminology | Seed cache + `PORTFIR_PROXY_URL` server adapter (`queryPortfir`) |
| USDA FoodData Central | 2 | Global coverage | Seed cache + live FDC when `USDA_FDC_API_KEY` set (`queryUsda`) |
| Open Food Facts | 3 | Branded / barcode | Live server adapter (`queryOpenFoodFacts`); never auto-log |

## Architecture

```
CLIENT → FitConnect /api/v1/nutrition/targets?view=foods → food-adapters → external
```

Never call PortFIR/USDA/OFF credentials from the mobile/web client bundle.

## States

`AVAILABLE` · `LOCAL_CACHE_ONLY` · `NOT_CONFIGURED` · `TIMEOUT` · `ERROR` · `RATE_LIMITED`

Sources are never silently merged into one authoritative nutrient row.

## FoodRecord contract

`food_id`, `source`, `source_id`, `name`, `locale`, `serving_size`, `grams`, `kcal`, `protein`, `carbohydrate`, `fat`, `fiber`, `micronutrients`, `confidence`, `source_timestamp` (+ optional barcode/caveat).

Never treat an unsourced external number as absolute truth.
