package com.fitconnect.android.ai.assistant

import com.fitconnect.android.ai.actions.ActionProposalService
import com.fitconnect.android.ai.audit.AiAuditEvent
import com.fitconnect.android.ai.audit.AiAuditLog
import com.fitconnect.android.ai.context.ContextEngine
import com.fitconnect.android.ai.cost.AiCostController
import com.fitconnect.android.ai.domain.AiConversationResponse
import com.fitconnect.android.ai.domain.AiRole
import com.fitconnect.android.ai.domain.AiSummary
import com.fitconnect.android.ai.domain.Confidence
import com.fitconnect.android.ai.insights.InsightEngine
import com.fitconnect.android.ai.memory.AiMemoryStore
import com.fitconnect.android.ai.permissions.AiPrincipal
import com.fitconnect.android.ai.prompts.PromptCatalog
import com.fitconnect.android.ai.provider.AiGenerateRequest
import com.fitconnect.android.ai.provider.AiMessage
import com.fitconnect.android.ai.provider.AiProvider
import com.fitconnect.android.ai.provider.AiProviderException
import com.fitconnect.android.ai.provider.AiProviderFailure
import com.fitconnect.android.ai.recommendations.RecommendationEngine
import com.fitconnect.android.ai.retrieval.RetrievalEngine
import com.fitconnect.android.ai.safety.AiSafetyLayer
import com.fitconnect.android.ai.tools.AiToolRuntime
import com.fitconnect.android.foundation.network.ConnectivityMonitor

data class MorningBrief(
    val summary: AiSummary,
    val insights: List<com.fitconnect.android.ai.domain.AiInsight>,
    val recommendations: List<com.fitconnect.android.ai.domain.AiRecommendation>,
    val offline: Boolean,
)

/**
 * Athlete + Coach assistants share one grounded runtime.
 * Offline: returns cached/previous structured insights with clear timestamps —
 * never presents stale advice as current without labeling.
 */
class AiPerformanceEngine(
    private val provider: AiProvider,
    private val contextEngine: ContextEngine,
    private val insights: InsightEngine,
    private val recommendations: RecommendationEngine,
    private val actions: ActionProposalService,
    private val tools: AiToolRuntime,
    private val safety: AiSafetyLayer,
    private val cost: AiCostController,
    private val audit: AiAuditLog,
    private val memory: AiMemoryStore,
    private val retrieval: RetrievalEngine,
    private val connectivity: ConnectivityMonitor,
    private val nowProvider: () -> Long = System::currentTimeMillis,
) {
    private val lastBriefs = mutableMapOf<String, MorningBrief>()

    suspend fun athleteMorningBrief(athleteId: String): MorningBrief {
        val principal = AiPrincipal(athleteId, AiRole.ATHLETE)
        return brief(principal, athleteId, feature = "athlete_morning_brief")
    }

    suspend fun coachAthleteSummary(coachId: String, athleteId: String, assigned: Set<String>): MorningBrief {
        val principal = AiPrincipal(coachId, AiRole.COACH, assignedAthleteIds = assigned)
        return brief(principal, athleteId, feature = "coach_athlete_summary")
    }

    suspend fun ask(
        principal: AiPrincipal,
        athleteId: String,
        question: String,
        sessionId: String,
    ): AiConversationResponse {
        val safetyVerdict = safety.classify(question)
        if (!safetyVerdict.allowed) {
            audit.record(
                AiAuditEvent(
                    nowProvider(), principal.userId, "ask", principal.role.name,
                    success = false, safetyClass = safetyVerdict.classification.name,
                ),
            )
            return AiConversationResponse(
                message = safetyVerdict.userMessage ?: "Request refused.",
                refused = true,
                refusalReason = safetyVerdict.classification.name,
                confidence = Confidence.HIGH,
                promptVersion = PromptCatalog.VERSION,
                modelId = provider.metadata.id,
            )
        }
        if (!cost.allowRequest(principal.userId)) {
            return AiConversationResponse(
                message = "AI rate or budget limit reached. Try again later.",
                refused = true,
                refusalReason = "RATE_OR_BUDGET",
                confidence = Confidence.HIGH,
                promptVersion = PromptCatalog.VERSION,
                modelId = provider.metadata.id,
            )
        }

        val bundle = try {
            contextEngine.build(principal, athleteId, includeCommunity = true)
        } catch (e: IllegalArgumentException) {
            return AiConversationResponse(
                message = e.message ?: "Unauthorized",
                refused = true,
                refusalReason = "UNAUTHORIZED",
                confidence = Confidence.HIGH,
                promptVersion = PromptCatalog.VERSION,
                modelId = provider.metadata.id,
            )
        }

        val groundedInsights = insights.fromContext(bundle)
        val groundedRecs = recommendations.fromInsights(groundedInsights)
        val proposals = actions.proposeFrom(groundedRecs)

        // Natural-language → controlled tools (never raw SQL)
        val toolHints = mutableListOf<String>()
        val q = question.lowercase()
        if (q.contains("recovery") || q.contains("readiness")) {
            tools.invoke(principal, "getRecoverySummary", athleteId).payload.let { toolHints += it }
        }
        if (q.contains("program")) {
            tools.invoke(principal, "getProgramProgress", athleteId).payload.let { toolHints += it }
        }
        if (q.contains("missed") || q.contains("session")) {
            tools.invoke(principal, "getUpcomingSessions", athleteId).payload.let { toolHints += it }
        }

        val retrieved = retrieval.search(question, limit = 3)
            .joinToString("\n") { retrieval.provenanceLine(it) + " :: " + it.excerpt }

        val rolePrompt = if (principal.role == AiRole.COACH) PromptCatalog.COACH_ROLE else PromptCatalog.ATHLETE_ROLE
        val system = PromptCatalog.systemFor(rolePrompt)
        val contextBlock = bundle.toPromptBlock(safety) +
            "\nTOOLS:\n" + toolHints.joinToString("\n") +
            "\nRETRIEVAL:\n" + retrieved

        memory.appendSession(sessionId, "user:$question")

        if (!connectivity.online.value) {
            val cached = lastBriefs[athleteId]
            return AiConversationResponse(
                message = "AI is offline. Showing last grounded insights from " +
                    "${cached?.summary?.timestampEpochMs ?: bundle.asOfEpochMs}. " +
                    "Not presented as current.",
                insights = cached?.insights ?: groundedInsights,
                recommendations = cached?.recommendations ?: groundedRecs,
                proposals = proposals,
                confidence = Confidence.LOW,
                promptVersion = PromptCatalog.VERSION,
                modelId = "offline-cache",
            )
        }

        val cacheKey = "${principal.userId}:$athleteId:${question.hashCode()}"
        cost.cached(cacheKey)?.let { cachedText ->
            return AiConversationResponse(
                message = cachedText,
                insights = groundedInsights,
                recommendations = groundedRecs,
                proposals = proposals,
                confidence = groundedInsights.minOfOrNull { it.confidence } ?: Confidence.LOW,
                promptVersion = PromptCatalog.VERSION,
                modelId = provider.metadata.id,
            )
        }

        return try {
            val started = nowProvider()
            val response = provider.generate(
                AiGenerateRequest(
                    messages = listOf(
                        AiMessage("system", system),
                        AiMessage("system", contextBlock),
                        AiMessage("user", question),
                    ),
                ),
            )
            cost.record(principal.userId, "ask", response.modelId, response.usage, response.latencyMs)
            cost.putCache(cacheKey, response.text)
            memory.appendSession(sessionId, "assistant:${response.text.take(300)}")
            audit.record(
                AiAuditEvent(
                    nowProvider(), principal.userId, "ask", principal.role.name,
                    modelId = response.modelId, latencyMs = nowProvider() - started, success = true,
                    safetyClass = safetyVerdict.classification.name,
                ),
            )
            AiConversationResponse(
                message = response.text,
                insights = groundedInsights,
                recommendations = groundedRecs,
                proposals = proposals,
                confidence = groundedInsights.minOfOrNull { it.confidence } ?: Confidence.MEDIUM,
                promptVersion = PromptCatalog.VERSION,
                modelId = response.modelId,
            )
        } catch (e: AiProviderException) {
            audit.record(
                AiAuditEvent(
                    nowProvider(), principal.userId, "ask", principal.role.name,
                    success = false, detail = e.failure.name,
                ),
            )
            AiConversationResponse(
                message = when (e.failure) {
                    AiProviderFailure.UNAVAILABLE -> "AI provider unavailable. Grounded insights below use FitConnect data only."
                    AiProviderFailure.BUDGET_EXCEEDED -> "AI budget exceeded."
                    else -> "AI request failed (${e.failure})."
                },
                insights = groundedInsights,
                recommendations = groundedRecs,
                proposals = proposals,
                confidence = Confidence.LOW,
                promptVersion = PromptCatalog.VERSION,
                modelId = provider.metadata.id,
            )
        }
    }

    private suspend fun brief(principal: AiPrincipal, athleteId: String, feature: String): MorningBrief {
        val offline = !connectivity.online.value
        val bundle = contextEngine.build(principal, athleteId)
        val ins = insights.fromContext(bundle)
        val recs = recommendations.fromInsights(ins)
        val summary = AiSummary(
            title = if (principal.role == AiRole.COACH) "Athlete review" else "Morning brief",
            body = ins.firstOrNull()?.summary ?: "No insights available — data may be missing.",
            evidence = bundle.evidence,
            confidence = ins.minOfOrNull { it.confidence } ?: Confidence.INSUFFICIENT_DATA,
            limitations = buildList {
                if (offline) add("Generated offline / without live model")
                if (bundle.stale) add("Context stale asOf=${bundle.asOfEpochMs}")
                addAll(bundle.missingKeys.map { "Missing $it" })
            },
            timestampEpochMs = nowProvider(),
        )
        val brief = MorningBrief(summary, ins, recs, offline)
        lastBriefs[athleteId] = brief
        audit.record(
            AiAuditEvent(
                nowProvider(), principal.userId, feature, principal.role.name,
                success = true, modelId = if (offline) "local-insights" else provider.metadata.id,
            ),
        )
        return brief
    }
}
