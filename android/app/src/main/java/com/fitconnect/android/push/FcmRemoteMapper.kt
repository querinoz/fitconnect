package com.fitconnect.android.push

import com.fitconnect.android.foundation.notifications.LocalNotificationRequest
import com.fitconnect.android.foundation.notifications.NotificationCategory
import com.fitconnect.android.foundation.notifications.NotificationDeepLinkRouter

/**
 * Maps FCM notification + data payloads to the local notification model.
 * Pure JVM — no Firebase types — so unit tests do not need Google Play.
 *
 * Deep links are canonicalized via [NotificationDeepLinkRouter] (booking / session /
 * athlete / coach). Unrouteable links stay null — never invent destinations.
 */
object FcmRemoteMapper {
    fun toLocalRequest(
        data: Map<String, String>,
        notificationTitle: String?,
        notificationBody: String?,
        messageId: String?,
        fallbackTitle: String,
    ): LocalNotificationRequest? {
        val title = notificationTitle ?: data["title"] ?: return null
        val body = notificationBody ?: data["body"].orEmpty()
        val deepLink = NotificationDeepLinkRouter.resolve(
            deepLink = data["deepLink"] ?: data["deep_link"] ?: data["link"],
            type = data["type"] ?: data["entityType"] ?: data["entity_type"],
            entityId = data["id"] ?: data["entityId"] ?: data["entity_id"]
                ?: data["sessionId"] ?: data["session_id"]
                ?: data["bookingId"] ?: data["booking_id"]
                ?: data["athleteId"] ?: data["athlete_id"],
            roleHint = data["role"] ?: data["audience"],
        )
        val category = runCatching {
            NotificationCategory.valueOf((data["category"] ?: "SYSTEM").uppercase())
        }.getOrDefault(NotificationCategory.SYSTEM)
        val id = messageId?.hashCode() ?: (title + body).hashCode()
        return LocalNotificationRequest(
            id = id,
            title = title.ifBlank { fallbackTitle },
            body = body,
            category = category,
            deepLink = deepLink,
        )
    }
}
