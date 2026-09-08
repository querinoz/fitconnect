package com.fitconnect.android.coach.payments

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.foundation.session.AuthTokens
import com.fitconnect.android.foundation.session.SessionSnapshot
import com.fitconnect.android.foundation.session.SessionStore
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CoachPaymentsFailClosedTest {

    @Test
    fun localDemoNeverReportsConnectReady() = runBlocking {
        val status = LocalDemoStripeConnectStatusPort().status() as AppResult.Ok
        assertFalse(status.value.live)
        assertFalse(status.value.configured)
        assertFalse(status.value.chargesEnabled)
        assertFalse(status.value.payoutsEnabled)
        assertFalse(status.value.payoutsReady)
        assertEquals("LOCAL_DEMO", status.value.source)
    }

    @Test
    fun failClosedPortDoesNotInventPaidSuccess() = runBlocking {
        val result = FailClosedStripeConnectStatusPort().status()
        assertTrue(result is AppResult.Err)
        val err = (result as AppResult.Err).error
        assertTrue(err is AppError.Unexpected)
        assertTrue((err as AppError.Unexpected).message.contains("BLOCKED_EXTERNAL"))
    }

    @Test
    fun httpPortParsesHonestNotConfiguredStatus() = runBlocking {
        val api = FakeApiClient(
            """{"live":false,"configured":false,"subscription":null,"connect":null}""",
        )
        val status = HttpStripeConnectStatusPort { api }.status() as AppResult.Ok
        assertFalse(status.value.live)
        assertFalse(status.value.payoutsReady)
        assertEquals("STRIPE_NOT_CONFIGURED", status.value.source)
    }

    @Test
    fun httpPortNeverUpgradesMissingConnectFlags() = runBlocking {
        val api = FakeApiClient(
            """{"live":true,"configured":true,"connect":{}}""",
        )
        val status = HttpStripeConnectStatusPort { api }.status() as AppResult.Ok
        assertTrue(status.value.live)
        assertFalse(status.value.chargesEnabled)
        assertFalse(status.value.payoutsEnabled)
        assertFalse(status.value.payoutsReady)
    }

    @Test
    fun localDemoInvoiceAndTransferStayFailClosed() = runBlocking {
        val gateway = LocalDemoCoachPaymentsGateway()
        val invoice = gateway.createInvoice(
            InvoiceDraft("ath-1", 1000, "eur", "demo"),
        )
        val transfer = gateway.requestTransfer(
            TransferRequest(1000, "eur", "acct_x"),
        )
        assertTrue(invoice is AppResult.Err)
        assertTrue(transfer is AppResult.Err)
        assertEquals(PayoutRail.UNSUPPORTED, gateway.rail())
    }

    @Test
    fun sessionAwareCachesLocalDemoRailAfterRevenue() = runBlocking {
        val store = FakeSessionStore(isLocalDemo = true)
        val gateway = SessionAwareCoachPaymentsGateway(
            sessionStore = store,
            api = { FakeApiClient("{}") },
        )
        gateway.revenue()
        assertEquals(PayoutRail.UNSUPPORTED, gateway.rail())
    }
}

private class FakeApiClient(private val body: String) : ApiClient {
    override suspend fun get(path: String, headers: Map<String, String>): AppResult<String> =
        AppResult.Ok(body)

    override suspend fun post(
        path: String,
        body: String,
        headers: Map<String, String>,
        mediaType: String,
    ): AppResult<String> = AppResult.Err(AppError.Unexpected("unused"))

    override suspend fun put(
        path: String,
        body: String,
        headers: Map<String, String>,
        mediaType: String,
    ): AppResult<String> = AppResult.Err(AppError.Unexpected("unused"))

    override suspend fun delete(path: String, headers: Map<String, String>): AppResult<String> =
        AppResult.Err(AppError.Unexpected("unused"))

    override fun cancelAll() = Unit
}

private class FakeSessionStore(private val isLocalDemo: Boolean) : SessionStore {
    private val snap = SessionSnapshot(
        userId = "u1",
        role = UserRole.COACH,
        tokens = null,
        isAnonymous = false,
        biometricUnlockEnabled = false,
        isLocalDemo = isLocalDemo,
    )

    override suspend fun snapshot(): SessionSnapshot = snap
    override suspend fun isLoggedIn(): Boolean = true
    override suspend fun role(): UserRole = snap.role
    override suspend fun activeMode(): UserRole = snap.activeMode
    override suspend fun capabilities(): Set<UserRole> = snap.capabilities
    override suspend fun accessToken(): String? = null
    override suspend fun refreshToken(): String? = null
    override suspend fun save(snapshot: SessionSnapshot): AppResult<Unit> = AppResult.Ok(Unit)
    override suspend fun updateTokens(tokens: AuthTokens): AppResult<Unit> = AppResult.Ok(Unit)
    override suspend fun setActiveMode(mode: UserRole): AppResult<SessionSnapshot> =
        AppResult.Ok(snap.copy(activeMode = mode, role = mode))
    override suspend fun clear(): AppResult<Unit> = AppResult.Ok(Unit)
}
