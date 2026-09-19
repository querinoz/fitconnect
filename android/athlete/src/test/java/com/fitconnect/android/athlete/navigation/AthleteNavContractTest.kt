package com.fitconnect.android.athlete.navigation

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** Social-first IA: Feed · Ascend · Dashboard · Profile (+ Train FAB). */
class AthleteNavContractTest {
    @Test
    fun fourDestinationsPlusTrainAction() {
        val tabs = AthleteDest.bottomTabs.map { it.name }
        assertEquals(listOf("FEED", "ASCEND", "DASHBOARD", "PROFILE"), tabs)
        assertFalse(AthleteDest.ACTIVITY.bottom)
        assertFalse(AthleteDest.WORKOUT.bottom)
        assertFalse(AthleteDest.DISCOVER.bottom)
        assertFalse(AthleteDest.COMMUNITY.bottom)
        assertFalse(AthleteDest.NUTRITION.bottom)
        assertFalse(AthleteDest.ROUTES.bottom)
        assertFalse(AthleteDest.SPORT_SELECTOR.bottom)
        assertFalse(AthleteDest.TRAIN_PLAN.bottom)
        assertTrue(AthleteDest.FEED.bottom)
        assertEquals("athlete/feed", AthleteDest.FEED.route)
        assertTrue(AthleteDest.bottomTabs.size == 4)
    }

    @Test
    fun feedIsStartDestinationContract() {
        assertEquals("athlete/feed", AthleteDest.FEED.route)
        assertTrue(AthleteDest.bottomTabs.first() == AthleteDest.FEED)
    }

    @Test
    fun iaV12SecondaryRoutesExist() {
        assertEquals("athlete/sport-selector", AthleteDest.SPORT_SELECTOR.route)
        assertEquals("athlete/train-plan", AthleteDest.TRAIN_PLAN.route)
        assertEquals("athlete/routes", AthleteDest.ROUTES.route)
        assertEquals("athlete/nutrition", AthleteDest.NUTRITION.route)
    }
}
