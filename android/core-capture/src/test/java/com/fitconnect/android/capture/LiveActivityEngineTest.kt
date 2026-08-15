package com.fitconnect.android.capture

import org.junit.Assert.assertEquals
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
}
