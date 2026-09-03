# Progression Engine — Specification

**Version:** 1.0.0

## Rules supported (v1)

| Rule | Behavior |
|------|----------|
| `LINEAR` | +fixed load when all sets hit target reps |
| `DOUBLE_PROGRESSION` | Increase reps in range; then +load, reset to min reps |
| `GREYSKULL_LP` | Two sets + AMRAP; double jumps; 10% reset on stall |
| `TIME_PROGRESSION` | +seconds when target met |
| `NONE` | Manual targets only |

Routine-level default + exercise-level override.

## Inputs

- Previous session performance (sets)
- `ProgressionRule` + parameters (rep min/max, step kg, stall threshold)
- `ExerciseMode` (weighted vs bodyweight)
- `StallState`

## Outputs

```typescript
{
  targetWeightKg: number | null;
  targetRepsMin: number;
  targetRepsMax: number;
  targetTimeSec: number | null;
  rationale: string;
  progressionState: "advance" | "hold" | "deload" | "reset";
}
```

## Invariants

1. **Failed reps never advance load** (unless rule explicitly allows AMRAP bonus)
2. Every target includes human-readable `rationale`
3. Bodyweight: never prompt fake 0kg — use rep progression
4. Per-side: target reps step in evens when `sideMode = PER_SIDE`
5. RPE/RIR does **not** alter targets unless future product rule adds it

## Implementations

| Runtime | Path |
|---------|------|
| TypeScript | `packages/utils/src/strength/progression.ts` |
| Kotlin | `android/sports/.../progression/ProgressionEngine.kt` |

Both must pass identical table-driven unit tests.
