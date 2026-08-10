package com.fitconnect.android.coach.ui.bookings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.fitconnect.android.coach.domain.BookingRequest
import com.fitconnect.android.coach.domain.BookingStatus
import com.fitconnect.android.coach.domain.CancellationPolicy
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachLoad
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun BookingsScreen() {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    val bookingRevision by container.geo.booking.revisions().collectAsState(initial = 0L)
    var result by remember { mutableStateOf<AppResult<List<BookingRequest>>?>(null) }
    var policy by remember { mutableStateOf<CancellationPolicy?>(null) }
    fun reload() {
        scope.launch {
            result = container.coachRepository.bookings()
            policy = (container.coachRepository.cancellationPolicy() as? AppResult.Ok)?.value
        }
    }
    LaunchedEffect(bookingRevision) {
        container.platform.analytics.screen("coach_bookings")
        reload()
    }

    CoachLoad(result, ::reload) { bookings ->
        CoachScreenScaffold(
            title = "Bookings",
            subtitle = "Requests · approve · reject · payment · reminders",
            testTag = "coach_bookings",
        ) {
            policy?.let { p ->
                item {
                    EliteCard {
                        Text("Cancellation policy", style = MaterialTheme.typography.titleMedium)
                        Text(
                            "${p.hoursNotice}h notice · ${p.refundPercent}% refund · reminders ${p.reminderHoursBefore.joinToString()}h",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                }
            }
            items(bookings, key = { it.id }) { booking ->
                EliteCard {
                    Text(booking.athleteName, style = MaterialTheme.typography.titleMedium)
                    Text(
                        "${booking.status} · payment ${booking.paymentStatus}",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    booking.notes?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
                    if (booking.status == BookingStatus.PENDING) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
                            content = {
                                EliteButton(
                                    label = "Approve",
                                    onClick = {
                                        scope.launch {
                                            container.coachRepository.approveBooking(booking.id)
                                            reload()
                                        }
                                    },
                                )
                                EliteButton(
                                    label = "Reject",
                                    variant = EliteButtonVariant.Ghost,
                                    onClick = {
                                        scope.launch {
                                            container.coachRepository.rejectBooking(booking.id)
                                            reload()
                                        }
                                    },
                                )
                            },
                        )
                    }
                }
            }
        }
    }
}
