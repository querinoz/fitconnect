package com.fitconnect.android.wear

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.Text
import com.fitconnect.android.capture.LiveActivityEngine
import com.fitconnect.android.capture.LiveActivityPhase
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.ascend.domain.EventPayload
import com.fitconnect.ascend.domain.EventSource
import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.PerformanceEventType
import com.fitconnect.ascend.engine.EventIds
import com.fitconnect.ascend.domain.StreakKind
import com.fitconnect.shared.intelligence.BodyState
import com.fitconnect.shared.intelligence.PerformanceIntelligence
import com.fitconnect.shared.telemetry.MetricAvailability
import com.fitconnect.shared.workout.WorkoutSport
import kotlinx.coroutines.delay

enum class WearPane {
    HOME,
    READINESS,
    WORKOUT,
    PAUSE,
    SUMMARY,
    HEART_RATE,
    SLEEP,
    RECOVERY,
    STEPS,
    ASCEND,
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
    var pane by remember { mutableStateOf(WearPane.HOME) }
    LaunchedEffect(snap.phase) {
        when (snap.phase) {
            LiveActivityPhase.COUNTDOWN -> {
                while (engine.state.value.phase == LiveActivityPhase.COUNTDOWN) {
                    delay(1_000)
                    engine.tickCountdown()
                }
            }
            LiveActivityPhase.RUNNING -> {
                pane = WearPane.WORKOUT
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
                        userId = "local",
                        sequenceNumber = WearRuntime.nextSequence(),
                        timestampEpochMs = System.currentTimeMillis(),
                    )
                }
            }
            LiveActivityPhase.PAUSED -> pane = WearPane.PAUSE
            LiveActivityPhase.ENDED -> {
                pane = WearPane.SUMMARY
                val current = engine.state.value
                if (current.sessionId.isNotBlank()) {
                    WearRuntime.ascend.process(
                        PerformanceEvent(
                            eventId = EventIds.workoutCompleted("wear-local", current.sessionId),
                            userId = "wear-local",
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
    val zoneText = if (hrCapability == MetricAvailability.AVAILABLE) {
        "ZONE ${snap.zone ?: "—"}"
    } else {
        "ZONE UNAVAILABLE"
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(EliteSurfaceColors.FLOOR))
            .padding(10.dp)
            .pointerInput(pane) {
                detectHorizontalDragGestures { _, drag ->
                    if (drag < -40) pane = pane.next()
                    if (drag > 40) pane = pane.prev()
                }
            },
        verticalArrangement = Arrangement.spacedBy(3.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("FITCONNECT", color = Color(EliteSurfaceColors.VOLTLINE), fontSize = 11.sp, fontWeight = FontWeight.Bold)
        Text(companionLabel, color = Color(EliteSurfaceColors.ON_SURFACE_MUTED), fontSize = 8.sp)
        when (pane) {
            WearPane.HOME -> WearHomePane(
                hrText = hrText,
                onStart = {
                    engine.arm(WorkoutSport.RUN.wireKey)
                    engine.beginCountdown()
                },
                onOpen = { pane = it },
            )
            WearPane.READINESS -> WearMetricPane("READINESS", "88", "CALCULATED · LOCAL_DEMO")
            WearPane.WORKOUT -> WearWorkoutPane(engine, snap.elapsedMs, snap.distanceM, snap.paceSecPerKm, hrText, zoneText)
            WearPane.PAUSE -> WearPausePane(engine)
            WearPane.SUMMARY -> WearSummaryPane(engine)
            WearPane.HEART_RATE -> WearMetricPane("HEART RATE", if (hrCapability == MetricAvailability.AVAILABLE) "${snap.hrBpm ?: "—"}" else "UNAVAILABLE", hrCapability.name)
            WearPane.SLEEP -> WearMetricPane("SLEEP", "DATA SOURCE REQUIRED", "No Health Services sleep")
            WearPane.RECOVERY -> {
                val body = PerformanceIntelligence.bodyState(88, hrvAvailable = false, sleepAvailable = false)
                WearMetricPane("RECOVERY", if (body == BodyState.DATA_SOURCE_REQUIRED) "NO SOURCE" else body.name, "Performance Intelligence")
            }
            WearPane.STEPS -> WearMetricPane("STEPS", "DATA SOURCE REQUIRED", "Not a fabricated count")
            WearPane.ASCEND -> {
                val snap = WearRuntime.ascend.snapshot("wear-local")
                val streak = snap.streaks.firstOrNull { it.kind == StreakKind.PERFORMANCE }?.days ?: 0
                WearMetricPane(
                    "ASCEND",
                    "${snap.level.rank.code} · ${snap.totalXp} XP",
                    "streak $streak · LINK UNVERIFIED · LOCAL_DEMO",
                )
            }
            WearPane.SETTINGS -> WearMetricPane("SETTINGS", companionLabel, "queued ${sender.pendingCount}")
        }
    }
}

@Composable
private fun WearHomePane(
    hrText: String,
    onStart: () -> Unit,
    onOpen: (WearPane) -> Unit,
) {
    Text("READINESS", color = Color(EliteSurfaceColors.CONNECT), fontSize = 9.sp)
    Text("88", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Color(EliteSurfaceColors.VOLTLINE))
    Text("READY · LOCAL_DEMO", fontSize = 9.sp, color = Color(EliteSurfaceColors.ON_SURFACE_MUTED))
    Text(hrText, color = Color(EliteSurfaceColors.TELEMETRY), fontSize = 12.sp)
    Button(
        onClick = onStart,
        modifier = Modifier.fillMaxWidth(),
        colors = ButtonDefaults.primaryButtonColors(),
    ) { Text("START") }
    Button(onClick = { onOpen(WearPane.SETTINGS) }, modifier = Modifier.fillMaxWidth()) { Text("MORE") }
}

@Composable
private fun WearWorkoutPane(
    engine: LiveActivityEngine,
    elapsedMs: Long,
    distanceM: Double,
    pace: Double?,
    hrText: String,
    zoneText: String,
) {
    Text("LIVE TELEMETRY", color = Color(EliteSurfaceColors.CONNECT), fontSize = 8.sp)
    Text(LiveActivityEngine.formatElapsed(elapsedMs), fontSize = 22.sp, fontWeight = FontWeight.Bold)
    Text("%.2f KM".format(distanceM / 1000.0), fontSize = 14.sp, color = Color(EliteSurfaceColors.VOLTLINE))
    Text(LiveActivityEngine.formatPace(pace), fontSize = 12.sp)
    Text(hrText, fontSize = 12.sp, color = Color(EliteSurfaceColors.TELEMETRY))
    Text(zoneText, fontSize = 11.sp)
    Button(onClick = engine::pause, modifier = Modifier.fillMaxWidth()) { Text("PAUSE") }
    Button(onClick = engine::end, modifier = Modifier.fillMaxWidth()) { Text("FINISH") }
}

@Composable
private fun WearPausePane(engine: LiveActivityEngine) {
    Text("PAUSED", color = Color(EliteSurfaceColors.RECOVERY), fontSize = 14.sp, fontWeight = FontWeight.Bold)
    Button(onClick = engine::resume, modifier = Modifier.fillMaxWidth()) { Text("RESUME") }
    Button(onClick = engine::end, modifier = Modifier.fillMaxWidth()) { Text("FINISH") }
}

@Composable
private fun WearSummaryPane(engine: LiveActivityEngine) {
    val snap by engine.state.collectAsState()
    Text("PERFORMANCE COMPLETE", color = Color(EliteSurfaceColors.VOLTLINE), fontSize = 9.sp)
    Text("%.2f KM".format(snap.distanceM / 1000.0), fontSize = 16.sp)
    Text(LiveActivityEngine.formatElapsed(snap.elapsedMs), fontSize = 14.sp)
    val ascend = WearRuntime.ascend.snapshot("wear-local")
    Text("ASCEND ${ascend.level.rank.code} · ${ascend.totalXp} XP", fontSize = 11.sp, color = Color(EliteSurfaceColors.CONNECT))
    Text("SCORE ${snap.performanceScore ?: "—"}", fontSize = 12.sp)
    Button(onClick = engine::discard, modifier = Modifier.fillMaxWidth()) { Text("DONE") }
}

@Composable
private fun WearMetricPane(title: String, value: String, footnote: String) {
    Text(title, color = Color(EliteSurfaceColors.CONNECT), fontSize = 9.sp)
    Text(value, fontSize = 18.sp, fontWeight = FontWeight.Bold)
    Text(footnote, fontSize = 8.sp, color = Color(EliteSurfaceColors.ON_SURFACE_MUTED))
}

private fun WearPane.next(): WearPane {
    val all = WearPane.entries
    return all[(ordinal + 1) % all.size]
}

private fun WearPane.prev(): WearPane {
    val all = WearPane.entries
    return all[(ordinal - 1 + all.size) % all.size]
}
