package com.fitconnect.android.sports.zones

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Golden parity: Rust UniFFI `heart_rate_zone` ↔ Kotlin [EliteCoreBridge] ↔ [HeartRateZones].
 * Vectors copied from `elite-core/uniffi` + `elite-core/core` zone tests (LTHR 170).
 */
class EliteCoreZonesGoldenTest {

    private val lthr = 170.0

    @Test
    fun uniffiVectors_bridgeMatchesHeartRateZones() {
        val cases = listOf(
            100.0 to 1,
            137.0 to 1, // just below Z2 floor (138)
            138.0 to 2,
            152.0 to 2,
            153.0 to 3,
            159.0 to 3,
            160.0 to 4,
            169.0 to 4,
            170.0 to 5,
            190.0 to 5,
        )
        for ((bpm, expected) in cases) {
            assertEquals(
                "bridge bpm=$bpm",
                expected,
                EliteCoreBridge.heartRateZone(bpm, lthr),
            )
            assertEquals(
                "HeartRateZones bpm=$bpm",
                expected,
                HeartRateZones.zoneFor(bpm, lthr),
            )
            assertEquals(
                "reference bpm=$bpm",
                expected,
                EliteCoreBridge.referenceHeartRateZone(bpm, lthr),
            )
        }
    }

    @Test
    fun invalidLthr_returnsNullOrZero() {
        assertEquals(0, EliteCoreBridge.heartRateZone(150.0, 0.0))
        assertEquals(0, EliteCoreBridge.heartRateZone(150.0, -1.0))
        assertNull(HeartRateZones.zoneFor(150.0, 0.0))
        assertNull(HeartRateZones.zoneFor(150.0, -1.0))
    }

    @Test
    fun multipleLthrFloors_zone2Boundary() {
        for (l in listOf(150.0, 165.0, 170.0, 178.0, 190.0)) {
            val z2 = HeartRateZones.LADDER[1]
            val floor = HeartRateZones.zoneFloorBpm(l, z2).toDouble()
            assertEquals("LTHR $l on Z2 floor", 2, HeartRateZones.zoneFor(floor, l))
            assertEquals(1, HeartRateZones.zoneFor(floor - 1.0, l))
        }
    }

    @Test
    fun backendIsDocumented() {
        assertTrue(
            EliteCoreBridge.backend == EliteCoreBridge.Backend.REFERENCE_PARITY ||
                EliteCoreBridge.backend == EliteCoreBridge.Backend.NATIVE_JNI,
        )
    }
}
