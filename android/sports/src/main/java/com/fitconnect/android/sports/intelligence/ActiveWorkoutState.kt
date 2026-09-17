package com.fitconnect.android.sports.intelligence

import com.fitconnect.android.sports.domain.SportId

/** Zenith V8.5 active workout phases (crash-recoverable). */
enum class ActiveWorkoutPhase {
    IDLE,
    PREVIEW,
    WARMUP,
    ACTIVE,
    REST,
    PAUSED,
    COMPLETE,
}

data class ActiveWorkoutSnapshot(
    val phase: ActiveWorkoutPhase = ActiveWorkoutPhase.IDLE,
    val sportId: SportId? = null,
    val sessionType: String = "",
    val intent: String = "",
    val currentAction: String = "",
    val primaryMetricKey: String = "",
    val primaryMetricLabel: String = "",
    val nextAction: String = "",
    val setIndex: Int = 0,
    val totalSets: Int = 0,
    val rest: WallClockRestTimer? = null,
    val pausedFrom: ActiveWorkoutPhase? = null,
    val startedAtWallMs: Long? = null,
    val completedAtWallMs: Long? = null,
    val honesty: SessionHonestyBundle = SessionHonestyBundle(),
    val lastError: String? = null,
    val sessionId: String = "",
) {
    fun isInProgress(): Boolean = when (phase) {
        ActiveWorkoutPhase.PREVIEW,
        ActiveWorkoutPhase.WARMUP,
        ActiveWorkoutPhase.ACTIVE,
        ActiveWorkoutPhase.REST,
        ActiveWorkoutPhase.PAUSED,
        -> true
        else -> false
    }

    companion object {
        fun idle(): ActiveWorkoutSnapshot = ActiveWorkoutSnapshot()
    }
}

sealed class ActiveWorkoutCommand {
    data class Preview(val recommendation: TodaySessionRecommendation, val sessionId: String) : ActiveWorkoutCommand()
    data object StartWarmup : ActiveWorkoutCommand()
    data object StartActive : ActiveWorkoutCommand()
    data class CompleteSet(val restDurationMs: Long) : ActiveWorkoutCommand()
    data object SkipRest : ActiveWorkoutCommand()
    data object Pause : ActiveWorkoutCommand()
    data object Resume : ActiveWorkoutCommand()
    data object Complete : ActiveWorkoutCommand()
    data object Reset : ActiveWorkoutCommand()
    data object Tick : ActiveWorkoutCommand()
    data class Recover(val snapshot: ActiveWorkoutSnapshot) : ActiveWorkoutCommand()
    data class UpdateHonesty(val honesty: SessionHonestyBundle) : ActiveWorkoutCommand()
}

data class ActiveWorkoutReduceResult(
    val state: ActiveWorkoutSnapshot,
    val rejected: String? = null,
    val haptic: ActiveWorkoutHaptic? = null,
)

enum class ActiveWorkoutHaptic {
    SET_COMPLETE,
    REST_COMPLETE,
}

fun interface WorkoutWallClock {
    fun nowMs(): Long
}

object SystemWorkoutWallClock : WorkoutWallClock {
    override fun nowMs(): Long = System.currentTimeMillis()
}

/**
 * Pure state machine for TRAIN sport sessions.
 * Persistence is handled by [ActiveWorkoutStore]; this object only reduces state.
 */
object ActiveWorkoutMachine {
    fun reduce(
        state: ActiveWorkoutSnapshot,
        command: ActiveWorkoutCommand,
        clock: WorkoutWallClock = SystemWorkoutWallClock,
    ): ActiveWorkoutReduceResult = when (command) {
        is ActiveWorkoutCommand.Preview -> preview(state, command)
        ActiveWorkoutCommand.StartWarmup -> startWarmup(state, clock)
        ActiveWorkoutCommand.StartActive -> startActive(state, clock)
        is ActiveWorkoutCommand.CompleteSet -> completeSet(state, command.restDurationMs, clock)
        ActiveWorkoutCommand.SkipRest -> skipRest(state)
        ActiveWorkoutCommand.Pause -> pause(state, clock)
        ActiveWorkoutCommand.Resume -> resume(state, clock)
        ActiveWorkoutCommand.Complete -> complete(state, clock)
        ActiveWorkoutCommand.Reset -> ActiveWorkoutReduceResult(ActiveWorkoutSnapshot.idle())
        ActiveWorkoutCommand.Tick -> tick(state, clock)
        is ActiveWorkoutCommand.Recover -> recover(command.snapshot)
        is ActiveWorkoutCommand.UpdateHonesty ->
            ActiveWorkoutReduceResult(state.copy(honesty = command.honesty, lastError = null))
    }

    private fun preview(
        state: ActiveWorkoutSnapshot,
        command: ActiveWorkoutCommand.Preview,
    ): ActiveWorkoutReduceResult {
        if (state.phase != ActiveWorkoutPhase.IDLE && state.phase != ActiveWorkoutPhase.COMPLETE) {
            return reject(state, "Preview only from IDLE or COMPLETE.")
        }
        val rec = command.recommendation
        val profile = SportIntelligenceCatalog.require(rec.sportId)
        return ActiveWorkoutReduceResult(
            ActiveWorkoutSnapshot(
                phase = ActiveWorkoutPhase.PREVIEW,
                sportId = rec.sportId,
                sessionType = rec.sessionType,
                intent = rec.intent,
                currentAction = "Preview ${profile.displayName}",
                primaryMetricKey = profile.primaryMetrics.first(),
                primaryMetricLabel = profile.primaryMetrics.first().replace('_', ' '),
                nextAction = "Start warmup or session",
                setIndex = 0,
                totalSets = 0,
                honesty = rec.honesty,
                sessionId = command.sessionId,
            ),
        )
    }

    private fun startWarmup(
        state: ActiveWorkoutSnapshot,
        clock: WorkoutWallClock,
    ): ActiveWorkoutReduceResult {
        if (state.phase != ActiveWorkoutPhase.PREVIEW && state.phase != ActiveWorkoutPhase.IDLE) {
            return reject(state, "Warmup only from PREVIEW or IDLE.")
        }
        if (state.sportId == null) return reject(state, "Sport required before warmup.")
        return ActiveWorkoutReduceResult(
            state.copy(
                phase = ActiveWorkoutPhase.WARMUP,
                currentAction = "Warmup",
                nextAction = "Begin working sets",
                startedAtWallMs = state.startedAtWallMs ?: clock.nowMs(),
                lastError = null,
            ),
        )
    }

    private fun startActive(
        state: ActiveWorkoutSnapshot,
        clock: WorkoutWallClock,
    ): ActiveWorkoutReduceResult {
        if (state.phase != ActiveWorkoutPhase.PREVIEW &&
            state.phase != ActiveWorkoutPhase.WARMUP &&
            state.phase != ActiveWorkoutPhase.IDLE
        ) {
            return reject(state, "Start active only from PREVIEW, WARMUP, or IDLE.")
        }
        if (state.sportId == null) return reject(state, "Sport required before active.")
        return ActiveWorkoutReduceResult(
            state.copy(
                phase = ActiveWorkoutPhase.ACTIVE,
                currentAction = "Set ${state.setIndex + 1}",
                nextAction = "Complete set",
                startedAtWallMs = state.startedAtWallMs ?: clock.nowMs(),
                lastError = null,
            ),
        )
    }

    private fun completeSet(
        state: ActiveWorkoutSnapshot,
        restDurationMs: Long,
        clock: WorkoutWallClock,
    ): ActiveWorkoutReduceResult {
        if (state.phase != ActiveWorkoutPhase.ACTIVE && state.phase != ActiveWorkoutPhase.WARMUP) {
            return reject(state, "Complete set only while ACTIVE or WARMUP.")
        }
        val nextSet = state.setIndex + 1
        if (restDurationMs <= 0) {
            return ActiveWorkoutReduceResult(
                state.copy(
                    phase = ActiveWorkoutPhase.ACTIVE,
                    setIndex = nextSet,
                    totalSets = maxOf(state.totalSets, nextSet),
                    currentAction = "Set ${nextSet + 1}",
                    nextAction = "Complete set",
                    rest = null,
                    lastError = null,
                ),
                haptic = ActiveWorkoutHaptic.SET_COMPLETE,
            )
        }
        val timer = WallClockRestTimer.start(restDurationMs, clock.nowMs())
        return ActiveWorkoutReduceResult(
            state.copy(
                phase = ActiveWorkoutPhase.REST,
                setIndex = nextSet,
                totalSets = maxOf(state.totalSets, nextSet),
                currentAction = "Rest",
                nextAction = "Set ${nextSet + 1}",
                rest = timer,
                lastError = null,
            ),
            haptic = ActiveWorkoutHaptic.SET_COMPLETE,
        )
    }

    private fun skipRest(state: ActiveWorkoutSnapshot): ActiveWorkoutReduceResult {
        if (state.phase != ActiveWorkoutPhase.REST) return reject(state, "Skip rest only during REST.")
        return ActiveWorkoutReduceResult(
            state.copy(
                phase = ActiveWorkoutPhase.ACTIVE,
                currentAction = "Set ${state.setIndex + 1}",
                nextAction = "Complete set",
                rest = null,
                lastError = null,
            ),
        )
    }

    private fun pause(
        state: ActiveWorkoutSnapshot,
        clock: WorkoutWallClock,
    ): ActiveWorkoutReduceResult {
        if (state.phase != ActiveWorkoutPhase.ACTIVE &&
            state.phase != ActiveWorkoutPhase.REST &&
            state.phase != ActiveWorkoutPhase.WARMUP
        ) {
            return reject(state, "Pause only from ACTIVE, REST, or WARMUP.")
        }
        return ActiveWorkoutReduceResult(
            state.copy(
                phase = ActiveWorkoutPhase.PAUSED,
                pausedFrom = state.phase,
                rest = state.rest?.freeze(clock.nowMs()),
                currentAction = "Paused",
                nextAction = "Resume",
                lastError = null,
            ),
        )
    }

    private fun resume(
        state: ActiveWorkoutSnapshot,
        clock: WorkoutWallClock,
    ): ActiveWorkoutReduceResult {
        if (state.phase != ActiveWorkoutPhase.PAUSED) return reject(state, "Resume only from PAUSED.")
        val target = state.pausedFrom ?: ActiveWorkoutPhase.ACTIVE
        return ActiveWorkoutReduceResult(
            state.copy(
                phase = target,
                pausedFrom = null,
                rest = state.rest?.resume(clock.nowMs()),
                currentAction = when (target) {
                    ActiveWorkoutPhase.REST -> "Rest"
                    ActiveWorkoutPhase.WARMUP -> "Warmup"
                    else -> "Set ${state.setIndex + 1}"
                },
                nextAction = when (target) {
                    ActiveWorkoutPhase.REST -> "Set ${state.setIndex + 1}"
                    else -> "Complete set"
                },
                lastError = null,
            ),
        )
    }

    private fun complete(
        state: ActiveWorkoutSnapshot,
        clock: WorkoutWallClock,
    ): ActiveWorkoutReduceResult {
        if (state.phase == ActiveWorkoutPhase.IDLE) {
            return reject(state, "Nothing to complete.")
        }
        if (state.phase == ActiveWorkoutPhase.COMPLETE) {
            return ActiveWorkoutReduceResult(state)
        }
        return ActiveWorkoutReduceResult(
            state.copy(
                phase = ActiveWorkoutPhase.COMPLETE,
                rest = null,
                pausedFrom = null,
                completedAtWallMs = clock.nowMs(),
                currentAction = "Complete",
                nextAction = "Review",
                lastError = null,
            ),
        )
    }

    private fun tick(
        state: ActiveWorkoutSnapshot,
        clock: WorkoutWallClock,
    ): ActiveWorkoutReduceResult {
        if (state.phase != ActiveWorkoutPhase.REST) return ActiveWorkoutReduceResult(state)
        val rest = state.rest ?: return ActiveWorkoutReduceResult(state)
        if (!rest.isComplete(clock.nowMs())) return ActiveWorkoutReduceResult(state)
        return ActiveWorkoutReduceResult(
            state.copy(
                phase = ActiveWorkoutPhase.ACTIVE,
                rest = null,
                currentAction = "Set ${state.setIndex + 1}",
                nextAction = "Complete set",
                lastError = null,
            ),
            haptic = ActiveWorkoutHaptic.REST_COMPLETE,
        )
    }

    private fun recover(snapshot: ActiveWorkoutSnapshot): ActiveWorkoutReduceResult {
        if (snapshot.sessionId.isBlank() && snapshot.phase == ActiveWorkoutPhase.IDLE) {
            return ActiveWorkoutReduceResult(ActiveWorkoutSnapshot.idle(), rejected = "Nothing to recover.")
        }
        return ActiveWorkoutReduceResult(snapshot.copy(lastError = null))
    }

    private fun reject(state: ActiveWorkoutSnapshot, message: String): ActiveWorkoutReduceResult =
        ActiveWorkoutReduceResult(state.copy(lastError = message), rejected = message)
}
