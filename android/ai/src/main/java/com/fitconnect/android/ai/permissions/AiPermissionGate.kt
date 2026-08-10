package com.fitconnect.android.ai.permissions

import com.fitconnect.android.ai.domain.AiRole

enum class DataScope { SELF, ASSIGNED_ATHLETES, ROSTER, PUBLIC, NONE }

enum class ToolAccess { READ, WRITE }

data class ToolPermission(
    val toolName: String,
    val allowedRoles: Set<AiRole>,
    val requiredScopes: Set<DataScope>,
    val access: ToolAccess,
    val sensitiveHealth: Boolean,
    val auditRequired: Boolean = true,
)

data class AiPrincipal(
    val userId: String,
    val role: AiRole,
    val assignedAthleteIds: Set<String> = emptySet(),
)

/**
 * Hard authorization gate for every tool call. Athlete AI may only touch self;
 * Coach AI may only touch assigned athletes. Write tools are never auto-executed
 * by the AI runtime (proposals only).
 */
class AiPermissionGate(private val registry: Map<String, ToolPermission>) {
    fun permissionFor(toolName: String): ToolPermission? = registry[toolName]

    fun authorize(principal: AiPrincipal, toolName: String, targetAthleteId: String?): AuthzResult {
        val perm = registry[toolName]
            ?: return AuthzResult.Denied("Unknown tool: $toolName")
        if (principal.role !in perm.allowedRoles) {
            return AuthzResult.Denied("Role ${principal.role} cannot call $toolName")
        }
        if (perm.access == ToolAccess.WRITE) {
            return AuthzResult.Denied("Write tools cannot be executed by AI — propose only")
        }
        when (principal.role) {
            AiRole.ATHLETE -> {
                if (DataScope.PUBLIC in perm.requiredScopes || DataScope.NONE in perm.requiredScopes) {
                    return AuthzResult.Allowed(perm)
                }
                // SELF-scoped tools require an explicit self target — null must not fail open.
                if (DataScope.SELF in perm.requiredScopes) {
                    if (targetAthleteId == null || targetAthleteId != principal.userId) {
                        return AuthzResult.Denied("Athletes must target their own id")
                    }
                    return AuthzResult.Allowed(perm)
                }
                if (targetAthleteId != null && targetAthleteId != principal.userId) {
                    return AuthzResult.Denied("Athletes may only access their own data")
                }
            }
            AiRole.COACH -> {
                if (DataScope.PUBLIC in perm.requiredScopes || DataScope.ROSTER in perm.requiredScopes) {
                    return AuthzResult.Allowed(perm)
                }
                if (DataScope.ASSIGNED_ATHLETES in perm.requiredScopes || DataScope.SELF in perm.requiredScopes) {
                    val target = targetAthleteId
                        ?: return AuthzResult.Denied("Target athlete required")
                    if (target !in principal.assignedAthleteIds) {
                        return AuthzResult.Denied("Coach not assigned to athlete $target")
                    }
                }
            }
            AiRole.SYSTEM -> Unit
        }
        return AuthzResult.Allowed(perm)
    }

    sealed interface AuthzResult {
        data class Allowed(val permission: ToolPermission) : AuthzResult
        data class Denied(val reason: String) : AuthzResult
    }

    companion object {
        fun defaultRegistry(): Map<String, ToolPermission> = listOf(
            ToolPermission("getAthleteProfile", setOf(AiRole.ATHLETE, AiRole.COACH), setOf(DataScope.SELF, DataScope.ASSIGNED_ATHLETES), ToolAccess.READ, false),
            ToolPermission("getTrainingHistory", setOf(AiRole.ATHLETE, AiRole.COACH), setOf(DataScope.SELF, DataScope.ASSIGNED_ATHLETES), ToolAccess.READ, false),
            ToolPermission("getTelemetrySummary", setOf(AiRole.ATHLETE, AiRole.COACH), setOf(DataScope.SELF, DataScope.ASSIGNED_ATHLETES), ToolAccess.READ, true),
            ToolPermission("getRecoverySummary", setOf(AiRole.ATHLETE, AiRole.COACH), setOf(DataScope.SELF, DataScope.ASSIGNED_ATHLETES), ToolAccess.READ, true),
            ToolPermission("getProgramProgress", setOf(AiRole.ATHLETE, AiRole.COACH), setOf(DataScope.SELF, DataScope.ASSIGNED_ATHLETES), ToolAccess.READ, false),
            ToolPermission("getUpcomingSessions", setOf(AiRole.ATHLETE, AiRole.COACH), setOf(DataScope.SELF, DataScope.ASSIGNED_ATHLETES), ToolAccess.READ, false),
            ToolPermission("getGoals", setOf(AiRole.ATHLETE, AiRole.COACH), setOf(DataScope.SELF, DataScope.ASSIGNED_ATHLETES), ToolAccess.READ, false),
            ToolPermission("getSportProfile", setOf(AiRole.ATHLETE, AiRole.COACH), setOf(DataScope.SELF, DataScope.ASSIGNED_ATHLETES), ToolAccess.READ, false),
            ToolPermission("getCompetitionCalendar", setOf(AiRole.ATHLETE, AiRole.COACH), setOf(DataScope.SELF, DataScope.ASSIGNED_ATHLETES), ToolAccess.READ, false),
            ToolPermission("getCoachNotes", setOf(AiRole.COACH), setOf(DataScope.ASSIGNED_ATHLETES), ToolAccess.READ, false),
            ToolPermission("getAvailability", setOf(AiRole.ATHLETE, AiRole.COACH), setOf(DataScope.SELF, DataScope.ASSIGNED_ATHLETES), ToolAccess.READ, false),
            ToolPermission("getRelevantCommunityContext", setOf(AiRole.ATHLETE, AiRole.COACH), setOf(DataScope.PUBLIC), ToolAccess.READ, false),
            ToolPermission("proposeProgramChange", setOf(AiRole.COACH), setOf(DataScope.ASSIGNED_ATHLETES), ToolAccess.WRITE, false),
            ToolPermission("proposeSessionMove", setOf(AiRole.ATHLETE, AiRole.COACH), setOf(DataScope.SELF, DataScope.ASSIGNED_ATHLETES), ToolAccess.WRITE, false),
        ).associateBy { it.toolName }
    }
}
