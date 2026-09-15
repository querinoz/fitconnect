package com.fitconnect.android.sports.guided.wakelock

import com.fitconnect.android.sports.guided.domain.WorkoutPhase

object WorkoutWakePolicy {
    const val PAUSE_RELEASE_TIMEOUT_MS = 2L * 60L * 1000L

    fun keepScreenAwake(
        phase: WorkoutPhase,
        pausedElapsedMs: Long = 0L,
        inWorkoutContext: Boolean = true,
    ): Boolean {
        if (!inWorkoutContext) return false
        return when (phase) {
            WorkoutPhase.ACTIVE, WorkoutPhase.WARMUP, WorkoutPhase.REST, WorkoutPhase.COMPLETING -> true
            WorkoutPhase.PAUSED, WorkoutPhase.INTERRUPTED -> pausedElapsedMs < PAUSE_RELEASE_TIMEOUT_MS
            else -> false
        }
    }
}
