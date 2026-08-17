package com.fitconnect.android.wear

import com.fitconnect.shared.wear.WearPaths
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class FitConnectWearListenerServiceTest {
    @Test
    fun ingestOnlyTelemetryPaths() {
        assertTrue(shouldIngestWearPath(WearPaths.TELEMETRY_LIVE))
        assertTrue(shouldIngestWearPath(WearPaths.TELEMETRY_BATCH))
        assertFalse(shouldIngestWearPath(WearPaths.SESSION_CONTROL))
        assertFalse(shouldIngestWearPath("/unknown"))
    }
}
