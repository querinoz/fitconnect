package com.fitconnect.android.sports.guided.schedule

import com.fitconnect.android.sports.guided.domain.ExecutionSlot
import com.fitconnect.android.sports.guided.domain.PlannedExercise
import com.fitconnect.android.sports.guided.domain.SetSide
import com.fitconnect.android.sports.guided.domain.WorkoutPlan
import com.fitconnect.android.sports.progression.SideMode

object ExecutionSchedule {
    fun build(plan: WorkoutPlan): List<ExecutionSlot> {
        val groups = group(plan.exercises)
        val slots = mutableListOf<ExecutionSlot>()
        var index = 0
        for (group in groups) {
            val rounds = group.maxOf { it.targetSets.coerceAtLeast(1) }
            for (round in 1..rounds) {
                val live = group.filter { round <= it.targetSets }
                live.forEachIndexed { gIndex, exercise ->
                    val sides = sidesFor(exercise)
                    sides.forEachIndexed { sIndex, side ->
                        val lastInGroupRound = gIndex == live.lastIndex && sIndex == sides.lastIndex
                        val rest = if (lastInGroupRound) exercise.restSec.coerceAtLeast(0) else 0
                        slots += ExecutionSlot(
                            slotIndex = index++,
                            exercise = exercise,
                            setNumber = round,
                            side = side,
                            restAfterSec = rest,
                        )
                    }
                }
            }
        }
        return slots
    }

    private fun sidesFor(exercise: PlannedExercise): List<SetSide> = when (exercise.sideMode) {
        SideMode.PER_SIDE -> listOf(SetSide.LEFT, SetSide.RIGHT)
        SideMode.ALTERNATING -> listOf(SetSide.LEFT, SetSide.RIGHT)
        SideMode.NONE -> listOf(SetSide.BOTH)
    }

    private fun group(exercises: List<PlannedExercise>): List<List<PlannedExercise>> {
        val out = mutableListOf<MutableList<PlannedExercise>>()
        for (exercise in exercises) {
            val last = out.lastOrNull()
            val gid = exercise.supersetGroupId
            if (gid != null && last != null && last.first().supersetGroupId == gid) {
                last += exercise
            } else {
                out += mutableListOf(exercise)
            }
        }
        return out
    }
}
