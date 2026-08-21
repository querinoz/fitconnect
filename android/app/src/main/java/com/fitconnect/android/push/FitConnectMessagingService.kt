package com.fitconnect.android.push

import com.fitconnect.android.R
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

/**
 * FCM entry point. Token persistence is owned by session-aware registration after login.
 * Never logs the token value.
 */
open class FitConnectMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        android.util.Log.i("FitConnectFCM", "onNewToken received")
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
