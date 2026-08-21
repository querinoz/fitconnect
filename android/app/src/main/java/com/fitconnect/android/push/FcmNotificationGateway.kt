package com.fitconnect.android.push

import android.content.Context
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.notifications.LocalNotificationRequest
import com.fitconnect.android.foundation.notifications.NotificationGateway
import com.fitconnect.android.foundation.notifications.PushRegistration
import com.google.firebase.messaging.FirebaseMessaging
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
