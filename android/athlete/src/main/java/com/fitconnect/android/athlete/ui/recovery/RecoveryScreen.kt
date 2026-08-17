package com.fitconnect.android.athlete.ui.recovery

import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.ui.Modifier
import com.fitconnect.android.athlete.domain.RecoverySnapshot
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteLoad
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.athlete.ui.components.ScoreBlock
import com.fitconnect.android.designui.charts.EliteChart
import com.fitconnect.android.designui.charts.EliteChartKind
import com.fitconnect.android.designui.charts.EliteChartModel
import com.fitconnect.android.designui.charts.EliteChartPoint
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun RecoveryScreen() {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<RecoverySnapshot>?>(null) }
    fun reload() { scope.launch { result = container.athleteRepository.recovery() } }
    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_recovery")
        reload()
    }

    AthleteLoad(result, ::reload) { recovery ->
        AthleteScreenScaffold(
            title = "Recovery Center",
            subtitle = "Sleep · HRV · resting heart rate · trends",
            testTag = "athlete_recovery",
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    content = {
                        ScoreBlock("Recovery", "${recovery.score}")
                        ScoreBlock("Sleep", "${recovery.sleepQuality}")
                        ScoreBlock("rHR", "${recovery.restingHrBpm}")
                    },
                )
            }
            item {
                EliteCard {
                    Text(
                        "CALCULATED from LOCAL_DEMO vitals — not a medical diagnosis. " +
                            "Body state uses Performance Intelligence (RESTORE / READY / STRAINED).",
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
            }
            item {
                EliteChart(
                    model = EliteChartModel(
                        kind = EliteChartKind.RECOVERY,
                        points = recovery.timeline.mapIndexed { i, p ->
                            EliteChartPoint(i.toFloat(), p.score.toFloat())
                        },
                        contentDescription = "Recovery timeline",
                    ),
                )
            }
            item { Text("Recommendations", style = MaterialTheme.typography.titleMedium) }
            items(recovery.recommendations) { line ->
                EliteCard { Text(line, style = MaterialTheme.typography.bodyLarge) }
            }
            if (recovery.warnings.isNotEmpty()) {
                item { Text("Warnings", style = MaterialTheme.typography.titleMedium) }
                items(recovery.warnings) { line ->
                    EliteCard {
                        Text(line, color = MaterialTheme.colorScheme.error)
                    }
                }
            }
            item {
                Text("Historical trend", style = MaterialTheme.typography.titleMedium)
                recovery.timeline.forEach {
                    Text("${it.dayLabel}: ${it.score}", style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}
