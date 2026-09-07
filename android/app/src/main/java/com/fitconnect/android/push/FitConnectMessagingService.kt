package com.fitconnect.android.push

import com.fitconnect.android.FitConnectApplication
import com.fitconnect.android.R
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * FCM entry point. Token persistence posts to `/api/v1/push/register` after login
 * and on [onNewToken]. Never logs the token value.
 */
open class FitConnectMessagingService : FirebaseMessagingService() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onNewToken(token: String) {
        android.util.Log.i("FitConnectFCM", "onNewToken received")
        val app = applicationContext as? FitConnectApplication ?: return
        val gateway = app.container.notifications as? FcmNotificationGateway ?: return
        scope.launch {
            runCatching { gateway.registerTokenWithBackend(token) }
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        android.util.Log.i(
            "FitConnectFCM",
            "onMessageReceived dataKeys=${message.data.keys.size}",
        )
        val request = FcmRemoteMapper.toLocalRequest(
            data = message.data,
            notificationTitle = message.notification?.title,
            notificationBody = message.notification?.body,
            messageId = message.messageId,
            fallbackTitle = getString(R.string.app_name),
        ) ?: return
        NotificationHelper(this).showLocal(request)
    }
}

/** Manifest-stable alias; prefer [FitConnectMessagingService]. */
class FitConnectFirebaseMessagingService : FitConnectMessagingService()
