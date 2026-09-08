package com.fitconnect.android.sports.zones

/**
 * JNI surface matching UniFFI `elite-core-uniffi` (`version`, `heart_rate_zone`).
 * Loaded from `libelite_core_jni.so` when packaged; JVM unit tests use [EliteCoreBridge] reference.
 */
internal object EliteCoreNative {
    @JvmStatic
    external fun nativeVersion(): String

    /** Zone index 1–5, or 0 if invalid LTHR / input. */
    @JvmStatic
    external fun nativeHeartRateZone(bpm: Double, lthrBpm: Double): Int
}
