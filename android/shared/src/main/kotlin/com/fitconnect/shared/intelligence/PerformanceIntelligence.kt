package com.fitconnect.shared.intelligence

/**
 * Performance Intelligence — not medical diagnosis.
 * Every output carries an [EvidenceKind] so UI never presents inference as observation.
 */
enum class EvidenceKind {
    OBSERVED,
    CALCULATED,
    INFERRED,
    RECOMMENDED,
}

enum class BodyState {
    RESTORE,
    READY,
    STRAINED,
    DATA_SOURCE_REQUIRED,
}

data class IntelligenceClaim(
    val label: String,
    val value: String,
    val kind: EvidenceKind,
    val disclaimer: String = "Performance Intelligence — not a medical diagnosis.",
)

data class SleepScore(
    val score: Int?,
    val durationMin: Int?,
    val efficiencyPct: Int?,
    val recoveryImpact: String,
    val kind: EvidenceKind,
    val available: Boolean,
)

data class TrainingLoadSnapshot(
    val acute: Double?,
    val chronic: Double?,
    val strain: Double?,
    val readiness: Int?,
    val kind: EvidenceKind,
    val labeledAs: String = "CALCULATED · not medical truth",
)

object PerformanceIntelligence {
    fun bodyState(
        readiness: Int?,
        hrvAvailable: Boolean,
        sleepAvailable: Boolean,
    ): BodyState {
        if (!hrvAvailable && !sleepAvailable && readiness == null) {
            return BodyState.DATA_SOURCE_REQUIRED
        }
        val score = readiness ?: return BodyState.DATA_SOURCE_REQUIRED
        return when {
            score >= 75 -> BodyState.READY
            score >= 50 -> BodyState.RESTORE
            else -> BodyState.STRAINED
        }
    }

    /**
     * Sleep score is CALCULATED from duration when a source exists.
     * Missing sleep → unavailable, never a fake 0.
     */
    fun sleepScore(durationMin: Int?, efficiencyPct: Int?): SleepScore {
        if (durationMin == null) {
            return SleepScore(
                score = null,
                durationMin = null,
                efficiencyPct = null,
                recoveryImpact = "DATA SOURCE REQUIRED",
                kind = EvidenceKind.INFERRED,
                available = false,
            )
        }
        val durationScore = ((durationMin / 480.0) * 70.0).coerceIn(0.0, 70.0)
        val efficiencyScore = ((efficiencyPct ?: 85) / 100.0) * 30.0
        val score = (durationScore + efficiencyScore).toInt().coerceIn(0, 100)
        val impact = when {
            score >= 80 -> "Recovery impact: supportive of high-intensity work"
            score >= 60 -> "Recovery impact: mixed — protect intensity"
            else -> "Recovery impact: prioritize restore"
        }
        return SleepScore(
            score = score,
            durationMin = durationMin,
            efficiencyPct = efficiencyPct,
            recoveryImpact = impact,
            kind = EvidenceKind.CALCULATED,
            available = true,
        )
    }

    fun trainingLoad(acute: Double?, chronic: Double?, readiness: Int?): TrainingLoadSnapshot {
        val strain = if (acute != null && chronic != null && chronic > 0) acute / chronic else null
        return TrainingLoadSnapshot(
            acute = acute,
            chronic = chronic,
            strain = strain,
            readiness = readiness,
            kind = EvidenceKind.CALCULATED,
        )
    }

    fun directive(readiness: Int?, body: BodyState): IntelligenceClaim {
        if (body == BodyState.DATA_SOURCE_REQUIRED || readiness == null) {
            return IntelligenceClaim(
                label = "TODAY'S DIRECTIVE",
                value = "DATA SOURCE REQUIRED — connect a watch or Health Connect before recommending intensity.",
                kind = EvidenceKind.INFERRED,
            )
        }
        val text = when (body) {
            BodyState.READY ->
                "READINESS $readiness. Recovery profile supports high-intensity work today. Recommended focus: ANAEROBIC CAPACITY. Confidence: MEDIUM."
            BodyState.RESTORE ->
                "READINESS $readiness. Mixed recovery. Recommended focus: AEROBIC / TECHNIQUE. Confidence: MEDIUM."
            BodyState.STRAINED ->
                "READINESS $readiness. Strain signals present. Recommended focus: RESTORE. Confidence: MEDIUM."
            BodyState.DATA_SOURCE_REQUIRED ->
                "DATA SOURCE REQUIRED"
        }
        return IntelligenceClaim(
            label = "TODAY'S DIRECTIVE",
            value = text,
            kind = EvidenceKind.RECOMMENDED,
        )
    }
}
