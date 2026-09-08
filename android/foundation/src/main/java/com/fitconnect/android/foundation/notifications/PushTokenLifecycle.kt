package com.fitconnect.android.foundation.notifications

/**
 * Token lifecycle hooks for push registration.
 * Call sites must not treat [onAuthenticated] success as FCM device-delivery proof —
 * only local/API registration was attempted.
 */
class PushTokenLifecycle(
    private val gateway: NotificationGateway,
    private val isLocalDemo: () -> Boolean,
) {
    /** After real (non-LOCAL_DEMO) sign-in or session restore. */
    suspend fun onAuthenticated() {
        if (isLocalDemo()) return
        gateway.registerForPush()
    }

    /** Logout / account wipe — best-effort local token delete. */
    suspend fun onSignedOut() {
        gateway.unregisterPush()
    }
}

/**
 * Optional sink for FCM [com.google.firebase.messaging.FirebaseMessagingService.onNewToken].
 * Only real FCM gateways implement this; Dev/FailClosed ignore system callbacks.
 */
interface PushTokenRefreshSink {
    suspend fun onNewToken(token: String)
}
