package com.fitconnect.shared.session

import com.fitconnect.shared.source.DataSourceKind
import com.fitconnect.shared.sync.OutboxQueue
import com.fitconnect.shared.sync.OutboxRecord
import com.fitconnect.shared.sync.SequenceDeduper
import com.fitconnect.shared.telemetry.HeartRate
import com.fitconnect.shared.telemetry.MetricAvailability
import com.fitconnect.shared.telemetry.TelemetryEnvelope
import com.fitconnect.shared.telemetry.TelemetryEnvelopeSample
import com.fitconnect.shared.wear.WearPaths
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SharedDomainTest {
    @Test
    fun sessionStartPauseResumeEnd() {
        var session = ActivitySession(sessionId = "s1")
        session = ActivitySessionMachine.apply(session, ActivitySessionEvent.START, 10L)
        assertEquals(ActivitySessionState.ACTIVE, session.state)
        assertEquals(10L, session.startedAtEpochMs)
        session = ActivitySessionMachine.apply(session, ActivitySessionEvent.PAUSE, 20L)
        assertEquals(ActivitySessionState.PAUSED, session.state)
        session = ActivitySessionMachine.apply(session, ActivitySessionEvent.RESUME, 30L)
        assertEquals(ActivitySessionState.RESUMING, session.state)
        session = ActivitySessionMachine.apply(session, ActivitySessionEvent.START, 31L)
        assertEquals(ActivitySessionState.ACTIVE, session.state)
        session = ActivitySessionMachine.apply(session, ActivitySessionEvent.END, 40L)
        session = ActivitySessionMachine.apply(session, ActivitySessionEvent.END, 41L)
        assertEquals(ActivitySessionState.COMPLETED, session.state)
    }

    @Test(expected = IllegalSessionTransition::class)
    fun illegalPauseFromIdle() {
        ActivitySessionMachine.apply(ActivitySession("s"), ActivitySessionEvent.PAUSE, 1L)
    }

    @Test
    fun heartRateUnavailableIsNullNotZero() {
        val missing = HeartRate.unavailable(
            timestampEpochMs = 1L,
            source = DataSourceKind.EMULATED_SENSOR,
        )
        assertNull(missing.bpm)
        assertEquals(MetricAvailability.UNAVAILABLE, missing.availability)
    }

    @Test
    fun envelopeRoundTripAndDedupe() {
        val envelope = TelemetryEnvelope(
            sessionId = "s1",
            deviceId = "w1",
            userId = "u1",
            timestampEpochMs = 99L,
            sequenceNumber = 3L,
            source = DataSourceKind.LOCAL_DEMO,
            samples = listOf(
                TelemetryEnvelopeSample("HEART_RATE", 148.0, "bpm", MetricAvailability.AVAILABLE, 99L),
                TelemetryEnvelopeSample("CADENCE", null, "rpm", MetricAvailability.UNAVAILABLE, 99L),
            ),
        )
        val parsed = TelemetryEnvelope.parse(envelope.toWire())
        assertEquals(envelope, parsed)
        assertEquals(WearPaths.SCHEMA, parsed.schemaVersion)

        val queue = OutboxQueue()
        assertTrue(queue.enqueue(OutboxRecord(3L, 99L, envelope.toWire())))
        assertFalse(queue.enqueue(OutboxRecord(3L, 99L, envelope.toWire())))
        queue.ack(3L)
        assertEquals(0, queue.size())

        val deduper = SequenceDeduper()
        assertTrue(deduper.accept(1L))
        assertFalse(deduper.accept(1L))
    }

    @Test
    fun sessionControlRoundTrip() {
        val cmd = com.fitconnect.shared.wear.SessionControlCommand(
            op = com.fitconnect.shared.wear.SessionControlCommand.START,
            sportKey = "Ride",
        )
        val parsed = com.fitconnect.shared.wear.SessionControlCommand.parse(cmd.toWire())
        assertEquals(cmd, parsed)
    }
}
