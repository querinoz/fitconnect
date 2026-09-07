package com.fitconnect.android.capture.gps

/**
 * Explicit location sample acceptance.
 *
 * ACCEPT — include in route + distance
 * LOW_CONFIDENCE — persist for diagnostics but do not advance distance
 * REJECT — drop (invalid coords / impossible jump)
 */
enum class GpsPointVerdict {
    ACCEPT,
    LOW_CONFIDENCE,
    REJECT,
}

data class GpsFilterResult(
    val verdict: GpsPointVerdict,
    val reason: String,
)

object GpsAccuracyFilter {
    /** Meters — above this is low confidence, not hard reject. */
    const val LOW_ACCURACY_M = 50.0

    /** Meters — hard reject when accuracy worse than this. */
    const val REJECT_ACCURACY_M = 200.0

    /**
     * Max plausible displacement between consecutive accepted points.
     * ~50 m/s (180 km/h) * 30s ≈ 1500 m — jump threshold.
     */
    const val MAX_JUMP_M = 1_500.0

    fun evaluate(
        latitude: Double,
        longitude: Double,
        accuracyM: Double?,
        distanceFromLastAcceptedM: Double?,
    ): GpsFilterResult {
        if (latitude !in -90.0..90.0 || longitude !in -180.0..180.0) {
            return GpsFilterResult(GpsPointVerdict.REJECT, "coords_out_of_range")
        }
        if (accuracyM != null && accuracyM < 0.0) {
            return GpsFilterResult(GpsPointVerdict.REJECT, "negative_accuracy")
        }
        if (accuracyM != null && accuracyM > REJECT_ACCURACY_M) {
            return GpsFilterResult(GpsPointVerdict.REJECT, "accuracy_too_poor")
        }
        if (distanceFromLastAcceptedM != null && distanceFromLastAcceptedM > MAX_JUMP_M) {
            return GpsFilterResult(GpsPointVerdict.REJECT, "gps_jump")
        }
        if (accuracyM != null && accuracyM > LOW_ACCURACY_M) {
            return GpsFilterResult(GpsPointVerdict.LOW_CONFIDENCE, "accuracy_low")
        }
        return GpsFilterResult(GpsPointVerdict.ACCEPT, "ok")
    }
}
