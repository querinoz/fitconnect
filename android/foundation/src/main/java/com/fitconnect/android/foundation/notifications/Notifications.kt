package com.fitconnect.android.foundation.notifications

/**
 * Platform notification channels + local/push gateway.
 * Deep links are canonicalized by [NotificationDeepLinkRouter] before DeepLinkInbox.
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
    /** Canonical `fitconnect://app/…` when known; helpers route raw payloads first. */
    val deepLink: String? = null,
    val scheduleAtEpochMs: Long? = null,
)

data class PushRegistration(
    val token: String,
    val provider: String,
)

interface NotificationGateway {
    /**
     * Attempt push token registration. Null = refused / unavailable (fail-closed).
     * Non-null does **not** prove remote FCM delivery — only that a token was obtained
     * (or a debug stand-in for Dev).
     */
    suspend fun registerForPush(): PushRegistration?
    suspend fun unregisterPush()
    suspend fun showLocal(request: LocalNotificationRequest)
    suspend fun cancel(id: Int)
    /** Canonicalize a raw deep link for DeepLinkInbox / nav graphs. */
    fun routeDeepLink(deepLink: String?): String? =
        NotificationDeepLinkRouter.routeDeepLink(deepLink)
}
