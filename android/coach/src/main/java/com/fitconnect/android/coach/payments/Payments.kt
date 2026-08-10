package com.fitconnect.android.coach.payments

import com.fitconnect.android.coach.domain.RevenueSnapshot
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult

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

class ArchitectureCoachPaymentsGateway : CoachPaymentsGateway {
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
            payoutStatus = "Architecture only — connect Stripe",
        ),
    )

    override suspend fun createInvoice(draft: InvoiceDraft): AppResult<String> =
        AppResult.Err(AppError.Unexpected("Stripe not configured — invoice staged locally for ${draft.athleteId}"))

    override suspend fun requestTransfer(request: TransferRequest): AppResult<String> =
        AppResult.Err(AppError.Unexpected("Stripe Connect not configured"))
}
