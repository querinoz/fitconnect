package com.fitconnect.android.coach.ui.analytics

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.fitconnect.android.coach.domain.AnalyticsSnapshot
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachLoad
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.charts.EliteChart
import com.fitconnect.android.designui.charts.EliteChartKind
import com.fitconnect.android.designui.charts.EliteChartModel
import com.fitconnect.android.designui.charts.EliteChartPoint
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun AnalyticsScreen() {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<AnalyticsSnapshot>?>(null) }
    fun reload() { scope.launch { result = container.coachRepository.analytics() } }
    LaunchedEffect(Unit) {
        container.platform.analytics.screen("coach_analytics")
        reload()
    }

    CoachLoad(result, ::reload) { analytics ->
        CoachScreenScaffold(
            title = "Analytics",
            subtitle = "Derived from roster + sessions · no fabricated revenue",
            testTag = "coach_analytics",
        ) {
            item {
                val retentionUnavailable = analytics.customMetrics["retention_unavailable"] == 1.0
                val conversionUnavailable = analytics.customMetrics["conversion_unavailable"] == 1.0
                val revenueUnavailable = analytics.customMetrics["revenue_unavailable"] == 1.0
                EliteMetricCard(label = "Attendance", value = "${analytics.attendancePercent}%")
                EliteMetricCard(label = "Completion", value = "${analytics.programCompletionPercent}%")
                EliteMetricCard(
                    label = "Retention",
                    value = if (retentionUnavailable) "Unavailable" else "${analytics.retentionPercent}%",
                )
                EliteMetricCard(
                    label = "Conversion",
                    value = if (conversionUnavailable) "Unavailable" else "${analytics.conversionPercent}%",
                )
                EliteMetricCard(
                    label = "Revenue",
                    value = if (revenueUnavailable) "Unavailable" else "€${analytics.revenueCents / 100}",
                )
            }
            item {
                Text("Athlete evolution", style = MaterialTheme.typography.titleMedium)
                EliteChart(
                    model = EliteChartModel(
                        kind = EliteChartKind.PERFORMANCE,
                        points = analytics.athleteEvolution.mapIndexed { i, p ->
                            EliteChartPoint(i.toFloat(), p.value)
                        },
                        contentDescription = "Athlete evolution",
                    ),
                )
            }
            item {
                Text("Recovery trends", style = MaterialTheme.typography.titleMedium)
                EliteChart(
                    model = EliteChartModel(
                        kind = EliteChartKind.RECOVERY,
                        points = analytics.recoveryTrend.mapIndexed { i, p ->
                            EliteChartPoint(i.toFloat(), p.value)
                        },
                        contentDescription = "Recovery trends",
                    ),
                )
            }
            item { Text("Custom metrics", style = MaterialTheme.typography.titleMedium) }
            item {
                analytics.customMetrics.forEach { (k, v) ->
                    Text("$k · $v", style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}
