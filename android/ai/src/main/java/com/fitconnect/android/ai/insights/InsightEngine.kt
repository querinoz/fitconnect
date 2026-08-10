package com.fitconnect.android.ai.insights

import com.fitconnect.android.ai.context.AthleteContextBundle
import com.fitconnect.android.ai.domain.AiInsight
import com.fitconnect.android.ai.domain.Confidence
import com.fitconnect.android.ai.domain.Evidence
import com.fitconnect.android.ai.domain.InsightKind

/**
 * Structured insights grounded solely in context evidence.
 * Never invents numbers — if evidence is missing, confidence is INSUFFICIENT_DATA.
 */
class InsightEngine(private val nowProvider: () -> Long = System::currentTimeMillis) {
    private var seq = 0L

    fun fromContext(bundle: AthleteContextBundle): List<AiInsight> {
        val insights = mutableListOf<AiInsight>()
        val e = bundle.evidence
        val hrvTrend = e.valueOf("hrv_trend_pct")?.toDoubleOrNull()
        val sleepTrend = e.valueOf("sleep_trend_pct")?.toDoubleOrNull()
        val load = e.valueOf("load")?.toDoubleOrNull()
        val readiness = e.valueOf("readiness")?.toIntOrNull()
        val completion = e.valueOf("completion_pct")?.trimEnd('%')?.toIntOrNull()

        if (hrvTrend == null && sleepTrend == null && readiness == null) {
            insights += insight(
                InsightKind.RECOVERY,
                "Recovery data unavailable",
                "Authorized telemetry for recovery is missing. Sync devices or grant sharing.",
                emptyList(),
                Confidence.INSUFFICIENT_DATA,
                recommendedAction = "Open Telemetry Center and sync",
                limitations = listOf("No HRV/sleep/readiness evidence in context"),
            )
        } else {
            val recoveryEvidence = e.filter {
                it.metricKey in setOf("hrv_ms", "hrv_trend_pct", "sleep_min", "sleep_trend_pct", "readiness", "rhr")
            }
            val concern = (hrvTrend != null && hrvTrend <= -10.0) ||
                (sleepTrend != null && sleepTrend <= -10.0) ||
                (readiness != null && readiness < 55)
            insights += insight(
                kind = if (concern) InsightKind.CONCERN else InsightKind.RECOVERY,
                title = if (concern) "Recovery needs attention" else "Recovery snapshot",
                summary = buildString {
                    readiness?.let { append("Readiness $it. ") }
                    hrvTrend?.let { append("HRV trend ${"%.1f".format(it)}%. ") }
                    sleepTrend?.let { append("Sleep trend ${"%.1f".format(it)}%. ") }
                    if (concern) append("Consider reducing intensity and prioritizing sleep.")
                    else append("No strong negative recovery signals in available data.")
                },
                evidence = recoveryEvidence,
                confidence = confidenceFor(recoveryEvidence, bundle.stale),
                recommendedAction = if (concern) "Reduce today's intensity or rest" else "Proceed with planned session unless coach advises otherwise",
                limitations = limitations(bundle, recoveryEvidence),
            )
        }

        if (load != null) {
            val loadEvidence = e.filter { it.metricKey == "load" }
            insights += insight(
                InsightKind.TRAINING,
                "Training load",
                "Reported training load is ${"%.0f".format(load)} (from Telemetry Engine).",
                loadEvidence,
                confidenceFor(loadEvidence, bundle.stale),
                recommendedAction = if (load > 4500) "Monitor fatigue; discuss deload with coach" else null,
                limitations = limitations(bundle, loadEvidence),
            )
        }

        if (completion != null) {
            val progEvidence = e.filter { it.sourceEngine == "programs" }
            insights += insight(
                InsightKind.PROGRAM,
                "Program progress",
                "Program completion is $completion% as reported by the Programs Engine.",
                progEvidence,
                confidenceFor(progEvidence, bundle.stale),
                recommendedAction = if (completion < 40) "Review missed sessions with coach" else null,
                limitations = limitations(bundle, progEvidence),
            )
        }

        e.valueOf("competition")?.let { race ->
            insights += insight(
                InsightKind.COMPETITION,
                "Competition context",
                "Upcoming: $race",
                e.filter { it.metricKey == "competition" },
                Confidence.MEDIUM,
                recommendedAction = "Align load with race-week plan from Sports Engine",
                limitations = listOf("Race tactics remain coach-led"),
            )
        }

        return insights
    }

    private fun insight(
        kind: InsightKind,
        title: String,
        summary: String,
        evidence: List<Evidence>,
        confidence: Confidence,
        recommendedAction: String?,
        limitations: List<String>,
    ) = AiInsight(
        id = "ins-${++seq}",
        kind = kind,
        title = title,
        summary = summary,
        evidence = evidence,
        dataSources = evidence.map { it.sourceEngine }.distinct(),
        confidence = confidence,
        timestampEpochMs = nowProvider(),
        recommendedAction = recommendedAction,
        limitations = limitations,
    )

    private fun confidenceFor(evidence: List<Evidence>, stale: Boolean): Confidence {
        if (evidence.isEmpty()) return Confidence.INSUFFICIENT_DATA
        if (stale) return Confidence.LOW
        return when {
            evidence.size >= 3 -> Confidence.HIGH
            evidence.size == 2 -> Confidence.MEDIUM
            else -> Confidence.LOW
        }
    }

    private fun limitations(bundle: AthleteContextBundle, evidence: List<Evidence>): List<String> = buildList {
        if (bundle.stale) add("Context may be stale (asOf=${bundle.asOfEpochMs})")
        if (bundle.missingKeys.isNotEmpty()) add("Missing: ${bundle.missingKeys.joinToString()}")
        if (evidence.isEmpty()) add("No supporting evidence")
        add("AI does not recompute HRV, readiness or training load")
    }

    private fun List<Evidence>.valueOf(key: String): String? = firstOrNull { it.metricKey == key }?.value
}
