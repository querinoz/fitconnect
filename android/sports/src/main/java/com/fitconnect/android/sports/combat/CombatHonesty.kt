package com.fitconnect.android.sports.combat

object CombatHonesty {
    private val directForceSensors = setOf(
        "INSTRUMENTED_GLOVE_FORCE",
        "INSTRUMENTED_BAG",
        "INSTRUMENTED_PAD",
        "FORCE_PLATE",
    )

    fun rewriteForce(metric: String, measurementType: String, sensor: String): Pair<String, String> {
        if (metric != "impact_force") return metric to measurementType
        if (measurementType == "DIRECT" && sensor in directForceSensors) return metric to measurementType
        return "impact_estimate" to "ESTIMATED"
    }

    fun watchImuCannotMeasureForce(): Boolean = true
}
