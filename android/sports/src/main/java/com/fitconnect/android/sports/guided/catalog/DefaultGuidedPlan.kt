package com.fitconnect.android.sports.guided.catalog

import com.fitconnect.android.sports.guided.domain.PlannedExercise
import com.fitconnect.android.sports.guided.domain.WorkoutPlan
import com.fitconnect.android.sports.progression.ExerciseMode
import com.fitconnect.android.sports.progression.ProgressionRule
import com.fitconnect.android.sports.progression.SideMode

/**
 * Bundled executable plan — not a LOCAL_DEMO completion path.
 * Builtin exercise ids match migration 018.
 */
object DefaultGuidedPlan {
    const val WORKOUT_ID = "plan_upper_push_v2"

    fun plan(): WorkoutPlan = WorkoutPlan(
        workoutId = WORKOUT_ID,
        name = "Upper strength",
        estimatedDurationMin = 42,
        exercises = listOf(
            PlannedExercise(
                exerciseId = "ex_bench_press",
                name = "Barbell bench press",
                mode = ExerciseMode.REPS,
                weighted = true,
                sideMode = SideMode.NONE,
                supersetGroupId = null,
                targetSets = 2,
                targetRepsMin = 6,
                targetRepsMax = 8,
                targetWeightKg = 60.0,
                targetTimeSec = null,
                restSec = 90,
                progressionRule = ProgressionRule.DOUBLE_PROGRESSION,
            ),
            PlannedExercise(
                exerciseId = "ex_dumbbell_row",
                name = "Dumbbell row",
                mode = ExerciseMode.REPS,
                weighted = true,
                sideMode = SideMode.NONE,
                supersetGroupId = "A",
                targetSets = 2,
                targetRepsMin = 8,
                targetRepsMax = 10,
                targetWeightKg = 22.5,
                targetTimeSec = null,
                restSec = 75,
                progressionRule = ProgressionRule.LINEAR,
            ),
            PlannedExercise(
                exerciseId = "ex_push_up",
                name = "Push-up",
                mode = ExerciseMode.BODYWEIGHT,
                weighted = false,
                sideMode = SideMode.NONE,
                supersetGroupId = "A",
                targetSets = 2,
                targetRepsMin = 8,
                targetRepsMax = 12,
                targetWeightKg = null,
                targetTimeSec = null,
                restSec = 75,
                progressionRule = ProgressionRule.LINEAR,
            ),
            PlannedExercise(
                exerciseId = "ex_reverse_lunge",
                name = "Reverse lunge",
                mode = ExerciseMode.REPS,
                weighted = true,
                sideMode = SideMode.PER_SIDE,
                targetSets = 1,
                targetRepsMin = 8,
                targetRepsMax = 8,
                targetWeightKg = 16.0,
                targetTimeSec = null,
                restSec = 60,
                progressionRule = ProgressionRule.LINEAR,
                supersetGroupId = null,
            ),
            PlannedExercise(
                exerciseId = "ex_plank",
                name = "Plank",
                mode = ExerciseMode.TIME,
                weighted = false,
                sideMode = SideMode.NONE,
                supersetGroupId = null,
                targetSets = 1,
                targetRepsMin = 0,
                targetRepsMax = 0,
                targetWeightKg = null,
                targetTimeSec = 20,
                restSec = 30,
                progressionRule = ProgressionRule.TIME_PROGRESSION,
            ),
            PlannedExercise(
                exerciseId = "ex_jump_rope",
                name = "Jump rope",
                mode = ExerciseMode.DURATION_SPEED,
                weighted = false,
                sideMode = SideMode.NONE,
                supersetGroupId = null,
                targetSets = 1,
                targetRepsMin = 0,
                targetRepsMax = 0,
                targetWeightKg = null,
                targetTimeSec = 20,
                restSec = 0,
                progressionRule = ProgressionRule.TIME_PROGRESSION,
            ),
        ),
    )
}
