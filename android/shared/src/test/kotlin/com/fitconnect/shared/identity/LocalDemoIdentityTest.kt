package com.fitconnect.shared.identity

import org.junit.Assert.assertEquals
import org.junit.Test

class LocalDemoIdentityTest {
    @Test
    fun phoneAndWearShareTheSameLocalAthleteId() {
        assertEquals("ath-1", LocalDemoIdentity.ATHLETE_ID)
    }
}
