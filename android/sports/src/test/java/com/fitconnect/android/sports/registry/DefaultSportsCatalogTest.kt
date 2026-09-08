package com.fitconnect.android.sports.registry

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class DefaultSportsCatalogTest {
    @Test
    fun seed_registersAtLeastFiftyStravaAlignedSports() {
        val registry = DefaultSportsRegistry()
        DefaultSportsCatalog.seed(registry)
        val all = registry.all()
        assertTrue("expected ≥50 sports, got ${all.size}", all.size >= 50)
        val strava = all.mapNotNull { it.stravaType }.toSet()
        // Core + coverage must include major Strava activity types
        listOf("Run", "Ride", "Swim", "TrailRun", "Yoga", "Workout", "AlpineSki", "Pickleball").forEach {
            assertTrue("missing stravaType $it", strava.contains(it))
        }
    }

    @Test
    fun definitions_haveUniqueIds() {
        val ids = DefaultSportsCatalog.definitions().map { it.id.value }
        assertEquals(ids.size, ids.toSet().size)
    }
}
