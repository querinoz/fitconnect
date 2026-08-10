package com.fitconnect.android.athlete.domain

/**
 * LOCAL_DEMO live-session UX state machine (not LiveKit production).
 * Pure transitions — Compose observes and renders only.
 */
enum class LiveSessionPhase {
    IDLE,
    CONNECTING,
    CONNECTED_DEMO,
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
)

object LiveSessionPreviewMachine {
    fun onJoin(current: LiveSessionUiState): LiveSessionUiState =
        when (current.phase) {
            LiveSessionPhase.IDLE, LiveSessionPhase.ENDED, LiveSessionPhase.ERROR ->
                LiveSessionUiState(phase = LiveSessionPhase.CONNECTING)
            else -> current
        }

    fun onConnected(current: LiveSessionUiState): LiveSessionUiState =
        if (current.phase == LiveSessionPhase.CONNECTING) {
            LiveSessionUiState(phase = LiveSessionPhase.CONNECTED_DEMO)
        } else {
            current
        }

    fun onToggleMute(current: LiveSessionUiState): LiveSessionUiState {
        if (current.phase !in setOf(
                LiveSessionPhase.CONNECTED_DEMO,
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
            else -> LiveSessionPhase.CONNECTED_DEMO
        }
        return current.copy(muted = muted, phase = phase)
    }

    fun onToggleCamera(current: LiveSessionUiState): LiveSessionUiState {
        if (current.phase !in setOf(
                LiveSessionPhase.CONNECTED_DEMO,
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
            else -> LiveSessionPhase.CONNECTED_DEMO
        }
        return current.copy(cameraOff = cameraOff, phase = phase)
    }

    fun onEnd(current: LiveSessionUiState): LiveSessionUiState =
        if (current.phase in setOf(
                LiveSessionPhase.CONNECTED_DEMO,
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

    fun onError(current: LiveSessionUiState): LiveSessionUiState =
        if (current.phase in setOf(
                LiveSessionPhase.CONNECTED_DEMO,
                LiveSessionPhase.MUTED,
                LiveSessionPhase.CAMERA_OFF,
                LiveSessionPhase.CONNECTING,
            )
        ) {
            current.copy(phase = LiveSessionPhase.ERROR)
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
