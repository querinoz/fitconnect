package com.fitconnect.android.sports.intelligence

/**
 * V10.2 Adaptive Training Engine (Android port of web recommendSessionAdaptation).
 * Rule-bound; never silently mutates active plans. Confirm-only.
 */
enum class AdaptationAction {
    KEEP,
    REDUCE_VOLUME,
    REDUCE_INTENSITY,
    EXTEND_REST,
    SWAP_TO_RECOVERY,
    DELOAD_SUGGEST,
}

enum class TrainingLoadLabel {
    LOW,
    MODERATE,
    HIGH,
    SPIKE,
    UNKNOWN,
}

data class TrainingLoadView(
    val label: TrainingLoadLabel,
    val acwr: Double? = null,
)

enum class AdaptationConfidence {
    HIGH,
    MEDIUM,
    LOW,
    NOT_AVAILABLE,
}

/**
 * Explainable adaptation — WHAT / WHY / DATA / CONFIDENCE.
 * [requiresConfirm] is always true; [autoApplied] is always false.
 */
data class ExplainableAdaptation(
    val action: AdaptationAction,
    val what: String,
    val why: String,
    val data: List<String>,
    val confidence: AdaptationConfidence,
    val requiresConfirm: Boolean = true,
    val autoApplied: Boolean = false,
) {
    init {
        require(requiresConfirm) { "Adaptations must require athlete confirmation" }
        require(!autoApplied) { "Adaptations must never auto-apply" }
        require(what.isNotBlank()) { "what required" }
        require(why.isNotBlank()) { "why required" }
        require(data.isNotEmpty()) { "data required" }
    }
}

object AdaptiveTraining {
    fun recommendSessionAdaptation(
        trainingLoad: TrainingLoadView,
        readinessScore: Int?,
        readinessState: AdaptationConfidence,
        availableMin: Int?,
        plannedDurationMin: Int,
    ): ExplainableAdaptation {
        require(plannedDurationMin > 0) { "plannedDurationMin must be positive" }
        val data = buildList {
            add("load=${trainingLoad.label.name}")
            add("acwr=${trainingLoad.acwr ?: "n/a"}")
            add("readiness=${readinessScore ?: readinessState.name}")
            add("plannedMin=$plannedDurationMin")
        }

        if (trainingLoad.label == TrainingLoadLabel.SPIKE) {
            return ExplainableAdaptation(
                action = AdaptationAction.REDUCE_VOLUME,
                what = "Reduce planned volume by ~20–30% or swap to recovery session",
                why = "Acute:chronic workload ratio in SPIKE band",
                data = data,
                confidence = AdaptationConfidence.MEDIUM,
            )
        }

        if (
            readinessScore != null &&
            readinessScore < 45 &&
            readinessState != AdaptationConfidence.NOT_AVAILABLE
        ) {
            return ExplainableAdaptation(
                action = AdaptationAction.SWAP_TO_RECOVERY,
                what = "Prefer recovery / technique session over high intensity",
                why = "Readiness score below caution threshold",
                data = data,
                confidence = readinessState,
            )
        }

        if (
            availableMin != null &&
            availableMin > 0 &&
            availableMin < plannedDurationMin * 0.7
        ) {
            return ExplainableAdaptation(
                action = AdaptationAction.REDUCE_VOLUME,
                what = "Shorten session to fit available time",
                why = "Available time materially below planned duration",
                data = data + "availableMin=$availableMin",
                confidence = AdaptationConfidence.HIGH,
            )
        }

        if (trainingLoad.label == TrainingLoadLabel.HIGH) {
            return ExplainableAdaptation(
                action = AdaptationAction.EXTEND_REST,
                what = "Extend rest intervals; keep intensity unless athlete confirms cut",
                why = "Elevated training load without SPIKE",
                data = data,
                confidence = AdaptationConfidence.MEDIUM,
            )
        }

        return ExplainableAdaptation(
            action = AdaptationAction.KEEP,
            what = "Keep planned session",
            why = "No rule-bound adaptation triggers",
            data = data,
            confidence = AdaptationConfidence.HIGH,
        )
    }

    fun loadLabelFromReadiness(score: Int?, honesty: HonestyStatus): TrainingLoadLabel {
        if (honesty != HonestyStatus.AVAILABLE || score == null) return TrainingLoadLabel.UNKNOWN
        return when {
            score >= 75 -> TrainingLoadLabel.MODERATE
            score >= 45 -> TrainingLoadLabel.MODERATE
            else -> TrainingLoadLabel.LOW
        }
    }
}
