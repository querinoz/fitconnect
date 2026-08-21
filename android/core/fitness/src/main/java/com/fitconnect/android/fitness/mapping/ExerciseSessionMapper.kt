package com.fitconnect.android.fitness.mapping

import com.fitconnect.android.fitness.domain.Sport
import com.fitconnect.android.fitness.domain.WorkoutSession
import com.fitconnect.android.fitness.domain.WorkoutStreams
import com.fitconnect.shared.fitness.ProviderConstraints
import com.fitconnect.shared.fitness.ProviderId

/**
 * Vendor-neutral DTO. [HealthConnectSource] maps ExerciseSessionRecord here
 * so JVM tests cover every [Sport] without the Health Connect SDK.
 */
data class ExerciseSessionDto(
    val externalId: String,
    val userId: String,
    val exerciseType: String,
    val startEpochMs: Long,
    val endEpochMs: Long,
    val distanceM: Double? = null,
    val elevationGainM: Double? = null,
    val avgHeartRateBpm: Double? = null,
    val energyKj: Double? = null,
    val deviceName: String? = null,
    val title: String? = null,
)

object ExerciseSessionMapper {
    fun toDomain(
        dto: ExerciseSessionDto,
        providerId: ProviderId = ProviderId.HEALTH_CONNECT,
        streams: WorkoutStreams = WorkoutStreams(),
    ): WorkoutSession {
        val sport = SportCatalog.fromExerciseType(dto.exerciseType)
        return WorkoutSession(
            id = "${providerId.name}:${dto.externalId}",
            userId = dto.userId,
            providerId = providerId,
            externalId = dto.externalId,
            sport = sport,
            startedAtEpochMs = dto.startEpochMs,
            endedAtEpochMs = dto.endEpochMs.coerceAtLeast(dto.startEpochMs),
            distanceM = dto.distanceM,
            elevationGainM = dto.elevationGainM,
            avgHeartRateBpm = dto.avgHeartRateBpm,
            caloriesKj = dto.energyKj,
            deviceName = dto.deviceName,
            streams = streams,
            constraints = ProviderConstraints(providerId),
        )
    }
}

object SportCatalog {
    private val MAP: Map<String, Sport> = mapOf(
        "running" to Sport.RUN,
        "running_treadmill" to Sport.RUN,
        "trail_running" to Sport.TRAIL_RUN,
        "walking" to Sport.WALK,
        "hiking" to Sport.HIKE,
        "biking" to Sport.RIDE,
        "cycling" to Sport.RIDE,
        "mountain_biking" to Sport.MOUNTAIN_BIKE,
        "gravel_cycling" to Sport.GRAVEL,
        "biking_stationary" to Sport.INDOOR_RIDE,
        "indoor_cycling" to Sport.INDOOR_RIDE,
        "e_bike" to Sport.E_BIKE,
        "swimming_pool" to Sport.SWIM_POOL,
        "swimming_open_water" to Sport.SWIM_OPEN,
        "strength_training" to Sport.STRENGTH,
        "weightlifting" to Sport.STRENGTH,
        "calisthenics" to Sport.STRENGTH,
        "high_intensity_interval_training" to Sport.HIIT,
        "boot_camp" to Sport.HIIT,
        "yoga" to Sport.YOGA,
        "pilates" to Sport.PILATES,
        "stretching" to Sport.MOBILITY,
        "guided_breathing" to Sport.MOBILITY,
        "rowing" to Sport.ROW,
        "rowing_machine" to Sport.ROW,
        "skiing" to Sport.SKI,
        "snowboarding" to Sport.SNOWBOARD,
        "surfing" to Sport.SURF,
        "sailing" to Sport.SAIL,
        "paddling" to Sport.PADDLE,
        "kayaking" to Sport.PADDLE,
        "tennis" to Sport.RACQUET,
        "squash" to Sport.RACQUET,
        "badminton" to Sport.RACQUET,
        "table_tennis" to Sport.RACQUET,
        "soccer" to Sport.TEAM,
        "basketball" to Sport.TEAM,
        "football_american" to Sport.TEAM,
        "golf" to Sport.GOLF,
        "other_workout" to Sport.OTHER,
    )

    /** Every Health Connect exercise type we accept, including aliases. */
    val ALL_EXERCISE_TYPES: List<String> = MAP.keys.sorted()

    fun fromExerciseType(raw: String): Sport {
        val key = raw.trim().lowercase().replace('-', '_').replace(' ', '_')
        return MAP[key] ?: Sport.OTHER
    }

    fun representativeType(sport: Sport): String =
        MAP.entries.first { it.value == sport }.key
}
