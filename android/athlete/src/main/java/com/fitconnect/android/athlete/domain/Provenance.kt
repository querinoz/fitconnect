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
