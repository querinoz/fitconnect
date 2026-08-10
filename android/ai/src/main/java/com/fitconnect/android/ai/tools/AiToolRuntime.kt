package com.fitconnect.android.ai.tools

import com.fitconnect.android.ai.audit.AiAuditLog
import com.fitconnect.android.ai.integration.AiCommunityPort
import com.fitconnect.android.ai.integration.AiProgramPort
import com.fitconnect.android.ai.integration.AiSessionPort
import com.fitconnect.android.ai.integration.AiSportsPort
import com.fitconnect.android.ai.integration.AiTelemetryPort
import com.fitconnect.android.ai.permissions.AiPermissionGate
import com.fitconnect.android.ai.permissions.AiPrincipal
import com.fitconnect.android.ai.domain.AiRole
import kotlinx.coroutines.withTimeout

data class ToolResult(
    val ok: Boolean,
    val payload: String,
    val error: String? = null,
)

/**
 * Controlled tool runtime. Every call is authorized, timed, audited.
 * Write tools are rejected — AI may only propose actions elsewhere.
 */
class AiToolRuntime(
    private val gate: AiPermissionGate,
    private val telemetry: AiTelemetryPort,
    private val programs: AiProgramPort,
    private val sports: AiSportsPort,
    private val sessions: AiSessionPort,
    private val community: AiCommunityPort,
    private val audit: AiAuditLog,
    private val timeoutMs: Long = 5_000,
) {
    suspend fun invoke(
        principal: AiPrincipal,
        toolName: String,
        targetAthleteId: String?,
        args: Map<String, String> = emptyMap(),
    ): ToolResult {
        // Bind athlete SELF target before authz so null cannot fail open.
        val boundTarget = when (principal.role) {
            AiRole.ATHLETE -> targetAthleteId ?: principal.userId
            else -> targetAthleteId
        }
        val auth = gate.authorize(principal, toolName, boundTarget)
        if (auth is AiPermissionGate.AuthzResult.Denied) {
            audit.toolDenied(principal.userId, toolName, auth.reason)
            return ToolResult(ok = false, payload = "", error = auth.reason)
        }
        return try {
            withTimeout(timeoutMs) {
                val athleteId = boundTarget ?: principal.userId
                val payload = when (toolName) {
                    "getAthleteProfile" -> "athleteId=$athleteId"
                    "getTelemetrySummary" -> telemetry.summary(athleteId)?.toEvidence()
                        ?.joinToString("; ") { "${it.metricKey}=${it.value}" }
                        ?: "UNAVAILABLE"
                    "getRecoverySummary" -> telemetry.summary(athleteId)?.let {
                        "readiness=${it.readinessScore} hrv=${it.hrvMs} sleep=${it.sleepMinutes}"
                    } ?: "UNAVAILABLE"
                    "getProgramProgress" -> programs.progress(athleteId)?.let {
                        "program=${it.title} week=${it.week} completion=${it.completionPercent}% next=${it.nextSessionTitle}"
                    } ?: "UNAVAILABLE"
                    "getUpcomingSessions" -> sessions.sessions(athleteId)?.upcomingTitles?.joinToString()
                        ?: "UNAVAILABLE"
                    "getGoals" -> sports.profile(athleteId)?.goalSummary ?: "UNAVAILABLE"
                    "getSportProfile" -> sports.profile(athleteId)?.primarySportKey ?: "UNAVAILABLE"
                    "getCompetitionCalendar" -> sports.profile(athleteId)?.upcomingCompetition ?: "UNAVAILABLE"
                    "getCoachNotes" -> args["notes"] ?: "UNAVAILABLE"
                    "getAvailability" -> args["availability"] ?: "UNAVAILABLE"
                    "getTrainingHistory" -> sessions.sessions(athleteId)?.let {
                        "recentCompleted=${it.recentCompleted}"
                    } ?: "UNAVAILABLE"
                    "getRelevantCommunityContext" -> community.relevantPublic(athleteId)
                        .joinToString(" | ").ifBlank { "none" }
                    else -> return@withTimeout ToolResult(false, "", "Unhandled tool")
                }
                audit.toolOk(principal.userId, toolName, athleteId)
                ToolResult(true, payload)
            }
        } catch (e: Exception) {
            audit.toolDenied(principal.userId, toolName, e.message ?: "error")
            ToolResult(false, "", e.message)
        }
    }
}
