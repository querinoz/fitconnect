package com.fitconnect.android.foundation.notifications

import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class FakeNotificationGatewayTest {
    @Test
    fun registerAndShowAreRecorded() = runBlocking {
        val gateway = FakeNotificationGateway()
        val reg = gateway.registerForPush()
        assertEquals("fake", reg.provider)
        assertTrue(reg.token.startsWith("fake-fcm-token-"))

        gateway.showLocal(
            LocalNotificationRequest(
                id = 7,
                title = "Booking confirmed",
                body = "Tomorrow 09:00",
                category = NotificationCategory.SESSION,
                deepLink = "fitconnect://app/athlete/home",
            ),
        )
        assertEquals(1, gateway.delivered().size)
        assertEquals(7, gateway.delivered().first().id)

        gateway.cancel(7)
        assertTrue(gateway.delivered().isEmpty())
    }
}
