package com.fitconnect.ascend.badges

import com.fitconnect.shared.fitness.ProviderId
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class BadgeProgressEngineTest {
    @Test
    fun stravaOnlyHasPrivateProgressAndEmptyShareableCopy() {
        val workouts = listOf(
            WorkoutContribution(10_000.0, ProviderId.STRAVA),
            WorkoutContribution(5_000.0, ProviderId.STRAVA),
        )
        val progress = BadgeProgressEngine.evaluate(workouts)
        assertEquals(15_000.0, progress.privateDistanceM, 0.01)
        assertEquals(0.0, progress.shareableDistanceM, 0.01)
        assertTrue(progress.stravaOnly)
        assertTrue(progress.emptyCopy.contains("restricted"))
    }

    @Test
    fun shareableIgnoresStravaEvenWhenMixed() {
        val workouts = listOf(
            WorkoutContribution(10_000.0, ProviderId.STRAVA),
            WorkoutContribution(3_000.0, ProviderId.HEALTH_CONNECT),
        )
        val progress = BadgeProgressEngine.evaluate(workouts)
        assertEquals(13_000.0, progress.privateDistanceM, 0.01)
        assertEquals(3_000.0, progress.shareableDistanceM, 0.01)
    }
}
