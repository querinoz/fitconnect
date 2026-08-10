package com.fitconnect.android.coach.ui.calendar

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.fitconnect.android.coach.domain.AvailabilitySlot
import com.fitconnect.android.coach.domain.CalendarEvent
import com.fitconnect.android.coach.domain.CalendarViewMode
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.theme.EliteSpace
import kotlinx.coroutines.launch

@Composable
fun CalendarScreen(
    onOpenSession: (String) -> Unit,
    onOpenSessions: () -> Unit,
) {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var mode by remember { mutableStateOf(CalendarViewMode.AGENDA) }
    var events by remember { mutableStateOf<List<CalendarEvent>>(emptyList()) }
    var availability by remember { mutableStateOf<List<AvailabilitySlot>>(emptyList()) }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("coach_calendar")
        events = (container.coachRepository.calendarEvents() as? com.fitconnect.android.foundation.common.AppResult.Ok)?.value.orEmpty()
        availability = (container.coachRepository.availability() as? com.fitconnect.android.foundation.common.AppResult.Ok)?.value.orEmpty()
    }

    val filtered = when (mode) {
        CalendarViewMode.DAY -> events.take(2)
        CalendarViewMode.WEEK -> events
        CalendarViewMode.MONTH -> events
        CalendarViewMode.AGENDA -> events.sortedBy { it.startEpochMs }
    }

    CoachScreenScaffold(
        title = "Calendar",
        subtitle = "Day · week · month · agenda · conflicts · travel · TZ",
        testTag = "coach_calendar",
    ) {
        item {
            Row(
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
                content = {
                    CalendarViewMode.entries.forEach { m ->
                        EliteChip(
                            label = m.name.lowercase().replaceFirstChar { it.uppercase() },
                            onClick = { mode = m },
                        )
                    }
                },
            )
        }
        item {
            Text("View · ${mode.name} · Europe/Lisbon", style = MaterialTheme.typography.labelLarge)
            Text(
                "Drag-and-drop reschedule uses session actions (move +1h / cancel). Gesture DnD ships with platform pointer APIs.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        items(filtered, key = { it.id }) { event ->
            EliteCard(onClick = { event.sessionId?.let(onOpenSession) }) {
                Text(event.title, style = MaterialTheme.typography.titleMedium)
                Text(
                    buildString {
                        append("TZ Europe/Lisbon")
                        if (event.recurringRule != null) append(" · recurring ${event.recurringRule}")
                        if (event.travelMinutes > 0) append(" · travel ${event.travelMinutes}m")
                        if (event.conflict) append(" · CONFLICT")
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (event.conflict) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant,
                )
                if (event.sessionId != null) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
                        content = {
                            EliteButton(
                                label = "Move +1h",
                                variant = EliteButtonVariant.Secondary,
                                onClick = {
                                    scope.launch {
                                        container.coachRepository.rescheduleSession(
                                            event.sessionId,
                                            event.startEpochMs + 3_600_000,
                                        )
                                        events = (container.coachRepository.calendarEvents() as? com.fitconnect.android.foundation.common.AppResult.Ok)?.value.orEmpty()
                                    }
                                },
                            )
                        },
                    )
                }
            }
        }
        item { Text("Availability", style = MaterialTheme.typography.titleMedium) }
        items(availability) { slot ->
            Text(
                "${slot.dayLabel} · ${slot.startHour}:00–${slot.endHour}:00 · ${slot.timezone}",
                style = MaterialTheme.typography.bodyMedium,
            )
        }
        item {
            EliteButton("All sessions", onClick = onOpenSessions, variant = EliteButtonVariant.Ghost)
        }
    }
}
