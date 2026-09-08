package com.fitconnect.android.foundation.notifications

/**
 * Resolve a notification-tap deep link from string extras (FCM data → Intent extras).
 * Pure JVM for unit tests — Activity passes Intent::getStringExtra.
 */
object NotificationTapExtras {
    fun resolve(extras: (key: String) -> String?): String? =
        NotificationDeepLinkRouter.resolve(
            deepLink = extras("deepLink") ?: extras("deep_link") ?: extras("link"),
            type = extras("type") ?: extras("entityType") ?: extras("entity_type"),
            entityId = extras("id") ?: extras("entityId") ?: extras("entity_id")
                ?: extras("sessionId") ?: extras("session_id")
                ?: extras("bookingId") ?: extras("booking_id")
                ?: extras("athleteId") ?: extras("athlete_id"),
            roleHint = extras("role") ?: extras("audience"),
        )
}
