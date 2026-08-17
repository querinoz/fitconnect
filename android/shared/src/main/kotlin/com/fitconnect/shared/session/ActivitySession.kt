package com.fitconnect.shared.session

enum class ActivitySessionState {
    IDLE,
    READY,
    COUNTDOWN,
    PREPARING,
    ACTIVE,
    PAUSED,
    RESUMING,
    FINISHING,
    ENDING,
    COMPLETED,
    FAILED,
}

enum class ActivitySessionEvent {
    PREPARE,
    COUNTDOWN,
    START,
    PAUSE,
    RESUME,
    END,
    FAIL,
    RESET,
}

data class ActivitySession(
    val sessionId: String,
    val state: ActivitySessionState = ActivitySessionState.IDLE,
    val sportKey: String = "Run",
    val startedAtEpochMs: Long? = null,
    val deviceId: String? = null,
)

class IllegalSessionTransition(
    val from: ActivitySessionState,
    val event: ActivitySessionEvent,
) : IllegalStateException("Cannot apply $event from $from")

/**
 * Canonical activity session. Watch acquires; phone visualizes.
 * Illegal transitions throw — callers must not invent states.
 */
object ActivitySessionMachine {
    fun apply(current: ActivitySession, event: ActivitySessionEvent, nowEpochMs: Long): ActivitySession {
        val next = transition(current.state, event)
            ?: throw IllegalSessionTransition(current.state, event)
        return when (event) {
            ActivitySessionEvent.PREPARE,
            ActivitySessionEvent.COUNTDOWN,
            -> current.copy(state = next)
            ActivitySessionEvent.START -> current.copy(
                state = next,
                startedAtEpochMs = current.startedAtEpochMs ?: nowEpochMs,
            )
            ActivitySessionEvent.RESET -> ActivitySession(
                sessionId = current.sessionId,
                sportKey = current.sportKey,
                deviceId = current.deviceId,
            )
            else -> current.copy(state = next)
        }
    }

    fun transition(from: ActivitySessionState, event: ActivitySessionEvent): ActivitySessionState? =
        when (from to event) {
            ActivitySessionState.IDLE to ActivitySessionEvent.PREPARE -> ActivitySessionState.READY
            ActivitySessionState.IDLE to ActivitySessionEvent.START -> ActivitySessionState.ACTIVE
            ActivitySessionState.READY to ActivitySessionEvent.COUNTDOWN -> ActivitySessionState.COUNTDOWN
            ActivitySessionState.READY to ActivitySessionEvent.START -> ActivitySessionState.ACTIVE
            ActivitySessionState.READY to ActivitySessionEvent.RESET -> ActivitySessionState.IDLE
            ActivitySessionState.COUNTDOWN to ActivitySessionEvent.START -> ActivitySessionState.ACTIVE
            ActivitySessionState.COUNTDOWN to ActivitySessionEvent.FAIL -> ActivitySessionState.FAILED
            ActivitySessionState.COUNTDOWN to ActivitySessionEvent.RESET -> ActivitySessionState.IDLE
            ActivitySessionState.PREPARING to ActivitySessionEvent.START -> ActivitySessionState.ACTIVE
            ActivitySessionState.PREPARING to ActivitySessionEvent.FAIL -> ActivitySessionState.FAILED
            ActivitySessionState.PREPARING to ActivitySessionEvent.RESET -> ActivitySessionState.IDLE
            ActivitySessionState.ACTIVE to ActivitySessionEvent.PAUSE -> ActivitySessionState.PAUSED
            ActivitySessionState.ACTIVE to ActivitySessionEvent.END -> ActivitySessionState.FINISHING
            ActivitySessionState.ACTIVE to ActivitySessionEvent.FAIL -> ActivitySessionState.FAILED
            ActivitySessionState.PAUSED to ActivitySessionEvent.RESUME -> ActivitySessionState.RESUMING
            ActivitySessionState.PAUSED to ActivitySessionEvent.END -> ActivitySessionState.FINISHING
            ActivitySessionState.PAUSED to ActivitySessionEvent.FAIL -> ActivitySessionState.FAILED
            ActivitySessionState.RESUMING to ActivitySessionEvent.START -> ActivitySessionState.ACTIVE
            ActivitySessionState.RESUMING to ActivitySessionEvent.FAIL -> ActivitySessionState.FAILED
            ActivitySessionState.FINISHING to ActivitySessionEvent.END -> ActivitySessionState.COMPLETED
            ActivitySessionState.FINISHING to ActivitySessionEvent.FAIL -> ActivitySessionState.FAILED
            ActivitySessionState.ENDING to ActivitySessionEvent.END -> ActivitySessionState.COMPLETED
            ActivitySessionState.ENDING to ActivitySessionEvent.FAIL -> ActivitySessionState.FAILED
            ActivitySessionState.COMPLETED to ActivitySessionEvent.RESET -> ActivitySessionState.IDLE
            ActivitySessionState.FAILED to ActivitySessionEvent.RESET -> ActivitySessionState.IDLE
            else -> if (event == ActivitySessionEvent.RESET) ActivitySessionState.IDLE else null
        }
}
