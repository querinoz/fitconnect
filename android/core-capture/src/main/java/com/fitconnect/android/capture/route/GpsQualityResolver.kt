package com.fitconnect.android.capture.route

import com.fitconnect.android.capture.runtime.OutdoorTrackingPhase

/**
 * Semantic GPS quality for map chrome — sourced from outdoor capture phase,
 * never from UI timers or HR zones.
 */
enum class GpsQualityUi {
    GOOD,
    DEGRADED,
    LOST,
    RECOVERING,
}

object GpsQualityResolver {
    fun resolve(
        phase: OutdoorTrackingPhase,
        acceptedPoints: Int,
        lastVerdict: String,
    ): GpsQualityUi =
        when (phase) {
            OutdoorTrackingPhase.RESUMING -> GpsQualityUi.RECOVERING
            OutdoorTrackingPhase.GPS_DEGRADED -> GpsQualityUi.DEGRADED
            OutdoorTrackingPhase.PREPARING ->
                if (acceptedPoints == 0) GpsQualityUi.LOST else GpsQualityUi.RECOVERING
            OutdoorTrackingPhase.TRACKING ->
                when {
                    lastVerdict == "accuracy_low" -> GpsQualityUi.DEGRADED
                    acceptedPoints > 0 -> GpsQualityUi.GOOD
                    else -> GpsQualityUi.LOST
                }
            OutdoorTrackingPhase.PAUSED ->
                if (acceptedPoints > 0) GpsQualityUi.GOOD else GpsQualityUi.LOST
            OutdoorTrackingPhase.ERROR -> GpsQualityUi.LOST
            else ->
                if (acceptedPoints > 0) GpsQualityUi.GOOD else GpsQualityUi.LOST
        }

    fun label(quality: GpsQualityUi): String =
        when (quality) {
            GpsQualityUi.GOOD -> "GPS GOOD"
            GpsQualityUi.DEGRADED -> "GPS DEGRADED"
            GpsQualityUi.LOST -> "GPS LOST"
            GpsQualityUi.RECOVERING -> "RECOVERING"
        }
}
