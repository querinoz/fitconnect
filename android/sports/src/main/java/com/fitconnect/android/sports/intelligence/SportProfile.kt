package com.fitconnect.android.sports.intelligence

import com.fitconnect.android.sports.domain.SportId

/**
 * Sport-level training profile for Zenith V8.5.
 * Nutrition keys are config strings only — never hardcode dangerous diet rules.
 */
data class SportProfile(
    val sportId: SportId,
    val displayName: String,
    val sessionTypes: List<String>,
    val primaryMetrics: List<String>,
    val nutritionProfileKeys: List<String> = emptyList(),
) {
    init {
        require(displayName.isNotBlank()) { "displayName required" }
        require(sessionTypes.isNotEmpty()) { "sessionTypes required" }
        require(primaryMetrics.isNotEmpty()) { "primaryMetrics required" }
    }
}

/**
 * Explainable today-session pick. Reasons are human-readable; never invent biometrics.
 */
data class TodaySessionRecommendation(
    val sportId: SportId,
    val sessionType: String,
    val intent: String,
    val estimatedDurationMin: Int,
    val reasons: List<String>,
    val honesty: SessionHonestyBundle = SessionHonestyBundle(),
    val adaptationNote: String? = null,
) {
    init {
        require(sessionType.isNotBlank()) { "sessionType required" }
        require(intent.isNotBlank()) { "intent required" }
        require(estimatedDurationMin > 0) { "duration must be positive" }
        require(reasons.isNotEmpty()) { "at least one explainable reason required" }
    }

    fun primaryReason(): String = reasons.first()

    fun readinessLabel(): String = when (honesty.readiness.status) {
        HonestyStatus.AVAILABLE -> "Readiness ${honesty.readinessDisplay()}"
        else -> "Readiness ${honesty.readiness.label()}"
    }
}

/**
 * Explains load adaptations without inventing sensor values.
 */
object SessionAdaptation {
    fun explain(
        sportId: SportId,
        sessionType: String,
        readiness: HonestMetric<Int>,
        priorSessionType: String? = null,
    ): String {
        val sport = sportId.value.replace('_', ' ')
        val base = "Suggested $sessionType for $sport"
        val readinessPart = when (readiness.status) {
            HonestyStatus.AVAILABLE -> {
                val score = readiness.value!!
                when {
                    score >= 70 -> "readiness $score supports higher intensity"
                    score >= 45 -> "readiness $score favors moderate intensity"
                    else -> "readiness $score favors recovery-biased intensity"
                }
            }
            HonestyStatus.NOT_CONNECTED -> "readiness not connected — intensity left unset"
            HonestyStatus.MISSING -> "readiness missing — no intensity claim"
            HonestyStatus.UNAVAILABLE -> "readiness unavailable — no intensity claim"
            HonestyStatus.LOADING -> "readiness still loading"
            HonestyStatus.ERROR -> "readiness error — intensity left unset"
        }
        val prior = priorSessionType?.takeIf { it.isNotBlank() }?.let {
            "following prior $it"
        }
        return listOfNotNull(base, readinessPart, prior).joinToString(" · ")
    }
}
