package com.fitconnect.android.wear

import com.fitconnect.shared.wear.WearPaths
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** Contract tests for Wear Data Layer path constants (no fabricated readiness). */
class WearPathsContractTest {
    @Test
    fun telemetryAndControlPaths_areStable() {
        assertEquals("/telemetry/live", WearPaths.TELEMETRY_LIVE)
        assertEquals("/telemetry/batch", WearPaths.TELEMETRY_BATCH)
        assertEquals("/session/control", WearPaths.SESSION_CONTROL)
        assertEquals("fitconnect_telemetry", WearPaths.CAPABILITY)
        assertTrue(WearPaths.SCHEMA.startsWith("telemetry."))
    }
}
