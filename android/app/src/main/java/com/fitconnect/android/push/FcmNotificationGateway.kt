package com.fitconnect.android.push

import android.content.Context
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.foundation.notifications.LocalNotificationRequest
import com.fitconnect.android.foundation.notifications.NotificationDeepLinkRouter
import com.fitconnect.android.foundation.notifications.NotificationGateway
import com.fitconnect.android.foundation.notifications.PushRegistration
import com.fitconnect.android.foundation.notifications.PushTokenRefreshSink
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.tasks.await
import org.json.JSONObject

/**
 * Real FCM registration gateway. Only selected when BuildConfig.FCM_CONFIGURED
 * and google-services.json is present. Device push **receipt** remains EXTERNAL
 * (Firebase Console + Play credentials) — this never claims delivery success.
 */
class FcmNotificationGateway(
    context: Context,
    private val logger: Logger,
    private val api: (() -> ApiClient)? = null,
) : NotificationGateway, PushTokenRefreshSink {
    private val helper = NotificationHelper(context)

    override suspend fun registerForPush(): PushRegistration? {
        return runCatching {
            val token = FirebaseMessaging.getInstance().token.await()
            if (token.isNullOrBlank()) return@runCatching null
            onNewToken(token)
            PushRegistration(token = token, provider = "fcm")
        }.onFailure {
            logger.w("FcmNotificationGateway", "token registration failed", it)
        }.getOrNull()
    }

    /** FCM [onNewToken] / explicit refresh — posts to `/api/v1/push/register`. Never logs the token. */
    override suspend fun onNewToken(token: String) {
        if (token.isBlank()) return
        registerTokenWithBackend(token)
    }

    suspend fun registerTokenWithBackend(token: String) {
        val client = api?.invoke() ?: run {
            logger.i("FcmNotificationGateway", "token obtained; API client unavailable — skip backend register")
            return
        }
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
        val routed = request.copy(
            deepLink = NotificationDeepLinkRouter.resolve(deepLink = request.deepLink)
                ?: request.deepLink,
        )
        helper.showLocal(routed)
        logger.i("FcmNotificationGateway", "local show id=${routed.id} category=${routed.category}")
    }

    override suspend fun cancel(id: Int) {
        helper.cancel(id)
    }

    override fun routeDeepLink(deepLink: String?): String? =
        NotificationDeepLinkRouter.routeDeepLink(deepLink)
}
