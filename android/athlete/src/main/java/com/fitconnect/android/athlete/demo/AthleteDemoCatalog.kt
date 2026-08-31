package com.fitconnect.android.athlete.demo

import com.fitconnect.android.foundation.auth.DemoPersona

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

    /** Template Y values for readiness trend chart; last point is appended from live score. */
    val READINESS_CHART_TEMPLATE_Y: List<Float> = listOf(70f, 74f, 68f, 80f)

    fun formatSleepMinutes(totalMinutes: Int): String {
        val hours = totalMinutes / 60
        val minutes = totalMinutes % 60
        return if (minutes == 0) "${hours}h" else "${hours}h ${minutes}m"
    }
}
