package com.fitconnect.android.ai.di

import com.fitconnect.android.ai.actions.ActionProposalService
import com.fitconnect.android.ai.assistant.AiPerformanceEngine
import com.fitconnect.android.ai.audit.AiAuditLog
import com.fitconnect.android.ai.context.ContextEngine
import com.fitconnect.android.ai.cost.AiCostController
import com.fitconnect.android.ai.evaluation.AiEvaluationSuite
import com.fitconnect.android.ai.feedback.AiFeedbackStore
import com.fitconnect.android.ai.insights.InsightEngine
import com.fitconnect.android.ai.integration.AiCommunityPort
import com.fitconnect.android.ai.integration.AiProgramPort
import com.fitconnect.android.ai.integration.AiSessionPort
import com.fitconnect.android.ai.integration.AiSportsPort
import com.fitconnect.android.ai.integration.AiTelemetryPort
import com.fitconnect.android.ai.integration.EmptyAiCommunityPort
import com.fitconnect.android.ai.integration.EmptyAiProgramPort
import com.fitconnect.android.ai.integration.EmptyAiSessionPort
import com.fitconnect.android.ai.integration.EmptyAiSportsPort
import com.fitconnect.android.ai.integration.EmptyAiTelemetryPort
import com.fitconnect.android.ai.memory.AiMemoryStore
import com.fitconnect.android.ai.permissions.AiPermissionGate
import com.fitconnect.android.ai.privacy.HealthDataPolicy
import com.fitconnect.android.ai.provider.AiProvider
import com.fitconnect.android.ai.provider.FallbackAiProvider
import com.fitconnect.android.ai.provider.GroundedLocalAiProvider
import com.fitconnect.android.ai.provider.UnavailableAiProvider
import com.fitconnect.android.ai.recommendations.RecommendationEngine
import com.fitconnect.android.ai.retrieval.KnowledgeDoc
import com.fitconnect.android.ai.retrieval.RetrievalEngine
import com.fitconnect.android.ai.domain.KnowledgeSourceKind
import com.fitconnect.android.ai.safety.AiSafetyLayer
import com.fitconnect.android.ai.tools.AiToolRuntime
import com.fitconnect.android.foundation.network.ConnectivityMonitor

interface AiContainer {
    val engine: AiPerformanceEngine
    val provider: AiProvider
    val insights: InsightEngine
    val recommendations: RecommendationEngine
    val actions: ActionProposalService
    val feedback: AiFeedbackStore
    val audit: AiAuditLog
    val cost: AiCostController
    val evaluation: AiEvaluationSuite
    val memory: AiMemoryStore
    val retrieval: RetrievalEngine
    val safety: AiSafetyLayer
    val tools: AiToolRuntime
    val permissions: AiPermissionGate
}

class DefaultAiContainer(
    connectivity: ConnectivityMonitor,
    telemetryPort: AiTelemetryPort = EmptyAiTelemetryPort(),
    programPort: AiProgramPort = EmptyAiProgramPort(),
    sportsPort: AiSportsPort = EmptyAiSportsPort(),
    sessionPort: AiSessionPort = EmptyAiSessionPort(),
    communityPort: AiCommunityPort = EmptyAiCommunityPort(),
    provider: AiProvider = FallbackAiProvider(
        primary = GroundedLocalAiProvider(),
        fallbacks = listOf(UnavailableAiProvider()),
    ),
) : AiContainer {
    override val provider: AiProvider = provider
    override val safety = AiSafetyLayer()
    override val permissions = AiPermissionGate(AiPermissionGate.defaultRegistry())
    override val audit = AiAuditLog()
    override val cost = AiCostController()
    override val feedback = AiFeedbackStore()
    override val memory = AiMemoryStore()
    override val retrieval = RetrievalEngine().also { engine ->
        engine.upsert(
            KnowledgeDoc(
                id = "doc-readiness",
                title = "Understanding readiness",
                section = "education",
                body = "Readiness is computed by FitConnect Athlete/Telemetry engines. AI explains values; it does not recompute them.",
                kind = KnowledgeSourceKind.SYSTEM_KNOWLEDGE,
                ownerId = null,
                version = "1",
                updatedAtEpochMs = System.currentTimeMillis(),
                permissions = setOf("public"),
            ),
        )
    }
    override val evaluation = AiEvaluationSuite()
    override val insights = InsightEngine()
    override val recommendations = RecommendationEngine()
    override val actions = ActionProposalService()

    private val healthPolicy = HealthDataPolicy()
    private val contextEngine = ContextEngine(
        telemetry = telemetryPort,
        programs = programPort,
        sports = sportsPort,
        sessions = sessionPort,
        community = communityPort,
        healthPolicy = healthPolicy,
    )

    override val tools = AiToolRuntime(
        gate = permissions,
        telemetry = telemetryPort,
        programs = programPort,
        sports = sportsPort,
        sessions = sessionPort,
        community = communityPort,
        audit = audit,
    )

    override val engine = AiPerformanceEngine(
        provider = provider,
        contextEngine = contextEngine,
        insights = insights,
        recommendations = recommendations,
        actions = actions,
        tools = tools,
        safety = safety,
        cost = cost,
        audit = audit,
        memory = memory,
        retrieval = retrieval,
        connectivity = connectivity,
    )
}
