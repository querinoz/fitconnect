package com.fitconnect.android.foundation.notifications

import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class PushTokenLifecycleTest {
    @Test
    fun skipsLocalDemoAndRegistersWhenLive() = runBlocking {
        val gateway = DevNotificationGateway()
        val demoLife = PushTokenLifecycle(gateway) { true }
        demoLife.onAuthenticated()
        // Skipped — first explicit register is still token-1
        assertEquals("dev-fcm-token-1", gateway.registerForPush().token)

        val liveGateway = DevNotificationGateway()
        val live = PushTokenLifecycle(liveGateway) { false }
        live.onAuthenticated()
        // onAuthenticated already registered once
        assertTrue(liveGateway.registerForPush().token.startsWith("dev-fcm-token-"))
        live.onSignedOut()
    }

    @Test
    fun failClosedLifecycleNeverInventSuccess() = runBlocking {
        val logger = object : com.fitconnect.android.foundation.common.Logger {
            override fun d(tag: String, message: String) = Unit
            override fun i(tag: String, message: String) = Unit
            override fun w(tag: String, message: String, throwable: Throwable?) = Unit
            override fun e(tag: String, message: String, throwable: Throwable?) = Unit
        }
        val gateway = FailClosedNotificationGateway(logger)
        val life = PushTokenLifecycle(gateway) { false }
        life.onAuthenticated()
        assertNull(gateway.registerForPush())
    }
}
