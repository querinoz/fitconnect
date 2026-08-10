package com.fitconnect.android.ai.integration

import com.fitconnect.android.ai.assistant.AiPerformanceEngine
import com.fitconnect.android.ai.domain.AiRole
import com.fitconnect.android.ai.permissions.AiPrincipal
import com.fitconnect.android.foundation.common.AppResult

/**
 * Adapter bridging legacy Coach AI port shapes without coupling :coach to
 * provider SDKs. :coach keeps its own CoachAiPort interface; :app wires this.
 */
class CoachAiBridge(
    private val engine: AiPerformanceEngine,
    private val coachId: String,
    private val assignedAthletes: () -> Set<String>,
) {
    suspend fun trainingSuggestions(athleteId: String): AppResult<List<Pair<String, String>>> {
        val brief = engine.coachAthleteSummary(coachId, athleteId, assignedAthletes())
        return AppResult.Ok(
            brief.recommendations.map { it.title to it.reason },
        )
    }

    suspend fun riskSignals(rosterIds: List<String>): AppResult<List<Triple<String, String, String>>> {
        val assigned = assignedAthletes()
        val out = mutableListOf<Triple<String, String, String>>()
        for (id in rosterIds.filter { it in assigned }) {
            val brief = engine.coachAthleteSummary(coachId, id, assigned)
            brief.insights.filter { it.kind.name == "CONCERN" }.forEach { ins ->
                out += Triple(id, ins.confidence.name, ins.summary)
            }
        }
        return AppResult.Ok(out)
    }

    suspend fun naturalLanguageSearch(query: String): AppResult<List<String>> {
        val assigned = assignedAthletes()
        val first = assigned.firstOrNull() ?: return AppResult.Ok(emptyList())
        val response = engine.ask(
            AiPrincipal(coachId, AiRole.COACH, assigned),
            first,
            query,
            sessionId = "coach-search",
        )
        return AppResult.Ok(listOf(response.message) + response.insights.map { it.title })
    }
}
