package com.fitconnect.android.capture

import com.fitconnect.shared.source.DataSourceKind
import com.fitconnect.shared.telemetry.MetricAvailability
import com.fitconnect.shared.telemetry.TelemetryEnvelope
import com.fitconnect.shared.telemetry.TelemetryEnvelopeSample

/**
 * Maps a live snapshot onto [TelemetryEnvelope].
 *
 * Heart rate is [MetricAvailability.UNAVAILABLE] unless Health Services
 * reported [MetricAvailability.AVAILABLE]. Simulated engine BPM is never
 * upgraded to [DataSourceKind.REAL_SENSOR].
 */
fun LiveActivitySnapshot.toTelemetryEnvelope(
    sessionId: String,
    deviceId: String,
    userId: String,
    sequenceNumber: Long,
    timestampEpochMs: Long,
    heartRateCapability: MetricAvailability,
    source: DataSourceKind = DataSourceKind.LOCAL_DEMO,
): TelemetryEnvelope {
    val hrAvailable = heartRateCapability == MetricAvailability.AVAILABLE && hrBpm != null && hrBpm > 0
    return TelemetryEnvelope(
        sessionId = sessionId,
        deviceId = deviceId,
        userId = userId,
        timestampEpochMs = timestampEpochMs,
        sequenceNumber = sequenceNumber,
        source = source,
        samples = listOf(
            TelemetryEnvelopeSample(
                metric = "HEART_RATE",
                value = hrBpm?.takeIf { hrAvailable }?.toDouble(),
                unit = "bpm",
                availability = if (hrAvailable) MetricAvailability.AVAILABLE else heartRateCapability,
                timestampEpochMs = timestampEpochMs,
            ),
            TelemetryEnvelopeSample(
                metric = "DISTANCE_M",
                value = distanceM,
                unit = "m",
                availability = MetricAvailability.AVAILABLE,
                timestampEpochMs = timestampEpochMs,
            ),
            TelemetryEnvelopeSample(
                metric = "PACE_SEC_PER_KM",
                value = paceSecPerKm,
                unit = "s/km",
                availability = if (paceSecPerKm != null) MetricAvailability.AVAILABLE else MetricAvailability.UNAVAILABLE,
                timestampEpochMs = timestampEpochMs,
            ),
            TelemetryEnvelopeSample(
                metric = "CADENCE",
                value = null,
                unit = "rpm",
                availability = MetricAvailability.UNAVAILABLE,
                timestampEpochMs = timestampEpochMs,
            ),
            TelemetryEnvelopeSample(
                metric = "CALORIES_KCAL",
                value = caloriesKcal.toDouble(),
                unit = "kcal",
                availability = MetricAvailability.AVAILABLE,
                timestampEpochMs = timestampEpochMs,
            ),
            TelemetryEnvelopeSample(
                metric = "ELAPSED_MS",
                value = elapsedMs.toDouble(),
                unit = "ms",
                availability = MetricAvailability.AVAILABLE,
                timestampEpochMs = timestampEpochMs,
            ),
            TelemetryEnvelopeSample(
                metric = "LATITUDE",
                value = route.lastOrNull()?.latitude,
                unit = "deg",
                availability = if (route.isNotEmpty()) MetricAvailability.AVAILABLE else MetricAvailability.UNAVAILABLE,
                timestampEpochMs = timestampEpochMs,
            ),
            TelemetryEnvelopeSample(
                metric = "LONGITUDE",
                value = route.lastOrNull()?.longitude,
                unit = "deg",
                availability = if (route.isNotEmpty()) MetricAvailability.AVAILABLE else MetricAvailability.UNAVAILABLE,
                timestampEpochMs = timestampEpochMs,
            ),
        ),
    )
}
