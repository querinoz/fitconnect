package com.fitconnect.android.coach.navigation

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CoachNavContractTest {
    @Test
    fun fourDestinationsPlusTrainAction() {
        val tabs = CoachDest.bottomTabs.map { it.name }
        assertEquals(listOf("FEED", "ASCEND", "DASHBOARD", "PROFILE"), tabs)
        assertFalse(CoachDest.SESSIONS.bottom)
        assertFalse(CoachDest.ATHLETES.bottom)
        assertFalse(CoachDest.OVERVIEW.bottom)
        assertFalse(CoachDest.INBOX.bottom)
        assertTrue(CoachDest.bottomTabs.size <= 4)
    }

    @Test
    fun legacyRoutesPreserved() {
        assertEquals("coach/overview", CoachDest.OVERVIEW.route)
        assertEquals("coach/inbox", CoachDest.INBOX.route)
        assertEquals("coach/analytics", CoachDest.ANALYTICS.route)
        assertEquals("coach/profile", CoachDest.PROFILE.route)
        assertEquals("coach/feed", CoachDest.FEED.route)
        assertEquals("coach/dashboard", CoachDest.DASHBOARD.route)
        assertEquals("coach/ascend", CoachDest.ASCEND.route)
    }
}
