package com.fitconnect.shared.export

import com.fitconnect.shared.geo.RoutePoint
import com.fitconnect.shared.source.DataSourceKind
import com.fitconnect.shared.workout.WorkoutSport

/**
 * Domain payload for future Strava / file export.
 * OAuth is not performed here — architecture only until credentials exist.
 */
data class ActivityExportPayload(
    val sessionId: String,
    val sport: WorkoutSport,
    val startedAtEpochMs: Long,
    val elapsedMs: Long,
    val movingMs: Long,
    val distanceM: Double,
    val averagePaceSecPerKm: Double?,
    val averageHeartRateBpm: Int?,
    val maxHeartRateBpm: Int?,
    val elevationGainM: Double,
    val route: List<RoutePoint>,
    val source: DataSourceKind,
    val stravaReady: Boolean,
) {
    val oauthRequired: Boolean get() = true
}

object ActivityExportFactory {
    fun fromSession(
        sessionId: String,
        sport: WorkoutSport,
        startedAtEpochMs: Long,
        elapsedMs: Long,
        movingMs: Long,
        distanceM: Double,
        averagePaceSecPerKm: Double?,
        heartRates: List<Int>,
        elevationGainM: Double,
        route: List<RoutePoint>,
        source: DataSourceKind,
    ): ActivityExportPayload {
        val avgHr = heartRates.takeIf { it.isNotEmpty() }?.average()?.toInt()
        val maxHr = heartRates.maxOrNull()
        return ActivityExportPayload(
            sessionId = sessionId,
            sport = sport,
            startedAtEpochMs = startedAtEpochMs,
            elapsedMs = elapsedMs,
            movingMs = movingMs,
            distanceM = distanceM,
            averagePaceSecPerKm = averagePaceSecPerKm,
            averageHeartRateBpm = avgHr,
            maxHeartRateBpm = maxHr,
            elevationGainM = elevationGainM,
            route = route,
            source = source,
            stravaReady = route.isNotEmpty() && distanceM > 0.0,
        )
    }
}
