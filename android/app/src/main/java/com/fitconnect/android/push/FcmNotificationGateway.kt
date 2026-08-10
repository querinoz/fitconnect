package com.fitconnect.android.push

import android.content.Context
import com.fitconnect.android.R
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.notifications.LocalNotificationRequest
import com.fitconnect.android.foundation.notifications.NotificationCategory
import com.fitconnect.android.foundation.notifications.NotificationGateway
import com.fitconnect.android.foundation.notifications.PushRegistration
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.tasks.await

/**
 * Real FCM registration gateway. Only selected when BuildConfig.FCM_CONFIGURED
 * and google-services.json is present. Device push receipt remains a separate
 * certification gate.
 */
class FcmNotificationGateway(
    context: Context,
    private val logger: Logger,
) : NotificationGateway {
    private val helper = NotificationHelper(context)

    override suspend fun registerForPush(): PushRegistration? {
        return runCatching {
            val token = FirebaseMessaging.getInstance().token.await()
            if (token.isNullOrBlank()) null
            else PushRegistration(token = token, provider = "fcm")
        }.onFailure {
            logger.w("FcmNotificationGateway", "token registration failed", it)
        }.getOrNull()
    }

    override suspend fun unregisterPush() {
        runCatching { FirebaseMessaging.getInstance().deleteToken().await() }
            .onFailure { logger.w("FcmNotificationGateway", "deleteToken failed", it) }
    }

    override suspend fun showLocal(request: LocalNotificationRequest) {
        helper.showLocal(request)
        logger.i("FcmNotificationGateway", "local show id=${request.id} category=${request.category}")
    }

    override suspend fun cancel(id: Int) {
        helper.cancel(id)
    }

    override fun routeDeepLink(deepLink: String?): String? = deepLink
}

/** Minimal FirebaseMessagingService for token refresh + foreground local display. */
class FitConnectFirebaseMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        // Token persistence to backend is owned by session-aware registration after login.
        android.util.Log.i("FitConnectFCM", "onNewToken len=${token.length}")
    }

    override fun onMessageReceived(message: RemoteMessage) {
        android.util.Log.i(
            "FitConnectFCM",
            "onMessageReceived from=${message.from} dataKeys=${message.data.keys}",
        )
        val title = message.notification?.title
            ?: message.data["title"]
            ?: return
        val body = message.notification?.body
            ?: message.data["body"]
            ?: ""
        val deepLink = message.data["deepLink"]
            ?: message.data["deep_link"]
            ?: message.data["link"]
        val category = runCatching {
            NotificationCategory.valueOf(
                (message.data["category"] ?: "SYSTEM").uppercase(),
            )
        }.getOrDefault(NotificationCategory.SYSTEM)

        val id = message.messageId?.hashCode()
            ?: (title + body).hashCode()

        NotificationHelper(this).showLocal(
            LocalNotificationRequest(
                id = id,
                title = title.ifBlank { getString(R.string.app_name) },
                body = body,
                category = category,
                deepLink = deepLink,
            ),
        )
    }
}
