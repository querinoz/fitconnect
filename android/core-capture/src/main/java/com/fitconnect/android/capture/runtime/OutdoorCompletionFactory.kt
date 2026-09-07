package com.fitconnect.android.capture.runtime

import com.fitconnect.shared.geo.RoutePoint

data class OutdoorCompletionPayload(
    val activityJson: String,
    val xpJson: String,
    val activityIdempotencyKey: String,
    val xpIdempotencyKey: String,
)

object OutdoorCompletionFactory {
    fun build(
        userId: String,
        activityId: String,
        sessionId: String,
        sport: String,
        startedAtMs: Long,
        completedAtMs: Long,
        durationMs: Long,
        distanceM: Double,
        points: List<RoutePoint>,
        avgSpeedMps: Double?,
        elevationGainM: Double,
    ): OutdoorCompletionPayload {
        val activityKey = "activity:$userId:$sessionId"
        val xpKey = "xp:$userId:$sessionId"
        val routeJson = points.joinToString(",", prefix = "[", postfix = "]") { p ->
            buildString {
                append("{")
                append("\"lat\":").append(p.latitude).append(',')
                append("\"lon\":").append(p.longitude).append(',')
                append("\"t\":").append(p.capturedSafe()).append(',')
                append("\"acc\":").append(p.accuracyM ?: "null").append(',')
                append("\"spd\":").append(p.speedMps ?: "null").append(',')
                append("\"alt\":").append(p.altitudeM ?: "null")
                append("}")
            }
        }
        val activityJson = buildString {
            append('{')
            append("\"activityId\":\"").append(activityId).append("\",")
            append("\"userId\":\"").append(userId).append("\",")
            append("\"sessionId\":\"").append(sessionId).append("\",")
            append("\"idempotencyKey\":\"").append(activityKey).append("\",")
            append("\"provider\":\"GPS\",")
            append("\"sport\":\"").append(sport.uppercase()).append("\",")
            append("\"startedAtMs\":").append(startedAtMs).append(',')
            append("\"completedAtMs\":").append(completedAtMs).append(',')
            append("\"durationMs\":").append(durationMs).append(',')
            append("\"metrics\":{")
            append("\"distanceM\":").append(distanceM).append(',')
            append("\"avgSpeedMps\":").append(avgSpeedMps ?: "null").append(',')
            append("\"elevationGainM\":").append(elevationGainM).append(',')
            append("\"pointCount\":").append(points.size)
            append("},")
            append("\"route\":").append(routeJson)
            append('}')
        }
        val xpJson = buildString {
            append('{')
            append("\"eventId\":\"").append(xpKey).append("\",")
            append("\"sessionId\":\"").append(sessionId).append("\",")
            append("\"durationMs\":").append(durationMs).append(',')
            append("\"distanceM\":").append(distanceM)
            append('}')
        }
        return OutdoorCompletionPayload(
            activityJson = activityJson,
            xpJson = xpJson,
            activityIdempotencyKey = activityKey,
            xpIdempotencyKey = xpKey,
        )
    }

    private fun RoutePoint.capturedSafe(): Long = timestampEpochMs
}
