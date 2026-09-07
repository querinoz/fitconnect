package com.fitconnect.android.sports.guided.timer

import com.fitconnect.android.sports.guided.domain.RestTimerState
import com.fitconnect.android.sports.guided.domain.TimedExerciseState
import com.fitconnect.android.sports.guided.domain.WorkoutClock

object MonotonicTimer {
    fun restRemaining(rest: RestTimerState, clock: WorkoutClock): Long =
        remaining(rest.remainingMs, rest.elapsedAnchorMs, rest.wallAnchorMs, clock)

    fun timedRemaining(timed: TimedExerciseState, clock: WorkoutClock): Long =
        remaining(timed.remainingMs, timed.elapsedAnchorMs, timed.wallAnchorMs, clock)

    fun startRest(
        durationMs: Long,
        nextSlotIndex: Int,
        clock: WorkoutClock,
    ): RestTimerState = RestTimerState(
        remainingMs = durationMs,
        durationMs = durationMs,
        elapsedAnchorMs = clock.elapsedRealtimeMs(),
        wallAnchorMs = clock.wallClockMs(),
        nextSlotIndex = nextSlotIndex,
    )

    fun startTimed(
        durationMs: Long,
        slotIndex: Int,
        clock: WorkoutClock,
    ): TimedExerciseState = TimedExerciseState(
        remainingMs = durationMs,
        durationMs = durationMs,
        elapsedAnchorMs = clock.elapsedRealtimeMs(),
        wallAnchorMs = clock.wallClockMs(),
        slotIndex = slotIndex,
    )

    fun freezeRest(rest: RestTimerState, clock: WorkoutClock): RestTimerState =
        rest.copy(
            remainingMs = restRemaining(rest, clock),
            elapsedAnchorMs = clock.elapsedRealtimeMs(),
            wallAnchorMs = clock.wallClockMs(),
        )

    fun freezeTimed(timed: TimedExerciseState, clock: WorkoutClock): TimedExerciseState =
        timed.copy(
            remainingMs = timedRemaining(timed, clock),
            elapsedAnchorMs = clock.elapsedRealtimeMs(),
            wallAnchorMs = clock.wallClockMs(),
        )

    private fun remaining(
        remainingAtAnchor: Long,
        elapsedAnchor: Long,
        wallAnchor: Long,
        clock: WorkoutClock,
    ): Long {
        val elapsedDelta = clock.elapsedRealtimeMs() - elapsedAnchor
        val delta = if (elapsedDelta >= 0 && elapsedDelta < 24L * 60L * 60L * 1000L) {
            elapsedDelta
        } else {
            (clock.wallClockMs() - wallAnchor).coerceAtLeast(0)
        }
        return (remainingAtAnchor - delta).coerceAtLeast(0)
    }
}
