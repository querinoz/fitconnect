# Phase 06 — Sports Audit Report

**Date:** 2026-08-07 · **Branch:** `phase-06/sports-engine`

## Pre-engine state (audit)

| Area | Finding |
|------|---------|
| Android sports | Thin `DefaultSportsEngine` inside `:athlete` (11 enum sports + metric keys only) |
| Coach | No sport IDs; program exercises as strings; readiness as bare `Int` |
| Web / packages | Strava taxonomies diverge (`packages/types` vs `apps/web/lib/sports`) |
| Formulas | `elite-core` (Rust) owns NP/TSS/GAP — not duplicated in Kotlin |
| Duplication | Athlete registry vs web Strava lists vs marketplace sports |

## Current sports (pre-migration)

`RUNNING, CYCLING, SWIMMING, FOOTBALL, BASKETBALL, CROSSFIT, TENNIS, PADEL, TRIATHLON, GYM, OTHER`

## Workout / session / metrics / exercises found

- Athlete: `TrainingSession`, `ExerciseItem{name,detail}`, `DailyReadiness` (hardcoded scores)
- Coach: `ProgramExercise`, `CoachSession` (no sport field)
- Web: `EXERCISE_LIBRARY`, readiness in `@fitconnect/utils`

## Decision executed

Create **`:sports`** as the single Android domain SSOT. Delete athlete-local `SportsEngine.kt`. Athlete + Coach depend on `:sports`. New sports = catalog/plugin registration, not app-core edits.
