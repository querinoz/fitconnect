package com.fitconnect.android.athlete.domain

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class LiveSessionPreviewMachineTest {
    @Test
    fun joinConnectMuteCameraEndReset() {
        var state = LiveSessionUiState()
        state = LiveSessionPreviewMachine.onJoin(state)
        assertEquals(LiveSessionPhase.CONNECTING, state.phase)

        state = LiveSessionPreviewMachine.onConnected(state)
        assertEquals(LiveSessionPhase.CONNECTED_DEMO, state.phase)

        state = LiveSessionPreviewMachine.onToggleMute(state)
        assertTrue(state.muted)
        assertEquals(LiveSessionPhase.MUTED, state.phase)

        state = LiveSessionPreviewMachine.onToggleCamera(state)
        assertTrue(state.cameraOff)
        assertEquals(LiveSessionPhase.CAMERA_OFF, state.phase)

        state = LiveSessionPreviewMachine.onEnd(state)
        assertEquals(LiveSessionPhase.ENDING, state.phase)

        state = LiveSessionPreviewMachine.onEnded(state)
        assertEquals(LiveSessionPhase.ENDED, state.phase)
        assertFalse(state.muted)
        assertFalse(state.cameraOff)

        state = LiveSessionPreviewMachine.onReset(state)
        assertEquals(LiveSessionPhase.IDLE, state.phase)
    }

    @Test
    fun errorThenReset() {
        var state = LiveSessionPreviewMachine.onJoin(LiveSessionUiState())
        state = LiveSessionPreviewMachine.onConnected(state)
        state = LiveSessionPreviewMachine.onError(state)
        assertEquals(LiveSessionPhase.ERROR, state.phase)
        state = LiveSessionPreviewMachine.onReset(state)
        assertEquals(LiveSessionPhase.IDLE, state.phase)
    }

    @Test
    fun idleIgnoresMute() {
        val state = LiveSessionPreviewMachine.onToggleMute(LiveSessionUiState())
        assertEquals(LiveSessionPhase.IDLE, state.phase)
        assertFalse(state.muted)
    }
}
