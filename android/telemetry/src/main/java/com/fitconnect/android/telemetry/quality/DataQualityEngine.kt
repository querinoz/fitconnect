package com.fitconnect.android.telemetry.quality

import com.fitconnect.android.telemetry.domain.DataQuality
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.TelemetrySample
import com.fitconnect.android.telemetry.time.TelemetryClock
import com.fitconnect.android.telemetry.time.SystemTelemetryClock

/**
 * Validates telemetry streams. Suspicious data is FLAGGED, never silently
 * corrected — the sample keeps its original value plus quality flags.
 */
class DataQualityEngine(private val clock: TelemetryClock = SystemTelemetryClock) {

    data class Assessment(val quality: DataQuality, val flags: List<String>)

    /** Physiological / physical plausibility bounds per metric (canonical units). */
    private val bounds: Map<MetricType, ClosedFloatingPointRange<Double>> = mapOf(
        MetricType.HEART_RATE to 20.0..250.0,
        MetricType.RESTING_HEART_RATE to 25.0..120.0,
        MetricType.HRV to 1.0..300.0,
        MetricType.SLEEP to 0.0..1_440.0,
        MetricType.STEPS to 0.0..200_000.0,
        MetricType.CALORIES to 0.0..20_000.0,
        MetricType.DISTANCE to 0.0..500_000.0,
        MetricType.ELEVATION to -500.0..9_000.0,
        MetricType.POWER to 0.0..3_000.0,
        MetricType.CADENCE to 0.0..300.0,
        MetricType.SPEED to 0.0..40.0,
        MetricType.RESPIRATORY_RATE to 2.0..60.0,
        MetricType.SPO2 to 50.0..100.0,
        MetricType.BODY_TEMPERATURE to 30.0..45.0,
        MetricType.WEIGHT to 20.0..400.0,
        MetricType.STRESS to 0.0..100.0,
        MetricType.RECOVERY to 0.0..100.0,
        MetricType.READINESS to 0.0..100.0,
        MetricType.TRAINING_LOAD to 0.0..2_000.0,
        MetricType.VO2_MAX to 10.0..100.0,
    )

    fun assess(sample: TelemetrySample): Assessment {
        val flags = mutableListOf<String>()
        var quality = DataQuality.VALID

        if (sample.value.isNaN() || sample.value.isInfinite()) {
            return Assessment(DataQuality.INVALID, listOf("non_finite_value"))
        }

        val range = bounds[sample.metric]
        if (range != null && sample.value !in range) {
            flags += "out_of_bounds:${sample.metric.name.lowercase()}"
            quality = DataQuality.INVALID
        }

        val now = clock.nowEpochMs()
        if (sample.at.epochMs > now + FUTURE_TOLERANCE_MS) {
            flags += "future_timestamp"
            quality = DataQuality.INVALID
        }

        val end = sample.endAt
        if (end != null && end.epochMs < sample.at.epochMs) {
            flags += "negative_duration"
            quality = DataQuality.INVALID
        }

        if (sample.provenance.confidence < LOW_CONFIDENCE && quality == DataQuality.VALID) {
            flags += "low_confidence"
            quality = DataQuality.SUSPECT
        }

        return Assessment(quality, flags)
    }

    /** Statistical outlier detection over a window of samples (same metric). */
    fun flagOutliers(samples: List<TelemetrySample>): Set<String> {
        if (samples.size < MIN_OUTLIER_WINDOW) return emptySet()
        val values = samples.map { it.value }.sorted()
        val median = values[values.size / 2]
        val deviations = values.map { kotlin.math.abs(it - median) }.sorted()
        val mad = deviations[deviations.size / 2]
        if (mad == 0.0) return emptySet()
        return samples
            .filter { kotlin.math.abs(it.value - median) / mad > OUTLIER_MAD_FACTOR }
            .map { it.id }
            .toSet()
    }

    private companion object {
        const val FUTURE_TOLERANCE_MS = 5 * 60_000L
        const val LOW_CONFIDENCE = 0.5
        const val MIN_OUTLIER_WINDOW = 8
        const val OUTLIER_MAD_FACTOR = 6.0
    }
}
