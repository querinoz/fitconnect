package com.fitconnect.android.coach.ui.athletes

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
import com.fitconnect.android.coach.domain.AthleteDetail
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachLoad
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.charts.EliteChart
import com.fitconnect.android.designui.charts.EliteChartKind
import com.fitconnect.android.designui.charts.EliteChartModel
import com.fitconnect.android.designui.charts.EliteChartPoint
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.telemetry.integration.CoachAthleteTelemetry
import kotlinx.coroutines.launch

@Composable
fun AthleteDetailScreen(athleteId: String) {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<AthleteDetail>?>(null) }
    var telemetry by remember { mutableStateOf<CoachAthleteTelemetry?>(null) }
    fun reload() {
        scope.launch {
            result = container.coachRepository.athleteDetail(athleteId)
            telemetry = container.coachTelemetry.athleteTelemetry(COACH_ID, athleteId)
        }
    }
    LaunchedEffect(athleteId) {
        container.platform.analytics.screen("coach_athlete_detail")
        reload()
    }

    CoachLoad(result, ::reload) { detail ->
        CoachScreenScaffold(
            title = detail.roster.displayName,
            subtitle = "Overview · performance · recovery · notes · files",
            testTag = "coach_athlete_detail",
        ) {
            item {
                EliteMetricCard(label = "HRV", value = "${detail.hrvMs} ms")
                EliteMetricCard(label = "Sleep", value = "${detail.sleepQuality}")
                EliteMetricCard(label = "Recovery", value = "${detail.roster.recovery}")
                EliteMetricCard(label = "Load", value = "${detail.trainingLoad}")
                EliteMetricCard(label = "Weight", value = "${detail.bodyWeightKg} kg")
            }
            item {
                EliteChart(
                    model = EliteChartModel(
                        kind = EliteChartKind.PERFORMANCE,
                        points = detail.performanceTimeline.mapIndexed { i, p ->
                            EliteChartPoint(i.toFloat(), p.value)
                        },
                        contentDescription = "Performance timeline",
                    ),
                )
            }
            item { Text("Programs", style = MaterialTheme.typography.titleMedium) }
            items(detail.programs) { Text(it, style = MaterialTheme.typography.bodyLarge) }
            item { Text("Goals", style = MaterialTheme.typography.titleMedium) }
            items(detail.goals) { Text(it, style = MaterialTheme.typography.bodyLarge) }
            item { Text("Achievements", style = MaterialTheme.typography.titleMedium) }
            items(detail.achievements) { Text(it, style = MaterialTheme.typography.bodyLarge) }
            item { Text("Coach notes", style = MaterialTheme.typography.titleMedium) }
            items(detail.coachNotes) { note ->
                EliteCard { Text(note, style = MaterialTheme.typography.bodyLarge) }
            }
            item {
                Text("Medical", style = MaterialTheme.typography.titleMedium)
                Text(detail.roster.medicalNotes ?: "None on file", style = MaterialTheme.typography.bodyMedium)
            }
            item { Text("Files", style = MaterialTheme.typography.titleMedium) }
            items(detail.files, key = { it.id }) { file ->
                EliteCard { Text("${file.name} · ${file.mime}", style = MaterialTheme.typography.bodyMedium) }
            }
            item { Text("Telemetry (athlete-authorized)", style = MaterialTheme.typography.titleMedium) }
            item {
                val shared = telemetry
                if (shared == null || shared.sharedMetrics.isEmpty()) {
                    Text(
                        "No telemetry shared with you. The athlete controls sharing from their Telemetry Center.",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                } else {
                    shared.vitals.forEach { (metric, value) ->
                        val trend = shared.trends[metric]?.let { delta ->
                            if (delta >= 0) " · +%.1f 14d".format(delta) else " · %.1f 14d".format(delta)
                        }.orEmpty()
                        EliteMetricCard(
                            label = metric.name.lowercase().replace('_', ' '),
                            value = "%.0f%s".format(value, trend),
                        )
                    }
                }
            }
            item { Text("Connected devices", style = MaterialTheme.typography.titleMedium) }
            items(detail.devices) { Text(it, style = MaterialTheme.typography.bodyMedium) }
            item { Text("Session history", style = MaterialTheme.typography.titleMedium) }
            items(detail.sessionHistoryIds) { Text(it, style = MaterialTheme.typography.bodyMedium) }
            item {
                EliteButton(
                    label = if (detail.roster.favorite) "Unfavorite" else "Favorite",
                    variant = EliteButtonVariant.Secondary,
                    onClick = {
                        scope.launch {
                            container.coachRepository.toggleFavorite(athleteId)
                            reload()
                        }
                    },
                )
            }
        }
    }
}

private const val COACH_ID = "coach-1"
