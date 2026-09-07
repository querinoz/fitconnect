package com.fitconnect.android.sports.zones

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class HeartRateZonesTest {
    @Test
    fun boundariesMatchEliteCoreLthr170() {
        val lthr = 170.0
        assertEquals(1, HeartRateZones.zoneFor(100.0, lthr))
        assertEquals(1, HeartRateZones.zoneFor(137.0, lthr))
        assertEquals(2, HeartRateZones.zoneFor(138.0, lthr))
        assertEquals(3, HeartRateZones.zoneFor(153.0, lthr))
        assertEquals(4, HeartRateZones.zoneFor(160.0, lthr))
        assertEquals(5, HeartRateZones.zoneFor(170.0, lthr))
    }

    @Test
    fun invalidLthrReturnsNull() {
        assertNull(HeartRateZones.zoneFor(150.0, 0.0))
        assertNull(HeartRateZones.zoneFor(150.0, -1.0))
    }

    @Test
    fun timeInZonesBucketsMinutes() {
        // 60 samples @ 100 bpm → Z1; 60 @ 170 → Z5 → ~1 min each
        val samples = List(60) { 100.0 } + List(60) { 170.0 }
        val minutes = HeartRateZones.timeInZonesMinutes(samples, 170.0, sampleIntervalSec = 1.0)!!
        assertEquals(5, minutes.size)
        assertEquals(1, minutes[0])
        assertEquals(0, minutes[1])
        assertEquals(0, minutes[2])
        assertEquals(0, minutes[3])
        assertEquals(1, minutes[4])
    }

    @Test
    fun emptySamplesInsufficient() {
        assertNull(HeartRateZones.timeInZonesMinutes(emptyList(), 170.0))
    }
}
