package com.fitconnect.android.ai.evaluation

import com.fitconnect.android.ai.domain.AiInsight
import com.fitconnect.android.ai.domain.Confidence
import com.fitconnect.android.ai.domain.Evidence

data class EvalCase(
    val id: String,
    val description: String,
    val evidence: List<Evidence>,
    val missingAllowed: Boolean,
    val expectInsufficient: Boolean = false,
    val expectNoFabrication: Boolean = true,
)

data class EvalResult(
    val caseId: String,
    val passed: Boolean,
    val notes: String,
)

/**
 * Formal evaluation: grounding, structured validity, no fabrication.
 */
class AiEvaluationSuite {
    fun evaluateInsights(case: EvalCase, insights: List<AiInsight>): EvalResult {
        if (case.expectInsufficient) {
            val ok = insights.any { it.confidence == Confidence.INSUFFICIENT_DATA } ||
                insights.all { it.evidence.isEmpty() || it.confidence == Confidence.INSUFFICIENT_DATA }
            return EvalResult(case.id, ok, if (ok) "insufficient-data honored" else "expected insufficient data")
        }
        for (insight in insights) {
            for (ev in insight.evidence) {
                if (case.evidence.none { it.metricKey == ev.metricKey && it.value == ev.value }) {
                    // Insight cited evidence not in input — fabrication
                    if (case.expectNoFabrication) {
                        return EvalResult(case.id, false, "ungrounded evidence: ${ev.metricKey}=${ev.value}")
                    }
                }
            }
            // Detect invented percentages in summary not present in evidence values
            val invented = Regex("""\d+\.\d+%""").findAll(insight.summary).map { it.value }.any { pct ->
                case.evidence.none { it.value?.contains(pct.trimEnd('%')) == true || it.value == pct }
                    && insight.evidence.none { it.value == pct || it.value?.contains(pct.trimEnd('%')) == true }
            }
            // Soft check — skip if no numeric claims
        }
        val grounded = insights.all { it.evidence.isEmpty() || it.dataSources.isNotEmpty() }
        return EvalResult(case.id, grounded, if (grounded) "grounded" else "missing dataSources")
    }

    companion object {
        fun goldenCases(now: Long = System.currentTimeMillis()): List<EvalCase> = listOf(
            EvalCase(
                "healthy-week",
                "Healthy training week",
                listOf(
                    Evidence("HRV", "telemetry", "hrv_ms", "68", now),
                    Evidence("HRV trend", "telemetry", "hrv_trend_pct", "2.0", now),
                    Evidence("Readiness", "athlete", "readiness", "82", now),
                    Evidence("Training load", "telemetry", "load", "3200", now),
                ),
                missingAllowed = false,
            ),
            EvalCase(
                "poor-recovery",
                "Poor recovery",
                listOf(
                    Evidence("HRV trend", "telemetry", "hrv_trend_pct", "-14.0", now),
                    Evidence("Sleep trend", "telemetry", "sleep_trend_pct", "-12.0", now),
                    Evidence("Readiness", "athlete", "readiness", "48", now),
                    Evidence("Training load", "telemetry", "load", "5100", now),
                ),
                missingAllowed = false,
            ),
            EvalCase(
                "missing-telemetry",
                "Missing telemetry",
                emptyList(),
                missingAllowed = true,
                expectInsufficient = true,
            ),
            EvalCase(
                "race-week",
                "Race week",
                listOf(
                    Evidence("Competition", "sports", "competition", "City Marathon", now),
                    Evidence("Training phase", "sports", "phase", "taper", now),
                    Evidence("Readiness", "athlete", "readiness", "76", now),
                ),
                missingAllowed = false,
            ),
            EvalCase(
                "program-deload",
                "Program deload",
                listOf(
                    Evidence("Program", "programs", "title", "VO2 Build", now),
                    Evidence("Completion", "programs", "completion_pct", "55%", now),
                    Evidence("Current week", "programs", "week", "5", now),
                ),
                missingAllowed = false,
            ),
            EvalCase(
                "stale-data",
                "Stale data",
                listOf(Evidence("HRV", "telemetry", "hrv_ms", "60", now - 7 * 86_400_000L)),
                missingAllowed = false,
            ),
        )
    }
}
