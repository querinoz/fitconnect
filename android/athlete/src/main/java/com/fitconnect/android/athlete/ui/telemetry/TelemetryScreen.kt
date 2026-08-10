package com.fitconnect.android.athlete.ui.telemetry

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
import com.fitconnect.android.athlete.data.LocalAthleteRepository
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.charts.EliteChart
import com.fitconnect.android.designui.charts.EliteChartKind
import com.fitconnect.android.designui.charts.EliteChartModel
import com.fitconnect.android.designui.charts.EliteChartPoint
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.telemetry.aggregate.AggregateSeries
import com.fitconnect.android.telemetry.devices.DeviceEntry
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.integration.TelemetryOverview
import com.fitconnect.android.telemetry.provider.ProviderConnectionState
import kotlinx.coroutines.launch

/**
 * Telemetry Center — devices, sync state, coverage and normalized vitals.
 * Consumes only [TelemetryOverview] / [AggregateSeries]; no provider logic.
 */
@Composable
fun TelemetryScreen() {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    val athleteId = LocalAthleteRepository.ATHLETE_ID
    var devices by remember { mutableStateOf<List<DeviceEntry>>(emptyList()) }
    var overview by remember { mutableStateOf<TelemetryOverview?>(null) }
    var hrvTrend by remember { mutableStateOf<AggregateSeries?>(null) }
    var sleepTrend by remember { mutableStateOf<AggregateSeries?>(null) }

    suspend fun reload() {
        devices = container.telemetry.deviceCenter.devices(athleteId)
        overview = container.telemetry.athleteFacade.overview(athleteId)
        hrvTrend = container.telemetry.athleteFacade.trend(athleteId, MetricType.HRV, days = 14)
        sleepTrend = container.telemetry.athleteFacade.trend(athleteId, MetricType.SLEEP, days = 14)
    }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_telemetry")
        reload()
    }

    val freshness = when {
        overview == null || (overview?.sampleCount ?: 0) == 0 -> "NO DATA"
        devices.any { it.state == ProviderConnectionState.CONNECTED } -> "LIVE"
        else -> "STALE"
    }

    AthleteScreenScaffold(
        title = "Telemetry Center",
        subtitle = "Devices · sync · coverage · vitals · ${DemoPersona.MODE_LABEL}",
        testTag = "athlete_telemetry",
    ) {
        item {
            EliteBadge(text = freshness)
        }
        if (freshness == "NO DATA") {
            item {
                EliteCard {
                    Text("NO DATA", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "Connect a device or sync LOCAL_DEMO fixtures to populate vitals.",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }
        overview?.let { o ->
            item {
                EliteMetricCard(label = "Samples", value = "${o.sampleCount}")
                EliteMetricCard(label = "Coverage", value = "${o.coveredMetrics.size} metrics")
                o.latestHrv?.let { EliteMetricCard(label = "HRV", value = "${it.value} ${it.unit.symbol}") }
                o.latestHeartRate?.let { EliteMetricCard(label = "Heart rate", value = "${it.value} ${it.unit.symbol}") }
                o.latestSleep?.let { EliteMetricCard(label = "Sleep", value = "${(it.value / 60).toInt()}h ${(it.value % 60).toInt()}m") }
                o.latestWeight?.let { EliteMetricCard(label = "Weight", value = "${it.value} ${it.unit.symbol}") }
            }
        }
        hrvTrend?.takeIf { it.points.isNotEmpty() }?.let { series ->
            item {
                Text("HRV · 14 days", style = MaterialTheme.typography.titleMedium)
                EliteChart(
                    model = EliteChartModel(
                        kind = EliteChartKind.HRV,
                        points = series.points.mapIndexed { i, p -> EliteChartPoint(i.toFloat(), p.avg.toFloat()) },
                        contentDescription = "HRV daily trend",
                    ),
                )
            }
        }
        sleepTrend?.takeIf { it.points.isNotEmpty() }?.let { series ->
            item {
                Text("Sleep · 14 days", style = MaterialTheme.typography.titleMedium)
                EliteChart(
                    model = EliteChartModel(
                        kind = EliteChartKind.SLEEP,
                        points = series.points.mapIndexed { i, p -> EliteChartPoint(i.toFloat(), p.avg.toFloat()) },
                        contentDescription = "Sleep daily trend",
                    ),
                )
            }
        }
        overview?.takeIf { it.recentWorkouts.isNotEmpty() }?.let { o ->
            item { Text("Imported workouts", style = MaterialTheme.typography.titleMedium) }
            items(o.recentWorkouts, key = { it.id }) { workout ->
                EliteCard {
                    Text(workout.title, style = MaterialTheme.typography.titleMedium)
                    val sources = (listOf(workout.provenance) + workout.mergedFrom)
                        .joinToString(" + ") { it.provider.name.lowercase().replace('_', ' ') }
                    Text(
                        "${workout.sportKey} · ${(workout.durationMs / 60_000)} min · via $sources",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }
        item { Text("Providers", style = MaterialTheme.typography.titleMedium) }
        items(devices, key = { it.provider.name }) { device ->
            EliteCard {
                Text(device.displayName, style = MaterialTheme.typography.titleMedium)
                val sync = device.lastSyncAt?.let { "last sync ${(System.currentTimeMillis() - it.epochMs) / 60_000} min ago" }
                    ?: "never synced"
                Text("${device.state} · $sync", style = MaterialTheme.typography.bodyMedium)
                val connected = device.state == ProviderConnectionState.CONNECTED
                EliteButton(
                    label = if (connected) "Sync now" else "Connect",
                    variant = EliteButtonVariant.Secondary,
                    onClick = {
                        scope.launch {
                            if (connected) {
                                container.telemetry.deviceCenter.syncNow(athleteId, device.provider)
                            } else {
                                container.telemetry.deviceCenter.connect(athleteId, device.provider)
                                container.telemetry.deviceCenter.syncNow(athleteId, device.provider)
                            }
                            reload()
                        }
                    },
                )
                if (connected) {
                    EliteButton(
                        label = "Disconnect",
                        variant = EliteButtonVariant.Ghost,
                        onClick = {
                            scope.launch {
                                container.telemetry.deviceCenter.disconnect(athleteId, device.provider)
                                reload()
                            }
                        },
                    )
                }
            }
        }
    }
}
