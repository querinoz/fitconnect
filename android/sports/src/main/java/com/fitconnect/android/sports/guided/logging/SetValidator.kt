package com.fitconnect.android.sports.guided.logging

import com.fitconnect.android.sports.guided.domain.EffortScales
import com.fitconnect.android.sports.guided.domain.ExecutionSlot
import com.fitconnect.android.sports.guided.domain.SetLogInput
import com.fitconnect.android.sports.guided.domain.SetSide
import com.fitconnect.android.sports.progression.ExerciseMode

sealed class SetValidation {
    data object Ok : SetValidation()
    data class Err(val message: String) : SetValidation()
}

object SetValidator {
    fun validate(slot: ExecutionSlot, input: SetLogInput): SetValidation {
        val exercise = slot.exercise
        if (input.actualReps != null && input.actualReps < 0) {
            return SetValidation.Err("Reps cannot be negative.")
        }
        if (input.actualTimeSec != null && input.actualTimeSec < 0) {
            return SetValidation.Err("Duration cannot be negative.")
        }
        if (input.actualTimeSec != null && input.actualTimeSec > 24 * 60 * 60) {
            return SetValidation.Err("Duration is not a possible set length.")
        }
        if (input.loadKg != null && input.loadKg < 0) {
            return SetValidation.Err("Load cannot be negative.")
        }
        if (input.loadKg != null && input.loadKg > 1_000) {
            return SetValidation.Err("Load exceeds canonical unit range (kg).")
        }
        if (input.rpe != null && (input.rpe < EffortScales.RPE_MIN || input.rpe > EffortScales.RPE_MAX)) {
            return SetValidation.Err("RPE must be between 1 and 10.")
        }
        if (input.rpe != null) {
            val steps = input.rpe * 2.0
            if (kotlin.math.abs(steps - kotlin.math.round(steps)) > 0.001) {
                return SetValidation.Err("RPE must use 0.5 steps on the 1–10 scale.")
            }
        }
        if (input.rir != null && (input.rir < EffortScales.RIR_MIN || input.rir > EffortScales.RIR_MAX)) {
            return SetValidation.Err("RIR must be between 0 and 5.")
        }
        if (exercise.rpeRequired && input.rpe == null) {
            return SetValidation.Err("RPE is required for this exercise.")
        }
        if (exercise.rirRequired && input.rir == null) {
            return SetValidation.Err("RIR is required for this exercise.")
        }
        if (exercise.weighted && input.loadKg == null && !input.failed) {
            return SetValidation.Err("Load (kg) is required for weighted exercises.")
        }
        if (!exercise.weighted && input.loadKg != null) {
            return SetValidation.Err("Load is not used for this exercise.")
        }
        when (exercise.mode) {
            ExerciseMode.TIME, ExerciseMode.DURATION_SPEED, ExerciseMode.DISTANCE -> {
                if (input.actualTimeSec == null && !input.failed) {
                    return SetValidation.Err("Time is required for timed exercises.")
                }
            }
            ExerciseMode.REPS, ExerciseMode.BODYWEIGHT, ExerciseMode.WEIGHTED_BODYWEIGHT -> {
                if (input.actualReps == null && !input.failed) {
                    return SetValidation.Err("Reps are required for this exercise.")
                }
            }
        }
        val side = input.side ?: slot.side
        if (slot.side == SetSide.LEFT || slot.side == SetSide.RIGHT) {
            if (side != slot.side && side != SetSide.BOTH) {
                return SetValidation.Err("This set must be logged as ${slot.side}.")
            }
        }
        return SetValidation.Ok
    }
}
