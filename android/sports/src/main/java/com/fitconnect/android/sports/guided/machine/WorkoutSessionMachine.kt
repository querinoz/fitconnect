package com.fitconnect.android.sports.guided.machine

import com.fitconnect.android.sports.guided.domain.ExerciseSetRecord
import com.fitconnect.android.sports.guided.domain.GuidedSessionSnapshot
import com.fitconnect.android.sports.guided.domain.ReduceResult
import com.fitconnect.android.sports.guided.domain.RestTimerState
import com.fitconnect.android.sports.guided.domain.SetLogInput
import com.fitconnect.android.sports.guided.domain.SyncUiStatus
import com.fitconnect.android.sports.guided.domain.TimedExerciseState
import com.fitconnect.android.sports.guided.domain.WorkoutClock
import com.fitconnect.android.sports.guided.domain.WorkoutCommand
import com.fitconnect.android.sports.guided.domain.WorkoutEventRecord
import com.fitconnect.android.sports.guided.domain.WorkoutIds
import com.fitconnect.android.sports.guided.domain.WorkoutPhase
import com.fitconnect.android.sports.guided.logging.SetValidation
import com.fitconnect.android.sports.guided.logging.SetValidator
import com.fitconnect.android.sports.guided.schedule.ExecutionSchedule
import com.fitconnect.android.sports.guided.timer.MonotonicTimer
import com.fitconnect.android.sports.progression.ExerciseMode
import java.util.UUID

object WorkoutSessionMachine {
    fun reduce(
        state: GuidedSessionSnapshot,
        command: WorkoutCommand,
        clock: WorkoutClock,
        eventId: () -> String = { UUID.randomUUID().toString() },
        setId: () -> String = { UUID.randomUUID().toString() },
    ): ReduceResult {
        return when (command) {
            is WorkoutCommand.LoadPlan -> loadPlan(command, clock, eventId)
            WorkoutCommand.Start -> start(state, clock, eventId)
            is WorkoutCommand.LogSet -> logSet(state, command.input, clock, eventId, setId)
            WorkoutCommand.SkipRest -> skipRest(state, clock, eventId)
            is WorkoutCommand.ExtendRest -> extendRest(state, command.extraSec, clock, eventId)
            WorkoutCommand.Pause -> pause(state, clock, eventId)
            WorkoutCommand.Resume -> resume(state, clock, eventId)
            WorkoutCommand.SkipExercise -> skipExercise(state, clock, eventId)
            WorkoutCommand.Finish -> finish(state, clock, eventId)
            WorkoutCommand.Tick -> tick(state, clock, eventId, setId)
            is WorkoutCommand.Recover -> recover(command.snapshot)
            is WorkoutCommand.MarkSyncPending -> markSyncPending(state, command.activityId, eventId, clock)
            WorkoutCommand.MarkSynced -> markSynced(state, eventId, clock)
            is WorkoutCommand.MarkSyncError -> markSyncError(state, command.message, eventId, clock)
            is WorkoutCommand.MarkFailed -> markFailed(state, command.reason, eventId, clock)
            is WorkoutCommand.AwardXp -> awardXp(state, command.xp, command.duplicate, eventId, clock)
        }
    }

    private fun loadPlan(
        command: WorkoutCommand.LoadPlan,
        clock: WorkoutClock,
        eventId: () -> String,
    ): ReduceResult {
        if (command.userId.isBlank()) {
            return ReduceResult(GuidedSessionSnapshot.idle(), rejected = "userId is required.")
        }
        val schedule = ExecutionSchedule.build(command.plan)
        val snapshot = GuidedSessionSnapshot(
            userId = command.userId,
            sessionId = command.sessionId,
            workoutId = command.plan.workoutId,
            plan = command.plan,
            schedule = schedule,
            phase = WorkoutPhase.PREP,
            slotIndex = 0,
            sets = emptyList(),
            rest = null,
            timed = null,
            pausedFrom = null,
            startedAtMs = null,
            completedAtMs = null,
            activityId = null,
            idempotencyKey = WorkoutIds.activityIdempotencyKey(command.userId, command.sessionId),
            syncStatus = SyncUiStatus.LOCAL,
            lastError = null,
            progressionRationale = null,
            progressionState = null,
            xpEarned = null,
            xpDuplicatePrevented = false,
        )
        return ReduceResult(snapshot, listOf(event(snapshot, "workout_loaded", clock, eventId)))
    }

    private fun start(
        state: GuidedSessionSnapshot,
        clock: WorkoutClock,
        eventId: () -> String,
    ): ReduceResult {
        if (state.phase != WorkoutPhase.PREP) {
            return reject(state, "Start is only valid from PREP.")
        }
        val timed = maybeStartTimed(state, 0, clock)
        val next = state.copy(
            phase = WorkoutPhase.ACTIVE,
            startedAtMs = clock.wallClockMs(),
            timed = timed,
            lastError = null,
        )
        return ReduceResult(next, listOf(event(next, "workout_started", clock, eventId)))
    }

    private fun logSet(
        state: GuidedSessionSnapshot,
        input: SetLogInput,
        clock: WorkoutClock,
        eventId: () -> String,
        setId: () -> String,
    ): ReduceResult {
        if (state.phase != WorkoutPhase.ACTIVE) {
            return reject(state, "Sets can only be logged while ACTIVE.")
        }
        val slot = state.currentSlot ?: return reject(state, "No current exercise.")
        when (val check = SetValidator.validate(slot, input)) {
            is SetValidation.Err -> return reject(state, check.message)
            SetValidation.Ok -> Unit
        }
        val record = ExerciseSetRecord(
            setId = setId(),
            sessionId = state.sessionId,
            exerciseId = slot.exercise.exerciseId,
            sequence = state.sets.size + 1,
            setIndex = slot.setNumber,
            setType = com.fitconnect.android.sports.guided.domain.LoggedSetType.WORKING,
            supersetGroupId = slot.exercise.supersetGroupId,
            side = input.side ?: slot.side,
            targetReps = slot.exercise.targetRepsMax.takeIf { it > 0 },
            actualReps = input.actualReps,
            targetTimeSec = slot.exercise.targetTimeSec,
            actualTimeSec = input.actualTimeSec,
            loadKg = input.loadKg,
            rpe = input.rpe,
            rir = input.rir,
            completedAtMs = clock.wallClockMs(),
            isFailed = input.failed,
        )
        val withSet = state.copy(sets = state.sets + record, timed = null, lastError = null)
        val advanced = advanceAfterSet(withSet, clock)
        return ReduceResult(
            advanced,
            listOf(event(advanced, "set_completed", clock, eventId)),
        )
    }

    private fun skipRest(
        state: GuidedSessionSnapshot,
        clock: WorkoutClock,
        eventId: () -> String,
    ): ReduceResult {
        if (state.phase != WorkoutPhase.REST) return reject(state, "Skip rest is only valid during REST.")
        val nextIndex = state.rest?.nextSlotIndex ?: (state.slotIndex + 1)
        return enterActive(state, nextIndex, clock, eventId, "rest_skipped")
    }

    private fun extendRest(
        state: GuidedSessionSnapshot,
        extraSec: Int,
        clock: WorkoutClock,
        eventId: () -> String,
    ): ReduceResult {
        if (state.phase != WorkoutPhase.REST) return reject(state, "Extend rest is only valid during REST.")
        if (extraSec <= 0) return reject(state, "Rest extension must be positive.")
        val rest = state.rest ?: return reject(state, "No rest timer.")
        val frozen = MonotonicTimer.freezeRest(rest, clock)
        val next = state.copy(
            rest = frozen.copy(remainingMs = frozen.remainingMs + extraSec * 1000L),
            lastError = null,
        )
        return ReduceResult(next, listOf(event(next, "rest_extended", clock, eventId)))
    }

    private fun pause(
        state: GuidedSessionSnapshot,
        clock: WorkoutClock,
        eventId: () -> String,
    ): ReduceResult {
        if (state.phase != WorkoutPhase.ACTIVE && state.phase != WorkoutPhase.REST) {
            return reject(state, "Pause is only valid from ACTIVE or REST.")
        }
        val next = state.copy(
            phase = WorkoutPhase.PAUSED,
            pausedFrom = state.phase,
            rest = state.rest?.let { MonotonicTimer.freezeRest(it, clock) },
            timed = state.timed?.let { MonotonicTimer.freezeTimed(it, clock) },
            lastError = null,
        )
        return ReduceResult(next, listOf(event(next, "workout_paused", clock, eventId)))
    }

    private fun resume(
        state: GuidedSessionSnapshot,
        clock: WorkoutClock,
        eventId: () -> String,
    ): ReduceResult {
        if (state.phase != WorkoutPhase.PAUSED) return reject(state, "Resume is only valid from PAUSED.")
        val target = state.pausedFrom ?: WorkoutPhase.ACTIVE
        val rest = state.rest?.let {
            it.copy(elapsedAnchorMs = clock.elapsedRealtimeMs(), wallAnchorMs = clock.wallClockMs())
        }
        val timed = state.timed?.let {
            it.copy(elapsedAnchorMs = clock.elapsedRealtimeMs(), wallAnchorMs = clock.wallClockMs())
        }
        val next = state.copy(
            phase = target,
            pausedFrom = null,
            rest = rest,
            timed = timed,
            lastError = null,
        )
        return ReduceResult(next, listOf(event(next, "workout_resumed", clock, eventId)))
    }

    private fun skipExercise(
        state: GuidedSessionSnapshot,
        clock: WorkoutClock,
        eventId: () -> String,
    ): ReduceResult {
        if (state.phase != WorkoutPhase.ACTIVE) return reject(state, "Skip is only valid while ACTIVE.")
        val slot = state.currentSlot ?: return finish(state, clock, eventId)
        var nextIndex = state.slotIndex + 1
        while (nextIndex < state.schedule.size &&
            state.schedule[nextIndex].exercise.exerciseId == slot.exercise.exerciseId
        ) {
            nextIndex++
        }
        if (nextIndex >= state.schedule.size) {
            return finish(state.copy(timed = null), clock, eventId)
        }
        return enterActive(state.copy(timed = null), nextIndex, clock, eventId, "exercise_skipped")
    }

    private fun finish(
        state: GuidedSessionSnapshot,
        clock: WorkoutClock,
        eventId: () -> String,
    ): ReduceResult {
        if (state.phase == WorkoutPhase.COMPLETED ||
            state.phase == WorkoutPhase.SYNC_PENDING ||
            state.phase == WorkoutPhase.SYNCED ||
            state.phase == WorkoutPhase.COMPLETING
        ) {
            return ReduceResult(state)
        }
        if (state.phase == WorkoutPhase.IDLE || state.phase == WorkoutPhase.FAILED) {
            return reject(state, "Cannot finish this session.")
        }
        val next = state.copy(
            phase = WorkoutPhase.COMPLETING,
            rest = null,
            timed = null,
            pausedFrom = null,
            completedAtMs = clock.wallClockMs(),
            lastError = null,
        )
        val completed = next.copy(phase = WorkoutPhase.COMPLETED)
        return ReduceResult(
            completed,
            listOf(
                event(next, "workout_completing", clock, eventId),
                event(completed, "workout_completed", clock, eventId),
            ),
        )
    }

    private fun tick(
        state: GuidedSessionSnapshot,
        clock: WorkoutClock,
        eventId: () -> String,
        setId: () -> String,
    ): ReduceResult {
        when (state.phase) {
            WorkoutPhase.REST -> {
                val rest = state.rest ?: return ReduceResult(state)
                if (MonotonicTimer.restRemaining(rest, clock) > 0) return ReduceResult(state)
                return enterActive(state, rest.nextSlotIndex, clock, eventId, "rest_elapsed")
            }
            WorkoutPhase.ACTIVE -> {
                val timed = state.timed ?: return ReduceResult(state)
                if (MonotonicTimer.timedRemaining(timed, clock) > 0) return ReduceResult(state)
                val slot = state.currentSlot ?: return ReduceResult(state)
                val input = SetLogInput(
                    actualTimeSec = slot.exercise.targetTimeSec ?: (timed.durationMs / 1000).toInt(),
                    actualReps = if (needsReps(slot.exercise.mode)) slot.exercise.targetRepsMin else null,
                    loadKg = if (slot.exercise.weighted) slot.exercise.targetWeightKg else null,
                    side = slot.side,
                )
                return logSet(state, input, clock, eventId, setId)
            }
            else -> return ReduceResult(state)
        }
    }

    private fun recover(snapshot: GuidedSessionSnapshot): ReduceResult {
        if (snapshot.sessionId.isBlank()) {
            return ReduceResult(GuidedSessionSnapshot.idle(), rejected = "Nothing to recover.")
        }
        val restored = snapshot.copy(
            phase = when (snapshot.phase) {
                WorkoutPhase.RECOVERING -> snapshot.pausedFrom ?: WorkoutPhase.PREP
                else -> snapshot.phase
            },
            lastError = null,
        )
        return ReduceResult(restored)
    }

    private fun markSyncPending(
        state: GuidedSessionSnapshot,
        activityId: String,
        eventId: () -> String,
        clock: WorkoutClock,
    ): ReduceResult {
        if (state.phase != WorkoutPhase.COMPLETED && state.phase != WorkoutPhase.SYNC_PENDING) {
            return reject(state, "Sync pending requires COMPLETED.")
        }
        val next = state.copy(
            phase = WorkoutPhase.SYNC_PENDING,
            activityId = activityId,
            syncStatus = SyncUiStatus.SYNCING,
            lastError = null,
        )
        return ReduceResult(next, listOf(event(next, "activity_created", clock, eventId)))
    }

    private fun markSynced(
        state: GuidedSessionSnapshot,
        eventId: () -> String,
        clock: WorkoutClock,
    ): ReduceResult {
        if (state.phase != WorkoutPhase.SYNC_PENDING && state.phase != WorkoutPhase.COMPLETED) {
            return reject(state, "Synced requires SYNC_PENDING.")
        }
        val next = state.copy(phase = WorkoutPhase.SYNCED, syncStatus = SyncUiStatus.SYNCED, lastError = null)
        return ReduceResult(next, listOf(event(next, "activity_sync_succeeded", clock, eventId)))
    }

    private fun markSyncError(
        state: GuidedSessionSnapshot,
        message: String,
        eventId: () -> String,
        clock: WorkoutClock,
    ): ReduceResult {
        val next = state.copy(
            phase = WorkoutPhase.SYNC_PENDING,
            syncStatus = SyncUiStatus.SYNC_ERROR,
            lastError = message,
        )
        return ReduceResult(next, listOf(event(next, "activity_sync_failed", clock, eventId)))
    }

    private fun markFailed(
        state: GuidedSessionSnapshot,
        reason: String,
        eventId: () -> String,
        clock: WorkoutClock,
    ): ReduceResult {
        val next = state.copy(phase = WorkoutPhase.FAILED, lastError = reason, rest = null, timed = null)
        return ReduceResult(next, listOf(event(next, "workout_failed", clock, eventId)))
    }

    private fun awardXp(
        state: GuidedSessionSnapshot,
        xp: Int,
        duplicate: Boolean,
        eventId: () -> String,
        clock: WorkoutClock,
    ): ReduceResult {
        val next = state.copy(
            xpEarned = if (duplicate) state.xpEarned ?: 0 else xp,
            xpDuplicatePrevented = duplicate || state.xpDuplicatePrevented,
        )
        val type = if (duplicate) "xp_duplicate_prevented" else "xp_awarded"
        return ReduceResult(next, listOf(event(next, type, clock, eventId)))
    }

    private fun advanceAfterSet(state: GuidedSessionSnapshot, clock: WorkoutClock): GuidedSessionSnapshot {
        val slot = state.currentSlot ?: return state.copy(phase = WorkoutPhase.COMPLETING)
        val nextIndex = state.slotIndex + 1
        if (nextIndex >= state.schedule.size) {
            return state.copy(
                phase = WorkoutPhase.COMPLETED,
                completedAtMs = clock.wallClockMs(),
                rest = null,
                timed = null,
            )
        }
        if (slot.restAfterSec > 0) {
            return state.copy(
                phase = WorkoutPhase.REST,
                rest = MonotonicTimer.startRest(slot.restAfterSec * 1000L, nextIndex, clock),
                timed = null,
                slotIndex = nextIndex,
            )
        }
        return enterActiveSnapshot(state, nextIndex, clock)
    }

    private fun enterRest(
        state: GuidedSessionSnapshot,
        nextIndex: Int,
        restSec: Int,
        clock: WorkoutClock,
        eventId: () -> String,
    ): ReduceResult {
        val next = state.copy(
            phase = WorkoutPhase.REST,
            rest = MonotonicTimer.startRest(restSec * 1000L, nextIndex, clock),
            timed = null,
            slotIndex = nextIndex,
            lastError = null,
        )
        return ReduceResult(next, listOf(event(next, "rest_started", clock, eventId)))
    }

    private fun enterActive(
        state: GuidedSessionSnapshot,
        nextIndex: Int,
        clock: WorkoutClock,
        eventId: () -> String,
        eventType: String,
    ): ReduceResult {
        val next = enterActiveSnapshot(state, nextIndex, clock)
        return ReduceResult(next, listOf(event(next, eventType, clock, eventId)))
    }

    private fun enterActiveSnapshot(
        state: GuidedSessionSnapshot,
        nextIndex: Int,
        clock: WorkoutClock,
    ): GuidedSessionSnapshot {
        if (nextIndex >= state.schedule.size) {
            return state.copy(
                phase = WorkoutPhase.COMPLETED,
                completedAtMs = clock.wallClockMs(),
                rest = null,
                timed = null,
            )
        }
        return state.copy(
            phase = WorkoutPhase.ACTIVE,
            slotIndex = nextIndex,
            rest = null,
            timed = maybeStartTimed(state, nextIndex, clock),
            lastError = null,
        )
    }

    private fun maybeStartTimed(
        state: GuidedSessionSnapshot,
        slotIndex: Int,
        clock: WorkoutClock,
    ): TimedExerciseState? {
        val slot = state.schedule.getOrNull(slotIndex) ?: return null
        val timed = slot.exercise.mode == ExerciseMode.TIME ||
            slot.exercise.mode == ExerciseMode.DURATION_SPEED
        if (!timed) return null
        val sec = slot.exercise.targetTimeSec ?: return null
        return MonotonicTimer.startTimed(sec * 1000L, slotIndex, clock)
    }

    private fun needsReps(mode: ExerciseMode): Boolean = when (mode) {
        ExerciseMode.REPS, ExerciseMode.BODYWEIGHT, ExerciseMode.WEIGHTED_BODYWEIGHT -> true
        else -> false
    }

    private fun reject(state: GuidedSessionSnapshot, message: String): ReduceResult =
        ReduceResult(state.copy(lastError = message), rejected = message)

    private fun event(
        state: GuidedSessionSnapshot,
        type: String,
        clock: WorkoutClock,
        eventId: () -> String,
    ): WorkoutEventRecord = WorkoutEventRecord(
        eventId = eventId(),
        sessionId = state.sessionId,
        type = type,
        payload = """{"phase":"${state.phase}","slot":${state.slotIndex}}""",
        createdAtMs = clock.wallClockMs(),
    )
}
