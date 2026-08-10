package com.fitconnect.android.telemetry.domain

import com.fitconnect.android.telemetry.time.TelemetryInstant
import com.fitconnect.android.telemetry.units.TelemetryUnit

/** Canonical metric taxonomy. Providers map their raw types onto these. */
enum class MetricType {
    HEART_RATE,
    HRV,
    RESTING_HEART_RATE,
    SLEEP,
    STEPS,
    CALORIES,
    DISTANCE,
    ELEVATION,
    LOCATION,
    POWER,
    CADENCE,
    PACE,
    SPEED,
    RESPIRATORY_RATE,
    SPO2,
    BODY_TEMPERATURE,
    WEIGHT,
    BODY_COMPOSITION,
    BLOOD_PRESSURE,
    STRESS,
    RECOVERY,
    READINESS,
    TRAINING_LOAD,
    VO2_MAX,
    WORKOUT,
}

/** Provider identity — the only place vendors are named inside the domain. */
enum class ProviderId {
    HEALTH_CONNECT,
    GARMIN,
    WHOOP,
    OURA,
    FITBIT,
    POLAR,
    SAMSUNG_HEALTH,
    STRAVA,
    MANUAL,
}

enum class DataQuality { VALID, SUSPECT, INVALID, UNKNOWN }

/**
 * Provenance carried by every telemetry record. Records are never stripped of
 * their origin, original unit, or quality assessment.
 */
data class Provenance(
    val provider: ProviderId,
    val device: String?,
    val deviceId: String?,
    val sourceRecordId: String,
    val originalUnit: TelemetryUnit,
    val confidence: Double = 1.0,
    val accuracy: Double? = null,
    val syncedAt: TelemetryInstant,
    val createdAt: TelemetryInstant,
    val updatedAt: TelemetryInstant,
    val quality: DataQuality = DataQuality.UNKNOWN,
    val qualityFlags: List<String> = emptyList(),
)

/**
 * Canonical telemetry sample. Value is always stored in the canonical unit of
 * its [MetricType]; the original unit remains in [Provenance.originalUnit].
 */
data class TelemetrySample(
    val id: String,
    val athleteId: String,
    val metric: MetricType,
    val value: Double,
    val unit: TelemetryUnit,
    val at: TelemetryInstant,
    val endAt: TelemetryInstant? = null,
    val provenance: Provenance,
    val attributes: Map<String, String> = emptyMap(),
)

enum class SleepStageKind { AWAKE, LIGHT, DEEP, REM, UNKNOWN }

data class SleepStage(
    val kind: SleepStageKind,
    val start: TelemetryInstant,
    val end: TelemetryInstant,
)

/** Sleep session spanning possibly cross-midnight windows. */
data class SleepSession(
    val id: String,
    val athleteId: String,
    val start: TelemetryInstant,
    val end: TelemetryInstant,
    val stages: List<SleepStage>,
    val efficiencyPct: Double?,
    val provenance: Provenance,
) {
    val durationMs: Long get() = end.epochMs - start.epochMs
}

/** Normalized imported workout. Sport interpretation belongs to :sports. */
data class WorkoutSession(
    val id: String,
    val athleteId: String,
    val sportKey: String,
    val title: String,
    val start: TelemetryInstant,
    val end: TelemetryInstant,
    val distanceMeters: Double?,
    val calories: Double?,
    val avgHeartRate: Double?,
    val maxHeartRate: Double?,
    val avgPowerWatts: Double?,
    val elevationGainMeters: Double?,
    val provenance: Provenance,
    val mergedFrom: List<Provenance> = emptyList(),
) {
    val durationMs: Long get() = end.epochMs - start.epochMs
}

data class LocationSample(
    val id: String,
    val athleteId: String,
    val lat: Double,
    val lng: Double,
    val altitudeMeters: Double?,
    val at: TelemetryInstant,
    val provenance: Provenance,
)

data class BloodPressureSample(
    val id: String,
    val athleteId: String,
    val systolicMmHg: Double,
    val diastolicMmHg: Double,
    val at: TelemetryInstant,
    val provenance: Provenance,
)

data class BodyComposition(
    val id: String,
    val athleteId: String,
    val weightKg: Double?,
    val bodyFatPct: Double?,
    val muscleMassKg: Double?,
    val at: TelemetryInstant,
    val provenance: Provenance,
)
