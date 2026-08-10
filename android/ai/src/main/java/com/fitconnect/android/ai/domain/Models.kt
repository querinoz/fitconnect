package com.fitconnect.android.ai.domain

/**
 * Canonical AI domain. AI is never a source of truth — every insight and
 * recommendation must cite [Evidence] drawn from authoritative engines.
 */

enum class Confidence { HIGH, MEDIUM, LOW, INSUFFICIENT_DATA }

enum class InsightKind {
    RECOVERY,
    TRAINING,
    PERFORMANCE,
    CONSISTENCY,
    PROGRAM,
    COMPETITION,
    BEHAVIORAL,
    CONCERN,
    POSITIVE,
}

enum class RecommendationKind {
    TRAINING_ADJUSTMENT,
    RECOVERY_ACTION,
    SESSION_PREPARATION,
    PROGRAM_MODIFICATION,
    COACH_CONTACT,
    EDUCATION,
    REST,
    MONITORING,
}

enum class AiRole { ATHLETE, COACH, SYSTEM }

enum class ActionDecision { ACCEPT, DISMISS, ASK_WHY, ASK_COACH, MODIFY, REJECT, IGNORE }

enum class FeedbackLabel {
    HELPFUL,
    NOT_HELPFUL,
    INCORRECT,
    NOT_RELEVANT,
    TOO_GENERIC,
    UNSAFE,
    REPORT,
}

enum class KnowledgeSourceKind {
    FITCONNECT_DATA,
    USER_DATA,
    COACH_CONTENT,
    SYSTEM_KNOWLEDGE,
    MODEL_KNOWLEDGE,
}

data class Evidence(
    val claim: String,
    val sourceEngine: String,
    val metricKey: String? = null,
    val value: String? = null,
    val observedAtEpochMs: Long? = null,
)

data class AiInsight(
    val id: String,
    val kind: InsightKind,
    val title: String,
    val summary: String,
    val evidence: List<Evidence>,
    val dataSources: List<String>,
    val confidence: Confidence,
    val timestampEpochMs: Long,
    val recommendedAction: String?,
    val limitations: List<String>,
)

data class AiRecommendation(
    val id: String,
    val kind: RecommendationKind,
    val title: String,
    val reason: String,
    val evidence: List<Evidence>,
    val expectedBenefit: String,
    val potentialRisk: String,
    val alternative: String,
    val confidence: Confidence,
    val timestampEpochMs: Long,
    val overrideable: Boolean = true,
)

data class AiActionProposal(
    val id: String,
    val title: String,
    val description: String,
    val impact: String,
    val requiresHumanApproval: Boolean = true,
    val evidence: List<Evidence> = emptyList(),
)

data class AiSummary(
    val title: String,
    val body: String,
    val evidence: List<Evidence>,
    val confidence: Confidence,
    val limitations: List<String>,
    val timestampEpochMs: Long,
)

data class AiConversationResponse(
    val message: String,
    val insights: List<AiInsight> = emptyList(),
    val recommendations: List<AiRecommendation> = emptyList(),
    val proposals: List<AiActionProposal> = emptyList(),
    val refused: Boolean = false,
    val refusalReason: String? = null,
    val confidence: Confidence,
    val promptVersion: String,
    val modelId: String,
)

data class TokenUsage(
    val promptTokens: Int,
    val completionTokens: Int,
) {
    val total: Int get() = promptTokens + completionTokens
}

data class ModelMetadata(
    val id: String,
    val provider: String,
    val supportsStreaming: Boolean,
    val supportsTools: Boolean,
    val supportsStructuredOutput: Boolean,
)
