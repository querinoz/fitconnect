package com.fitconnect.android.athlete.ui.activity

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.capture.GpsFeedStatus
import com.fitconnect.android.capture.LiveActivityEngine
import com.fitconnect.android.capture.LiveActivityPhase
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteCardVariant
import com.fitconnect.android.designui.components.EliteFlowRow
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import kotlinx.coroutines.delay

@Composable
fun ActivityScreen() {
    val container = LocalAthleteContainer.current
    val engine = container.liveActivity
    val snap by engine.state.collectAsState()
    val haptics = LocalHapticFeedback.current

    LaunchedEffect(snap.phase) {
        if (snap.phase != LiveActivityPhase.RUNNING) return@LaunchedEffect
        while (true) {
            delay(1_000)
            if (engine.state.value.phase != LiveActivityPhase.RUNNING) break
            engine.tick()
        }
    }

    AthleteScreenScaffold(
        title = "Activity",
        subtitle = "Start monitoring · ${snap.sourceLabel}",
        overline = "ATHLETE OS · CAPTURE",
        testTag = "athlete_activity",
    ) {
        item {
            EliteCard(variant = EliteCardVariant.Glass, modifier = Modifier.testTag("activity_monitor")) {
                EliteStack(spacing = EliteSpace.Md) {
                    EliteSysLabel("LIVE MONITOR · ${snap.sport.uppercase()}")
                    EliteBadge(text = snap.sourceLabel)
                    Text(
                        LiveActivityEngine.formatElapsed(snap.elapsedMs),
                        style = EliteMetricTextStyle,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.testTag("activity_timer"),
                    )
                    Text(
                        when (snap.phase) {
                            LiveActivityPhase.IDLE -> "Idle — sensors not bound"
                            LiveActivityPhase.RUNNING -> "Recording (simulated GPS / HR)"
                            LiveActivityPhase.PAUSED -> "Paused"
                            LiveActivityPhase.ENDED -> "Ended — review then discard"
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Text(
                        gpsCopy(snap.gps),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
        item {
            EliteStack {
                EliteMetricCard(
                    label = "Distance",
                    value = "%.2f km".format(snap.distanceM / 1000.0),
                )
                EliteMetricCard(
                    label = "Pace",
                    value = LiveActivityEngine.formatPace(snap.paceSecPerKm),
                )
                EliteMetricCard(
                    label = "Heart rate",
                    value = snap.hrBpm?.let { "$it bpm" } ?: "Sensor unavailable",
                )
                EliteMetricCard(
                    label = "Zone",
                    value = snap.zone?.let { "Z$it" } ?: "—",
                )
                EliteMetricCard(
                    label = "Calories",
                    value = "${snap.caloriesKcal} kcal",
                )
            }
        }
        item {
            EliteFlowRow {
                when (snap.phase) {
                    LiveActivityPhase.IDLE, LiveActivityPhase.ENDED -> {
                        EliteButton(
                            label = "Start monitoring",
                            onClick = {
                                haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                                engine.start("Run")
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
                    LiveActivityPhase.RUNNING -> {
                        EliteButton(
                            label = "Pause",
                            variant = EliteButtonVariant.Secondary,
                            onClick = engine::pause,
                            modifier = Modifier.testTag("activity_pause"),
                        )
                        EliteButton(
                            label = "End",
                            onClick = {
                                haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                                engine.end()
                            },
                            modifier = Modifier.testTag("activity_end"),
                        )
                    }
                    LiveActivityPhase.PAUSED -> {
                        EliteButton(
                            label = "Resume",
                            onClick = engine::resume,
                            modifier = Modifier.testTag("activity_resume"),
                        )
                        EliteButton(
                            label = "End",
                            variant = EliteButtonVariant.Secondary,
                            onClick = engine::end,
                            modifier = Modifier.testTag("activity_end"),
                        )
                        EliteButton(
                            label = "Discard",
                            variant = EliteButtonVariant.Ghost,
                            onClick = engine::discard,
                            modifier = Modifier.testTag("activity_discard"),
                        )
                    }
                }
            }
        }
        item {
            EliteCard {
                EliteSysLabel("PRODUCTION")
                Text(
                    "FusedLocation, Health Connect, and BLE are not bound in this build. " +
                        "This monitor is LOCAL_DEMO only — never shown as live GPS.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

private fun gpsCopy(status: GpsFeedStatus): String = when (status) {
    GpsFeedStatus.SIMULATED -> "GPS: simulated path (not hardware)"
    GpsFeedStatus.UNAVAILABLE -> "GPS unavailable"
    GpsFeedStatus.PERMISSION_DENIED -> "GPS permission denied"
}
