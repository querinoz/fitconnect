package com.fitconnect.android.coach.ui.revenue

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
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachLoad
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun RevenueScreen() {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<RevenueSnapshot>?>(null) }
    fun reload() { scope.launch { result = container.payments.revenue() } }
    LaunchedEffect(Unit) {
        container.platform.analytics.screen("coach_revenue")
        reload()
    }

    CoachLoad(result, ::reload) { revenue ->
        CoachScreenScaffold(
            title = "Revenue",
            subtitle = "Subscriptions · bookings · invoices · payouts · Stripe architecture",
            testTag = "coach_revenue",
        ) {
            item {
                EliteMetricCard(label = "This week", value = "€${revenue.weekCents / 100}")
                EliteMetricCard(label = "This month", value = "€${revenue.monthCents / 100}")
                EliteMetricCard(label = "Pending payout", value = "€${revenue.pendingPayoutCents / 100}")
            }
            item {
                EliteCard {
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
                }
            }
        }
    }
}
