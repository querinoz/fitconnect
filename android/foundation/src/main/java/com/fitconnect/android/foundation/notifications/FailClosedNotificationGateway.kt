package com.fitconnect.android.foundation.notifications

import com.fitconnect.android.foundation.common.Logger

/**
 * Release/production path when FCM is not configured.
 * Must never be mistaken for a working push stack — registration always fails closed.
 */
class FailClosedNotificationGateway(
    private val logger: Logger,
) : NotificationGateway {
    override suspend fun registerForPush(): PushRegistration? {
        logger.e("Notifications", "FCM not configured — push registration refused (fail-closed)")
        return null
    }

    override suspend fun unregisterPush() = Unit

    override suspend fun showLocal(request: LocalNotificationRequest) {
        logger.w("Notifications", "local notification suppressed — FCM/channels not production-ready")
    }

    override suspend fun cancel(id: Int) = Unit

    override fun routeDeepLink(deepLink: String?): String? = deepLink
}
