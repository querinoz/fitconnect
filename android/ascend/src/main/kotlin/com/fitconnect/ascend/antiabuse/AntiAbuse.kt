package com.fitconnect.ascend.antiabuse

import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.PerformanceEventType

data class AbuseVerdict(
    val accepted: Boolean,
    val reason: String? = null,
)

/**
 * Extensible integrity checks. Uncertain-but-plausible data is accepted.
 * Impossible kinematics are rejected with 0 XP. Legitimate users are not
 * punished for missing sensors.
 */
object AntiAbuse {
    fun validate(event: PerformanceEvent, nowEpochMs: Long): AbuseVerdict {
        if (event.eventId.isBlank() || event.userId.isBlank()) {
            return AbuseVerdict(false, "abuse.identity")
        }
        if (event.timestampEpochMs <= 0L) {
            return AbuseVerdict(false, "abuse.timestamp")
        }
        if (event.timestampEpochMs > nowEpochMs + 10 * 60_000L) {
            return AbuseVerdict(false, "abuse.timestamp_future")
        }
        val p = event.payload
        if (p.distanceM < 0 || p.durationMs < 0 || p.elevationGainM < 0 || p.caloriesKcal < 0) {
            return AbuseVerdict(false, "abuse.negative")
        }
        if (event.type == PerformanceEventType.WORKOUT_COMPLETED) {
            if (p.distanceM > 300_000) {
                return AbuseVerdict(false, "abuse.impossible_distance")
            }
            if (p.durationMs > 0 && p.distanceM > 50) {
                val speed = p.distanceM / (p.durationMs / 1000.0)
                val sport = p.sport?.lowercase().orEmpty()
                val limit = when {
                    sport.contains("ride") || sport.contains("cycle") -> 30.0
                    sport.contains("swim") -> 4.0
                    else -> 12.5
                }
                if (speed > limit) {
                    return AbuseVerdict(false, "abuse.impossible_speed")
                }
            }
            if (p.durationMs in 1 until 30_000 && p.distanceM > 1_000) {
                return AbuseVerdict(false, "abuse.impossible_speed")
            }
        }
        return AbuseVerdict(true)
    }
}
