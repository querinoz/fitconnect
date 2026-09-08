package com.fitconnect.android.coach.ui.revenue

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.fitconnect.android.coach.domain.RevenueSnapshot
import com.fitconnect.android.coach.payments.StripeConnectStatus
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachLoad
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.components.EliteZenithHeader
import com.fitconnect.android.designui.components.HexBadge
import com.fitconnect.android.designui.components.HexBadgeTone
import com.fitconnect.android.designui.components.HexStatus
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun RevenueScreen() {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<RevenueSnapshot>?>(null) }
    var connect by remember { mutableStateOf<StripeConnectStatus?>(null) }
    fun reload() {
        scope.launch {
            result = container.payments.revenue()
            connect = (container.connectStatus.status() as? AppResult.Ok)?.value
        }
    }
    LaunchedEffect(Unit) {
        container.platform.analytics.screen("coach_revenue")
        reload()
    }

    CoachLoad(result, ::reload) { revenue ->
        CoachScreenScaffold(
            title = "Revenue",
            subtitle = "Subscriptions · bookings · invoices · payouts · Stripe architecture",
            testTag = "coach_revenue",
            showTitle = false,
        ) {
            item {
                EosPremiumCard {
                    Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
                        EliteZenithHeader(
                            sysLabel = "REVENUE COMMAND",
                            title = "Revenue",
                            subtitle = "Coach revenue stays operationally honest: Stripe rail, payout state, and open invoices.",
                            badge = {
                                HexBadge(
                                    text = revenue.subscriptions.coerceAtMost(99).toString().padStart(2, '0'),
                                    tone = HexBadgeTone.Success,
                                )
                            },
                        )
                        HexStatus(container.payments.rail().toString())
                        HexStatus(connectStatusLabel(connect))
                    }
                }
            }
            item {
                EliteMetricCard(label = "This week", value = "€${revenue.weekCents / 100}")
                EliteMetricCard(label = "This month", value = "€${revenue.monthCents / 100}")
                EliteMetricCard(label = "Pending payout", value = "€${revenue.pendingPayoutCents / 100}")
            }
            item {
                EosPremiumCard {
                    Text("Subscriptions: ${revenue.subscriptions}", style = MaterialTheme.typography.bodyLarge)
                    Text("Bookings paid: ${revenue.bookingsPaid}", style = MaterialTheme.typography.bodyLarge)
                    Text("Invoices open: ${revenue.invoicesOpen}", style = MaterialTheme.typography.bodyLarge)
                    Text("Transfers pending: ${revenue.transfersPending}", style = MaterialTheme.typography.bodyLarge)
                    Text("Payout: ${revenue.payoutStatus}", style = MaterialTheme.typography.bodyMedium)
                    Text(
                        "Rail: ${container.payments.rail()}",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Text(
                        "Connect: ${connectStatusLabel(connect)}",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}

internal fun connectStatusLabel(status: StripeConnectStatus?): String {
    if (status == null) return "CONNECT · UNAVAILABLE"
    if (!status.configured || !status.live) return "CONNECT · NOT_CONFIGURED"
    if (status.payoutsReady) return "CONNECT · PAYOUTS_READY"
    if (status.onboardingComplete) return "CONNECT · ONBOARDING_COMPLETE"
    return "CONNECT · PENDING"
}
