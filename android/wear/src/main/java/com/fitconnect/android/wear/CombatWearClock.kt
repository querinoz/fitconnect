package com.fitconnect.android.wear

/** Watch-side round clock. IMU on the watch is never punch force. */
object CombatWearClock {
    fun formatClock(totalSec: Int): String {
        val sec = totalSec.coerceAtLeast(0)
        return "%02d:%02d".format(sec / 60, sec % 60)
    }

    fun headline(phase: String, round: Int): String = when (phase.lowercase()) {
        "rest" -> "REST"
        "warning" -> "WARNING"
        "countdown" -> "COUNTDOWN"
        "complete" -> "COMPLETE"
        "paused" -> "PAUSED"
        "work" -> "ROUND $round"
        else -> "FIGHT MODE"
    }

    fun watchImuForceAllowed(): Boolean = false

    fun footnote(connected: Boolean, disciplineId: String?): String {
        val sport = disciplineId?.replace('_', ' ') ?: "martial arts"
        val link = if (connected) "phone linked" else "offline · last glance"
        return "$sport · $link · IMU is not punch force"
    }
}
