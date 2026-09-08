package com.fitconnect.android.athlete.ui.training

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
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
import com.fitconnect.android.athlete.domain.LiveSessionMachine
import com.fitconnect.android.athlete.domain.LiveSessionPhase
import com.fitconnect.android.athlete.domain.LiveSessionUiState
import com.fitconnect.android.athlete.domain.SessionStatus
import com.fitconnect.android.athlete.domain.TrainingSession
import com.fitconnect.android.athlete.live.LiveKitExternalKeys
import com.fitconnect.android.athlete.live.LiveSessionJoinRequest
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteLoad
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteInstrumentRing
import com.fitconnect.android.designui.components.EliteRingHero
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.components.EliteTag
import com.fitconnect.android.designui.theme.EliteMetricHeroTextStyle
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
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
            subtitle = "Upcoming · live session · completed",
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

    DisposableEffect(sessionId) {
        onDispose {
            scope.launch { container.liveSession.leave() }
        }
    }

    LaunchedEffect(live.phase) {
        if (live.phase == LiveSessionPhase.ENDING) {
            container.liveSession.leave()
            live = LiveSessionMachine.onEnded(live)
        }
    }

    AthleteLoad(result, ::reload) { session ->
        AthleteScreenScaffold(
            title = session.title,
            subtitle = "${session.sport.value} · ${session.durationMin} min",
            testTag = "athlete_session_detail",
        ) {
            item {
                val liveProgress = when (live.phase) {
                    LiveSessionPhase.ENDED -> 1f
                    LiveSessionPhase.IDLE, LiveSessionPhase.ERROR -> 0f
                    else -> 0.72f
                }
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    EliteInstrumentRing(
                        progress = liveProgress,
                        diameter = EliteRingHero,
                        contentDescription = "Session ${live.phase.name}",
                        modifier = Modifier.testTag("session_instrument_ring"),
                    ) {
                        Text(
                            if (live.phase == LiveSessionPhase.ENDED) "DONE" else live.phase.name.replace('_', ' '),
                            style = if (live.phase == LiveSessionPhase.ENDED) {
                                EliteMetricHeroTextStyle
                            } else {
                                MaterialTheme.typography.titleMedium
                            },
                            color = MaterialTheme.colorScheme.onBackground,
                        )
                    }
                    EliteSysLabel(
                        if (container.liveSession.isJoined) "LIVEKIT · CONNECTED" else "LIVEKIT · FAIL-CLOSED",
                    )
                }
            }
            item {
                LiveSessionPanel(
                    state = live,
                    joined = container.liveSession.isJoined,
                    onJoin = {
                        live = LiveSessionMachine.onJoin(live)
                        scope.launch {
                            val snap = container.platform.sessionStore.snapshot()
                            val uid = snap.userId
                            if (uid.isNullOrBlank()) {
                                live = LiveSessionMachine.onError(
                                    live,
                                    "EXTERNAL: authenticated participantId required for LiveKit token",
                                )
                                return@launch
                            }
                            val join = container.liveSession.join(
                                LiveSessionJoinRequest(
                                    roomName = "session-$sessionId",
                                    participantName = uid,
                                    participantId = uid,
                                ),
                            )
                            live = when (join) {
                                is AppResult.Ok -> LiveSessionMachine.onConnected(live)
                                is AppResult.Err -> LiveSessionMachine.onError(
                                    live,
                                    joinErrorMessage(join.error),
                                )
                            }
                        }
                    },
                    onMute = {
                        val next = LiveSessionMachine.onToggleMute(live)
                        live = next
                        scope.launch {
                            when (val r = container.liveSession.setMuted(next.muted)) {
                                is AppResult.Ok -> Unit
                                is AppResult.Err -> live = LiveSessionMachine.onError(
                                    live,
                                    joinErrorMessage(r.error),
                                )
                            }
                        }
                    },
                    onCamera = {
                        val next = LiveSessionMachine.onToggleCamera(live)
                        live = next
                        scope.launch {
                            when (val r = container.liveSession.setCameraOff(next.cameraOff)) {
                                is AppResult.Ok -> Unit
                                is AppResult.Err -> live = LiveSessionMachine.onError(
                                    live,
                                    joinErrorMessage(r.error),
                                )
                            }
                        }
                    },
                    onEnd = { live = LiveSessionMachine.onEnd(live) },
                    onReset = { live = LiveSessionMachine.onReset(live) },
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

private fun joinErrorMessage(error: AppError): String = when (error) {
    is AppError.Unexpected -> error.message
    is AppError.Api -> error.message ?: LiveKitExternalKeys.MESSAGE
    is AppError.Auth -> "EXTERNAL: auth required for LiveKit token (${error.kind.name})"
    is AppError.Network -> "Network unavailable (${error.kind.name})"
    is AppError.Storage -> error.message
}

@Composable
private fun LiveSessionPanel(
    state: LiveSessionUiState,
    joined: Boolean,
    onJoin: () -> Unit,
    onMute: () -> Unit,
    onCamera: () -> Unit,
    onEnd: () -> Unit,
    onReset: () -> Unit,
) {
    val panel = MaterialTheme.colorScheme.surfaceVariant
    EliteCard(modifier = Modifier.testTag("live_session_preview")) {
        EliteBadge(text = if (joined) "LIVE" else "FAIL-CLOSED")
        Text("Live session", style = MaterialTheme.typography.titleLarge)
        Text(
            "Joins LiveKit only after POST /api/v1/video/token returns a real URL + JWT. " +
                "Missing LIVEKIT_* server keys fail closed — no fake connected room.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(160.dp)
                .background(panel, RoundedCornerShape(EliteRadius.Md))
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
                if (state.phase == LiveSessionPhase.ERROR) {
                    Text(
                        state.errorMessage ?: LiveKitExternalKeys.MESSAGE,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error,
                    )
                } else if (joined) {
                    Text("Connected to LiveKit room", style = MaterialTheme.typography.bodySmall)
                } else {
                    Text("Not connected", style = MaterialTheme.typography.bodySmall)
                }
            }
        }
        com.fitconnect.android.designui.components.EliteFlowRow {
            when (state.phase) {
                LiveSessionPhase.IDLE, LiveSessionPhase.ENDED, LiveSessionPhase.ERROR -> {
                    EliteButton(label = "Join live", onClick = onJoin)
                    if (state.phase == LiveSessionPhase.ERROR || state.phase == LiveSessionPhase.ENDED) {
                        EliteButton(label = "Reset", variant = EliteButtonVariant.Ghost, onClick = onReset)
                    }
                }
                LiveSessionPhase.CONNECTING, LiveSessionPhase.ENDING -> {
                    Text("Please wait…", style = MaterialTheme.typography.bodyMedium)
                }
                LiveSessionPhase.CONNECTED, LiveSessionPhase.MUTED, LiveSessionPhase.CAMERA_OFF -> {
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
                }
            }
        }
    }
}
