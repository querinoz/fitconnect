package com.fitconnect.android.coach.payments

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.foundation.session.SessionStore
import org.json.JSONObject

/**
 * Stripe Connect status as seen by Coach OS.
 * Never invents charges/payouts enabled without a live server response.
 */
data class StripeConnectStatus(
    val live: Boolean,
    val configured: Boolean,
    val chargesEnabled: Boolean,
    val payoutsEnabled: Boolean,
    val onboardingComplete: Boolean,
    val source: String,
) {
    val payoutsReady: Boolean get() = live && configured && chargesEnabled && payoutsEnabled
}

interface StripeConnectStatusPort {
    suspend fun status(): AppResult<StripeConnectStatus>
}

/**
 * Reads `/api/stripe/status`. Fail-closed on transport / parse errors —
 * never fabricates paid or Connect-ready success.
 */
class HttpStripeConnectStatusPort(
    private val api: () -> ApiClient,
) : StripeConnectStatusPort {
    override suspend fun status(): AppResult<StripeConnectStatus> {
        return when (val raw = api().get("/api/stripe/status")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val live = root.optBoolean("live", false)
                val configured = root.optBoolean("configured", live)
                val connect = root.optJSONObject("connect")
                AppResult.Ok(
                    StripeConnectStatus(
                        live = live,
                        configured = configured,
                        chargesEnabled = connect?.optBoolean("chargesEnabled", false) == true,
                        payoutsEnabled = connect?.optBoolean("payoutsEnabled", false) == true,
                        onboardingComplete = connect?.optBoolean("onboardingComplete", false) == true,
                        source = if (live) "STRIPE_LIVE" else "STRIPE_NOT_CONFIGURED",
                    ),
                )
            }
        }
    }
}

/** LOCAL_DEMO — honest zeros; never reports Connect ready. */
class LocalDemoStripeConnectStatusPort : StripeConnectStatusPort {
    override suspend fun status(): AppResult<StripeConnectStatus> = AppResult.Ok(
        StripeConnectStatus(
            live = false,
            configured = false,
            chargesEnabled = false,
            payoutsEnabled = false,
            onboardingComplete = false,
            source = "LOCAL_DEMO",
        ),
    )
}

/** Fail-closed when no secrets / no session — never fake paid success. */
class FailClosedStripeConnectStatusPort : StripeConnectStatusPort {
    override suspend fun status(): AppResult<StripeConnectStatus> =
        AppResult.Err(
            AppError.Unexpected(
                "BLOCKED_EXTERNAL: Stripe Connect status — PENDING_HUMAN credentials",
            ),
        )
}

class SessionAwareStripeConnectStatusPort(
    private val sessionStore: SessionStore,
    private val api: () -> ApiClient,
    private val localDemo: StripeConnectStatusPort = LocalDemoStripeConnectStatusPort(),
    private val live: StripeConnectStatusPort = HttpStripeConnectStatusPort(api),
) : StripeConnectStatusPort {
    override suspend fun status(): AppResult<StripeConnectStatus> =
        if (sessionStore.snapshot().isLocalDemo) localDemo.status() else live.status()
}
