package com.fitconnect.android.capture

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class LiveActivityEngineTest {
    @Test
    fun startPauseResumeEndDiscard() {
        var now = 1_000_000L
        val engine = LiveActivityEngine(clockMs = { now })
        engine.start("Run")
        assertEquals(LiveActivityPhase.RUNNING, engine.state.value.phase)
        assertEquals(
            com.fitconnect.shared.session.ActivitySessionState.ACTIVE,
            engine.state.value.sessionState,
        )

        now += 10_000L
        engine.tick()
        val running = engine.state.value
        assertTrue(running.distanceM > 0.0)
        assertEquals(LiveActivitySnapshot.SOURCE_LABEL, running.sourceLabel)
        assertEquals(GpsFeedStatus.SIMULATED, running.gps)

        engine.pause()
        assertEquals(LiveActivityPhase.PAUSED, engine.state.value.phase)
        val pausedDistance = engine.state.value.distanceM
        now += 5_000L
        engine.tick()
        assertEquals(pausedDistance, engine.state.value.distanceM, 0.0001)

        engine.resume()
        assertEquals(LiveActivityPhase.RUNNING, engine.state.value.phase)
        now += 2_000L
        engine.tick()
        assertTrue(engine.state.value.distanceM > pausedDistance)

        engine.end()
        assertEquals(LiveActivityPhase.ENDED, engine.state.value.phase)

        engine.discard()
        assertEquals(LiveActivityPhase.IDLE, engine.state.value.phase)
        assertEquals(0.0, engine.state.value.distanceM, 0.0)
        assertNull(engine.state.value.hrBpm)
    }

    @Test
    fun zoneAndFormatters() {
        assertEquals(1, LiveActivityEngine.zoneFor(110))
        assertEquals(3, LiveActivityEngine.zoneFor(150))
        assertEquals(5, LiveActivityEngine.zoneFor(180))
        assertEquals("00:09", LiveActivityEngine.formatElapsed(9_000))
        assertEquals("1:01:01", LiveActivityEngine.formatElapsed(3_661_000))
        assertEquals("5:30 /km", LiveActivityEngine.formatPace(330.0))
        assertEquals("—", LiveActivityEngine.formatPace(null))
    }

    @Test
    fun envelopeOmitsHrWhenHealthServicesUnavailable() {
        var now = 1_000_000L
        val engine = LiveActivityEngine(clockMs = { now })
        engine.start("Run")
        now += 10_000L
        engine.tick()
        val envelope = engine.state.value.toTelemetryEnvelope(
            sessionId = "s1",
            deviceId = "w1",
            userId = "u1",
            sequenceNumber = 1L,
            timestampEpochMs = now,
            heartRateCapability = com.fitconnect.shared.telemetry.MetricAvailability.UNAVAILABLE,
            source = com.fitconnect.shared.source.DataSourceKind.LOCAL_DEMO,
        )
        val hr = envelope.samples.first { it.metric == "HEART_RATE" }
        assertEquals(null, hr.value)
        assertEquals(
            com.fitconnect.shared.telemetry.MetricAvailability.UNAVAILABLE,
            hr.availability,
        )
        val cadence = envelope.samples.first { it.metric == "CADENCE" }
        assertEquals(null, cadence.value)
        assertEquals(
            com.fitconnect.shared.source.DataSourceKind.LOCAL_DEMO,
            envelope.source,
        )
    }

    @Test
    fun simulatedOutdoorRouteRecordsPoints() {
        var now = 1_000_000L
        val engine = LiveActivityEngine(clockMs = { now })
        engine.start("Run")
        now += 10_000L
        engine.tick()
        assertTrue(engine.state.value.route.isNotEmpty())
        assertEquals(GpsFeedStatus.SIMULATED, engine.state.value.gps)
        assertEquals(LiveActivitySnapshot.SOURCE_LABEL, engine.state.value.sourceLabel)
    }

    @Test
    fun indoorRunDoesNotClaimGps() {
        var now = 1_000_000L
        val engine = LiveActivityEngine(clockMs = { now })
        engine.start("IndoorRun")
        now += 10_000L
        engine.tick()
        assertEquals(GpsFeedStatus.UNAVAILABLE, engine.state.value.gps)
        assertTrue(engine.state.value.route.isEmpty())
        assertTrue(engine.state.value.distanceM > 0.0)
    }

    @Test
    fun emulatorInjectedPointsMeasureNearTwoKm() {
        var now = 1_000_000L
        val engine = LiveActivityEngine(clockMs = { now })
        engine.start("Run")
        com.fitconnect.shared.geo.QaGpsRoute.POINTS.forEachIndexed { index, point ->
            now += 60_000L
            engine.ingestFix(
                point.copy(
                    timestampEpochMs = now,
                    heartRateBpm = com.fitconnect.shared.geo.QaGpsRoute.HR_FIXTURE_BPM[index],
                    source = com.fitconnect.shared.source.DataSourceKind.TEST_FIXTURE,
                ),
                GpsFeedStatus.EMULATOR_INJECTED,
            )
        }
        val snap = engine.state.value
        assertEquals(GpsFeedStatus.EMULATOR_INJECTED, snap.gps)
        assertTrue(snap.distanceM in 1_800.0..2_200.0)
        assertEquals(5, snap.route.size)
        engine.end()
        engine.setReplayFraction(0.5f)
        assertTrue(engine.state.value.replayCursor != null)
        assertFalse(engine.adoptRemote(snap.sessionId))
    }

    @Test
    fun countdownThenRunning() {
        var now = 1_000_000L
        val engine = LiveActivityEngine(clockMs = { now })
        engine.arm("Walk")
        assertEquals(LiveActivityPhase.READY, engine.state.value.phase)
        engine.beginCountdown()
        assertEquals(LiveActivityPhase.COUNTDOWN, engine.state.value.phase)
        engine.tickCountdown()
        engine.tickCountdown()
        engine.tickCountdown()
        assertEquals(LiveActivityPhase.RUNNING, engine.state.value.phase)
        assertEquals("Walk", engine.state.value.sport)
    }
}
