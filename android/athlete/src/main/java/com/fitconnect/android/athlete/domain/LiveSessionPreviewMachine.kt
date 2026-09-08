package com.fitconnect.android.athlete.domain

/**
 * Live-session UX state machine.
 * Transitions only — joining a real LiveKit room is owned by [com.fitconnect.android.athlete.live.LiveSessionPort].
 * Never invents a connected phase without the port reporting success.
 */
enum class LiveSessionPhase {
    IDLE,
    CONNECTING,
    CONNECTED,
    MUTED,
    CAMERA_OFF,
    ENDING,
    ENDED,
    ERROR,
}

data class LiveSessionUiState(
    val phase: LiveSessionPhase = LiveSessionPhase.IDLE,
    val muted: Boolean = false,
    val cameraOff: Boolean = false,
    /** Last fail-closed / EXTERNAL message for the ERROR surface. */
    val errorMessage: String? = null,
)

object LiveSessionMachine {
    fun onJoin(current: LiveSessionUiState): LiveSessionUiState =
        when (current.phase) {
            LiveSessionPhase.IDLE, LiveSessionPhase.ENDED, LiveSessionPhase.ERROR ->
                LiveSessionUiState(phase = LiveSessionPhase.CONNECTING)
            else -> current
        }

    fun onConnected(current: LiveSessionUiState): LiveSessionUiState =
        if (current.phase == LiveSessionPhase.CONNECTING) {
            LiveSessionUiState(phase = LiveSessionPhase.CONNECTED)
        } else {
            current
        }

    fun onToggleMute(current: LiveSessionUiState): LiveSessionUiState {
        if (current.phase !in setOf(
                LiveSessionPhase.CONNECTED,
                LiveSessionPhase.MUTED,
                LiveSessionPhase.CAMERA_OFF,
            )
        ) {
            return current
        }
        val muted = !current.muted
        val phase = when {
            muted -> LiveSessionPhase.MUTED
            current.cameraOff -> LiveSessionPhase.CAMERA_OFF
            else -> LiveSessionPhase.CONNECTED
        }
        return current.copy(muted = muted, phase = phase)
    }

    fun onToggleCamera(current: LiveSessionUiState): LiveSessionUiState {
        if (current.phase !in setOf(
                LiveSessionPhase.CONNECTED,
                LiveSessionPhase.MUTED,
                LiveSessionPhase.CAMERA_OFF,
            )
        ) {
            return current
        }
        val cameraOff = !current.cameraOff
        val phase = when {
            cameraOff -> LiveSessionPhase.CAMERA_OFF
            current.muted -> LiveSessionPhase.MUTED
            else -> LiveSessionPhase.CONNECTED
        }
        return current.copy(cameraOff = cameraOff, phase = phase)
    }

    fun onEnd(current: LiveSessionUiState): LiveSessionUiState =
        if (current.phase in setOf(
                LiveSessionPhase.CONNECTED,
                LiveSessionPhase.MUTED,
                LiveSessionPhase.CAMERA_OFF,
            )
        ) {
            current.copy(phase = LiveSessionPhase.ENDING)
        } else {
            current
        }

    fun onEnded(current: LiveSessionUiState): LiveSessionUiState =
        if (current.phase == LiveSessionPhase.ENDING) {
            LiveSessionUiState(phase = LiveSessionPhase.ENDED)
        } else {
            current
        }

    fun onError(current: LiveSessionUiState, message: String? = null): LiveSessionUiState =
        if (current.phase in setOf(
                LiveSessionPhase.CONNECTED,
                LiveSessionPhase.MUTED,
                LiveSessionPhase.CAMERA_OFF,
                LiveSessionPhase.CONNECTING,
            )
        ) {
            current.copy(phase = LiveSessionPhase.ERROR, errorMessage = message)
        } else {
            current
        }

    fun onReset(current: LiveSessionUiState): LiveSessionUiState =
        if (current.phase in setOf(LiveSessionPhase.ERROR, LiveSessionPhase.ENDED)) {
            LiveSessionUiState()
        } else {
            current
        }
}

/** @deprecated Use [LiveSessionMachine] — kept for transitional call sites. */
@Deprecated("Use LiveSessionMachine", ReplaceWith("LiveSessionMachine"))
typealias LiveSessionPreviewMachine = LiveSessionMachine
