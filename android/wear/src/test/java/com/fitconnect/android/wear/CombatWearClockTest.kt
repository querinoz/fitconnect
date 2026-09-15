package com.fitconnect.android.wear

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

class CombatWearClockTest {
    @Test
    fun formatsAndRefusesWatchForce() {
        assertEquals("03:00", CombatWearClock.formatClock(180))
        assertEquals("ROUND 3", CombatWearClock.headline("work", 3))
        assertEquals("REST", CombatWearClock.headline("rest", 3))
        assertFalse(CombatWearClock.watchImuForceAllowed())
        assertEquals(
            "boxing · offline · last glance · IMU is not punch force",
            CombatWearClock.footnote(false, "boxing"),
        )
    }
}
