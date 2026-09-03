# Workout Set Model — Specification

## Canonical set

| Field | Type |
|-------|------|
| `setId` | uuid |
| `sessionId` | uuid |
| `exerciseId` | string |
| `sequence` | int |
| `setType` | warmup \| working \| dropset \| amrap |
| `supersetGroupId` | string? |
| `sideMode` | none \| per_side \| alternating |
| `targetReps` | int? |
| `actualReps` | int? |
| `targetWeightKg` | decimal? |
| `actualWeightKg` | decimal? |
| `targetTimeSec` | int? |
| `actualTimeSec` | int? |
| `targetDistanceM` | decimal? |
| `actualDistanceM` | decimal? |
| `rpe` | decimal? (1–10) |
| `rir` | int? (0–5) |
| `effortScale` | rpe \| rir \| null |
| `completedAt` | timestamptz? |
| `isFailed` | boolean |

## Superset semantics

- Exercises sharing `supersetGroupId` execute back-to-back
- Rest timer starts after **last** exercise in group

## Warm-up sets

- `setType = warmup` excluded from 1RM and progression baseline
- Included in session history

## Cardio sets

Use `targetTimeSec` + `actualDistanceM` / speed fields — not weight×reps.
