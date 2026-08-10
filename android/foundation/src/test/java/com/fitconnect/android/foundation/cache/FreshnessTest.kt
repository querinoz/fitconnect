package com.fitconnect.android.foundation.cache

import org.junit.Assert.assertEquals
import org.junit.Test

class FreshnessTest {
    @Test
    fun freshnessMarksStaleAndOffline() {
        val now = 1_000_000L
        val meta = CacheMeta(now, now + 1_000, source = "telemetry", syncStatus = FreshnessState.SYNCED)
        assertEquals(FreshnessState.SYNCED, meta.stateAt(now + 500, online = true))
        assertEquals(FreshnessState.STALE, meta.stateAt(now + 2_000, online = true))
        assertEquals(FreshnessState.OFFLINE, meta.stateAt(now + 500, online = false))
    }
}
