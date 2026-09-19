package com.fitconnect.android.sports.domain

/**
 * Capability helpers derived from the FitConnect sports registry.
 * Prefer [supportedWearables] / [capabilities] — never invent GPS chrome for indoor strength.
 */
fun SportDefinition.gpsSupported(): Boolean =
    WearableCapability.GPS in supportedWearables ||
        capabilities.any { it.equals("gps", ignoreCase = true) }

fun SportCategory.displayLabel(): String = when (this) {
    SportCategory.ENDURANCE -> "Endurance"
    SportCategory.TEAM -> "Team"
    SportCategory.RACKET -> "Racket"
    SportCategory.STRENGTH -> "Strength"
    SportCategory.HYBRID -> "Hybrid"
    SportCategory.WATER -> "Water"
    SportCategory.WINTER -> "Winter"
    SportCategory.MIND_BODY -> "Mind & Body"
    SportCategory.COMBAT -> "Combat"
    SportCategory.OTHER -> "Other"
}
