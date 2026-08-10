package com.fitconnect.android.coach.ai

import com.fitconnect.android.ai.assistant.AiPerformanceEngine
import com.fitconnect.android.ai.domain.AiRole
import com.fitconnect.android.ai.domain.InsightKind
import com.fitconnect.android.ai.permissions.AiPrincipal
import com.fitconnect.android.foundation.common.AppResult

/**
 * Live CoachAiPort backed by the AI Performance Engine.
 * Replaces ArchitectureCoachAiPort empty stubs.
 */
class EngineCoachAiPort(
    private val engine: AiPerformanceEngine,
    private val coachId: String = "coach-1",
    private val assignedAthletes: () -> Set<String> = { setOf("a1", "ath-1") },
) : CoachAiPort {
    override suspend fun trainingSuggestions(athleteId: String): AppResult<List<TrainingSuggestion>> {
        if (athleteId !in assignedAthletes()) {
            return AppResult.Ok(emptyList())
        }
        val brief = engine.coachAthleteSummary(coachId, athleteId, assignedAthletes())
        return AppResult.Ok(
            brief.recommendations.map {
                TrainingSuggestion(athleteId, it.title, it.reason)
            },
        )
    }

    override suspend fun riskDetection(rosterIds: List<String>): AppResult<List<RiskSignal>> {
        val assigned = assignedAthletes()
        val signals = mutableListOf<RiskSignal>()
        for (id in rosterIds.filter { it in assigned }) {
            val brief = engine.coachAthleteSummary(coachId, id, assigned)
            brief.insights.filter { it.kind == InsightKind.CONCERN }.forEach { ins ->
                signals += RiskSignal(id, ins.confidence.name, ins.summary)
            }
        }
        return AppResult.Ok(signals)
    }

    override suspend fun recoveryAlerts(rosterIds: List<String>): AppResult<List<String>> {
        val risks = riskDetection(rosterIds)
        return when (risks) {
            is AppResult.Ok -> AppResult.Ok(risks.value.map { "${it.athleteId}: ${it.reason}" })
            is AppResult.Err -> risks
        }
    }

    override suspend fun sessionRecommendations(dayEpochMs: Long): AppResult<List<SessionRecommendation>> {
        val assigned = assignedAthletes()
        val first = assigned.firstOrNull() ?: return AppResult.Ok(emptyList())
        val brief = engine.coachAthleteSummary(coachId, first, assigned)
        return AppResult.Ok(
            brief.recommendations
                .filter { it.title.contains("session", ignoreCase = true) || it.kind.name.contains("SESSION") }
                .map { SessionRecommendation(null, it.title + " — " + it.reason) },
        )
    }

    override suspend fun loadAdjustments(athleteId: String): AppResult<String> {
        if (athleteId !in assignedAthletes()) {
            return AppResult.Ok("Unauthorized athlete")
        }
        val brief = engine.coachAthleteSummary(coachId, athleteId, assignedAthletes())
        val text = brief.recommendations.firstOrNull()?.let { "${it.title}: ${it.reason}" }
            ?: brief.summary.body
        return AppResult.Ok(text)
    }

    override suspend fun naturalLanguageSearch(query: String): AppResult<List<String>> {
        val assigned = assignedAthletes()
        val first = assigned.firstOrNull() ?: return AppResult.Ok(emptyList())
        val response = engine.ask(
            AiPrincipal(coachId, AiRole.COACH, assigned),
            first,
            query,
            sessionId = "coach-nl",
        )
        if (response.refused && response.refusalReason == "UNAUTHORIZED") {
            return AppResult.Ok(listOf(response.message))
        }
        return AppResult.Ok(listOf(response.message) + response.insights.map { it.title })
    }
}
