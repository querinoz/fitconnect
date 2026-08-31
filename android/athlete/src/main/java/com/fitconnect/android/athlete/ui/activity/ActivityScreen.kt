package com.fitconnect.android.athlete.ui.activity

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.fitconnect.android.athlete.ascend.ActivityAscendBridge
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.athlete.demo.AthleteContentResolver
import com.fitconnect.android.athlete.demo.AthleteDemoBanner
import com.fitconnect.android.athlete.demo.AthleteDemoCatalog
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.capture.GpsFeedStatus
import com.fitconnect.android.capture.LiveActivityEngine
import com.fitconnect.android.capture.LiveActivityPhase
import com.fitconnect.android.design.EliteSurfaceInstrument
import com.fitconnect.android.designui.components.AscendEnergyCard
import com.fitconnect.android.designui.components.EffortZoneStrip
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.HoldToConfirmButton
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteCardVariant
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteFlowRow
import com.fitconnect.android.designui.components.EliteInstrumentRing
import com.fitconnect.android.designui.components.EliteLiveDot
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.components.EliteMetricTile
import com.fitconnect.android.designui.components.EliteRingHero
import com.fitconnect.android.designui.components.EliteShareCard
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.components.EliteTelemetryGrid
import com.fitconnect.android.designui.components.PerformanceCompleteOverlay
import com.fitconnect.android.designui.maps.EliteMapMode
import com.fitconnect.android.designui.maps.EliteMapPhase
import com.fitconnect.android.designui.maps.EliteMapPhaseLogic
import com.fitconnect.android.designui.maps.EliteRouteMap
import com.fitconnect.android.designui.maps.EliteRouteVertex
import com.fitconnect.android.designui.theme.EliteMetricHeroTextStyle
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.i18n.AppLocale
import com.fitconnect.ascend.copy.AscendCopy
import com.fitconnect.ascend.domain.ProcessResult
import com.fitconnect.shared.telemetry.MetricAvailability
import com.fitconnect.shared.telemetry.TelemetryEnvelope
import com.fitconnect.shared.workout.WorkoutSport
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun ActivityScreen() {
    val container = LocalAthleteContainer.current
    val engine = container.liveActivity
    val snap by engine.state.collectAsState()
    val wearEnvelope by container.telemetry.wearInbox.lastEnvelope.collectAsState()
    val haptics = LocalHapticFeedback.current
    val scope = rememberCoroutineScope()
    var sport by remember { mutableStateOf(WorkoutSport.RUN) }
    var mapMode by remember { mutableStateOf(EliteMapMode.LIVE) }
    var complete by remember { mutableStateOf<ProcessResult?>(null) }
    var completeDismissed by remember { mutableStateOf(false) }
    var processedSession by remember { mutableStateOf<String?>(null) }
    val locale by container.platform.localeManager.observe().collectAsState(initial = AppLocale.EN)

    LaunchedEffect(wearEnvelope) {
        wearEnvelope?.let { container.liveCoordinator.onRemoteEnvelope(it) }
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
                while (engine.state.value.phase == LiveActivityPhase.RUNNING) {
                    delay(1_000)
                    engine.tick()
                }
            }
            else -> Unit
        }
    }

    LaunchedEffect(snap.phase, snap.sessionId) {
        if (snap.phase == LiveActivityPhase.ENDED &&
            snap.sessionId.isNotBlank() &&
            processedSession != snap.sessionId
        ) {
            processedSession = snap.sessionId
            completeDismissed = false
            val result = container.ascend.process(ActivityAscendBridge.workoutEvent(snap))
            complete = result
            if (result.snapshot.prefs.hapticsEnabled && result.awardedXp > 0) {
                haptics.performHapticFeedback(HapticFeedbackType.LongPress)
            }
        }
    }

    val vertices = snap.route.map {
        EliteRouteVertex(it.latitude, it.longitude, snap.paceSecPerKm, it.heartRateBpm, it.altitudeM)
    }
    val sessionWaiting = snap.phase != LiveActivityPhase.IDLE &&
        snap.phase != LiveActivityPhase.ENDED &&
        vertices.size < 2
    var waitMs by remember { mutableLongStateOf(0L) }
    LaunchedEffect(sessionWaiting, snap.sessionId) {
        waitMs = 0L
        if (!sessionWaiting) return@LaunchedEffect
        while (waitMs < EliteSurfaceInstrument.LOAD_TIMEOUT_MS &&
            engine.state.value.route.size < 2
        ) {
            delay(250)
            waitMs += 250
        }
    }
    val mapPhase = EliteMapPhaseLogic.resolve(
        pointCount = vertices.size,
        sessionWaitingForTrace = sessionWaiting,
        permissionDenied = snap.gps == GpsFeedStatus.PERMISSION_DENIED,
        elapsedMs = waitMs,
    )
    val cursor = snap.replayCursor?.let { cursor ->
        snap.route.indexOfFirst {
            it.latitude == cursor.latitude && it.longitude == cursor.longitude
        }.takeIf { it >= 0 }
    }
    val liveSession = snap.phase != LiveActivityPhase.IDLE
    val trainUi = remember(snap.sourceLabel) { AthleteContentResolver.trainSurface(snap.sourceLabel) }

    AthleteScreenScaffold(
        title = "Activity",
        subtitle = "Live cockpit · ${trainUi.sourceLabel}",
        overline = "ATHLETE OS · CAPTURE",
        testTag = "athlete_activity",
    ) {
        item {
            AthleteDemoBanner(
                visible = trainUi.isDemoCapture,
                modifier = Modifier.testTag("activity_demo_banner"),
            )
        }
        item {
            EliteStack {
                EliteSysLabel(
                    when (mapPhase) {
                        EliteMapPhase.Success -> "ROUTE · ${mapMode.name}"
                        EliteMapPhase.Loading -> "ROUTE · WAITING"
                        EliteMapPhase.Error -> "ROUTE · ERROR"
                        EliteMapPhase.Empty -> "ROUTE · NO TRACE"
                    },
                )
                if (liveSession) {
                    EliteInstrumentRing(
                        progress = when (snap.phase) {
                            LiveActivityPhase.ENDED -> 1f
                            else -> (snap.elapsedMs / 3_600_000f).coerceIn(0.04f, 1f)
                        },
                        diameter = EliteRingHero,
                        contentDescription = when (snap.phase) {
                            LiveActivityPhase.ENDED -> "Session complete"
                            else -> "Elapsed ${LiveActivityEngine.formatElapsed(snap.elapsedMs)}"
                        },
                        modifier = Modifier.testTag("activity_instrument_ring"),
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            if (snap.phase == LiveActivityPhase.ENDED) {
                                Icon(
                                    imageVector = Icons.Filled.Check,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier,
                                )
                                EliteSysLabel("COMPLETE")
                            } else {
                                EliteSysLabel(snap.sport.uppercase())
                                Text(
                                    if (snap.phase == LiveActivityPhase.COUNTDOWN) {
                                        "${snap.countdownRemainingSec}"
                                    } else {
                                        LiveActivityEngine.formatElapsed(snap.elapsedMs)
                                    },
                                    style = EliteMetricHeroTextStyle,
                                    color = MaterialTheme.colorScheme.onBackground,
                                    modifier = Modifier.testTag("activity_timer"),
                                )
                            }
                        }
                    }
                }
                if (mapPhase != EliteMapPhase.Empty) {
                    EliteFlowRow {
                        EliteMapMode.entries.forEach { mode ->
                            EliteChip(label = mode.name, selected = mapMode == mode, onClick = { mapMode = mode })
                        }
                    }
                }
                EliteRouteMap(
                    points = vertices,
                    mode = mapMode,
                    cursorIndex = cursor,
                    phase = mapPhase,
                    onRetry = if (mapPhase == EliteMapPhase.Empty) {
                        {
                            if (container.liveCoordinator.claimLocalStart(sport.wireKey)) {
                                haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                                engine.arm(sport.wireKey)
                                engine.beginCountdown()
                                scope.launch { container.telemetry.wearWorkout.startWorkout(sport.wireKey) }
                            }
                        }
                    } else {
                        { waitMs = 0L }
                    },
                    contentDescription = when (mapPhase) {
                        EliteMapPhase.Success -> "Activity route"
                        EliteMapPhase.Empty -> "No GPS trace yet"
                        EliteMapPhase.Loading -> "Waiting for GPS trace"
                        EliteMapPhase.Error -> "Map failed to load"
                    },
                )
            }
        }
        item {
            EliteCard(variant = EliteCardVariant.Glass, modifier = Modifier.testTag("activity_monitor")) {
                EliteStack(spacing = EliteSpace.Md) {
                    EliteLiveDot(
                        live = snap.phase == LiveActivityPhase.RUNNING ||
                            snap.phase == LiveActivityPhase.RESUMING,
                        label = when (snap.phase) {
                            LiveActivityPhase.RUNNING, LiveActivityPhase.RESUMING -> "LIVE TELEMETRY"
                            LiveActivityPhase.COUNTDOWN -> "SYS.COUNTDOWN"
                            LiveActivityPhase.PAUSED -> "PAUSED"
                            LiveActivityPhase.FINISHING -> "SYS.FINISH"
                            LiveActivityPhase.ENDED -> "COMPLETE"
                            else -> "IDLE"
                        },
                    )
                    EliteSysLabel("LIVE MONITOR · ${snap.sport.uppercase()}")
                    EliteBadge(text = snap.sourceLabel)
                    EliteBadge(text = snap.sessionState.name)
                    if (snap.sessionId.isNotBlank()) {
                        Text("session ${snap.sessionId}", style = MaterialTheme.typography.labelSmall)
                    }
                    if (!liveSession) {
                        Text(
                            "—",
                            style = EliteMetricTextStyle,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.testTag("activity_timer"),
                        )
                    }
                    Text(phaseCopy(snap.phase, snap.sessionState.name), style = MaterialTheme.typography.bodyMedium)
                    Text(gpsCopy(snap.gps), style = MaterialTheme.typography.bodySmall)
                    Text(
                        "HR ${snap.hrBpm ?: "—"} is ${snap.sourceKind.name} — not a medical reading.",
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
            }
        }
        if (snap.phase == LiveActivityPhase.IDLE || snap.phase == LiveActivityPhase.ENDED) {
            item {
                EliteFlowRow {
                    WorkoutSport.entries.forEach { option ->
                        EliteChip(
                            label = option.wireKey,
                            selected = sport == option,
                            onClick = { sport = option },
                        )
                    }
                }
            }
        }
        if (liveSession) {
            item {
                EliteTelemetryGrid(
                cells = listOf(
                    "DISTANCE" to "%.2f km".format(snap.distanceM / 1000.0),
                    "PACE" to LiveActivityEngine.formatPace(snap.paceSecPerKm),
                    "HR" to (snap.hrBpm?.let { "$it" } ?: "—"),
                    "ZONE" to (snap.zone?.let { "Z$it" } ?: "—"),
                    "ENERGY" to "${snap.caloriesKcal} kcal",
                    "ELEV +" to "+${snap.elevationGainM.toInt()} m",
                    "BEST" to LiveActivityEngine.formatPace(snap.bestPaceSecPerKm),
                    "LOAD" to snap.sessionState.name,
                    "GPS" to if (snap.gps == GpsFeedStatus.LIVE) "LIVE" else "DEMO",
                ),
            )
            }
        }
        item {
            EliteFlowRow {
                when (snap.phase) {
                    LiveActivityPhase.IDLE, LiveActivityPhase.ENDED -> {
                        EliteButton(
                            label = "Start",
                            onClick = {
                                if (container.liveCoordinator.claimLocalStart(sport.wireKey)) {
                                    haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                                    engine.arm(sport.wireKey)
                                    engine.beginCountdown()
                                    scope.launch { container.telemetry.wearWorkout.startWorkout(sport.wireKey) }
                                }
                            },
                            modifier = Modifier.testTag("activity_start"),
                        )
                        if (snap.phase == LiveActivityPhase.ENDED) {
                            EliteButton(
                                label = "Discard",
                                variant = EliteButtonVariant.Ghost,
                                onClick = engine::discard,
                                modifier = Modifier.testTag("activity_discard"),
                            )
                        }
                    }
                    LiveActivityPhase.READY, LiveActivityPhase.COUNTDOWN -> {
                        EliteButton(
                            label = "Skip countdown",
                            onClick = {
                                if (container.liveCoordinator.claimLocalStart(sport.wireKey)) {
                                    engine.start(sport.wireKey)
                                }
                            },
                        )
                    }
                    LiveActivityPhase.RUNNING, LiveActivityPhase.RESUMING -> {
                        EliteButton(
                            label = "Pause",
                            variant = EliteButtonVariant.Secondary,
                            onClick = {
                                engine.pause()
                                scope.launch { container.telemetry.wearWorkout.pauseWorkout() }
                            },
                            modifier = Modifier.testTag("activity_pause"),
                        )
                        EliteButton(
                            label = "Lap",
                            variant = EliteButtonVariant.Ghost,
                            onClick = engine::addLap,
                        )
                        HoldToConfirmButton(
                            label = "Finish",
                            onConfirmed = {
                                haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                                engine.end()
                                scope.launch { container.telemetry.wearWorkout.endWorkout() }
                            },
                        )
                    }
                    LiveActivityPhase.PAUSED -> {
                        EliteButton(
                            label = "Resume",
                            onClick = {
                                engine.resume()
                                scope.launch { container.telemetry.wearWorkout.resumeWorkout() }
                            },
                            modifier = Modifier.testTag("activity_resume"),
                        )
                        HoldToConfirmButton(
                            label = "Finish",
                            onConfirmed = {
                                engine.end()
                                scope.launch { container.telemetry.wearWorkout.endWorkout() }
                            },
                        )
                    }
                    LiveActivityPhase.FINISHING -> {
                        Text("Finishing…", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
        if (snap.phase == LiveActivityPhase.ENDED) {
            val result = complete
            if (result != null && !completeDismissed) {
                item {
                    val lang = locale.bcp47
                    val why = result.explanations.firstOrNull()?.let { AscendCopy.t(lang, it.reasonKey) }
                        ?: "Your performance profile evolved."
                    val achievement = result.newAchievementIds.firstOrNull()?.let { id ->
                        result.snapshot.achievements.firstOrNull { it.definition.id == id }
                            ?.let { AscendCopy.t(lang, it.definition.nameKey) }
                    }
                    PerformanceCompleteOverlay(
                        distanceLabel = "%.2f KM".format(snap.distanceM / 1000.0),
                        xpLabel = "+${result.awardedXp} XP",
                        why = "WHY: $why",
                        result = "RESULT: level ${result.snapshot.level.level} · ${AscendCopy.t(lang, result.snapshot.level.rank.nameKey)}",
                        next = result.snapshot.level.nextUnlock?.let { "NEXT: ${AscendCopy.t(lang, it.nameKey)}" }
                            ?: "There is another level of your performance waiting.",
                        energyLabel = result.snapshot.energy?.let {
                            "${it.kcal} kcal · ${AscendCopy.t(lang, it.equivalentKey, mapOf("n" to it.equivalentAmount.toString()))}"
                        },
                        achievement = achievement,
                        record = result.newRecordKinds.firstOrNull()?.name,
                        levelFrom = if (result.leveledUp) result.previousLevel.toString() else null,
                        levelTo = if (result.leveledUp) result.snapshot.level.level.toString() else null,
                        unlock = result.snapshot.level.nextUnlock?.let { AscendCopy.t(lang, it.nameKey) },
                        onContinue = { completeDismissed = true },
                    )
                }
            }
            item {
                EliteStack {
                    EliteSysLabel("PERFORMANCE TRACE")
                    Slider(
                        value = snap.replayFraction,
                        onValueChange = engine::setReplayFraction,
                        modifier = Modifier.testTag("activity_replay_scrub"),
                    )
                    val cursorPt = snap.replayCursor
                    Text(
                        "t=${"%.0f".format(snap.replayFraction * 100)}% · " +
                            "alt ${cursorPt?.altitudeM?.toInt() ?: "—"} m · " +
                            "HR ${cursorPt?.heartRateBpm ?: snap.hrBpm ?: "—"}",
                        style = MaterialTheme.typography.bodySmall,
                    )
                    EliteShareCard(
                        sport = snap.sport,
                        distanceKm = "%.2f km".format(snap.distanceM / 1000.0),
                        elapsed = LiveActivityEngine.formatElapsed(snap.elapsedMs),
                        pace = LiveActivityEngine.formatPace(snap.paceSecPerKm),
                        hr = snap.avgHrBpm?.let { "$it bpm" } ?: "UNAVAILABLE",
                        score = snap.performanceScore?.toString() ?: "—",
                        points = vertices,
                    )
                    EffortZoneStrip(secondsInZone = snap.timeInZoneSec)
                    Text(
                        "AI INSIGHT · RECOMMENDED: review pace vs zone 3. Not medical advice.",
                        style = MaterialTheme.typography.bodySmall,
                    )
                    complete?.snapshot?.energy?.let { energy ->
                        AscendEnergyCard(
                            kcalLabel = "${energy.kcal} kcal",
                            equivalent = AscendCopy.t(
                                locale.bcp47,
                                energy.equivalentKey,
                                mapOf("n" to energy.equivalentAmount.toString()),
                            ),
                            disclaimer = AscendCopy.t(locale.bcp47, energy.disclaimerKey),
                        )
                    }
                    complete?.snapshot?.conversions?.forEach { conv ->
                        Text(
                            "${AscendCopy.t(locale.bcp47, conv.headlineKey)} · ${if (conv.demoLabeled) "LOCAL_DEMO" else ""}",
                            style = MaterialTheme.typography.bodySmall,
                        )
                    }
                    complete?.snapshot?.segments?.forEach { seg ->
                        Text(
                            "${AscendCopy.t(locale.bcp47, seg.nameKey)} · ${seg.distanceKm} km · LOCAL_DEMO",
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.testTag("ascend_segment_demo"),
                        )
                    }
                }
            }
        }
        item { WatchFeedCard(wearEnvelope) }
        item {
            EliteCard {
                EliteSysLabel("PRODUCTION")
                Text(
                    "FusedLocation LIVE GPS is not claimed in LOCAL_DEMO. " +
                        "Emulator geo inject is GPS.EMULATOR. Health Services HR is UNAVAILABLE on this host unless probed AVAILABLE.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun WatchFeedCard(envelope: TelemetryEnvelope?) {
    EliteCard(variant = EliteCardVariant.Glass, modifier = Modifier.testTag("watch_feed")) {
        EliteStack(spacing = EliteSpace.Md) {
            EliteSysLabel("WATCH FEED")
            if (envelope == null) {
                Text(
                    "No Data Layer packets. Pairing requires a reachable FitConnect Wear node.",
                    style = MaterialTheme.typography.bodyMedium,
                )
            } else {
                EliteBadge(text = envelope.source.name)
                Text("seq ${envelope.sequenceNumber} · ${envelope.schemaVersion} · ${envelope.sessionId}")
                envelope.samples.forEach { sample ->
                    EliteMetricCard(
                        label = sample.metric,
                        value = if (sample.availability == MetricAvailability.AVAILABLE && sample.value != null) {
                            "${sample.value} ${sample.unit}"
                        } else {
                            sample.availability.name
                        },
                    )
                }
            }
        }
    }
}

private fun gpsCopy(status: GpsFeedStatus): String = when (status) {
    GpsFeedStatus.SIMULATED -> "GPS: simulated QA route (not hardware)"
    GpsFeedStatus.EMULATOR_INJECTED -> "GPS: emulator inject (TEST_FIXTURE)"
    GpsFeedStatus.LIVE -> "GPS: live device"
    GpsFeedStatus.UNAVAILABLE -> "GPS unavailable"
    GpsFeedStatus.PERMISSION_DENIED -> "GPS permission denied"
}

private fun phaseCopy(phase: LiveActivityPhase, session: String): String = when (phase) {
    LiveActivityPhase.IDLE -> "Idle — sensors not bound · $session"
    LiveActivityPhase.READY -> "Ready · $session"
    LiveActivityPhase.COUNTDOWN -> "Countdown · $session"
    LiveActivityPhase.RUNNING -> "Recording · $session"
    LiveActivityPhase.PAUSED -> "Paused · $session"
    LiveActivityPhase.RESUMING -> "Resuming · $session"
    LiveActivityPhase.FINISHING -> "Finishing · $session"
    LiveActivityPhase.ENDED -> "Performance complete · $session"
}
