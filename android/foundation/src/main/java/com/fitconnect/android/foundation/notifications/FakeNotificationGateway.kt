package com.fitconnect.android.foundation.notifications

import com.fitconnect.android.foundation.common.Logger
import java.util.concurrent.CopyOnWriteArrayList

/**
 * TEST classification notification sink. Records delivered notifications for assertions.
 * Never selected by production/release composition — use FailClosedNotificationGateway there.
 */
class FakeNotificationGateway(
    private val logger: Logger? = null,
) : NotificationGateway {
    private val delivered = CopyOnWriteArrayList<LocalNotificationRequest>()
    private var tokenSeq = 0

    fun delivered(): List<LocalNotificationRequest> = delivered.toList()

    fun clear() = delivered.clear()

    override suspend fun registerForPush(): PushRegistration {
        tokenSeq += 1
        val token = "fake-fcm-token-$tokenSeq"
        logger?.i("FakeNotification", "registered $token")
        return PushRegistration(token = token, provider = "fake")
    }

    override suspend fun unregisterPush() {
        logger?.i("FakeNotification", "unregistered")
    }

    override suspend fun showLocal(request: LocalNotificationRequest) {
        delivered += request
        logger?.i("FakeNotification", "show id=${request.id} title=${request.title}")
    }

    override suspend fun cancel(id: Int) {
        delivered.removeAll { it.id == id }
    }

    override fun routeDeepLink(deepLink: String?): String? = deepLink
}
