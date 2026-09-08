package com.fitconnect.android.foundation.notifications

import com.fitconnect.android.foundation.navigation.DeepLinkTarget
import com.fitconnect.android.foundation.navigation.classifyDeepLinkPath
import com.fitconnect.android.foundation.navigation.deepLinkAppPathString

/**
 * Canonicalizes notification payload deep links into `fitconnect://app/…` URIs
 * that [com.fitconnect.android.foundation.navigation.DeepLinkInbox] + nav graphs understand.
 *
 * Pure JVM — no Firebase, no Android Uri. Unrouteable input returns null (fail-closed).
 * Does not claim FCM delivery; routing only.
 */
object NotificationDeepLinkRouter {
    private const val SCHEME_PREFIX = "fitconnect://app/"

    /**
     * Resolve from an explicit deep-link string and/or typed FCM data fields
     * (`type` / `id` / `role`). Prefer [deepLink] when present and valid.
     */
    fun resolve(
        deepLink: String? = null,
        type: String? = null,
        entityId: String? = null,
        roleHint: String? = null,
    ): String? {
        normalizeExplicit(deepLink)?.let { return it }
        return normalizeTyped(
            type = type?.trim()?.lowercase()?.takeIf { it.isNotEmpty() },
            entityId = entityId?.trim()?.takeIf { it.isNotEmpty() },
            roleHint = roleHint?.trim()?.lowercase()?.takeIf { it.isNotEmpty() },
        )
    }

    /** Gateway [NotificationGateway.routeDeepLink] implementation. */
    fun routeDeepLink(deepLink: String?): String? = resolve(deepLink = deepLink)

    fun isRoutable(canonicalUri: String): Boolean {
        val path = deepLinkAppPathString(canonicalUri) ?: return false
        return classifyDeepLinkPath(path) !is DeepLinkTarget.Unknown
    }

    private fun normalizeExplicit(raw: String?): String? {
        val s = raw?.trim()?.takeIf { it.isNotEmpty() } ?: return null
        val path = when {
            s.startsWith("fitconnect://") || s.startsWith("https://") ->
                deepLinkAppPathString(s)
            s.startsWith("app/") -> s.removePrefix("app/").trim('/')
            else -> s.trim('/')
        } ?: return null
        val canonicalPath = aliasPath(path) ?: return null
        val uri = SCHEME_PREFIX + canonicalPath
        return uri.takeIf { isRoutable(uri) }
    }

    private fun normalizeTyped(type: String?, entityId: String?, roleHint: String?): String? {
        if (type == null) return null
        val role = roleHint ?: inferRole(type)
        val path = when (type) {
            "booking", "bookings" -> when (role) {
                "coach" -> "coach/bookings"
                else -> "athlete/discover"
            }
            "session", "sessions", "training" -> {
                val id = entityId ?: return when (role) {
                    "coach" -> "coach/sessions"
                    else -> "athlete/training"
                }
                when (role) {
                    "coach" -> "coach/sessions/$id"
                    else -> "athlete/training/$id"
                }
            }
            "athlete" -> {
                val id = entityId ?: return null
                "coach/athletes/$id"
            }
            "coach" -> "coach/feed"
            "home" -> when (role) {
                "coach" -> "coach/feed"
                else -> "athlete/home"
            }
            "notifications", "alerts" -> when (role) {
                "coach" -> "coach/notifications"
                else -> "athlete/notifications"
            }
            else -> return null
        }
        val uri = SCHEME_PREFIX + path
        return uri.takeIf { isRoutable(uri) }
    }

    /**
     * Alias legacy / payload-friendly paths onto nav-graph destinations.
     * Returns null when the path cannot be mapped honestly.
     */
    internal fun aliasPath(path: String): String? {
        val p = path.trim('/')
        if (p.isEmpty()) return ""
        return when {
            p == "athlete/session" || p == "athlete/sessions" -> "athlete/training"
            p.startsWith("athlete/session/") -> "athlete/training/" + p.removePrefix("athlete/session/")
            p.startsWith("athlete/sessions/") -> "athlete/training/" + p.removePrefix("athlete/sessions/")
            p == "athlete/booking" || p == "athlete/bookings" -> "athlete/discover"
            p == "coach/booking" -> "coach/bookings"
            p == "coach/session" -> "coach/sessions"
            p.startsWith("coach/session/") -> "coach/sessions/" + p.removePrefix("coach/session/")
            // Bare relative aliases from server payloads
            p.matches(Regex("^session/[^/]+$")) -> "athlete/training/" + p.removePrefix("session/")
            p == "booking" || p == "bookings" -> "athlete/discover"
            else -> p
        }
    }

    private fun inferRole(type: String): String? = when (type) {
        "athlete" -> "coach"
        else -> null
    }
}
