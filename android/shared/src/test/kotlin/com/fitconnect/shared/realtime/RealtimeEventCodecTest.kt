package com.fitconnect.shared.realtime

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

/** REALTIME-001…003 — canonical codec contract. */
class RealtimeEventCodecTest {
    @Test
    fun `REALTIME-001 session started round-trips`() {
        val original = FitConnectRealtimeEvent.SessionStarted(
            atEpochMs = 1_700_000_000_000L,
            userId = "uid-1",
            sessionId = "sess-9",
            sportKey = "run",
        )
        val decoded = RealtimeEventCodec.decode(RealtimeEventCodec.encode(original))
        assertEquals(original, decoded)
    }

    @Test
    fun `REALTIME-002 unknown type returns null`() {
        assertNull(RealtimeEventCodec.decode("""{"type":"stories.created","atEpochMs":1,"userId":"x"}"""))
    }

    @Test
    fun `REALTIME-003 watch connected preserves deviceId`() {
        val original = FitConnectRealtimeEvent.WatchConnected(
            atEpochMs = 42L,
            userId = "uid-2",
            deviceId = "PixelWatch",
            source = com.fitconnect.shared.source.DataSourceKind.HEALTH_CONNECT,
        )
        val decoded = RealtimeEventCodec.decode(RealtimeEventCodec.encode(original))
        assertNotNull(decoded)
        assertEquals(original, decoded)
    }
}
