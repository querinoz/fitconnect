package com.fitconnect.android.coach.ui.sessions

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
import com.fitconnect.android.coach.domain.CoachSession
import com.fitconnect.android.coach.domain.SessionLifecycle
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachLoad
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun SessionsScreen(onOpenSession: (String) -> Unit) {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<List<CoachSession>>?>(null) }
    fun reload() { scope.launch { result = container.coachRepository.sessions() } }
    LaunchedEffect(Unit) {
        container.platform.analytics.screen("coach_sessions")
        reload()
    }

    CoachLoad(result, ::reload) { all ->
        val upcoming = all.filter { it.lifecycle == SessionLifecycle.UPCOMING || it.lifecycle == SessionLifecycle.RESCHEDULED || it.lifecycle == SessionLifecycle.LIVE }
        val past = all.filter { it.lifecycle == SessionLifecycle.COMPLETED || it.lifecycle == SessionLifecycle.CANCELLED }
        CoachScreenScaffold(
            title = "Sessions",
            subtitle = "Upcoming · past · attendance · feedback",
            testTag = "coach_sessions",
        ) {
            item { Text("Upcoming", style = MaterialTheme.typography.titleMedium) }
            items(upcoming, key = { it.id }) { session ->
                EliteCard(onClick = { onOpenSession(session.id) }) {
                    Text(session.title, style = MaterialTheme.typography.titleMedium)
                    Text(
                        "${session.lifecycle} · ${session.kind} · ${session.athleteNames.joinToString()}",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
            item { Text("Past", style = MaterialTheme.typography.titleMedium) }
            items(past, key = { it.id }) { session ->
                EliteCard(onClick = { onOpenSession(session.id) }) {
                    Text(session.title, style = MaterialTheme.typography.titleMedium)
                    Text(session.lifecycle.name, style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}

@Composable
fun SessionDetailScreen(sessionId: String) {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<CoachSession>?>(null) }
    fun reload() { scope.launch { result = container.coachRepository.session(sessionId) } }
    LaunchedEffect(sessionId) {
        container.platform.analytics.screen("coach_session_detail")
        reload()
    }

    CoachLoad(result, ::reload) { session ->
        CoachScreenScaffold(
            title = session.title,
            subtitle = "${session.kind} · ${session.lifecycle}",
            testTag = "coach_session_detail",
        ) {
            item {
                Text("Athletes: ${session.athleteNames.joinToString()}", style = MaterialTheme.typography.bodyLarge)
                Text("Duration: ${session.durationMin} min", style = MaterialTheme.typography.bodyMedium)
                Text("Location: ${session.location ?: "Video / remote"}", style = MaterialTheme.typography.bodyMedium)
                Text("Timezone: ${session.timezone}", style = MaterialTheme.typography.bodyMedium)
            }
            item { Text("Attendance", style = MaterialTheme.typography.titleMedium) }
            items(session.attendance.entries.toList()) { (id, present) ->
                Text("$id · ${if (present) "Present" else "Absent"}", style = MaterialTheme.typography.bodyMedium)
            }
            item { Text("Attachments", style = MaterialTheme.typography.titleMedium) }
            items(session.attachments) { Text(it, style = MaterialTheme.typography.bodyMedium) }
            item {
                Text("Coach feedback", style = MaterialTheme.typography.titleMedium)
                Text(session.coachFeedback ?: "—", style = MaterialTheme.typography.bodyLarge)
                Text("Athlete feedback", style = MaterialTheme.typography.titleMedium)
                Text(session.athleteFeedback ?: "—", style = MaterialTheme.typography.bodyLarge)
            }
            item {
                EliteCard(onClick = {
                    scope.launch {
                        container.coachRepository.rescheduleSession(session.id, session.startEpochMs + 3_600_000)
                        reload()
                    }
                }) { Text("Reschedule +1 hour", style = MaterialTheme.typography.titleMedium) }
            }
            item {
                EliteCard(onClick = {
                    scope.launch {
                        container.coachRepository.cancelSession(session.id)
                        reload()
                    }
                }) {
                    Text("Cancel session", color = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}
