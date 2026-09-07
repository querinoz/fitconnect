package com.fitconnect.android.push

import android.content.Context
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.foundation.notifications.LocalNotificationRequest
import com.fitconnect.android.foundation.notifications.NotificationGateway
import com.fitconnect.android.foundation.notifications.PushRegistration
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.tasks.await
import org.json.JSONObject

/**
 * Real FCM registration gateway. Only selected when BuildConfig.FCM_CONFIGURED
 * and google-services.json is present. Device push receipt remains a separate
 * certification gate — this registers the token with the canonical API.
 */
class FcmNotificationGateway(
    context: Context,
    private val logger: Logger,
    private val api: (() -> ApiClient)? = null,
) : NotificationGateway {
    private val helper = NotificationHelper(context)

    override suspend fun registerForPush(): PushRegistration? {
        return runCatching {
            val token = FirebaseMessaging.getInstance().token.await()
            if (token.isNullOrBlank()) return@runCatching null
            val registration = PushRegistration(token = token, provider = "fcm")
            registerTokenWithBackend(token)
            registration
        }.onFailure {
            logger.w("FcmNotificationGateway", "token registration failed", it)
        }.getOrNull()
    }

    /** Called from [FitConnectMessagingService.onNewToken]. */
    suspend fun registerTokenWithBackend(token: String) {
        val client = api?.invoke() ?: return
        val body = JSONObject()
            .put("token", token)
            .put("platform", "android")
            .toString()
        when (val result = client.post("/api/v1/push/register", body)) {
            is AppResult.Ok -> logger.i("FcmNotificationGateway", "token registered with API")
            is AppResult.Err -> logger.w(
                "FcmNotificationGateway",
                "API token register failed: ${result.error}",
            )
        }
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
