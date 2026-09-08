package com.fitconnect.android.sports.zones

import kotlin.math.roundToInt

/**
 * UniFFI → Kotlin bridge for elite-core HR zones.
 *
 * Production prefers JNI (`libelite_core_jni`) which calls the same Rust as UniFFI.
 * JVM unit tests use [referenceHeartRateZone] — golden-locked to Rust / UniFFI vectors.
 */
object EliteCoreBridge {
    enum class Backend { NATIVE_JNI, REFERENCE_PARITY }

    @Volatile
    var backend: Backend = Backend.REFERENCE_PARITY
        private set

    init {
        try {
            System.loadLibrary("elite_core_jni")
            // Probe native
            EliteCoreNative.nativeVersion()
            backend = Backend.NATIVE_JNI
        } catch (_: UnsatisfiedLinkError) {
            backend = Backend.REFERENCE_PARITY
        } catch (_: Throwable) {
            backend = Backend.REFERENCE_PARITY
        }
    }

    fun version(): String = when (backend) {
        Backend.NATIVE_JNI -> EliteCoreNative.nativeVersion()
        Backend.REFERENCE_PARITY -> "0.1.0-reference"
    }

    /**
     * LTHR 5-zone index (1–5), or 0 if invalid — mirrors `elite_core_uniffi::heart_rate_zone`.
     */
    fun heartRateZone(bpm: Double, lthrBpm: Double): Int = when (backend) {
        Backend.NATIVE_JNI -> EliteCoreNative.nativeHeartRateZone(bpm, lthrBpm)
        Backend.REFERENCE_PARITY -> referenceHeartRateZone(bpm, lthrBpm)
    }

    /**
     * Exact floor algorithm from elite-core `zone_floor` / `zone_for` (HEART_RATE_ZONES).
     * Must stay golden-equal to Rust UniFFI tests — do not "simplify".
     */
    fun referenceHeartRateZone(bpm: Double, lthrBpm: Double): Int {
        if (lthrBpm <= 0.0 || !bpm.isFinite() || bpm < 0.0) return 0
        val ladder = HeartRateZones.LADDER
        var found = 1
        for (z in ladder) {
            val floor = (lthrBpm * z.lowerFraction).roundToInt().toDouble()
            if (bpm >= floor) found = z.index
        }
        return found
    }
}
