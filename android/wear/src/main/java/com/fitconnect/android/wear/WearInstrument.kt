package com.fitconnect.android.wear

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.TransformingLazyColumn
import androidx.wear.compose.foundation.lazy.TransformingLazyColumnDefaults
import androidx.wear.compose.foundation.lazy.TransformingLazyColumnScope
import androidx.wear.compose.foundation.lazy.rememberTransformingLazyColumnState
import androidx.wear.compose.foundation.pager.PagerState
import androidx.wear.compose.foundation.pager.VerticalPager
import androidx.wear.compose.foundation.pager.rememberPagerState
import androidx.wear.compose.foundation.rotary.RotaryScrollableDefaults
import androidx.wear.compose.material3.AnimatedPage
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.EdgeButton
import androidx.wear.compose.material3.ListHeader
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.ScreenScaffold
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.VerticalPagerScaffold
import com.fitconnect.android.capture.LiveActivityEngine
import com.fitconnect.android.capture.LiveActivityPhase
import com.fitconnect.ascend.domain.EventPayload
import com.fitconnect.ascend.domain.EventSource
import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.PerformanceEventType
import com.fitconnect.ascend.domain.StreakKind
import com.fitconnect.ascend.engine.EventIds
import com.fitconnect.shared.identity.LocalDemoIdentity
import com.fitconnect.shared.intelligence.BodyState
import com.fitconnect.shared.intelligence.PerformanceIntelligence
import com.fitconnect.shared.telemetry.MetricAvailability
import com.fitconnect.shared.workout.WorkoutSport
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private enum class WearIdlePane {
    HOME,
    READINESS,
    HEART_RATE,
    ASCEND,
    SLEEP,
    RECOVERY,
    STEPS,
    SETTINGS,
}

@Composable
fun WearInstrument(
    engine: LiveActivityEngine,
    sender: WearTelemetrySender,
    hrCapability: MetricAvailability,
    deviceId: String,
    companionLabel: String,
) {
    val snap by engine.state.collectAsState()
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val ambient = LocalWearAmbient.current
    val pagerState = rememberPagerState(pageCount = { WearIdlePane.entries.size })
    val sessionActive = snap.phase == LiveActivityPhase.COUNTDOWN ||
        snap.phase == LiveActivityPhase.RUNNING ||
        snap.phase == LiveActivityPhase.PAUSED ||
        snap.phase == LiveActivityPhase.RESUMING ||
        snap.phase == LiveActivityPhase.FINISHING
    val showSummary = snap.phase == LiveActivityPhase.ENDED

    LaunchedEffect(snap.phase, snap.elapsedMs, ambient) {
        WearOngoingController.sync(context, snap.phase, snap.elapsedMs)
    }

    LaunchedEffect(snap.phase) {
        when (snap.phase) {
            LiveActivityPhase.COUNTDOWN -> {
                while (engine.state.value.phase == LiveActivityPhase.COUNTDOWN) {
                    delay(1_000)
                    engine.tickCountdown()
                }
            }
            LiveActivityPhase.RUNNING -> {
                WearRuntime.sessionId = engine.state.value.sessionId.ifBlank { WearRuntime.sessionId }
                while (engine.state.value.phase == LiveActivityPhase.RUNNING) {
                    delay(1_000)
                    engine.tick()
                    val current = engine.state.value
                    sender.publish(
                        snapshot = current,
                        heartRateCapability = hrCapability,
                        sessionId = current.sessionId.ifBlank { WearRuntime.sessionId },
                        deviceId = deviceId,
                        userId = LocalDemoIdentity.ATHLETE_ID,
                        sequenceNumber = WearRuntime.nextSequence(),
                        timestampEpochMs = System.currentTimeMillis(),
                    )
                }
            }
            LiveActivityPhase.ENDED -> {
                val current = engine.state.value
                if (current.sessionId.isNotBlank()) {
                    WearRuntime.ascend.process(
                        PerformanceEvent(
                            eventId = EventIds.workoutCompleted(LocalDemoIdentity.ATHLETE_ID, current.sessionId),
                            userId = LocalDemoIdentity.ATHLETE_ID,
                            type = PerformanceEventType.WORKOUT_COMPLETED,
                            timestampEpochMs = System.currentTimeMillis(),
                            source = EventSource.WATCH,
                            payload = EventPayload(
                                sessionId = current.sessionId,
                                sport = current.sport,
                                distanceM = current.distanceM,
                                durationMs = current.elapsedMs,
                                elevationGainM = current.elevationGainM,
                                caloriesKcal = current.caloriesKcal,
                                avgPaceSecPerKm = current.paceSecPerKm,
                                avgHrBpm = current.avgHrBpm,
                                demo = true,
                            ),
                        ),
                    )
                }
            }
            else -> Unit
        }
    }

    val hrText = if (hrCapability == MetricAvailability.AVAILABLE) {
        snap.hrBpm?.let { "HR $it · Z${snap.zone}" } ?: "HR —"
    } else {
        "HR UNAVAILABLE"
    }

    when {
        sessionActive -> WearActivePane(
            engine = engine,
            snapElapsed = snap.elapsedMs,
            snapHr = snap.hrBpm,
            snapZone = snap.zone,
            phase = snap.phase,
            hrCapability = hrCapability,
            countdown = snap.countdownRemainingSec,
        )
        showSummary -> WearSummaryPane(engine)
        else -> WearIdlePager(
            pagerState = pagerState,
            hrText = hrText,
            hrCapability = hrCapability,
            snapHr = snap.hrBpm,
            companionLabel = companionLabel,
            pendingCount = sender.pendingCount,
            blocked = WearRuntime.lastBlockCode,
            onStart = {
                if (WearRuntime.claimLocalStart(WorkoutSport.RUN.wireKey)) {
                    engine.arm(WorkoutSport.RUN.wireKey)
                    engine.beginCountdown()
                }
            },
            onOpenSettings = {
                scope.launch { pagerState.animateScrollToPage(WearIdlePane.SETTINGS.ordinal) }
            },
        )
    }
}

@Composable
private fun WearIdlePager(
    pagerState: PagerState,
    hrText: String,
    hrCapability: MetricAvailability,
    snapHr: Int?,
    companionLabel: String,
    pendingCount: Int,
    blocked: String?,
    onStart: () -> Unit,
    onOpenSettings: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    BackHandler(enabled = pagerState.currentPage > 0) {
        scope.launch { pagerState.animateScrollToPage(pagerState.currentPage - 1) }
    }
    VerticalPagerScaffold(pagerState = pagerState) {
        VerticalPager(
            state = pagerState,
            rotaryScrollableBehavior = RotaryScrollableDefaults.snapBehavior(pagerState),
        ) { page ->
            val pane = WearIdlePane.entries[page]
            AnimatedPage(pageIndex = page, pagerState = pagerState) {
                when (pane) {
                    WearIdlePane.HOME -> WearHomePane(
                        hrText = hrText,
                        blocked = blocked,
                        onStart = onStart,
                        onOpenSettings = onOpenSettings,
                    )
                    WearIdlePane.READINESS -> WearMetricPane(
                        title = "READINESS",
                        value = "88",
                        footnote = "CALCULATED · LOCAL_DEMO",
                    )
                    WearIdlePane.HEART_RATE -> WearMetricPane(
                        title = "HEART RATE",
                        value = if (hrCapability == MetricAvailability.AVAILABLE) {
                            "${snapHr ?: "—"}"
                        } else {
                            "UNAVAILABLE"
                        },
                        footnote = hrCapability.name,
                    )
                    WearIdlePane.ASCEND -> {
                        val ascend = WearRuntime.ascend.snapshot(LocalDemoIdentity.ATHLETE_ID)
                        val streak = ascend.streaks.firstOrNull { it.kind == StreakKind.PERFORMANCE }?.days ?: 0
                        WearMetricPane(
                            title = "ASCEND",
                            value = "${ascend.level.rank.code} · ${ascend.totalXp} XP",
                            footnote = "streak $streak · LINK UNVERIFIED · LOCAL_DEMO",
                        )
                    }
                    WearIdlePane.SLEEP -> WearMetricPane(
                        title = "SLEEP",
                        value = "DATA SOURCE REQUIRED",
                        footnote = "No Health Services sleep",
                    )
                    WearIdlePane.RECOVERY -> {
                        val body = PerformanceIntelligence.bodyState(88, hrvAvailable = false, sleepAvailable = false)
                        WearMetricPane(
                            title = "RECOVERY",
                            value = if (body == BodyState.DATA_SOURCE_REQUIRED) "NO SOURCE" else body.name,
                            footnote = "Performance Intelligence",
                        )
                    }
                    WearIdlePane.STEPS -> WearMetricPane(
                        title = "STEPS",
                        value = "DATA SOURCE REQUIRED",
                        footnote = "Not a fabricated count",
                    )
                    WearIdlePane.SETTINGS -> WearMetricPane(
                        title = "SETTINGS",
                        value = companionLabel,
                        footnote = "queued $pendingCount",
                    )
                }
            }
        }
    }
}

@Composable
private fun WearHomePane(
    hrText: String,
    blocked: String?,
    onStart: () -> Unit,
    onOpenSettings: () -> Unit,
) {
    WearColumn(
        edgeButton = {
            EdgeButton(onClick = onStart) {
                Text("START")
            }
        },
    ) {
        item {
            ListHeader {
                Text(
                    "READINESS",
                    color = MaterialTheme.colorScheme.secondary,
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.semantics { heading() },
                )
            }
        }
        item {
            Text(
                "88",
                style = MaterialTheme.typography.displaySmall,
                color = MaterialTheme.colorScheme.primary,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        item {
            Text(
                "READY · LOCAL_DEMO",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        item {
            Text(
                hrText,
                color = MaterialTheme.colorScheme.tertiary,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        if (blocked != null) {
            item {
                Text(
                    blocked,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.labelSmall,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
        item {
            Button(onClick = onOpenSettings, modifier = Modifier.fillMaxWidth()) {
                Text("MORE")
            }
        }
    }
}

@Composable
private fun WearActivePane(
    engine: LiveActivityEngine,
    snapElapsed: Long,
    snapHr: Int?,
    snapZone: Int?,
    phase: LiveActivityPhase,
    hrCapability: MetricAvailability,
    countdown: Int,
) {
    val ambient = LocalWearAmbient.current
    val hrAvailable = hrCapability == MetricAvailability.AVAILABLE && snapHr != null
    val primaryValue = when {
        phase == LiveActivityPhase.COUNTDOWN -> countdown.toString()
        hrAvailable -> "${snapHr ?: "—"}"
        else -> LiveActivityEngine.formatElapsed(snapElapsed)
    }
    val primaryLabel = when {
        phase == LiveActivityPhase.COUNTDOWN -> "COUNTDOWN"
        hrAvailable -> "HR"
        else -> "ELAPSED"
    }
    WearColumn(
        edgeButton = {
            when (phase) {
                LiveActivityPhase.PAUSED -> EdgeButton(onClick = engine::resume) { Text("RESUME") }
                LiveActivityPhase.COUNTDOWN -> EdgeButton(onClick = engine::end) { Text("CANCEL") }
                else -> EdgeButton(onClick = engine::pause) { Text("PAUSE") }
            }
        },
    ) {
        item {
            ListHeader {
                Text(
                    if (phase == LiveActivityPhase.PAUSED) "PAUSED" else primaryLabel,
                    color = if (phase == LiveActivityPhase.PAUSED) {
                        MaterialTheme.colorScheme.error
                    } else {
                        MaterialTheme.colorScheme.secondary
                    },
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.semantics { heading() },
                )
            }
        }
        item {
            Text(
                primaryValue,
                style = MaterialTheme.typography.displaySmall,
                color = MaterialTheme.colorScheme.primary,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        if (!ambient) {
            item {
                val zone = if (hrAvailable) "ZONE ${snapZone ?: "—"}" else "LOCAL_DEMO"
                Text(
                    zone,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            if (phase == LiveActivityPhase.PAUSED || phase == LiveActivityPhase.RUNNING) {
                item {
                    Button(
                        onClick = engine::end,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.errorContainer,
                        ),
                    ) {
                        Text("FINISH")
                    }
                }
            }
        }
    }
}

@Composable
private fun WearSummaryPane(engine: LiveActivityEngine) {
    val snap by engine.state.collectAsState()
    WearColumn(
        edgeButton = {
            EdgeButton(onClick = engine::discard) { Text("DONE") }
        },
    ) {
        item {
            ListHeader {
                Text(
                    "COMPLETE",
                    color = MaterialTheme.colorScheme.primary,
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.semantics { heading() },
                )
            }
        }
        item {
            Text(
                LiveActivityEngine.formatElapsed(snap.elapsedMs),
                style = MaterialTheme.typography.displaySmall,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        item {
            val ascend = WearRuntime.ascend.snapshot(LocalDemoIdentity.ATHLETE_ID)
            Text(
                "ASCEND ${ascend.level.rank.code} · LOCAL_DEMO",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.secondary,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

@Composable
private fun WearMetricPane(title: String, value: String, footnote: String) {
    WearColumn {
        item {
            Text(
                title,
                color = MaterialTheme.colorScheme.secondary,
                style = MaterialTheme.typography.titleMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().semantics { heading() },
            )
        }
        item {
            Text(
                value,
                style = MaterialTheme.typography.displaySmall,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        item {
            Text(
                footnote,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

@Composable
private fun WearColumn(
    edgeButton: (@Composable BoxScope.() -> Unit)? = null,
    content: TransformingLazyColumnScope.() -> Unit,
) {
    val state = rememberTransformingLazyColumnState()
    val body: @Composable BoxScope.(androidx.compose.foundation.layout.PaddingValues) -> Unit =
        { contentPadding ->
            TransformingLazyColumn(
                modifier = Modifier.fillMaxSize(),
                state = state,
                contentPadding = contentPadding,
                flingBehavior = TransformingLazyColumnDefaults.snapFlingBehavior(state),
                rotaryScrollableBehavior = RotaryScrollableDefaults.snapBehavior(state),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(
                    com.fitconnect.android.design.EliteSurfaceSpacing.SM.dp,
                ),
                content = content,
            )
        }
    if (edgeButton != null) {
        ScreenScaffold(scrollState = state, edgeButton = edgeButton, content = body)
    } else {
        ScreenScaffold(scrollState = state, content = body)
    }
}
