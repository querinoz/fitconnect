package com.fitconnect.android.foundation.realtime

/**
 * Canonical product topics for native mobile RealtimeClient.
 * Do not use BroadcastChannel on Android.
 */
object ProductRealtimeTopics {
    const val SESSION = "fitconnect:session"
    const val BOOKING = "fitconnect:booking"
    const val MESSAGE = "fitconnect:message"
    const val ACTIVITY = "fitconnect:activity"
}

enum class ProductRealtimeLinkState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    RECONNECTING,
    UNAUTHORIZED,
    UNAVAILABLE,
}
