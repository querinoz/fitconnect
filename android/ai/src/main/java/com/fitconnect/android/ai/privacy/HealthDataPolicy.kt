package com.fitconnect.android.ai.privacy

import com.fitconnect.android.ai.domain.AiRole
import com.fitconnect.android.ai.permissions.AiPrincipal

/**
 * Health data may only leave the device / enter a provider prompt when consent
 * and purpose allow it. Tokens, secrets and device credentials are never
 * included — enforced by exclusion lists in context builders.
 */
class HealthDataPolicy(
    /** Fail-closed: no health data without explicit consent record. */
    private val athleteConsent: suspend (athleteId: String) -> Boolean = { false },
) {
    private val forbiddenPromptFragments = listOf(
        "access_token", "refresh_token", "api_key", "client_secret",
        "Authorization:", "Bearer ", "password=",
    )

    suspend fun mayIncludeHealth(principal: AiPrincipal, athleteId: String): Boolean {
        if (!athleteConsent(athleteId)) return false
        return when (principal.role) {
            AiRole.ATHLETE -> principal.userId == athleteId
            AiRole.COACH -> athleteId in principal.assignedAthleteIds
            AiRole.SYSTEM -> false
        }
    }

    fun scrub(text: String): String {
        var out = text
        for (frag in forbiddenPromptFragments) {
            if (out.contains(frag, ignoreCase = true)) {
                out = out.replace(frag, "[REDACTED]", ignoreCase = true)
            }
        }
        return out
    }
}
