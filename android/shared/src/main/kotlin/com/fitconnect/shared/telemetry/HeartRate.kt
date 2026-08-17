package com.fitconnect.shared.telemetry

import com.fitconnect.shared.source.DataSourceKind

/**
 * Typed heart-rate sample. [bpm] is null when [availability] is not [MetricAvailability.AVAILABLE].
 */
data class HeartRate(
    val bpm: Int?,
    val timestampEpochMs: Long,
    val availability: MetricAvailability,
    val source: DataSourceKind,
    val deviceId: String? = null,
    val accuracy: Double? = null,
) {
    init {
        if (availability != MetricAvailability.AVAILABLE) {
            require(bpm == null) { "Unavailable HR must not carry a fabricated bpm" }
        } else {
            require(bpm != null && bpm > 0) { "Available HR requires a positive bpm" }
        }
    }

    companion object {
        fun available(
            bpm: Int,
            timestampEpochMs: Long,
            source: DataSourceKind,
            deviceId: String? = null,
            accuracy: Double? = null,
        ): HeartRate = HeartRate(
            bpm = bpm,
            timestampEpochMs = timestampEpochMs,
            availability = MetricAvailability.AVAILABLE,
            source = source,
            deviceId = deviceId,
            accuracy = accuracy,
        )

        fun unavailable(
            timestampEpochMs: Long,
            availability: MetricAvailability = MetricAvailability.UNAVAILABLE,
            source: DataSourceKind,
            deviceId: String? = null,
        ): HeartRate = HeartRate(
            bpm = null,
            timestampEpochMs = timestampEpochMs,
            availability = availability,
            source = source,
            deviceId = deviceId,
        )
    }
}
