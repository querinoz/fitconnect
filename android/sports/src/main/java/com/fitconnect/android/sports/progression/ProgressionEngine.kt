package com.fitconnect.android.sports.progression

enum class ProgressionRule {
    LINEAR,
    DOUBLE_PROGRESSION,
    GREYSKULL_LP,
    TIME_PROGRESSION,
    NONE,
}

enum class ExerciseMode {
    REPS,
    TIME,
    DISTANCE,
    DURATION_SPEED,
    BODYWEIGHT,
    WEIGHTED_BODYWEIGHT,
}

enum class SideMode {
    NONE,
    PER_SIDE,
    ALTERNATING,
}

enum class SetType {
    WARMUP,
    WORKING,
    DROPSET,
    AMRAP,
}

enum class ProgressionState {
    ADVANCE,
    HOLD,
    DELOAD,
    RESET,
}

data class PreviousSetPerformance(
    val setType: SetType,
    val actualReps: Int?,
    val actualWeightKg: Double?,
    val actualTimeSec: Int?,
    val targetReps: Int?,
    val targetWeightKg: Double?,
    val isFailed: Boolean,
)

data class ProgressionInput(
    val rule: ProgressionRule,
    val exerciseMode: ExerciseMode,
    val sideMode: SideMode,
    val previousSets: List<PreviousSetPerformance>,
    val repMin: Int = 6,
    val repMax: Int = 8,
    val weightStepKg: Double = 2.5,
    val timeStepSec: Int = 5,
    val stallCount: Int = 0,
    val deloadPercent: Double = 0.10,
)

data class ProgressionTarget(
    val targetWeightKg: Double?,
    val targetRepsMin: Int,
    val targetRepsMax: Int,
    val targetTimeSec: Int?,
    val rationale: String,
    val progressionState: ProgressionState,
)

data class OneRepMaxEstimate(
    val estimatedKg: Double,
    val sourceWeightKg: Double,
    val sourceReps: Int,
    val formula: String = "epley",
    val confidence: String,
    val disclaimer: String,
)

object ProgressionEngine {
    fun compute(input: ProgressionInput): ProgressionTarget {
        val working = input.previousSets.filter { it.setType == SetType.WORKING }
        val baseWeight = working.lastOrNull { it.actualWeightKg != null }?.actualWeightKg ?: 0.0
        val baseReps = working.lastOrNull()?.actualReps ?: 0
        val perSide = input.sideMode == SideMode.PER_SIDE

        if (input.rule == ProgressionRule.NONE || working.isEmpty()) {
            return ProgressionTarget(
                targetWeightKg = baseWeight.takeIf { it > 0 },
                targetRepsMin = input.repMin,
                targetRepsMax = input.repMax,
                targetTimeSec = null,
                rationale = "No previous working sets — using plan defaults.",
                progressionState = ProgressionState.HOLD,
            )
        }

        if (input.exerciseMode == ExerciseMode.BODYWEIGHT) {
            val reps = evenReps(
                if (allTargetsMet(working)) baseReps + 1 else baseReps,
                perSide,
            )
            return ProgressionTarget(
                targetWeightKg = null,
                targetRepsMin = reps,
                targetRepsMax = reps,
                targetTimeSec = null,
                rationale = if (allTargetsMet(working)) {
                    "Previous session hit targets at $baseReps reps — bodyweight rep progression +1."
                } else {
                    "Previous session missed targets — hold at $baseReps reps."
                },
                progressionState = if (allTargetsMet(working)) ProgressionState.ADVANCE else ProgressionState.HOLD,
            )
        }

        if (input.rule == ProgressionRule.TIME_PROGRESSION) {
            val lastTime = working.last().actualTimeSec ?: 0
            val target = if (allTargetsMet(working)) lastTime + input.timeStepSec else lastTime
            return ProgressionTarget(
                targetWeightKg = null,
                targetRepsMin = 0,
                targetRepsMax = 0,
                targetTimeSec = target,
                rationale = if (allTargetsMet(working)) {
                    "Time progression: +${input.timeStepSec}s after successful hold."
                } else {
                    "Hold time — previous target not met."
                },
                progressionState = if (allTargetsMet(working)) ProgressionState.ADVANCE else ProgressionState.HOLD,
            )
        }

        if (input.stallCount >= 3) {
            val deload = round1(baseWeight * (1 - input.deloadPercent))
            return ProgressionTarget(
                targetWeightKg = deload,
                targetRepsMin = input.repMin,
                targetRepsMax = input.repMax,
                targetTimeSec = null,
                rationale = "Stall detected (${input.stallCount} sessions) — deload ${(input.deloadPercent * 100).toInt()}% to ${deload}kg.",
                progressionState = ProgressionState.DELOAD,
            )
        }

        val failed = working.any { it.isFailed || (it.actualReps ?: 0) < (it.targetReps ?: 0) }

        when (input.rule) {
            ProgressionRule.LINEAR -> {
                val nextWeight = if (allTargetsMet(working) && !failed) {
                    round1(baseWeight + input.weightStepKg)
                } else {
                    baseWeight
                }
                return ProgressionTarget(
                    targetWeightKg = nextWeight,
                    targetRepsMin = evenReps(input.repMin, perSide),
                    targetRepsMax = evenReps(input.repMax, perSide),
                    targetTimeSec = null,
                    rationale = if (allTargetsMet(working) && !failed) {
                        "Linear: all sets completed — +${input.weightStepKg}kg to ${nextWeight}kg."
                    } else {
                        "Linear: missed reps — hold at ${baseWeight}kg."
                    },
                    progressionState = if (allTargetsMet(working) && !failed) ProgressionState.ADVANCE else ProgressionState.HOLD,
                )
            }
            ProgressionRule.DOUBLE_PROGRESSION -> {
                if (failed) {
                    return ProgressionTarget(
                        targetWeightKg = baseWeight,
                        targetRepsMin = evenReps(input.repMin, perSide),
                        targetRepsMax = evenReps(input.repMax, perSide),
                        targetTimeSec = null,
                        rationale = "Double progression: missed reps — hold weight and rebuild rep range.",
                        progressionState = ProgressionState.HOLD,
                    )
                }
                if (baseReps >= input.repMax) {
                    val nextWeight = round1(baseWeight + input.weightStepKg)
                    return ProgressionTarget(
                        targetWeightKg = nextWeight,
                        targetRepsMin = evenReps(input.repMin, perSide),
                        targetRepsMax = evenReps(input.repMax, perSide),
                        targetTimeSec = null,
                        rationale = "Double progression: hit top of rep range (${input.repMax}) — +${input.weightStepKg}kg, reset reps.",
                        progressionState = ProgressionState.ADVANCE,
                    )
                }
                val nextReps = evenReps(baseReps + 1, perSide)
                return ProgressionTarget(
                    targetWeightKg = baseWeight,
                    targetRepsMin = nextReps,
                    targetRepsMax = evenReps(input.repMax, perSide),
                    targetTimeSec = null,
                    rationale = "Double progression: add rep within range ($nextReps–${input.repMax}) at ${baseWeight}kg.",
                    progressionState = ProgressionState.ADVANCE,
                )
            }
            ProgressionRule.GREYSKULL_LP -> {
                val amrapReps = working.last().actualReps ?: baseReps
                var jump = input.weightStepKg
                if (amrapReps >= input.repMax + 2) jump = input.weightStepKg * 2
                val nextWeight = if (allTargetsMet(working) && !failed) round1(baseWeight + jump) else baseWeight
                return ProgressionTarget(
                    targetWeightKg = nextWeight,
                    targetRepsMin = evenReps(input.repMin, perSide),
                    targetRepsMax = evenReps(input.repMax, perSide),
                    targetTimeSec = null,
                    rationale = if (allTargetsMet(working) && !failed) {
                        "Greyskull LP: $amrapReps reps on top set — load → ${nextWeight}kg."
                    } else {
                        "Greyskull LP: hold load until top set targets met."
                    },
                    progressionState = if (allTargetsMet(working) && !failed) ProgressionState.ADVANCE else ProgressionState.HOLD,
                )
            }
            else -> Unit
        }

        return ProgressionTarget(
            targetWeightKg = baseWeight,
            targetRepsMin = input.repMin,
            targetRepsMax = input.repMax,
            targetTimeSec = null,
            rationale = "Default hold.",
            progressionState = ProgressionState.HOLD,
        )
    }

    private fun allTargetsMet(working: List<PreviousSetPerformance>): Boolean =
        working.isNotEmpty() && working.all {
            !it.isFailed && (it.actualReps ?: 0) >= (it.targetReps ?: 0) && (it.targetReps ?: 0) > 0
        }

    private fun evenReps(value: Int, perSide: Boolean): Int =
        if (!perSide || value % 2 == 0) value else value + 1

    private fun round1(v: Double): Double = kotlin.math.round(v * 10) / 10.0
}

object OneRepMaxEstimator {
    fun estimate(weightKg: Double, reps: Int): OneRepMaxEstimate {
        if (reps <= 0 || weightKg <= 0) {
            return OneRepMaxEstimate(
                estimatedKg = 0.0,
                sourceWeightKg = weightKg,
                sourceReps = reps,
                confidence = "low",
                disclaimer = "Insufficient data for estimate.",
            )
        }
        if (reps == 1) {
            return OneRepMaxEstimate(
                estimatedKg = weightKg,
                sourceWeightKg = weightKg,
                sourceReps = reps,
                confidence = "high",
                disclaimer = "Estimated 1RM — not a measured max.",
            )
        }
        val confidence = if (reps <= 12) "medium" else "low"
        val estimated = kotlin.math.round(weightKg * (1 + reps / 30.0) * 10) / 10.0
        return OneRepMaxEstimate(
            estimatedKg = estimated,
            sourceWeightKg = weightKg,
            sourceReps = reps,
            confidence = confidence,
            disclaimer = "Estimated 1RM (Epley) — not a measured max.",
        )
    }
}
