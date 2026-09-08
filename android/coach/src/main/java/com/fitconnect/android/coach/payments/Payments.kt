package com.fitconnect.android.coach.payments

import com.fitconnect.android.coach.domain.RevenueSnapshot
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.foundation.session.SessionStore
import org.json.JSONObject

/**
 * Stripe-ready payments architecture. No live Stripe SDK — adapters plug in
 * when keys exist. Coach OS UI depends only on this port.
 */
enum class PayoutRail { STRIPE_CONNECT, MANUAL, UNSUPPORTED }

data class InvoiceDraft(
    val athleteId: String,
    val amountCents: Long,
    val currency: String,
    val memo: String,
)

data class TransferRequest(
    val amountCents: Long,
    val currency: String,
    val destinationAccountId: String,
)

interface CoachPaymentsGateway {
    suspend fun revenue(): AppResult<RevenueSnapshot>
    suspend fun createInvoice(draft: InvoiceDraft): AppResult<String>
    suspend fun requestTransfer(request: TransferRequest): AppResult<String>
    fun rail(): PayoutRail
}

/**
 * Reads coach earnings ledger from `/api/v1/coaches/earnings`.
 * Invoice/transfer stay fail-closed until Stripe Connect credentials exist.
 * Never fabricates revenue — empty ledger is honest zeros + payoutStatus text.
 */
class HttpCoachPaymentsGateway(
    private val api: () -> ApiClient,
) : CoachPaymentsGateway {
    override fun rail(): PayoutRail = PayoutRail.STRIPE_CONNECT

    override suspend fun revenue(): AppResult<RevenueSnapshot> {
        return when (val raw = api().get("/api/v1/coaches/earnings")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val e = root.optJSONObject("earnings") ?: root
                AppResult.Ok(
                    RevenueSnapshot(
                        weekCents = e.optLong("weekCents", 0L),
                        monthCents = e.optLong("monthCents", 0L),
                        pendingPayoutCents = e.optLong("pendingPayoutCents", 0L),
                        subscriptions = e.optInt("subscriptions", 0),
                        bookingsPaid = e.optInt("bookingsPaid", 0),
                        invoicesOpen = e.optInt("invoicesOpen", 0),
                        transfersPending = e.optInt("transfersPending", 0),
                        payoutStatus = e.optString(
                            "payoutStatus",
                            "ledger — Stripe Connect LIVE BLOCKED_EXTERNAL",
                        ),
                    ),
                )
            }
        }
    }

    override suspend fun createInvoice(draft: InvoiceDraft): AppResult<String> =
        AppResult.Err(
            AppError.Unexpected(
                "BLOCKED_EXTERNAL: Stripe Connect invoice — PENDING_HUMAN credentials",
            ),
        )

    override suspend fun requestTransfer(request: TransferRequest): AppResult<String> =
        AppResult.Err(
            AppError.Unexpected(
                "BLOCKED_EXTERNAL: Stripe Connect transfer — PENDING_HUMAN credentials",
            ),
        )
}

/**
 * LOCAL_DEMO-only revenue snapshot. Never used for Firebase / production sessions.
 * Invoice/transfer stay fail-closed — no fake paid success.
 */
class LocalDemoCoachPaymentsGateway : CoachPaymentsGateway {
    override fun rail(): PayoutRail = PayoutRail.UNSUPPORTED

    override suspend fun revenue(): AppResult<RevenueSnapshot> = AppResult.Ok(
        RevenueSnapshot(
            weekCents = 184_500,
            monthCents = 742_000,
            pendingPayoutCents = 210_000,
            subscriptions = 28,
            bookingsPaid = 12,
            invoicesOpen = 3,
            transfersPending = 1,
            payoutStatus = "LOCAL_DEMO — not Stripe",
        ),
    )

    override suspend fun createInvoice(draft: InvoiceDraft): AppResult<String> =
        AppResult.Err(AppError.Unexpected("LOCAL_DEMO — Stripe not configured"))

    override suspend fun requestTransfer(request: TransferRequest): AppResult<String> =
        AppResult.Err(AppError.Unexpected("LOCAL_DEMO — Stripe Connect not configured"))
}

class SessionAwareCoachPaymentsGateway(
    private val sessionStore: SessionStore,
    private val api: () -> ApiClient,
    private val localDemo: CoachPaymentsGateway = LocalDemoCoachPaymentsGateway(),
    private val live: CoachPaymentsGateway = HttpCoachPaymentsGateway(api),
) : CoachPaymentsGateway {
    @Volatile
    private var lastRail: PayoutRail = PayoutRail.STRIPE_CONNECT

    private suspend fun active(): CoachPaymentsGateway {
        val gateway = if (sessionStore.snapshot().isLocalDemo) localDemo else live
        lastRail = gateway.rail()
        return gateway
    }

    /** Last rail observed after a suspend call; defaults to STRIPE_CONNECT. */
    override fun rail(): PayoutRail = lastRail

    override suspend fun revenue(): AppResult<RevenueSnapshot> = active().revenue()
    override suspend fun createInvoice(draft: InvoiceDraft): AppResult<String> =
        active().createInvoice(draft)
    override suspend fun requestTransfer(request: TransferRequest): AppResult<String> =
        active().requestTransfer(request)
}
