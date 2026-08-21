package com.fitconnect.android.athlete.navigation

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class AthleteNavContractTest {
    @Test
    fun fourDestinationsPlusTrainAction() {
        val tabs = AthleteDest.bottomTabs.map { it.name }
        assertEquals(listOf("HOME", "DISCOVER", "VAULT", "PROFILE"), tabs)
        assertFalse(AthleteDest.ACTIVITY.bottom)
        assertFalse(AthleteDest.COMMUNITY.bottom)
        assertTrue(AthleteDest.bottomTabs.size <= 4)
    }
}
