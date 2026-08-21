package com.fitconnect.shared.fitness

/**
 * Vendor identity for workout provenance. Domain code may branch on
 * [ProviderConstraints], never on a vendor SDK type.
 */
enum class ProviderId {
    HEALTH_CONNECT,
    GARMIN,
    WHOOP,
    OURA,
    FITBIT,
    POLAR,
    SAMSUNG_HEALTH,
    STRAVA,
    MANUAL,
    LOCAL_DEMO,
    ;

    /** Strava sessions are never shareable with third parties (AGENTS.md §1). */
    val shareable: Boolean get() = this != STRAVA

    companion object {
        fun fromWire(raw: String): ProviderId =
            entries.firstOrNull { it.name.equals(raw.trim(), ignoreCase = true) }
                ?: LOCAL_DEMO
    }
}

data class ProviderConstraints(
    val providerId: ProviderId,
    val shareable: Boolean = providerId.shareable,
    val mayTrainMl: Boolean = providerId != ProviderId.STRAVA,
    val visibleToThirdParties: Boolean = shareable,
)
