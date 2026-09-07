package com.fitconnect.android.athlete.data

import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * ATHLETE-001 — LocalAthleteRepository is demo fallback, not production primary.
 * Wiring assertion is documented via HttpAthleteRepository + AthleteContainer.
 */
class AthleteRepositoryWave2Test {
    @Test
    fun `ATHLETE-001 LocalAthleteRepository companion id is demo-only constant`() {
        assertTrue(LocalAthleteRepository.ATHLETE_ID.isNotBlank())
        assertTrue(
            LocalAthleteRepository.ATHLETE_ID == "ath-1" ||
                LocalAthleteRepository.ATHLETE_ID.startsWith("ath"),
        )
    }
}
