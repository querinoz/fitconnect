package com.fitconnect.android.telemetry.sync

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class BackgroundSyncPolicyTest {
    @Test
    fun skipsWhenOfflineOrBatteryLow() {
        val policy = BackgroundSyncPolicy()
        assertFalse(policy.shouldRun(null, 1_000L, batteryLow = false, online = false))
        assertFalse(policy.shouldRun(null, 1_000L, batteryLow = true, online = true))
        assertTrue(policy.shouldRun(null, 1_000L, batteryLow = false, online = true))
    }

    @Test
    fun respectsMinimumInterval() {
        val policy = BackgroundSyncPolicy(minIntervalMinutes = 60)
        assertFalse(policy.shouldRun(0L, 30 * 60_000L, batteryLow = false, online = true))
        assertTrue(policy.shouldRun(0L, 61 * 60_000L, batteryLow = false, online = true))
    }
}
