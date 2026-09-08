package com.fitconnect.android.geo.spots

import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SpotEngineTest {
    @Test
    fun secretSpotHidesExactCoordinatesFromPublic() = runBlocking {
        val engine = InMemorySpotEngine()
        val created = engine.submit(
            SpotDraft(
                name = "Hidden trail",
                sportKey = "trail_run",
                description = "Quiet loop",
                exact = SpotCoordinates(41.15, -8.61),
                visibility = SpotVisibility.APPROXIMATE,
                access = SpotAccess.UNKNOWN,
                difficulty = SpotDifficulty.INTERMEDIATE,
                risk = SpotRisk.MODERATE,
                secret = true,
                creatorId = "creator",
            ),
        )
        val publicView = engine.get(created.id, viewerId = "stranger")
        assertNull(publicView?.exact)
        assertTrue(publicView!!.approximate != SpotCoordinates(41.15, -8.61) || publicView.blurRadiusMeters >= 400)
    }

    @Test
    fun creatorCanSeeExactWhenAuthorized() = runBlocking {
        val engine = InMemorySpotEngine()
        val created = engine.submit(
            SpotDraft(
                name = "Gym park",
                sportKey = "strength",
                description = "Bars",
                exact = SpotCoordinates(38.72, -9.14),
                visibility = SpotVisibility.PRIVATE,
                access = SpotAccess.PUBLIC,
                difficulty = SpotDifficulty.EASY,
                risk = SpotRisk.LOW,
                secret = false,
                creatorId = "creator",
            ),
        )
        val mine = engine.get(created.id, viewerId = "creator")
        assertTrue(mine?.exact != null)
    }
}
