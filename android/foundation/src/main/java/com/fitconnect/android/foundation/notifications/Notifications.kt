package com.fitconnect.android.foundation.notifications

/**
 * Notification infrastructure only — no product/business payloads yet.
 */
enum class NotificationCategory {
    SYSTEM,
    SESSION,
    TRAINING,
    SOCIAL,
    MARKETING,
    PROGRESSION,
}

data class LocalNotificationRequest(
    val id: Int,
    val title: String,
    val body: String,
    val category: NotificationCategory,
    val deepLink: String? = null,
    val scheduleAtEpochMs: Long? = null,
)

data class PushRegistration(
    val token: String,
    val provider: String,
)

interface NotificationGateway {
    suspend fun registerForPush(): PushRegistration?
    suspend fun unregisterPush()
    suspend fun showLocal(request: LocalNotificationRequest)
    suspend fun cancel(id: Int)
    fun routeDeepLink(deepLink: String?): String?
}
