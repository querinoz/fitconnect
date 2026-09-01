package com.fitconnect.android.athlete.ui.home

import com.fitconnect.android.fitness.domain.Sport
import com.fitconnect.android.fitness.domain.WorkoutSession
import com.fitconnect.shared.fitness.ProviderId
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class TodayWave7Test {

    @Test
    fun formatStepsUsesThousandsSeparatorBelowTenK() {
        assertEquals("8,420", formatSteps(8_420))
        assertEquals("999", formatSteps(999))
    }

    @Test
    fun formatStepsUsesCompactKAboveTenK() {
        assertEquals("10.5k", formatSteps(10_500))
        assertEquals("12.0k", formatSteps(12_000))
    }

    @Test
    fun sessionResolverReturnsWorkoutsWhenPresent() {
        val workouts = listOf(
            workout(id = "w1", sport = Sport.RUN, startedAt = 2_000L),
            workout(id = "w2", sport = Sport.RIDE, startedAt = 3_000L),
        )

        val cards = TodaySessionResolver.resolve(workouts, includeDemoFallback = true)

        assertEquals(2, cards.size)
        assertEquals("w2", cards.first().id)
        assertFalse(cards.first().isDemo)
    }

    @Test
    fun sessionResolverFallsBackToDemoWhenEmpty() {
        val cards = TodaySessionResolver.resolve(emptyList(), includeDemoFallback = true)

        assertTrue(cards.isNotEmpty())
        assertTrue(cards.all { it.isDemo })
    }

    @Test
    fun sessionResolverStaysEmptyWithoutDemoFallback() {
        val cards = TodaySessionResolver.resolve(emptyList(), includeDemoFallback = false)

        assertTrue(cards.isEmpty())
    }

    private fun workout(
        id: String,
        sport: Sport,
        startedAt: Long,
    ) = WorkoutSession(
        id = id,
        userId = "athlete",
        providerId = ProviderId.HEALTH_CONNECT,
        externalId = "ext-$id",
        sport = sport,
        startedAtEpochMs = startedAt,
        endedAtEpochMs = startedAt + 3_600_000,
        distanceM = 7_200.0,
    )
}
