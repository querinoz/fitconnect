package com.fitconnect.android.foundation.notifications

import com.fitconnect.android.foundation.common.Logger
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class FailClosedNotificationGatewayTest {
    private val logger = object : Logger {
        val messages = mutableListOf<String>()
        override fun d(tag: String, message: String) = Unit
        override fun i(tag: String, message: String) = Unit
        override fun w(tag: String, message: String, throwable: Throwable?) {
            messages += "W:$message"
        }
        override fun e(tag: String, message: String, throwable: Throwable?) {
            messages += "E:$message"
        }
    }

    @Test
    fun registerRefusesWithoutFakingDelivery() = runBlocking {
        val gateway = FailClosedNotificationGateway(logger)
        assertNull(gateway.registerForPush())
        assertTrue(logger.messages.any { it.startsWith("E:") && it.contains("fail-closed") })

        gateway.showLocal(
            LocalNotificationRequest(
                id = 1,
                title = "x",
                body = "y",
                category = NotificationCategory.SYSTEM,
            ),
        )
        assertTrue(logger.messages.any { it.startsWith("W:") && it.contains("suppressed") })
    }
}
