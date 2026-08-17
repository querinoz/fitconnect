package com.fitconnect.android.designui.components

import org.junit.Assert.assertEquals
import org.junit.Test

class EliteInstrumentLogicTest {
    @Test
    fun primeStatusMatchesStitchBands() {
        assertEquals("PRIMED", elitePrimeStatus(88))
        assertEquals("READY", elitePrimeStatus(70))
        assertEquals("MODERATE", elitePrimeStatus(55))
        assertEquals("RECOVER", elitePrimeStatus(40))
    }

    @Test
    fun peakTitleAndStrainAreDeterministic() {
        assertEquals("Peak Readiness", elitePeakTitle(88))
        assertEquals("Train Smart", elitePeakTitle(60))
        assertEquals("Recovery Focus", elitePeakTitle(40))
        assertEquals(10.76, eliteDayStrain(77), 0.01)
    }
}
