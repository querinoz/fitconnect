package com.fitconnect.android.athlete.domain

/**
 * How athlete-facing values were produced. UI must never present [LOCAL_DEMO] as measured.
 */
enum class AthleteDataProvenance {
    MEASURED,
    CALCULATED,
    LOCAL_DEMO,
    INSUFFICIENT_DATA,
}

data class Provenanced<T>(
    val value: T,
    val provenance: AthleteDataProvenance,
    val sourceLabel: String? = null,
) {
    val isDemo: Boolean get() = provenance == AthleteDataProvenance.LOCAL_DEMO
}

data class TodayReadinessUi(
    val readinessPercent: Provenanced<Int>,
    val hrvMs: Provenanced<Int>,
    val load: Provenanced<Float>,
    val sleepLabel: Provenanced<String>,
    val isAnyDemo: Boolean,
)

/** Analysis tab — coach marketplace map strip (not live GPS). */
data class DiscoverMapPreviewUi(
    val distanceKm: Provenanced<Double>,
    val durationMin: Provenanced<Int>,
    val heartRateBpm: Provenanced<Int>,
    val paceLabel: Provenanced<String>,
    val isAnyDemo: Boolean,
)

/** Achievements vault — shareable badge distance from seeded workouts. */
data class VaultBadgeUi(
    val shareableKm: Double,
    val privateKm: Double,
    val summary: String,
    val isDemo: Boolean,
)

/** Profile identity blocks — repo-sourced until backend profile exists. */
data class ProfileSurfaceUi(
    val displayName: Provenanced<String>,
    val bodyMetricsDemo: Boolean,
    val goalsDemo: Boolean,
    val hexatarNote: String,
    val isAnyDemo: Boolean,
)

/** Train FAB capture — live engine source labeling. */
data class TrainSurfaceUi(
    val sourceLabel: String,
    val isDemoCapture: Boolean,
)
