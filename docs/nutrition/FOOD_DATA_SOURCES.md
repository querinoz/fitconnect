# Food Data Sources

| Source | Priority | Use | Integration status |
|--------|----------|-----|--------------------|
| PortFIR / INSA Portugal | 1 (PT locale) | Local foods, PT terminology | Seed cache with `source: PORTFIR` + caveat; live API proxy TODO |
| USDA FoodData Central | 2 | Global coverage | Seed cache with `source: USDA` + caveat; live FDC proxy TODO |
| Open Food Facts | 3 | Branded / barcode | Seed + barcode lookup hook; never auto-log |

## FoodRecord contract

`food_id`, `source`, `source_id`, `name`, `locale`, `serving_size`, `grams`, `kcal`, `protein`, `carbohydrate`, `fat`, `fiber`, `micronutrients`, `confidence`, `source_timestamp` (+ optional barcode/caveat).

Never treat an unsourced external number as absolute truth.
