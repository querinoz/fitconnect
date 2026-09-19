# FitConnect V12 — TRAIN + Nutrition Intelligence Final Status

**Date:** 2026-09-19  
**Branch tip (work):** recovery on `feat/fitconnect-roadmap-v10-v11` after V12 smoke `3cb25b6`  
**Freeze:** `c78c2fd` untouched  

## Final status

## TRAIN + NUTRITION VERIFIED

## Root causes

1. **TRAIN FAB routed to guided workout (`WORKOUT`), not Activity/TRAIN hub** — so sport identity, plan overview, and adaptation UX never appeared on the primary TRAIN entry (smoke often landed on an active guided “Upper strength” surface).
2. **Activity TRAIN surface was execution-only** — `WorkoutSport` chips + live capture; no wire-up to `SportIntelligenceCatalog`, sports identity API, or confirm-only adaptation.
3. **Dashboard hard-coded `SportId.STRENGTH`** for today’s card — ignored `/api/v1/sports/identity`.
4. **Nutrition Intelligence existed on web + APIs** (`/nutrition`, targets/meals/grocery/log) but **had no Android product surface** and no Dashboard/TRAIN entry (V12 smoke: Nutrition NOT VERIFIED).

## What shipped

### Android TRAIN
- `TrainIntelligenceHub` on Activity IDLE: canonical sport selector, identity persist, plan overview (`GuidedPlanCatalog`), today session card, adaptation WHAT/WHY/DATA/CONFIDENCE confirm-only, Nutrition entry, free/fight/guided starts.
- FAB → `athlete/activity` (hub); guided remains secondary from hub.
- Kotlin port of `recommendSessionAdaptation` + wire-id mapping (`SportWireIds`).
- Remotes: `HttpSportsIdentityRemote`, `HttpTrainingTodayRemote`, `HttpNutritionRemote`.

### Android Nutrition
- `NutritionScreen` at `athlete/nutrition` (not a 5th tab).
- Entries: TRAIN hub “OPEN NUTRITION” + Dashboard card/button.
- Targets ESTIMATE, meal-plan/grocery summary, food search, confirm-before-log, diary list. Honest empty/unavailable states (no invented calories).

### Web parity
- `TodaySportEngine`: confirm-only adaptation card (WHAT/WHY/DATA/CONFIDENCE) using existing `recommendSessionAdaptation` (nutrition links already present).

## Artifact

```text
Artifact: FitConnectV12-TrainNutrition.apk
Package: com.fitconnect.android
VersionCode: 17
VersionName: 0.1.0-rc.1-train-nutrition
Size: 148304093 bytes
SHA256: 713F9458EC2DC20C134BC10BA49949CAA700D49309B603A29118A0F4C4E99D3E
Build: PASS (:app:assembleDebug)
Install: PASS (emulator-5554)
```

## Verification evidence

| Check | Result | Command / note |
| --- | --- | --- |
| Adaptive unit tests | PASS (5) | `.\gradlew.bat :sports:testDebugUnitTest --tests …AdaptiveTrainingTest` |
| Android assemble | PASS | `:app:assembleDebug` |
| Web nutrition + V10/V11 unit | PASS 22/22 | `vitest run lib/roadmap/v10-v11.test.ts lib/nutrition/nutrition.test.ts` |
| Web tsc | PASS | `pnpm --filter @fitconnect/web exec tsc --noEmit` |
| Emulator install | PASS | `adb install -r FitConnectV12-TrainNutrition.apk` → versionCode 17 |
| Maestro journeys A–D | PASS | `maestro/smoke/v12_train_nutrition.yaml` exit 0 |
| Screenshots | PASS | `docs/qa/v12-train-nutrition/` |

### Maestro journeys covered
- **A** TRAIN hub: SPORT IDENTITY + PLAN OVERVIEW  
- **B** Adaptation card (`train_adaptation_card`) after scroll  
- **C** TRAIN → OPEN NUTRITION → targets/meals  
- **D** Dashboard → NUTRITION → food search  

## NOT VERIFIED (remain)

- Physical Xiaomi ADB
- WearOS / Garmin / WHOOP OAuth
- Authored meal log against live prod with real food catalog (confirm path exercised; remote auth-dependent)
- Full Playwright e2e suite for web train adaptation UI (unit + typecheck only for web delta)
- Offline airplane matrix for nutrition/train remotes

## Key files

- `android/athlete/.../train/TrainIntelligenceHub.kt`
- `android/athlete/.../nutrition/NutritionScreen.kt`
- `android/athlete/.../AthleteScaffold.kt` (FAB → ACTIVITY)
- `android/athlete/.../activity/ActivityScreen.kt`
- `android/athlete/.../home/HomeScreen.kt`
- `android/sports/.../AdaptiveTraining.kt`, `HttpTrainingTodayRemote.kt`, `HttpNutritionRemote.kt`
- `apps/web/components/train/today-sport-engine.tsx`
- `maestro/smoke/v12_train_nutrition.yaml`
- `docs/qa/v12-train-nutrition/`
- `docs/release/FITCONNECT_V12_TRAIN_NUTRITION_FINAL_STATUS.md`
