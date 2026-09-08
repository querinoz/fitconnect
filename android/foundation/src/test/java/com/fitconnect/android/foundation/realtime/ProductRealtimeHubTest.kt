package com.fitconnect.android.foundation.realtime

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.InProcessRealtimeBus
import com.fitconnect.android.foundation.network.InProcessRealtimeClient
import com.fitconnect.android.foundation.session.AuthTokens
import com.fitconnect.android.foundation.session.SessionSnapshot
import com.fitconnect.android.foundation.session.SessionStore
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** REALTIME-010…012 — ProductRealtimeHub connect/subscribe/dedupe. */
class ProductRealtimeHubTest {
    @Test
    fun `REALTIME-010 start connects and receives payload`() = runBlocking {
        val bus = InProcessRealtimeBus()
        val client = InProcessRealtimeClient(bus = bus, clientId = "hub-a")
        val publisher = InProcessRealtimeClient(bus = bus, clientId = "hub-b")
        assertTrue(publisher.connect() is AppResult.Ok)
        val store = FakeSessionStore(userId = "uid-1", isLocalDemo = false)
        val hub = ProductRealtimeHub(client, store, CoroutineScope(SupervisorJob() + Dispatchers.Default))
        assertTrue(hub.start(listOf(ProductRealtimeTopics.BOOKING)) is AppResult.Ok)
        assertEquals(ProductRealtimeLinkState.CONNECTED, hub.linkState.value)

        val got = CompletableDeferred<String?>()
        val collector = launch {
            withTimeout(3_000) {
                got.complete(
                    hub.lastPayload.first { it != null },
                )
            }
        }
        delay(50)
        publisher.publish(ProductRealtimeTopics.BOOKING, """{"id":"b1"}""")
        assertEquals("""{"id":"b1"}""", got.await())
        collector.cancel()
        hub.stop()
        assertEquals(ProductRealtimeLinkState.DISCONNECTED, hub.linkState.value)
    }

    @Test
    fun `REALTIME-011 unauthorized without session`() = runBlocking {
        val client = InProcessRealtimeClient(bus = InProcessRealtimeBus(), clientId = "hub-x")
        val store = FakeSessionStore(userId = null, isLocalDemo = false)
        val hub = ProductRealtimeHub(client, store, CoroutineScope(SupervisorJob() + Dispatchers.Default))
        assertTrue(hub.start() is AppResult.Err)
        assertEquals(ProductRealtimeLinkState.UNAUTHORIZED, hub.linkState.value)
    }

    @Test
    fun `REALTIME-012 dedupe identical payloads keeps last`() = runBlocking {
        val bus = InProcessRealtimeBus()
        val client = InProcessRealtimeClient(bus = bus, clientId = "hub-d1")
        val publisher = InProcessRealtimeClient(bus = bus, clientId = "hub-d2")
        assertTrue(publisher.connect() is AppResult.Ok)
        val store = FakeSessionStore(userId = "uid-1", isLocalDemo = false)
        val hub = ProductRealtimeHub(client, store, CoroutineScope(SupervisorJob() + Dispatchers.Default))
        hub.start(listOf(ProductRealtimeTopics.MESSAGE))
        delay(80)
        publisher.publish(ProductRealtimeTopics.MESSAGE, "same")
        withTimeout(3_000) { hub.lastPayload.first { it == "same" } }
        publisher.publish(ProductRealtimeTopics.MESSAGE, "same")
        delay(80)
        assertEquals("same", hub.lastPayload.value)
        hub.stop()
    }
}

private class FakeSessionStore(
    private val userId: String?,
    private val isLocalDemo: Boolean,
) : SessionStore {
    override suspend fun snapshot(): SessionSnapshot =
        SessionSnapshot(
            userId = userId,
            role = if (userId == null) {
                com.fitconnect.android.foundation.authz.UserRole.GUEST
            } else {
                com.fitconnect.android.foundation.authz.UserRole.ATHLETE
            },
            tokens = null,
            isAnonymous = false,
            biometricUnlockEnabled = false,
            isLocalDemo = isLocalDemo,
        )

    override suspend fun isLoggedIn(): Boolean = userId != null
    override suspend fun role() = snapshot().role
    override suspend fun activeMode() = snapshot().activeMode
    override suspend fun capabilities() = snapshot().capabilities
    override suspend fun accessToken(): String? = null
    override suspend fun refreshToken(): String? = null
    override suspend fun save(snapshot: SessionSnapshot) = AppResult.Ok(Unit)
    override suspend fun updateTokens(tokens: AuthTokens) = AppResult.Ok(Unit)
    override suspend fun setActiveMode(mode: com.fitconnect.android.foundation.authz.UserRole) =
        AppResult.Ok(snapshot().copy(activeMode = mode, role = mode))
    override suspend fun clear() = AppResult.Ok(Unit)
}
