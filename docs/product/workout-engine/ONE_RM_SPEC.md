# Estimated 1RM — Specification

**Disclaimer:** All values are **estimates** unless from a true 1RM test set.

## Formula (v1)

Epley: `1RM = weight × (1 + reps/30)` for reps 1–12.

## Rules

1. Select **best eligible working set** (not warmup)
2. Reject reps > 12 for estimate (return low confidence)
3. Return `sourceSetId`, `sourceWeightKg`, `sourceReps`, `confidence`
4. UI label: "Estimated 1RM" — never "Your max"

## Per-exercise history

Store snapshots on session complete for trend charts in Analysis.

## Implementations

- `OneRepMaxEstimator.kt`
- `packages/utils/src/strength/one-rep-max.ts`
