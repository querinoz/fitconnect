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

/** Hardening: publish → transport → receiver hub state. */
class RealtimeRegressionHardeningTest {
    @Test
    fun bookingPublish_updatesReceiverHubState() = runBlocking {
        val bus = InProcessRealtimeBus()
        val athlete = InProcessRealtimeClient(bus = bus, clientId = "ath")
        val coachClient = InProcessRealtimeClient(bus = bus, clientId = "coach-cli")
        assertTrue(athlete.connect() is AppResult.Ok)
        val coachHub = ProductRealtimeHub(
            coachClient,
            HardeningSessionStore("coach-1"),
            CoroutineScope(SupervisorJob() + Dispatchers.Default),
        )
        assertTrue(coachHub.start(listOf(ProductRealtimeTopics.BOOKING)) is AppResult.Ok)

        val got = CompletableDeferred<String?>()
        val job = launch {
            withTimeout(4_000) {
                got.complete(coachHub.lastPayload.first { it != null && it.contains("book-99") })
            }
        }
        delay(40)
        athlete.publish(ProductRealtimeTopics.BOOKING, """{"id":"book-99","status":"requested"}""")
        assertEquals("""{"id":"book-99","status":"requested"}""", got.await())
        job.cancel()
        coachHub.stop()
    }

    @Test
    fun messagePublish_updatesReceiverHubState() = runBlocking {
        val bus = InProcessRealtimeBus()
        val sender = InProcessRealtimeClient(bus = bus, clientId = "s")
        val recvClient = InProcessRealtimeClient(bus = bus, clientId = "r")
        assertTrue(sender.connect() is AppResult.Ok)
        val hub = ProductRealtimeHub(
            recvClient,
            HardeningSessionStore("uid-r"),
            CoroutineScope(SupervisorJob() + Dispatchers.Default),
        )
        hub.start(listOf(ProductRealtimeTopics.MESSAGE))
        delay(40)
        sender.publish(ProductRealtimeTopics.MESSAGE, """{"body":"hello-zenith"}""")
        withTimeout(4_000) {
            hub.lastPayload.first { it != null && it.contains("hello-zenith") }
        }
        assertTrue(hub.lastPayload.value!!.contains("hello-zenith"))
        hub.stop()
    }
}

private class HardeningSessionStore(private val userId: String) : SessionStore {
    override suspend fun snapshot(): SessionSnapshot =
        SessionSnapshot(
            userId = userId,
            role = com.fitconnect.android.foundation.authz.UserRole.ATHLETE,
            tokens = null,
            isAnonymous = false,
            biometricUnlockEnabled = false,
            isLocalDemo = false,
        )

    override suspend fun isLoggedIn(): Boolean = true
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
