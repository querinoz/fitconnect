package com.fitconnect.android.athlete.ui.sleep

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteEmptyState
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.shared.intelligence.EvidenceKind
import com.fitconnect.shared.intelligence.PerformanceIntelligence
import kotlinx.coroutines.launch

@Composable
fun SleepScreen() {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var durationMin by remember { mutableStateOf<Int?>(null) }
    var sourceNote by remember { mutableStateOf("DATA SOURCE REQUIRED") }

    fun reload() {
        scope.launch {
            val overview = container.telemetry.athleteFacade.overview(
                com.fitconnect.android.athlete.data.LocalAthleteRepository.ATHLETE_ID,
            )
            val sleep = overview.latestSleep
            if (sleep == null) {
                durationMin = null
                sourceNote = "DATA SOURCE REQUIRED"
            } else {
                durationMin = (sleep.value / 60).toInt()
                sourceNote = "CALCULATED from telemetry store · ${DemoPersona.MODE_LABEL}"
            }
        }
    }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_sleep")
        reload()
    }

    val score = PerformanceIntelligence.sleepScore(durationMin, efficiencyPct = null)

    AthleteScreenScaffold(
        title = "Sleep",
        subtitle = "Night architecture · not a clinical sleep study",
        overline = "ATHLETE OS · SLEEP",
        testTag = "athlete_sleep",
    ) {
        item { EliteBadge(text = score.kind.name) }
        if (!score.available) {
            item {
                EliteEmptyState(
                    title = "Your first night fills this chart.",
                    body = "Sleep stages are not fabricated. Connect Health Connect or a FitConnect Watch.",
                    actionLabel = null,
                    onAction = null,
                )
            }
        }
        item {
            EliteCard {
                EliteStack {
                    EliteSysLabel("SLEEP SCORE")
                    if (!score.available) {
                        Text(sourceNote, style = MaterialTheme.typography.bodySmall)
                    } else {
                        Text("${score.score}", style = MaterialTheme.typography.displaySmall)
                        EliteMetricCard(label = "Duration", value = "${score.durationMin} min")
                        EliteMetricCard(label = "Efficiency", value = score.efficiencyPct?.let { "$it%" } ?: "UNAVAILABLE")
                        Text(score.recoveryImpact)
                    }
                    Text(sourceNote, style = MaterialTheme.typography.bodySmall)
                    Text("SpO2 UNAVAILABLE · breathing UNAVAILABLE", style = MaterialTheme.typography.bodySmall)
                    Text(
                        "Deep / light / REM stages are not fabricated. ${EvidenceKind.OBSERVED.name} requires a sensor source.",
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
            }
        }
    }
}
