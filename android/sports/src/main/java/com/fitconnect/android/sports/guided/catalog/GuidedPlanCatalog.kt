package com.fitconnect.android.sports.guided.catalog

import com.fitconnect.android.sports.guided.domain.PlannedExercise
import com.fitconnect.android.sports.guided.domain.WorkoutPlan
import com.fitconnect.android.sports.progression.ExerciseMode
import com.fitconnect.android.sports.progression.ProgressionRule
import com.fitconnect.android.sports.progression.SideMode

data class GuidedPlanCard(
    val plan: WorkoutPlan,
    val sport: String,
    val goal: String,
    val difficulty: String,
    val equipment: List<String>,
    val location: String,
    val plannedIntensity: String,
    val purpose: String,
    val outcome: String,
    val muscleGroups: List<String>,
    val structure: List<String>,
    val zenithNote: String,
)

/**
 * Bundled executable catalog. Completions stay MANUAL — never a LOCAL_DEMO biometric path.
 * Builtin exercise ids match migration 018 when possible.
 */
object GuidedPlanCatalog {
    val featuredId: String = DefaultGuidedPlan.WORKOUT_ID

    fun cards(): List<GuidedPlanCard> = listOf(
        card(
            plan = DefaultGuidedPlan.plan(),
            sport = "strength",
            goal = "strength",
            difficulty = "hard",
            equipment = listOf("barbell", "dumbbells", "bench"),
            location = "gym",
            plannedIntensity = "high",
            purpose = "Build pressing and pulling strength with honest set logging.",
            outcome = "Logged upper-body volume. Energy is not estimated.",
            muscleGroups = listOf("chest", "back", "shoulders"),
            structure = listOf("Main press", "Row + push-up", "Lunge", "Brace"),
            zenithNote = "Programmed intensity. Adaptation requires connected recovery data.",
        ),
        card(
            plan = WorkoutPlan(
                workoutId = "plan_push_density_v1",
                name = "Push density",
                estimatedDurationMin = 28,
                exercises = listOf(
                    planned("ex_bench_press", "Barbell bench press", ExerciseMode.REPS, true, 3, 8, 10, 50.0, null, 75),
                    planned("ex_push_up", "Push-up", ExerciseMode.BODYWEIGHT, false, 3, 8, 12, null, null, 45),
                    planned("ex_plank", "Plank", ExerciseMode.TIME, false, 2, 0, 0, null, 30, 20, ProgressionRule.TIME_PROGRESSION),
                ),
            ),
            sport = "hypertrophy",
            goal = "hypertrophy",
            difficulty = "moderate",
            equipment = listOf("barbell"),
            location = "gym",
            plannedIntensity = "moderate",
            purpose = "Accumulate pressing volume at controlled rest.",
            outcome = "Higher-rep pressing without fabricated pump metrics.",
            muscleGroups = listOf("chest", "triceps"),
            structure = listOf("Press", "Push-up", "Brace"),
            zenithNote = "Rest is part of the dose.",
        ),
        card(
            plan = WorkoutPlan(
                workoutId = "plan_home_full_v1",
                name = "Home full-body",
                estimatedDurationMin = 24,
                exercises = listOf(
                    planned("ex_push_up", "Push-up", ExerciseMode.BODYWEIGHT, false, 3, 8, 12, null, null, 45),
                    planned("ex_reverse_lunge", "Reverse lunge", ExerciseMode.REPS, false, 2, 8, 8, null, null, 45, side = SideMode.PER_SIDE),
                    planned("ex_plank", "Plank", ExerciseMode.TIME, false, 2, 0, 0, null, 30, 20, ProgressionRule.TIME_PROGRESSION),
                    planned("ex_jump_rope", "Jump rope", ExerciseMode.DURATION_SPEED, false, 2, 0, 0, null, 30, 20, ProgressionRule.TIME_PROGRESSION),
                ),
            ),
            sport = "conditioning",
            goal = "conditioning",
            difficulty = "moderate",
            equipment = listOf("none"),
            location = "home",
            plannedIntensity = "moderate",
            purpose = "Minimal kit: push, lunge, brace, skip.",
            outcome = "A complete session that works offline.",
            muscleGroups = listOf("full-body"),
            structure = listOf("Push", "Lunge", "Brace", "Skip"),
            zenithNote = "Substitute any movement you cannot perform. No fake heart rate.",
        ),
        card(
            plan = WorkoutPlan(
                workoutId = "plan_mobility_v1",
                name = "Mobility restore",
                estimatedDurationMin = 16,
                exercises = listOf(
                    planned("ex_reverse_lunge", "Slow reverse lunge", ExerciseMode.REPS, false, 2, 6, 8, null, null, 20, side = SideMode.PER_SIDE),
                    planned("ex_plank", "Plank", ExerciseMode.TIME, false, 2, 0, 0, null, 25, 20, ProgressionRule.TIME_PROGRESSION),
                ),
            ),
            sport = "mobility",
            goal = "mobility",
            difficulty = "easy",
            equipment = listOf("none"),
            location = "home",
            plannedIntensity = "recover",
            purpose = "Move without loading a tired nervous system.",
            outcome = "Completed mobility minutes. Not a readiness score.",
            muscleGroups = listOf("hips", "core"),
            structure = listOf("Open", "Brace"),
            zenithNote = "Choose this when you want to move without a high-intensity claim.",
        ),
        card(
            plan = WorkoutPlan(
                workoutId = "plan_hiit_v1",
                name = "HIIT conditioner",
                estimatedDurationMin = 18,
                exercises = listOf(
                    planned("ex_jump_rope", "Work interval", ExerciseMode.DURATION_SPEED, false, 6, 0, 0, null, 30, 30, ProgressionRule.TIME_PROGRESSION),
                ),
            ),
            sport = "hiit",
            goal = "conditioning",
            difficulty = "hard",
            equipment = listOf("none"),
            location = "home",
            plannedIntensity = "peak",
            purpose = "Short work/rest waves you can finish with quality.",
            outcome = "Logged intervals. Zones stay hidden without telemetry.",
            muscleGroups = listOf("full-body"),
            structure = listOf("30/30 waves"),
            zenithNote = "Planned peak work. Heart-rate zones are not invented.",
        ),
        card(
            plan = WorkoutPlan(
                workoutId = "plan_boxing_bag_v1",
                name = "Boxing bag — 5x3",
                estimatedDurationMin = 24,
                exercises = listOf(
                    planned("ex_boxing_bag", "Bag round", ExerciseMode.DURATION_SPEED, false, 5, 0, 0, null, 180, 60, ProgressionRule.TIME_PROGRESSION),
                ),
            ),
            sport = "martial_arts",
            goal = "conditioning",
            difficulty = "hard",
            equipment = listOf("heavy bag", "gloves"),
            location = "gym",
            plannedIntensity = "high",
            purpose = "Five three-minute rounds. Punch force is not invented from a watch.",
            outcome = "Rounds logged. Acceleration is not newtons.",
            muscleGroups = listOf("shoulders", "core"),
            structure = listOf("Round", "Rest"),
            zenithNote = "FIGHT MODE. IMU count is DETECTED until confirmed. No official scores.",
        ),
    )

    fun plan(id: String): WorkoutPlan = cards().firstOrNull { it.plan.workoutId == id }?.plan
        ?: DefaultGuidedPlan.plan()

    fun card(id: String): GuidedPlanCard = cards().firstOrNull { it.plan.workoutId == id }
        ?: cards().first()

    private fun card(
        plan: WorkoutPlan,
        sport: String,
        goal: String,
        difficulty: String,
        equipment: List<String>,
        location: String,
        plannedIntensity: String,
        purpose: String,
        outcome: String,
        muscleGroups: List<String>,
        structure: List<String>,
        zenithNote: String,
    ) = GuidedPlanCard(
        plan = plan,
        sport = sport,
        goal = goal,
        difficulty = difficulty,
        equipment = equipment,
        location = location,
        plannedIntensity = plannedIntensity,
        purpose = purpose,
        outcome = outcome,
        muscleGroups = muscleGroups,
        structure = structure,
        zenithNote = zenithNote,
    )

    private fun planned(
        id: String,
        name: String,
        mode: ExerciseMode,
        weighted: Boolean,
        sets: Int,
        repsMin: Int,
        repsMax: Int,
        load: Double?,
        timeSec: Int?,
        rest: Int,
        rule: ProgressionRule = ProgressionRule.LINEAR,
        side: SideMode = SideMode.NONE,
    ) = PlannedExercise(
        exerciseId = id,
        name = name,
        mode = mode,
        weighted = weighted,
        sideMode = side,
        supersetGroupId = null,
        targetSets = sets,
        targetRepsMin = repsMin,
        targetRepsMax = repsMax,
        targetWeightKg = load,
        targetTimeSec = timeSec,
        restSec = rest,
        progressionRule = rule,
    )
}
