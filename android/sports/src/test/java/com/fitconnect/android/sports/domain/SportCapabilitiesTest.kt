package com.fitconnect.android.sports.domain

import com.fitconnect.android.sports.registry.DefaultSportsCatalog
import com.fitconnect.android.sports.registry.DefaultSportsRegistry
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SportCapabilitiesTest {
    private val registry = DefaultSportsRegistry().also { DefaultSportsCatalog.seed(it) }

    @Test
    fun runningHasGps_strengthDoesNot() {
        val running = registry.require(SportId.RUNNING)
        val strength = registry.require(SportId.STRENGTH)
        assertTrue(running.gpsSupported())
        assertFalse(strength.gpsSupported())
    }

    @Test
    fun categoriesHaveDisplayLabels() {
        assertTrue(SportCategory.ENDURANCE.displayLabel().isNotBlank())
        assertTrue(SportCategory.STRENGTH.displayLabel().isNotBlank())
    }
}
