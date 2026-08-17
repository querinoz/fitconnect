package com.fitconnect.android.capture

import com.fitconnect.shared.source.DataSourceKind
import com.fitconnect.shared.telemetry.MetricAvailability
import com.fitconnect.shared.telemetry.TelemetryEnvelope
import com.fitconnect.shared.telemetry.TelemetryEnvelopeSample
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class LiveSessionCoordinatorTest {
    @Test
    fun watchStartAdoptsSameSessionId() {
        val engine = LiveActivityEngine(clockMs = { 1_000L })
        val coordinator = LiveSessionCoordinator(engine)
        val envelope = TelemetryEnvelope(
            sessionId = "watch-1",
            deviceId = "w1",
            userId = "u1",
            timestampEpochMs = 10L,
            sequenceNumber = 1L,
            source = DataSourceKind.TEST_FIXTURE,
            samples = listOf(
                TelemetryEnvelopeSample("LATITUDE", 38.7223, "deg", MetricAvailability.AVAILABLE, 10L),
                TelemetryEnvelopeSample("LONGITUDE", -9.1393, "deg", MetricAvailability.AVAILABLE, 10L),
            ),
        )
        coordinator.onRemoteEnvelope(envelope)
        assertEquals("watch-1", engine.state.value.sessionId)
        assertEquals(LiveActivityPhase.RUNNING, engine.state.value.phase)
        assertEquals(1, engine.state.value.route.size)
    }

    @Test
    fun completedSessionIsNotDuplicated() {
        val engine = LiveActivityEngine(clockMs = { 1_000L })
        engine.start("Run")
        val id = engine.state.value.sessionId
        engine.end()
        assertFalse(engine.adoptRemote(id))
        val coordinator = LiveSessionCoordinator(engine)
        coordinator.onRemoteEnvelope(
            TelemetryEnvelope(
                sessionId = id,
                deviceId = "w1",
                userId = "u1",
                timestampEpochMs = 20L,
                sequenceNumber = 2L,
                source = DataSourceKind.TEST_FIXTURE,
                samples = emptyList(),
            ),
        )
        assertEquals(LiveActivityPhase.ENDED, engine.state.value.phase)
        assertTrue(engine.isDuplicateSession(id))
    }
}
