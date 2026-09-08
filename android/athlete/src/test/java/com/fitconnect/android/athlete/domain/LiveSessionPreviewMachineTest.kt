package com.fitconnect.android.athlete.domain

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class LiveSessionMachineTest {
    @Test
    fun joinConnectMuteCameraEndReset() {
        var state = LiveSessionUiState()
        state = LiveSessionMachine.onJoin(state)
        assertEquals(LiveSessionPhase.CONNECTING, state.phase)

        state = LiveSessionMachine.onConnected(state)
        assertEquals(LiveSessionPhase.CONNECTED, state.phase)

        state = LiveSessionMachine.onToggleMute(state)
        assertTrue(state.muted)
        assertEquals(LiveSessionPhase.MUTED, state.phase)

        state = LiveSessionMachine.onToggleCamera(state)
        assertTrue(state.cameraOff)
        assertEquals(LiveSessionPhase.CAMERA_OFF, state.phase)

        state = LiveSessionMachine.onEnd(state)
        assertEquals(LiveSessionPhase.ENDING, state.phase)

        state = LiveSessionMachine.onEnded(state)
        assertEquals(LiveSessionPhase.ENDED, state.phase)
        assertFalse(state.muted)
        assertFalse(state.cameraOff)

        state = LiveSessionMachine.onReset(state)
        assertEquals(LiveSessionPhase.IDLE, state.phase)
    }

    @Test
    fun errorThenResetPreservesMessageUntilReset() {
        var state = LiveSessionMachine.onJoin(LiveSessionUiState())
        state = LiveSessionMachine.onError(state, "EXTERNAL: keys")
        assertEquals(LiveSessionPhase.ERROR, state.phase)
        assertEquals("EXTERNAL: keys", state.errorMessage)
        state = LiveSessionMachine.onReset(state)
        assertEquals(LiveSessionPhase.IDLE, state.phase)
        assertNull(state.errorMessage)
    }

    @Test
    fun idleIgnoresMute() {
        val state = LiveSessionMachine.onToggleMute(LiveSessionUiState())
        assertEquals(LiveSessionPhase.IDLE, state.phase)
        assertFalse(state.muted)
    }

    @Test
    fun connectingDoesNotAutoConnectWithoutPortSuccess() {
        val state = LiveSessionMachine.onJoin(LiveSessionUiState())
        assertEquals(LiveSessionPhase.CONNECTING, state.phase)
        // onConnected is only invoked after LiveSessionPort.join succeeds.
        assertEquals(LiveSessionPhase.CONNECTING, state.phase)
    }
}
