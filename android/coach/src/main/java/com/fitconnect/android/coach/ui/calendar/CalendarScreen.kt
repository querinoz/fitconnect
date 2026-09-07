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
import com.fitconnect.android.coach.domain.CalendarEvent
import com.fitconnect.android.coach.domain.CalendarViewMode
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachLoad
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteEmptyState
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun CalendarScreen(
    onOpenSession: (String) -> Unit,
    onOpenSessions: () -> Unit,
) {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var mode by remember { mutableStateOf(CalendarViewMode.AGENDA) }
    var result by remember { mutableStateOf<AppResult<List<CalendarEvent>>?>(null) }
    var rescheduleError by remember { mutableStateOf<String?>(null) }

    fun reload() {
        scope.launch {
            result = container.coachRepository.calendarEvents()
        }
    }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("coach_calendar")
        reload()
    }

    CoachLoad(result, ::reload) { events ->
        val filtered = when (mode) {
            CalendarViewMode.DAY -> events.take(2)
            CalendarViewMode.WEEK -> events
            CalendarViewMode.MONTH -> events
            CalendarViewMode.AGENDA -> events.sortedBy { it.startEpochMs }
        }

        CoachScreenScaffold(
            title = "Calendar",
            subtitle = "Sessions from canonical coach schedule",
            testTag = "coach_calendar",
        ) {
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                    CalendarViewMode.entries.forEach { m ->
                        EliteChip(
                            label = m.name.lowercase().replaceFirstChar { it.uppercase() },
                            onClick = { mode = m },
                        )
                    }
                }
            }
            rescheduleError?.let { err ->
                item {
                    Text(err, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                }
            }
            if (filtered.isEmpty()) {
                item {
                    EliteEmptyState(
                        title = "No sessions",
                        body = "Scheduled sessions appear here when present.",
                    )
                }
            }
            items(filtered, key = { it.id }) { event ->
                EliteCard(onClick = { event.sessionId?.let(onOpenSession) }) {
                    Text(event.title, style = MaterialTheme.typography.titleMedium)
                    Text(
                        "Session ${event.sessionId.orEmpty()}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    if (event.sessionId != null) {
                        EliteButton(
                            label = "Move +1h",
                            variant = EliteButtonVariant.Secondary,
                            onClick = {
                                scope.launch {
                                    when (
                                        val r = container.coachRepository.rescheduleSession(
                                            event.sessionId,
                                            event.startEpochMs + 3_600_000,
                                        )
                                    ) {
                                        is AppResult.Ok -> {
                                            rescheduleError = null
                                            reload()
                                        }
                                        is AppResult.Err -> {
                                            rescheduleError = r.error.toString()
                                        }
                                    }
                                }
                            },
                        )
                        EliteButton(
                            label = "Cancel",
                            variant = EliteButtonVariant.Ghost,
                            onClick = {
                                scope.launch {
                                    when (
                                        val r = container.coachRepository.cancelSession(event.sessionId)
                                    ) {
                                        is AppResult.Ok -> {
                                            rescheduleError = null
                                            reload()
                                        }
                                        is AppResult.Err -> {
                                            rescheduleError = r.error.toString()
                                        }
                                    }
                                }
                            },
                        )
                    }
                }
            }
            item {
                EliteButton("All sessions", onClick = onOpenSessions, variant = EliteButtonVariant.Ghost)
            }
        }
    }
}
