package com.fitconnect.android.foundation.navigation

import com.fitconnect.android.foundation.analytics.Analytics
import com.fitconnect.android.foundation.authz.AppPermission
import com.fitconnect.android.foundation.authz.Authorizer
import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.session.SessionStore

enum class CoreRoute(
    val path: String,
    val permission: AppPermission?,
    val allowedWhenGuest: Boolean = false,
) {
    SPLASH("splash", null, allowedWhenGuest = true),
    GUEST("guest", AppPermission.VIEW_GUEST_SHELL, allowedWhenGuest = true),
    AUTH("auth", AppPermission.VIEW_AUTH, allowedWhenGuest = true),
    HOME("home", AppPermission.ACCESS_APP_SHELL),
    ROLE("role", AppPermission.VIEW_ROLE_GATE),
    CATALOG("catalog", AppPermission.VIEW_LOGGED_SHELL),
    ERROR("error", null, allowedWhenGuest = true),
}

data class NavDecision(
    val allowed: Boolean,
    val redirectTo: CoreRoute? = null,
    val role: UserRole,
)

/**
 * Central navigation authorization. Compose NavHost must call [authorize]
 * before committing a guarded destination. Deep links must use the same path.
 */
class NavGuard(
    private val sessionStore: SessionStore,
    private val authorizer: Authorizer,
    private val analytics: Analytics,
) {
    suspend fun authorize(route: CoreRoute): NavDecision {
        val loggedIn = sessionStore.isLoggedIn()
        val role = sessionStore.role()
        analytics.screen("nav_${route.path}", mapOf("role" to role.name))

        val permission = route.permission
        if (permission == null) {
            return NavDecision(allowed = true, role = role)
        }
        if (!loggedIn && route.allowedWhenGuest) {
            return NavDecision(allowed = true, role = role)
        }
        if (!loggedIn) {
            return NavDecision(allowed = false, redirectTo = CoreRoute.GUEST, role = role)
        }
        if (!authorizer.can(permission)) {
            val redirect = when (role) {
                UserRole.GUEST, UserRole.ANONYMOUS -> CoreRoute.GUEST
                else -> CoreRoute.ROLE
            }
            return NavDecision(allowed = false, redirectTo = redirect, role = role)
        }
        return NavDecision(allowed = true, role = role)
    }

    /**
     * Resolves a deep link URI to a core route when possible.
     * Nested OS deep links (athlete or coach) force HOME so NavGuard still runs.
     */
    fun deepLinkToRoute(uri: String): CoreRoute? {
        val normalized = uri.lowercase()
        if (normalized.contains("/athlete/") || normalized.contains("/coach/")) {
            return CoreRoute.HOME
        }
        val path = uri.substringAfterLast('/').lowercase()
        return CoreRoute.entries.firstOrNull { it.path == path }
    }
}
