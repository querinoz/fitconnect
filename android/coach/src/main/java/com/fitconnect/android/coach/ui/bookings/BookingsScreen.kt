package com.fitconnect.android.coach.ui.bookings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
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
import com.fitconnect.android.designui.components.EliteEmptyState
import com.fitconnect.android.designui.components.EliteZenithHeader
import com.fitconnect.android.designui.components.HexBadge
import com.fitconnect.android.designui.components.HexBadgeTone
import com.fitconnect.android.designui.components.HexStatus
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun BookingsScreen() {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    val bookingRevision by container.geo.booking.revisions().collectAsState(initial = 0L)
    val realtimeEvent by container.platform.productRealtime.lastEvent.collectAsState()
    var result by remember { mutableStateOf<AppResult<List<BookingRequest>>?>(null) }
    var policy by remember { mutableStateOf<CancellationPolicy?>(null) }
    var busyId by remember { mutableStateOf<String?>(null) }

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
    LaunchedEffect(realtimeEvent?.receivedAtEpochMs) {
        val topic = realtimeEvent?.topic ?: return@LaunchedEffect
        if (topic == com.fitconnect.android.foundation.realtime.ProductRealtimeTopics.BOOKING) {
            reload()
        }
    }

    CoachLoad(result, ::reload) { bookings ->
        CoachScreenScaffold(
            title = "Bookings",
            subtitle = "Requests · approve · reject · payment · reminders",
            testTag = "coach_bookings",
            showTitle = false,
        ) {
            item {
                EosPremiumCard {
                    Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
                        EliteZenithHeader(
                            sysLabel = "BOOKINGS COMMAND",
                            title = "Bookings",
                            subtitle = "Approve requests, protect schedule integrity, and keep payment state fail-closed.",
                            badge = {
                                HexBadge(
                                    text = bookings.count { it.status == BookingStatus.PENDING }
                                        .coerceAtMost(99)
                                        .toString()
                                        .padStart(2, '0'),
                                    tone = HexBadgeTone.Warning,
                                )
                            },
                        )
                        HexStatus("REVISION $bookingRevision")
                    }
                }
            }
            policy?.let { p ->
                item {
                    EosPremiumCard {
                        Text("Cancellation policy", style = MaterialTheme.typography.titleMedium)
                        Text(
                            "${p.hoursNotice}h notice · ${p.refundPercent}% refund · reminders ${p.reminderHoursBefore.joinToString()}h",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                }
            }
            if (bookings.isEmpty()) {
                item {
                    EliteEmptyState(
                        title = "No booking requests",
                        body = "When athletes book an intro, pending requests show up here for approve or reject.",
                        actionLabel = "Refresh",
                        onAction = ::reload,
                    )
                }
            } else {
                items(bookings, key = { it.id }) { booking ->
                    EosPremiumCard {
                        Text(booking.athleteName, style = MaterialTheme.typography.titleMedium)
                        Text(
                            "${booking.status} · payment ${booking.paymentStatus}",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                        HexStatus("${booking.status} · ${booking.paymentStatus}")
                        booking.notes?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
                        if (booking.status == BookingStatus.PENDING) {
                            val busy = busyId == booking.id
                            Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                                EliteButton(
                                    label = "Approve",
                                    loading = busy,
                                    enabled = busyId == null,
                                    onClick = {
                                        if (busyId != null) return@EliteButton
                                        scope.launch {
                                            busyId = booking.id
                                            try {
                                                container.coachRepository.approveBooking(booking.id)
                                                reload()
                                            } finally {
                                                busyId = null
                                            }
                                        }
                                    },
                                )
                                EliteButton(
                                    label = "Reject",
                                    variant = EliteButtonVariant.Ghost,
                                    enabled = busyId == null,
                                    onClick = {
                                        if (busyId != null) return@EliteButton
                                        scope.launch {
                                            busyId = booking.id
                                            try {
                                                container.coachRepository.rejectBooking(booking.id)
                                                reload()
                                            } finally {
                                                busyId = null
                                            }
                                        }
                                    },
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
