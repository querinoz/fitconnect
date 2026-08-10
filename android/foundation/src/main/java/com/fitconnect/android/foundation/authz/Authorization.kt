package com.fitconnect.android.foundation.authz

import com.fitconnect.android.foundation.session.SessionStore

/**
 * Central authorization model. UI, routes, and API callers check [Authorizer]
 * — never hardcode role comparisons in screens.
 *
 * Local session role is a cache only. Production IdP must mint roles server-side;
 * client must never escalate to ADMIN.
 */
enum class UserRole {
    GUEST,
    ANONYMOUS,
    ATHLETE,
    COACH,
    ADMIN,
}

enum class AppPermission {
    VIEW_GUEST_SHELL,
    VIEW_AUTH,
    VIEW_LOGGED_SHELL,
    VIEW_ROLE_GATE,
    ACCESS_ATHLETE_OS,
    ACCESS_COACH_OS,
    ACCESS_APP_SHELL,
    ACCESS_ADMIN,
    ACCESS_MAPS,
    ACCESS_COMMUNITY,
    ACCESS_AI,
    MANAGE_SESSION,
    REQUEST_PUSH,
}

object RolePermissionTable {
    private val guest = setOf(
        AppPermission.VIEW_GUEST_SHELL,
        AppPermission.VIEW_AUTH,
    )
    // Anonymous may explore guest surfaces only — never Athlete/Coach OS.
    private val anonymous = guest + setOf(
        AppPermission.MANAGE_SESSION,
    )
    private val athlete = guest + setOf(
        AppPermission.VIEW_LOGGED_SHELL,
        AppPermission.VIEW_ROLE_GATE,
        AppPermission.ACCESS_APP_SHELL,
        AppPermission.ACCESS_ATHLETE_OS,
        AppPermission.ACCESS_MAPS,
        AppPermission.ACCESS_COMMUNITY,
        AppPermission.ACCESS_AI,
        AppPermission.MANAGE_SESSION,
        AppPermission.REQUEST_PUSH,
    )
    private val coach = guest + setOf(
        AppPermission.VIEW_LOGGED_SHELL,
        AppPermission.VIEW_ROLE_GATE,
        AppPermission.ACCESS_APP_SHELL,
        AppPermission.ACCESS_COACH_OS,
        AppPermission.ACCESS_MAPS,
        AppPermission.ACCESS_COMMUNITY,
        AppPermission.ACCESS_AI,
        AppPermission.MANAGE_SESSION,
        AppPermission.REQUEST_PUSH,
    )
    private val admin = AppPermission.entries.toSet()

    fun permissionsFor(role: UserRole): Set<AppPermission> = when (role) {
        UserRole.GUEST -> guest
        UserRole.ANONYMOUS -> anonymous
        UserRole.ATHLETE -> athlete
        UserRole.COACH -> coach
        UserRole.ADMIN -> admin
    }
}

interface Authorizer {
    suspend fun role(): UserRole
    suspend fun can(permission: AppPermission): Boolean
}

class SessionAuthorizer(
    private val sessionStore: SessionStore,
) : Authorizer {
    override suspend fun role(): UserRole = sessionStore.role()

    override suspend fun can(permission: AppPermission): Boolean =
        RolePermissionTable.permissionsFor(role()).contains(permission)
}
