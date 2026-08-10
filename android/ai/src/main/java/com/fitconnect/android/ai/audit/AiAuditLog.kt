package com.fitconnect.android.ai.audit

/**
 * AI audit log — records operational metadata without dumping sensitive prompt
 * bodies. Feedback and safety classifications are retained for evaluation.
 */
data class AiAuditEvent(
    val atEpochMs: Long,
    val userId: String,
    val feature: String,
    val role: String,
    val modelId: String? = null,
    val latencyMs: Long? = null,
    val success: Boolean,
    val safetyClass: String? = null,
    val toolName: String? = null,
    val detail: String? = null,
)

class AiAuditLog(
    private val nowProvider: () -> Long = System::currentTimeMillis,
    private val maxEvents: Int = com.fitconnect.android.foundation.perf.PerformanceBudget.AI_AUDIT_RING,
) {
    private val events = ArrayDeque<AiAuditEvent>()

    @Synchronized
    fun record(event: AiAuditEvent) {
        events.addLast(event)
        while (events.size > maxEvents) events.removeFirst()
    }

    fun toolOk(userId: String, tool: String, athleteId: String) = record(
        AiAuditEvent(
            atEpochMs = nowProvider(),
            userId = userId,
            feature = "tool",
            role = "",
            success = true,
            toolName = tool,
            detail = "athlete=$athleteId",
        ),
    )

    fun toolDenied(userId: String, tool: String, reason: String) = record(
        AiAuditEvent(
            atEpochMs = nowProvider(),
            userId = userId,
            feature = "tool",
            role = "",
            success = false,
            toolName = tool,
            detail = reason.take(120),
        ),
    )

    @Synchronized
    fun snapshot(): List<AiAuditEvent> = events.toList()
}
