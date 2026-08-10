package com.fitconnect.android.ai.context

import com.fitconnect.android.ai.domain.AiRole
import com.fitconnect.android.ai.domain.Evidence
import com.fitconnect.android.ai.integration.AiCommunityPort
import com.fitconnect.android.ai.integration.AiProgramPort
import com.fitconnect.android.ai.integration.AiSessionPort
import com.fitconnect.android.ai.integration.AiSportsPort
import com.fitconnect.android.ai.integration.AiTelemetryPort
import com.fitconnect.android.ai.permissions.AiPrincipal
import com.fitconnect.android.ai.privacy.HealthDataPolicy
import com.fitconnect.android.ai.safety.AiSafetyLayer

data class AthleteContextBundle(
    val athleteId: String,
    val evidence: List<Evidence>,
    val availableKeys: List<String>,
    val missingKeys: List<String>,
    val stale: Boolean,
    val communityUntrusted: List<String>,
    val asOfEpochMs: Long,
) {
    fun toPromptBlock(safety: AiSafetyLayer): String = buildString {
        appendLine("AVAILABLE: ${availableKeys.joinToString(", ").ifBlank { "none" }}")
        appendLine("MISSING: ${missingKeys.joinToString(", ").ifBlank { "none" }}")
        if (stale) appendLine("STALE: true — do not present as current without noting timestamp.")
        appendLine("AS_OF_EPOCH_MS: $asOfEpochMs")
        evidence.forEach { e ->
            appendLine("EVIDENCE: ${e.claim} | source=${e.sourceEngine} | ${e.metricKey}=${e.value}")
        }
        communityUntrusted.forEach { blob ->
            append(safety.quarantine("community", blob))
        }
    }
}

/**
 * Builds minimum-necessary athlete context from authoritative ports.
 * Filters by authorization, sensitivity, staleness and relevance.
 */
class ContextEngine(
    private val telemetry: AiTelemetryPort,
    private val programs: AiProgramPort,
    private val sports: AiSportsPort,
    private val sessions: AiSessionPort,
    private val community: AiCommunityPort,
    private val healthPolicy: HealthDataPolicy,
    private val nowProvider: () -> Long = System::currentTimeMillis,
    private val staleAfterMs: Long = 36 * 3_600_000L,
) {
    suspend fun build(principal: AiPrincipal, athleteId: String, includeCommunity: Boolean = false): AthleteContextBundle {
        authorize(principal, athleteId)
        val now = nowProvider()
        val evidence = mutableListOf<Evidence>()
        val available = mutableListOf<String>()
        val missing = mutableListOf<String>()
        var asOf = now
        var stale = false

        val tel = telemetry.summary(athleteId)
        if (tel == null) {
            missing += listOf("hrv", "sleep", "training_load", "readiness")
        } else {
            asOf = minOf(asOf, tel.asOfEpochMs)
            stale = stale || (now - tel.asOfEpochMs > staleAfterMs)
            val allowed = if (healthPolicy.mayIncludeHealth(principal, athleteId)) {
                tel.toEvidence()
            } else {
                emptyList()
            }
            if (allowed.isEmpty()) {
                missing += "health_redacted"
            } else {
                evidence += allowed
                available += allowed.mapNotNull { it.metricKey }
            }
            tel.dataQuality?.let {
                evidence += Evidence("Data quality", "telemetry", "quality", it, tel.asOfEpochMs)
            }
        }

        val prog = programs.progress(athleteId)
        if (prog == null || prog.programId == null) {
            missing += "program"
        } else {
            evidence += prog.toEvidence()
            available += listOfNotNull("program", prog.week?.let { "week" }, "completion")
            asOf = minOf(asOf, prog.asOfEpochMs)
        }

        val sport = sports.profile(athleteId)
        if (sport == null || sport.primarySportKey == null) {
            missing += "sport"
        } else {
            evidence += sport.toEvidence()
            available += listOfNotNull("sport", sport.goalSummary?.let { "goal" }, sport.phase?.let { "phase" })
            asOf = minOf(asOf, sport.asOfEpochMs)
        }

        val sess = sessions.sessions(athleteId)
        if (sess == null) {
            missing += "sessions"
        } else {
            evidence += sess.toEvidence()
            available += "sessions"
            asOf = minOf(asOf, sess.asOfEpochMs)
        }

        val communityBlobs = if (includeCommunity) community.relevantPublic(athleteId) else emptyList()

        return AthleteContextBundle(
            athleteId = athleteId,
            evidence = evidence,
            availableKeys = available.distinct(),
            missingKeys = missing.distinct(),
            stale = stale,
            communityUntrusted = communityBlobs,
            asOfEpochMs = asOf,
        )
    }

    private fun authorize(principal: AiPrincipal, athleteId: String) {
        when (principal.role) {
            AiRole.ATHLETE -> require(principal.userId == athleteId) {
                "Athlete may only build context for self"
            }
            AiRole.COACH -> require(athleteId in principal.assignedAthleteIds) {
                "Coach not assigned to $athleteId"
            }
            AiRole.SYSTEM -> Unit
        }
    }
}
