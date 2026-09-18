# Nutrition Intelligence Engine (V10.3)

Builds on V8.5/V9 planning-engine + meal/grocery/recipes.

## Periodization
`periodizeNutritionDay(dayKind)` → targets + fueling windows + hydration caution.

Day kinds: rest · easy · moderate · hard · long · competition · recovery

## Safety
- Combat weight-cut never automated
- High-risk / medical flags block aggressive prescriptions (planning-engine)
- Hydration estimate includes explicit anti-weight-cut caution

## Evidence
See `docs/nutrition/EVIDENCE_REGISTRY.md`
