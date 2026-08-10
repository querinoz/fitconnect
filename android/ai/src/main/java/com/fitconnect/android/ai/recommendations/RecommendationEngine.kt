package com.fitconnect.android.ai.recommendations

import com.fitconnect.android.ai.domain.AiInsight
import com.fitconnect.android.ai.domain.AiRecommendation
import com.fitconnect.android.ai.domain.Confidence
import com.fitconnect.android.ai.domain.InsightKind
import com.fitconnect.android.ai.domain.RecommendationKind

/**
 * Structured, overrideable recommendations derived from grounded insights.
 * Never silently mutates plans — proposals only.
 */
class RecommendationEngine(private val nowProvider: () -> Long = System::currentTimeMillis) {
    private var seq = 0L

    fun fromInsights(insights: List<AiInsight>): List<AiRecommendation> {
        val out = mutableListOf<AiRecommendation>()
        for (insight in insights) {
            when {
                insight.kind == InsightKind.CONCERN && insight.confidence != Confidence.INSUFFICIENT_DATA -> {
                    out += rec(
                        RecommendationKind.TRAINING_ADJUSTMENT,
                        "Consider reducing today's intensity",
                        reason = insight.summary,
                        evidence = insight.evidence,
                        benefit = "Lower acute strain while recovery signals are soft",
                        risk = "Under-training if signals are noise",
                        alternative = "Keep planned session but shorten intervals",
                        confidence = insight.confidence,
                    )
                    out += rec(
                        RecommendationKind.RECOVERY_ACTION,
                        "Prioritize sleep and easy movement",
                        reason = insight.summary,
                        evidence = insight.evidence,
                        benefit = "Support recovery before key sessions",
                        risk = "Opportunity cost vs planned intensity",
                        alternative = "Ask coach for a guided recovery session",
                        confidence = insight.confidence,
                    )
                }
                insight.kind == InsightKind.PROGRAM && (insight.recommendedAction != null) -> {
                    out += rec(
                        RecommendationKind.COACH_CONTACT,
                        "Discuss program adherence with coach",
                        reason = insight.summary,
                        evidence = insight.evidence,
                        benefit = "Aligned plan and accountability",
                        risk = "None significant",
                        alternative = "Self-review missed sessions first",
                        confidence = insight.confidence,
                    )
                }
                insight.kind == InsightKind.COMPETITION -> {
                    out += rec(
                        RecommendationKind.SESSION_PREPARATION,
                        "Confirm race-week plan",
                        reason = insight.summary,
                        evidence = insight.evidence,
                        benefit = "Arrive tapered and prepared",
                        risk = "Overthinking logistics",
                        alternative = "Follow existing program race week as written",
                        confidence = insight.confidence,
                    )
                }
                insight.confidence == Confidence.INSUFFICIENT_DATA -> {
                    out += rec(
                        RecommendationKind.MONITORING,
                        "Sync data before acting on AI advice",
                        reason = insight.summary,
                        evidence = insight.evidence,
                        benefit = "Avoid decisions on missing inputs",
                        risk = "Delay",
                        alternative = "Ask coach without AI",
                        confidence = Confidence.INSUFFICIENT_DATA,
                    )
                }
            }
        }
        return out
    }

    private fun rec(
        kind: RecommendationKind,
        title: String,
        reason: String,
        evidence: List<com.fitconnect.android.ai.domain.Evidence>,
        benefit: String,
        risk: String,
        alternative: String,
        confidence: Confidence,
    ) = AiRecommendation(
        id = "rec-${++seq}",
        kind = kind,
        title = title,
        reason = reason,
        evidence = evidence,
        expectedBenefit = benefit,
        potentialRisk = risk,
        alternative = alternative,
        confidence = confidence,
        timestampEpochMs = nowProvider(),
        overrideable = true,
    )
}
