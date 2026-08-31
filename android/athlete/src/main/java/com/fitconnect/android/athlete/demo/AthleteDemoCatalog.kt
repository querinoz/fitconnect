package com.fitconnect.android.athlete.demo

import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.ascend.badges.WorkoutContribution
import com.fitconnect.shared.fitness.ProviderId

/**
 * Single source for athlete LOCAL_DEMO literals. Composables must not invent demo numbers.
 */
object AthleteDemoCatalog {
    const val MODE_LABEL: String = DemoPersona.MODE_LABEL

    const val FALLBACK_HRV_MS: Int = 68
    const val FALLBACK_RESTING_HR_BPM: Int = 48
    const val FALLBACK_SLEEP_QUALITY: Int = 86
    const val FALLBACK_SLEEP_MINUTES: Int = 438 // 7h 18m
    const val FALLBACK_SLEEP_LABEL: String = "7h 18m"
    const val FALLBACK_SUBJECTIVE: Int = 80

    const val DEMO_ATHLETE_DISPLAY_NAME: String = "Inês Costa"

    /** Template Y values for readiness trend chart; last point is appended from live score. */
    val READINESS_CHART_TEMPLATE_Y: List<Float> = listOf(70f, 74f, 68f, 80f)

    // Analysis tab (coach marketplace map strip — not live GPS)
    const val DISCOVER_MAP_DISTANCE_KM: Double = 8.2
    const val DISCOVER_MAP_DURATION_MIN: Int = 42
    const val DISCOVER_MAP_HR_BPM: Int = 148
    const val DISCOVER_MAP_PACE_LABEL: String = "5:12/km"

    /** Seeded shareable workouts for vault badge progress (mirrors AscendDemo distances). */
    val VAULT_SHAREABLE_WORKOUTS: List<WorkoutContribution> = listOf(
        WorkoutContribution(6_200.0, ProviderId.HEALTH_CONNECT),
        WorkoutContribution(10_400.0, ProviderId.GARMIN),
        WorkoutContribution(5_500.0, ProviderId.WHOOP),
    )

    /** One Strava-origin row — private only (AGENTS.md §1). */
    val VAULT_PRIVATE_STRAVA_WORKOUT: WorkoutContribution =
        WorkoutContribution(4_200.0, ProviderId.STRAVA)

    const val HEXATAR_DETERMINISTIC_NOTE: String = "HEXATAR · DETERMINISTIC UID HASH"
    const val TRAIN_CAPTURE_SOURCE: String = MODE_LABEL

    fun formatSleepMinutes(totalMinutes: Int): String {
        val hours = totalMinutes / 60
        val minutes = totalMinutes % 60
        return if (minutes == 0) "${hours}h" else "${hours}h ${minutes}m"
    }
}
