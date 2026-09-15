package com.fitconnect.android.sports.combat

import org.junit.Assert.assertEquals
import org.junit.Test

class CombatHonestyTest {
    @Test
    fun watchImuForceBecomesEstimate() {
        val (metric, type) = CombatHonesty.rewriteForce("impact_force", "DIRECT", "WATCH_IMU")
        assertEquals("impact_estimate", metric)
        assertEquals("ESTIMATED", type)
    }

    @Test
    fun instrumentedBagKeepsDirectForce() {
        val (metric, type) = CombatHonesty.rewriteForce("impact_force", "DIRECT", "INSTRUMENTED_BAG")
        assertEquals("impact_force", metric)
        assertEquals("DIRECT", type)
    }
}
