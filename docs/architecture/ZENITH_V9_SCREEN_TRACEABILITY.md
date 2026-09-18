# Zenith V9 — Screen Traceability (wave 1)

| Screen | Primary goal | Primary action | Component tree | Data | States | Tests |
|--------|--------------|----------------|----------------|------|--------|-------|
| `/nutrition` | Fuel today with honest estimates + confirm log | Search → select → confirm | NutritionExperience → BentoCard × N | targets, foods, diary | LOADING/EMPTY/UNAVAILABLE/ERROR | `v9-nutrition.spec.ts` |
| `/dashboard` | What should I do today? | Open TRAIN / Nutrition | AthleteOsDashboard + TodaySportNutritionCard | sport identity, readiness, targets | ESTIMATE honesty | prior + link fix |
| `/profile` | Identity + sport | Save sports identity | SportsIdentityForm + profile panel | identity API | save/reload | prior |
| Android Profile | Identity + goals + devices | Open Goals dialog | ProfileScreen | goals repo | EMPTY/list | Goals onClick wired |
| Wear companion | Glance current action + one metric | (phone-driven) | WearWorkoutCompanion | MetricAvailability | honest device labels | unit honesty |
| `/train` | Execute session | Start / log / complete | train-experience + today-sport-engine | TRAIN machine + V8.5 | full machine | prior train E2E |

## Ascend route note

Athlete Ascend is `/achievements` (not `/ascend`). V9 fixed dashboard CTA that pointed at a dead `/ascend` path.

## Wave 3 screens

| Screen | Visual | Functional | Data | Responsive | A11y | Perf | Test |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /nutrition/meals | Elite OS | swap+detail | meal-plan | mobile-first | labels | light fetch | e2e |
| /nutrition/grocery | Elite OS | list actions | reconciled | mobile-first | checkbox labels | light | e2e |
| /nutrition/recipes | Elite OS | detail+log | recipe seed | mobile-first | labels | light | e2e |
