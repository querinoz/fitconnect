package com.fitconnect.shared.workout

/**
 * Initial FitConnect activity catalog. Keys are stable wire values
 * (session.v1 sport=). Not a clone of any vendor sport list.
 */
enum class WorkoutSport(
    val wireKey: String,
    val outdoorGps: Boolean,
) {
    RUN("Run", outdoorGps = true),
    WALK("Walk", outdoorGps = true),
    CYCLING("Cycling", outdoorGps = true),
    HIKE("Hike", outdoorGps = true),
    INDOOR_RUN("IndoorRun", outdoorGps = false),
    INDOOR_CYCLING("IndoorCycling", outdoorGps = false),
    STRENGTH("Strength", outdoorGps = false),
    MOBILITY("Mobility", outdoorGps = false),
    RECOVERY("Recovery", outdoorGps = false),
    CUSTOM("Custom", outdoorGps = false),
    ;

    companion object {
        fun fromKey(raw: String): WorkoutSport {
            val normalized = raw.trim().lowercase().replace(" ", "").replace("_", "")
            return entries.firstOrNull {
                it.wireKey.lowercase() == raw.trim() ||
                    it.name.lowercase().replace("_", "") == normalized
            } ?: CUSTOM
        }
    }
}
