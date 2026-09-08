package com.fitconnect.android.sports.zones

import kotlin.math.roundToInt

/**
 * Heart-rate training zones — **delegates to elite-core** via [EliteCoreBridge]
 * (UniFFI-compatible JNI, or golden-locked reference on JVM).
 *
 * Spec: docs/sports-metrics §2.2. Ladder fractions match `HEART_RATE_ZONES` in Rust.
 */
object HeartRateZones {
    data class ZoneDef(val index: Int, val label: String, val lowerFraction: Double)

    val LADDER: List<ZoneDef> = listOf(
        ZoneDef(1, "Recovery", 0.00),
        ZoneDef(2, "Endurance", 0.81),
        ZoneDef(3, "Tempo", 0.90),
        ZoneDef(4, "Threshold", 0.94),
        ZoneDef(5, "VO2max+", 1.00),
    )

    fun zoneFloorBpm(lthrBpm: Double, zone: ZoneDef): Int =
        (lthrBpm * zone.lowerFraction).roundToInt()

    /** Inclusive lower bound; higher zone wins on exact floor. Null if LTHR invalid. */
    fun zoneFor(hrBpm: Double, lthrBpm: Double): Int? {
        val z = EliteCoreBridge.heartRateZone(hrBpm, lthrBpm)
        return if (z == 0) null else z
    }

    /**
     * Minutes in each zone (index 1..5) from discrete HR samples.
     * Assumes [sampleIntervalSec] between consecutive samples (default 1s).
     */
    fun timeInZonesMinutes(
        hrSamplesBpm: List<Double>,
        lthrBpm: Double,
        sampleIntervalSec: Double = 1.0,
    ): List<Int>? {
        if (lthrBpm <= 0.0 || hrSamplesBpm.isEmpty()) return null
        val seconds = IntArray(5)
        for (hr in hrSamplesBpm) {
            val z = zoneFor(hr, lthrBpm) ?: continue
            seconds[z - 1] += sampleIntervalSec.roundToInt().coerceAtLeast(1)
        }
        return seconds.map { (it / 60.0).roundToInt() }
    }

    /** Default LTHR when athlete has no calibrated value — still CALCULATED, not measured. */
    const val DEFAULT_LTHR_BPM = 170.0
}
