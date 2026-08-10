package com.fitconnect.android.community.notifications

import com.fitconnect.android.foundation.notifications.LocalNotificationRequest
import com.fitconnect.android.foundation.notifications.NotificationCategory
import com.fitconnect.android.foundation.notifications.NotificationGateway

enum class CommunityEventKind {
    NEW_FOLLOWER,
    NEW_CONNECTION,
    REACTION,
    COMMENT,
    MENTION,
    PROGRAM_ENROLLMENT,
    PROGRAM_UPDATE,
    CHALLENGE_START,
    CHALLENGE_ENDING,
    ACHIEVEMENT,
    GROUP_INVITE,
    COACH_ANNOUNCEMENT,
}

data class CommunityEvent(
    val kind: CommunityEventKind,
    val recipientId: String,
    val title: String,
    val body: String,
    val deepLink: String? = null,
)

/**
 * Bridges community events onto the platform [NotificationGateway] — no
 * parallel notification architecture. A per-recipient burst cap prevents
 * notification spam.
 */
class CommunityNotifier(
    private val gateway: NotificationGateway,
    private val nowProvider: () -> Long = System::currentTimeMillis,
    private val maxPerWindow: Int = 20,
    private val windowMs: Long = 3_600_000,
) {
    private val recent = mutableMapOf<String, ArrayDeque<Long>>()

    suspend fun notify(event: CommunityEvent): Boolean {
        val allowed = synchronized(recent) {
            val window = recent.getOrPut(event.recipientId) { ArrayDeque() }
            val now = nowProvider()
            while (window.isNotEmpty() && now - window.first() > windowMs) window.removeFirst()
            if (window.size >= maxPerWindow) return@synchronized false
            window.addLast(now)
            true
        }
        if (!allowed) return false
        gateway.showLocal(
            LocalNotificationRequest(
                id = event.hashCode(),
                title = event.title,
                body = event.body,
                category = NotificationCategory.SOCIAL,
                deepLink = event.deepLink,
            ),
        )
        return true
    }
}
