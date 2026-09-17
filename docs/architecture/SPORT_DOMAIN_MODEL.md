# Sport Domain Model

Canonical types live in `apps/web/lib/sport-intelligence/`.

## Core entities

- `SportId` / `SportProfile` — registry-driven sport definition
- `SportsIdentityProfile` — athlete sports context (goals chosen, never assumed)
- `ComposedSession` / `TrainingBlock` — session composition
- `TodayTrainingCard` — adaptation output with honesty + explanation
- `ProgressionSuggestion` — explainable next-step proposals
- `RestTimerState` — wall-clock rest

## Legacy bridge

Existing `TrainPlan` / `TrainSnapshot` / `reduceTrain` remain the active workout runtime.
Composed sessions may link `legacyPlanId` to start that machine without rewriting execution.
