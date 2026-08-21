package com.fitconnect.android.push

import com.fitconnect.android.foundation.notifications.LocalNotificationRequest
import com.fitconnect.android.foundation.notifications.NotificationCategory

/**
 * Maps FCM notification + data payloads to the local notification model.
 * Pure JVM — no Firebase types — so unit tests do not need Google Play.
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
        val deepLink = data["deepLink"] ?: data["deep_link"] ?: data["link"]
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
