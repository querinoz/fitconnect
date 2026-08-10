package com.fitconnect.android.athlete.ui.training

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.fitconnect.android.athlete.domain.LiveSessionPhase
import com.fitconnect.android.athlete.domain.LiveSessionPreviewMachine
import com.fitconnect.android.athlete.domain.LiveSessionUiState
import com.fitconnect.android.athlete.domain.SessionStatus
import com.fitconnect.android.athlete.domain.TrainingSession
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteLoad
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteTag
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun TrainingScreen(
    onOpenSession: (String) -> Unit,
) {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<List<TrainingSession>>?>(null) }
    fun reload() { scope.launch { result = container.athleteRepository.sessions() } }
    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_training")
        reload()
    }

    AthleteLoad(result, ::reload) { sessions ->
        val upcoming = sessions.filter { it.status == SessionStatus.UPCOMING }
        val completed = sessions.filter { it.status == SessionStatus.COMPLETED }
        AthleteScreenScaffold(
            title = "Training Center",
            subtitle = "Upcoming · live preview · completed",
            testTag = "athlete_training",
        ) {
            item { Text("Upcoming", style = MaterialTheme.typography.titleMedium) }
            items(upcoming, key = { it.id }) { session ->
                SessionRow(session) { onOpenSession(session.id) }
            }
            item { Text("Completed", style = MaterialTheme.typography.titleMedium) }
            items(completed, key = { it.id }) { session ->
                SessionRow(session) { onOpenSession(session.id) }
            }
        }
    }
}

@Composable
private fun SessionRow(session: TrainingSession, onClick: () -> Unit) {
    EliteCard(onClick = onClick) {
        EliteTag(session.status.name)
        Text(session.title, style = MaterialTheme.typography.titleLarge)
        Text(
            "${session.sport.value} · ${session.durationMin} min",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
fun SessionDetailScreen(sessionId: String) {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<TrainingSession>?>(null) }
    var live by remember { mutableStateOf(LiveSessionUiState()) }

    fun reload() { scope.launch { result = container.athleteRepository.session(sessionId) } }
    LaunchedEffect(sessionId) { reload() }

    LaunchedEffect(live.phase) {
        when (live.phase) {
            LiveSessionPhase.CONNECTING -> {
                delay(700)
                live = LiveSessionPreviewMachine.onConnected(live)
            }
            LiveSessionPhase.ENDING -> {
                delay(500)
                live = LiveSessionPreviewMachine.onEnded(live)
            }
            else -> Unit
        }
    }

    AthleteLoad(result, ::reload) { session ->
        AthleteScreenScaffold(
            title = session.title,
            subtitle = "${session.sport.value} · ${session.durationMin} min",
            testTag = "athlete_session_detail",
        ) {
            item {
                LiveSessionPreview(
                    state = live,
                    onJoin = { live = LiveSessionPreviewMachine.onJoin(live) },
                    onMute = { live = LiveSessionPreviewMachine.onToggleMute(live) },
                    onCamera = { live = LiveSessionPreviewMachine.onToggleCamera(live) },
                    onEnd = { live = LiveSessionPreviewMachine.onEnd(live) },
                    onError = { live = LiveSessionPreviewMachine.onError(live) },
                    onReset = { live = LiveSessionPreviewMachine.onReset(live) },
                )
            }
            item { Text("Exercises", style = MaterialTheme.typography.titleMedium) }
            items(session.exercises) { ex ->
                EliteCard {
                    Text(ex.name, style = MaterialTheme.typography.titleMedium)
                    Text(ex.detail, style = MaterialTheme.typography.bodyMedium)
                }
            }
            session.notes?.let {
                item {
                    EliteCard {
                        Text("Session notes", style = MaterialTheme.typography.titleMedium)
                        Text(it)
                    }
                }
            }
            session.coachFeedback?.let {
                item {
                    EliteCard {
                        Text("Coach feedback", style = MaterialTheme.typography.titleMedium)
                        Text(it)
                    }
                }
            }
            if (session.mediaUrls.isNotEmpty()) {
                item {
                    EliteCard {
                        Text("Attachments", style = MaterialTheme.typography.titleMedium)
                        session.mediaUrls.forEach { url ->
                            Text(url, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun LiveSessionPreview(
    state: LiveSessionUiState,
    onJoin: () -> Unit,
    onMute: () -> Unit,
    onCamera: () -> Unit,
    onEnd: () -> Unit,
    onError: () -> Unit,
    onReset: () -> Unit,
) {
    val floor = EliteSurfaceColors.FLOOR.toColor()
    EliteCard(modifier = Modifier.testTag("live_session_preview")) {
        EliteBadge(text = DemoPersona.MODE_LABEL)
        Text("Live session preview", style = MaterialTheme.typography.titleLarge)
        Text(
            "Production LiveKit remains HUMAN_PENDING. This is a local UX state machine only.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(160.dp)
                .background(floor, RoundedCornerShape(EliteRadius.Md))
                .padding(EliteSpace.Md),
            contentAlignment = Alignment.Center,
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(state.phase.name.replace('_', ' '), style = MaterialTheme.typography.titleMedium)
                Text(
                    buildString {
                        append(if (state.muted) "Mic muted · " else "Mic on · ")
                        append(if (state.cameraOff) "Camera off" else "Camera on")
                    },
                    style = MaterialTheme.typography.bodySmall,
                )
                Text("Participants: You · Coach Tomás (demo)", style = MaterialTheme.typography.bodySmall)
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
            when (state.phase) {
                LiveSessionPhase.IDLE, LiveSessionPhase.ENDED, LiveSessionPhase.ERROR -> {
                    EliteButton(label = "Join (demo)", onClick = onJoin)
                    if (state.phase == LiveSessionPhase.ERROR) {
                        EliteButton(label = "Reset", variant = EliteButtonVariant.Ghost, onClick = onReset)
                    }
                }
                LiveSessionPhase.CONNECTING, LiveSessionPhase.ENDING -> {
                    Text("Please wait…", style = MaterialTheme.typography.bodyMedium)
                }
                LiveSessionPhase.CONNECTED_DEMO, LiveSessionPhase.MUTED, LiveSessionPhase.CAMERA_OFF -> {
                    EliteButton(
                        label = if (state.muted) "Unmute" else "Mute",
                        variant = EliteButtonVariant.Secondary,
                        onClick = onMute,
                    )
                    EliteButton(
                        label = if (state.cameraOff) "Camera on" else "Camera off",
                        variant = EliteButtonVariant.Secondary,
                        onClick = onCamera,
                    )
                    EliteButton(label = "End", onClick = onEnd)
                    EliteButton(label = "Simulate error", variant = EliteButtonVariant.Ghost, onClick = onError)
                }
            }
        }
    }
}
