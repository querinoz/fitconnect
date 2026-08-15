package com.fitconnect.android.athlete.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.fitconnect.android.athlete.domain.HomeSnapshot
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteLoad
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.athlete.ui.components.ScoreBlock
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.charts.EliteChart
import com.fitconnect.android.designui.charts.EliteChartKind
import com.fitconnect.android.designui.charts.EliteChartModel
import com.fitconnect.android.designui.charts.EliteChartPoint
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteCardVariant
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteFlowRow
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.components.EliteRecoveryRing
import com.fitconnect.android.designui.components.EliteSectionHeader
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    onOpenRecovery: () -> Unit,
    onOpenTraining: () -> Unit,
    onOpenSession: (String) -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenPrograms: () -> Unit,
    onOpenSports: () -> Unit,
    onOpenAi: () -> Unit = {},
    onOpenCommunity: () -> Unit = {},
    onOpenProfile: () -> Unit = {},
    onOpenDiscover: () -> Unit = {},
    onOpenActivity: () -> Unit = {},
) {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<HomeSnapshot>?>(null) }

    fun reload() {
        scope.launch { result = container.athleteRepository.home() }
    }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_home")
        reload()
    }

    AthleteLoad(result = result, onRetry = ::reload) { home ->
        val nervous = when {
            home.readiness.recoveryScore >= 75 -> "OPTIMAL"
            home.readiness.recoveryScore >= 50 -> "BALANCED"
            home.readiness.recoveryScore >= 30 -> "CAUTION"
            else -> "STRAIN"
        }
        AthleteScreenScaffold(
            title = home.greeting,
            subtitle = "Performance cockpit · ${DemoPersona.MODE_LABEL}",
            overline = "ATHLETE OS · TODAY",
            testTag = "athlete_home",
        ) {
            item {
                EliteBadge(text = DemoPersona.MODE_LABEL)
            }
            item {
                EliteCard(variant = EliteCardVariant.Glass, modifier = Modifier.testTag("prime_recovery_block")) {
                    EliteStack(spacing = EliteSpace.Md) {
                        EliteSysLabel("INSTRUMENT · PRIME RECOVERY")
                        EliteRecoveryRing(
                            score = home.readiness.recoveryScore,
                            label = "Prime Recovery",
                            size = 148.dp,
                        )
                        EliteStack(spacing = EliteSpace.Sm) {
                            ScoreBlock(label = "Readiness", value = "${home.readiness.score}%")
                            ScoreBlock(label = "HRV", value = "${home.readiness.hrvMs} ms")
                            ScoreBlock(label = "Sleep", value = "${home.readiness.sleepQuality}%")
                            ScoreBlock(label = "Nervous system", value = nervous)
                        }
                    }
                }
            }
            item {
                EliteCard(variant = EliteCardVariant.Glass) {
                    EliteSectionHeader(title = "AI Coach Directive", overline = "SYS.AI")
                    Text(home.readiness.aiSummary, style = MaterialTheme.typography.bodyLarge)
                    EliteButton(
                        label = "Open Performance AI",
                        variant = EliteButtonVariant.Secondary,
                        onClick = onOpenAi,
                    )
                }
            }
            item {
                EliteSectionHeader(title = "Training state", overline = "LOAD")
                EliteCard(variant = EliteCardVariant.Metric) {
                    Text(home.readiness.recommendation, style = MaterialTheme.typography.bodyLarge)
                    Text(
                        "Load ${"%.1f".format(home.readiness.trainingLoad)} · RHR ${home.readiness.restingHrBpm} bpm",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Text("Recovery plan", style = MaterialTheme.typography.titleMedium)
                    Text(home.readiness.recoveryRecommendation, style = MaterialTheme.typography.bodyMedium)
                }
            }
            item {
                EliteChart(
                    model = EliteChartModel(
                        kind = EliteChartKind.READINESS,
                        points = listOf(
                            EliteChartPoint(0f, 70f),
                            EliteChartPoint(1f, 74f),
                            EliteChartPoint(2f, 68f),
                            EliteChartPoint(3f, 80f),
                            EliteChartPoint(4f, home.readiness.score.toFloat()),
                        ),
                        contentDescription = "Readiness trend",
                    ),
                    modifier = Modifier.testTag("athlete_home_readiness_chart"),
                )
            }
            home.nextSession?.let { session ->
                item {
                    EliteCard(onClick = { onOpenSession(session.id) }) {
                        EliteSysLabel("UPCOMING SESSION")
                        Text(session.title, style = MaterialTheme.typography.titleLarge)
                        Text(
                            "${session.sport.value} · ${session.durationMin} min",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
            item {
                EliteStack {
                    EliteMetricCard(
                        label = "Conditions",
                        value = "${home.weather.tempC}°",
                        accent = EliteSurfaceColors.TELEMETRY.toColor(),
                    )
                    Text(home.weather.summary, style = MaterialTheme.typography.bodyMedium)
                }
            }
            home.coachMessage?.let { msg ->
                item {
                    EliteCard(variant = EliteCardVariant.Person) {
                        EliteSysLabel("COACH CHANNEL")
                        Text(msg.from, style = MaterialTheme.typography.titleMedium)
                        Text(msg.preview, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
            item { EliteSectionHeader(title = "Today's plan", overline = "TASKS") }
            items(home.tasks, key = { it.id }) { task ->
                EliteCard(onClick = {
                    scope.launch {
                        container.athleteRepository.toggleTask(task.id)
                        reload()
                    }
                }) {
                    Text(
                        if (task.done) "✓ ${task.title}" else task.title,
                        style = MaterialTheme.typography.bodyLarge,
                    )
                }
            }
            item {
                EliteStack {
                    EliteSectionHeader(title = "Quick actions", overline = "NAV")
                    EliteFlowRow {
                        home.quickActions.take(3).forEach { action ->
                            EliteChip(label = action, onClick = {
                                when {
                                    action.contains("session", true) -> onOpenTraining()
                                    action.contains("readiness", true) -> onOpenRecovery()
                                    else -> onOpenNotifications()
                                }
                            })
                        }
                    }
                }
            }
            item { EliteSectionHeader(title = "Recent activity", overline = "TELEMETRY") }
            items(home.recentActivity) { line ->
                Text(line, style = MaterialTheme.typography.bodyMedium)
            }
            item {
                EliteFlowRow {
                    EliteButton(
                        "Start monitoring",
                        onClick = onOpenActivity,
                        modifier = Modifier.testTag("home_start_monitoring"),
                    )
                    EliteButton("Recovery", onClick = onOpenRecovery, variant = EliteButtonVariant.Secondary)
                    EliteButton("Discover", onClick = onOpenDiscover, variant = EliteButtonVariant.Ghost)
                    EliteButton("Sports", onClick = onOpenSports, variant = EliteButtonVariant.Ghost)
                    EliteButton("You", onClick = onOpenProfile, variant = EliteButtonVariant.Ghost)
                }
            }
            if (home.readiness.warnings.isNotEmpty()) {
                item {
                    EliteCard(variant = EliteCardVariant.Metric) {
                        EliteSysLabel("ALERTS")
                        home.readiness.warnings.forEach {
                            Text(it, color = MaterialTheme.colorScheme.error)
                        }
                    }
                }
            }
        }
    }
}
