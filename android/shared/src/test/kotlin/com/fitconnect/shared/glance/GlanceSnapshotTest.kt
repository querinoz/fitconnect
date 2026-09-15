package com.fitconnect.shared.glance

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class GlanceSnapshotTest {
    @Test
    fun neverAllowsPermanentProcess() {
        assertFalse(BackgroundWorkloadCatalog.allowsPermanentProcess())
        assertTrue(BackgroundWorkloadCatalog.rows.any { it.feature.contains("TRAIN") })
    }

    @Test
    fun clockAndRoundTripJson() {
        val snap = GlanceSnapshot(phase = "REST", remainingSec = 84, title = "Boxing bag")
        assertEquals("1:24", snap.clock)
        assertTrue(snap.isLive)
        val restored = GlanceSnapshot.fromJson(snap.toJson())
        assertEquals("Boxing bag", restored.title)
        assertEquals(84, restored.remainingSec)
    }

    @Test
    fun recoveryHiddenOnWidgetByDefault() {
        val redacted = GlanceSnapshot(recoveryHRV = "42").redact(
            showRecovery = false,
            showHeartRate = false,
            showLockDetails = true,
            surface = "widget",
        )
        assertEquals("HIDDEN", redacted.recoveryHRV)
        assertEquals("DATA UNAVAILABLE", GlanceSnapshot.IDLE.heartRateLabel)
    }

    @Test
    fun missingJsonIsIdle() {
        assertEquals(GlanceSnapshot.IDLE, GlanceSnapshot.fromJson(null))
        assertEquals(GlanceSnapshot.IDLE, GlanceSnapshot.fromJson("{"))
    }
}
