# Zenith V9 — Component Traceability (wave 1)

| Component | Source | Code | Screen | Domain | Data | State | Interaction | Motion | A11y | Test |
|-----------|--------|------|--------|--------|------|-------|-------------|--------|------|------|
| NutritionExperience | V9 | `components/nutrition/nutrition-experience.tsx` | `/nutrition` | nutrition | targets API + foods API + log API | LOADING/AVAILABLE/EMPTY/ERROR | search, select, confirm log | none yet | labels + roles | `v9-nutrition.spec.ts` |
| Foods API | V9 | `api/v1/nutrition/foods/route.ts` | — | nutrition | PortFIR/USDA/OFF via lookup | 400/401/200/500 | GET only | — | auth gate | e2e API |
| TodaySportNutritionCard | V8.5+V9 | `dashboard/os/today-sport-nutrition-card.tsx` | Dashboard | sport+nutrition | readiness + targets ESTIMATE | AVAILABLE/UNAVAILABLE | sport chips, TRAIN/Nutrition/Ascend links | — | buttons | prior + v9 e2e |
| Profile Goals row | Android V9 | `ProfileScreen.kt` | Profile | athlete goals | repository goals | EMPTY/list | opens dialog | — | dialog | Wear honesty adjacent |
| WearWorkoutCompanion | V8.5+V9 | `WearWorkoutCompanion.kt` | Wear | train companion | phone link + metric availability | CONNECTED/SYNCING/… | glance only | haptics | heading | `WearWorkoutCompanionHonestyTest` |
| EliteButton | EOS | `elite-button.tsx` | many | UI | — | loading/disabled | click | — | min-h-11 | elite-os.test |
