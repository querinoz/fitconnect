package com.fitconnect.android.athlete.ui.daily

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.components.EliteStack
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.telemetry.domain.MetricType
import kotlinx.coroutines.launch

@Composable
fun DailyActivityScreen() {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var steps by remember { mutableStateOf<Double?>(null) }
    var calories by remember { mutableStateOf<Double?>(null) }
    var distance by remember { mutableStateOf<Double?>(null) }

    fun reload() {
        scope.launch {
            val overview = container.telemetry.athleteFacade.overview(LocalAthleteRepository.ATHLETE_ID)
            steps = overview.latestSteps?.value
            calories = overview.latestCalories?.value
            distance = overview.latestDistance?.value
        }
    }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_daily")
        reload()
    }

    val missing = steps == null && calories == null && distance == null

    AthleteScreenScaffold(
        title = "Daily activity",
        subtitle = "Steps · load · recovery · ${DemoPersona.MODE_LABEL}",
        overline = "ATHLETE OS · TODAY",
        testTag = "athlete_daily",
    ) {
        item { EliteBadge(text = if (missing) "DATA SOURCE REQUIRED" else DemoPersona.MODE_LABEL) }
        item {
            EliteCard {
                EliteStack {
                    if (missing) {
                        Text(
                            "No steps / calories / distance in the telemetry store. Connect a source — values are not invented.",
                            style = MaterialTheme.typography.bodyLarge,
                        )
                    } else {
                        EliteMetricCard(label = "Steps", value = steps?.toInt()?.toString() ?: "UNAVAILABLE")
                        EliteMetricCard(label = "Calories", value = calories?.toInt()?.toString() ?: "UNAVAILABLE")
                        EliteMetricCard(label = "Distance", value = distance?.let { "%.2f km".format(it / 1000.0) } ?: "UNAVAILABLE")
                        EliteMetricCard(label = "Active minutes", value = "UNAVAILABLE")
                        EliteMetricCard(label = "Standing", value = "UNAVAILABLE")
                    }
                    Text(
                        "Goals and weekly trends require ${MetricType.STEPS.name} history. Empty store stays empty.",
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
            }
        }
    }
}
