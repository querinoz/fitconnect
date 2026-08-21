package com.fitconnect.android.fitness.domain

import com.fitconnect.shared.fitness.ProviderConstraints
import com.fitconnect.shared.fitness.ProviderId

/**
 * Canonical sports. Health Connect / Strava types map here; UI never sees
 * vendor enums. Units in this module are SI.
 */
enum class Sport {
    RUN,
    TRAIL_RUN,
    WALK,
    HIKE,
    RIDE,
    MOUNTAIN_BIKE,
    GRAVEL,
    INDOOR_RIDE,
    E_BIKE,
    SWIM_POOL,
    SWIM_OPEN,
    STRENGTH,
    HIIT,
    YOGA,
    PILATES,
    MOBILITY,
    ROW,
    SKI,
    SNOWBOARD,
    SURF,
    SAIL,
    PADDLE,
    RACQUET,
    TEAM,
    GOLF,
    OTHER,
}

data class WorkoutStreams(
    val timeSec: List<Int> = emptyList(),
    val distanceM: List<Double> = emptyList(),
    val heartRateBpm: List<Int> = emptyList(),
    val watts: List<Int> = emptyList(),
    val cadenceRpm: List<Int> = emptyList(),
    val latLng: List<Pair<Double, Double>> = emptyList(),
    val altitudeM: List<Double> = emptyList(),
)

data class WorkoutSession(
    val id: String,
    val userId: String,
    val providerId: ProviderId,
    val externalId: String,
    val sport: Sport,
    val startedAtEpochMs: Long,
    val endedAtEpochMs: Long,
    val distanceM: Double? = null,
    val elevationGainM: Double? = null,
    val avgHeartRateBpm: Double? = null,
    val caloriesKj: Double? = null,
    val deviceName: String? = null,
    val streams: WorkoutStreams = WorkoutStreams(),
    val mergedFrom: List<Pair<ProviderId, String>> = emptyList(),
    val constraints: ProviderConstraints = ProviderConstraints(providerId),
) {
    val durationMs: Long get() = (endedAtEpochMs - startedAtEpochMs).coerceAtLeast(0)
    val shareable: Boolean get() = constraints.shareable
}

interface FitnessProvider {
    val providerId: ProviderId
    val constraints: ProviderConstraints
    suspend fun syncSince(cursor: String?): FitnessSyncPage
}

data class FitnessSyncPage(
    val sessions: List<WorkoutSession>,
    val nextCursor: String?,
    val fullReread: Boolean,
)

enum class HealthConnectSdkState {
    AVAILABLE,
    NEEDS_UPDATE,
    UNAVAILABLE,
}

enum class HealthFeature {
    ONBOARDING,
    SLEEP,
    BODY,
    BLOOD,
}

object HealthConnectPermissionPolicy {
    val ONBOARDING = setOf("ExerciseSession", "Steps", "HeartRate", "Distance")
    val SLEEP = setOf("SleepSession")
    val BODY = setOf("Weight", "BodyFat")
    val BLOOD = setOf("BloodPressure")

    fun forFeature(feature: HealthFeature): Set<String> = when (feature) {
        HealthFeature.ONBOARDING -> ONBOARDING
        HealthFeature.SLEEP -> SLEEP
        HealthFeature.BODY -> BODY
        HealthFeature.BLOOD -> BLOOD
    }
}
