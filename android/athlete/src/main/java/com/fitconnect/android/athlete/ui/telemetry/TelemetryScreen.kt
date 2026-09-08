package com.fitconnect.android.athlete.ui.telemetry

import android.content.Intent
import android.provider.Settings
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.fitconnect.android.athlete.data.canonicalAthleteId
import com.fitconnect.android.athlete.di.AthleteContainer
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.HoneycombDivider
import com.fitconnect.android.designui.charts.EliteChart
import com.fitconnect.android.designui.charts.EliteChartKind
import com.fitconnect.android.designui.charts.EliteChartModel
import com.fitconnect.android.designui.charts.EliteChartPoint
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.components.HexBadge
import com.fitconnect.android.designui.components.HexMetric
import com.fitconnect.android.designui.components.HexProgress
import com.fitconnect.android.designui.components.HexStatus
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.sports.zones.EliteCoreBridge
import com.fitconnect.android.sports.zones.HeartRateZones
import com.fitconnect.android.telemetry.aggregate.AggregateSeries
import com.fitconnect.android.telemetry.devices.DeviceEntry
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.TelemetryUiLabel
import com.fitconnect.android.telemetry.domain.TelemetryUiProvenance
import com.fitconnect.android.telemetry.healthconnect.HealthConnectAvailability
import com.fitconnect.android.telemetry.integration.TelemetryOverview
import com.fitconnect.android.telemetry.provider.ProviderConnectionState
import com.fitconnect.android.telemetry.wear.WearCompanionState
import com.fitconnect.android.telemetry.wear.WearablePlatformStatus
import kotlinx.coroutines.launch

/**
 * Telemetry Center + Device Center — devices, Wear companion, coverage, vitals.
 */
@Composable
fun TelemetryScreen() {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var athleteId by remember { mutableStateOf("") }
    var devices by remember { mutableStateOf<List<DeviceEntry>>(emptyList()) }
    var overview by remember { mutableStateOf<TelemetryOverview?>(null) }
    var hrvTrend by remember { mutableStateOf<AggregateSeries?>(null) }
    var sleepTrend by remember { mutableStateOf<AggregateSeries?>(null) }
    var isLocalDemo by remember { mutableStateOf(false) }
    var isOffline by remember { mutableStateOf(false) }

    suspend fun reload() {
        val uid = container.platform.sessionStore.canonicalAthleteId()
        athleteId = uid
        isLocalDemo = container.platform.sessionStore.snapshot().isLocalDemo
        isOffline = !container.platform.connectivity.online.value
        devices = container.telemetry.deviceCenter.devices(uid)
        overview = container.telemetry.athleteFacade.overview(uid)
        hrvTrend = container.telemetry.athleteFacade.trend(uid, MetricType.HRV, days = 14)
        sleepTrend = container.telemetry.athleteFacade.trend(uid, MetricType.SLEEP, days = 14)
    }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_telemetry")
        reload()
    }

    val freshness = resolveTelemetryScreenLabel(
        isLocalDemo = isLocalDemo,
        isOffline = isOffline,
        overview = overview,
        devices = devices,
    )

    AthleteScreenScaffold(
        title = "Telemetry Command",
        subtitle = "HR · HRV · zones · devices · ${if (isLocalDemo) TelemetryUiLabel.TEST.name else DemoPersona.MODE_LABEL}",
        testTag = "athlete_telemetry",
    ) {
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                HexBadge(text = freshness.name)
                HexStatus(text = "STREAM · ${freshness.name}")
            }
            HoneycombDivider()
        }
        if (freshness == TelemetryUiLabel.UNAVAILABLE || freshness == TelemetryUiLabel.OFFLINE) {
            item {
                EliteCard {
                    Text(freshness.name, style = MaterialTheme.typography.titleMedium)
                    Text(
                        "Connect a device or sync LOCAL_DEMO fixtures to populate vitals.",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }
        overview?.let { o ->
            item {
                Row(horizontalArrangement = Arrangement.SpaceEvenly, modifier = Modifier.fillMaxWidth()) {
                    HexMetric(value = "${o.sampleCount}", label = "Samples")
                    o.latestHrv?.let { HexMetric(value = "${it.value.toInt()}", label = "HRV") }
                    o.latestHeartRate?.let { HexMetric(value = "${it.value.toInt()}", label = "HR") }
                    HexProgress(
                        progress = (o.coveredMetrics.size * 12).coerceIn(0, 100),
                        label = "COV",
                    )
                }
            }
            item {
                val hr = o.latestHeartRate?.value
                val lthr = HeartRateZones.DEFAULT_LTHR_BPM
                val zone = hr?.let { EliteCoreBridge.heartRateZone(it, lthr) } ?: 0
                EliteCard {
                    Text(
                        "LTHR zones · elite-core (${EliteCoreBridge.backend})",
                        style = MaterialTheme.typography.titleSmall,
                    )
                    Text(
                        if (zone > 0 && hr != null) {
                            "HR ${hr.toInt()} bpm → Zone $zone / 5 · LTHR ${lthr.toInt()}"
                        } else {
                            "No HR sample for zone probe · engine wired via UniFFI-compatible bridge"
                        },
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
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
        item {
            WatchLinkCard(container)
        }
        item { Text("Providers · LOCAL_DEMO fixtures — Garmin / WHOOP / Oura production APIs are PENDING_HUMAN", style = MaterialTheme.typography.titleMedium) }
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

@Composable
private fun WatchLinkCard(container: AthleteContainer) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val envelope by container.telemetry.wearInbox.lastEnvelope.collectAsState()
    var companion by remember { mutableStateOf(WearCompanionState.NOT_PAIRED) }
    var transport by remember { mutableStateOf(container.telemetry.wearSessionLink.transport) }
    var pending by remember { mutableStateOf(0) }
    val hc = remember { HealthConnectAvailability.status(context) }
    val xiaomi = container.telemetry.xiaomiPlatform
    LaunchedEffect(Unit) {
        companion = container.telemetry.wearCompanion.state()
        transport = container.telemetry.wearSessionLink.transport
        pending = container.telemetry.wearSessionLink.pendingCount()
    }
    EliteCard {
        Text("FITCONNECT WATCH", style = MaterialTheme.typography.titleMedium)
        Text("${companion.name} · $transport", style = MaterialTheme.typography.bodyMedium)
        Text("Battery UNAVAILABLE · HR sensor UNAVAILABLE · GPS UNAVAILABLE", style = MaterialTheme.typography.bodySmall)
        Text("Health Connect SDK ${hc.name}", style = MaterialTheme.typography.bodySmall)
        Text(
            "Xiaomi HyperOS ${xiaomi.status.name} — not Wear OS.",
            style = MaterialTheme.typography.bodySmall,
        )
        val last = envelope?.let { "Last packet seq ${it.sequenceNumber} · ${it.source.name}" } ?: "Last sync: none"
        Text("$last · pending $pending", style = MaterialTheme.typography.bodySmall)
        Text(
            "Paired means a reachable FitConnect Wear capability, not a Bluetooth-only watch.",
            style = MaterialTheme.typography.bodySmall,
        )
        EliteButton(
            label = "PAIR WATCH",
            onClick = {
                context.startActivity(Intent(Settings.ACTION_BLUETOOTH_SETTINGS))
            },
        )
        EliteButton(
            label = "SYNC NOW",
            variant = EliteButtonVariant.Secondary,
            onClick = {
                scope.launch {
                    container.telemetry.wearCompanion.requestSync()
                    companion = container.telemetry.wearCompanion.state()
                    pending = container.telemetry.wearSessionLink.pendingCount()
                }
            },
        )
        EliteButton(
            label = "UNPAIR IN SYSTEM SETTINGS",
            variant = EliteButtonVariant.Ghost,
            onClick = {
                context.startActivity(Intent(Settings.ACTION_BLUETOOTH_SETTINGS))
            },
        )
        EliteButton(
            label = "DEVICE SETTINGS",
            variant = EliteButtonVariant.Ghost,
            onClick = {
                context.startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = android.net.Uri.fromParts("package", context.packageName, null)
                })
            },
        )
        if (xiaomi.status == WearablePlatformStatus.BLOCKED_EXTERNAL_DEPENDENCY) {
            EliteBadge(text = "XIAOMI BLOCKED")
        }
    }
}

internal fun resolveTelemetryScreenLabel(
    isLocalDemo: Boolean,
    isOffline: Boolean,
    overview: TelemetryOverview?,
    devices: List<DeviceEntry>,
    nowMs: Long = System.currentTimeMillis(),
): TelemetryUiLabel {
    val sampleCount = overview?.sampleCount ?: 0
    val latestAt = listOfNotNull(
        overview?.latestHeartRate?.at?.epochMs,
        overview?.latestHrv?.at?.epochMs,
        overview?.latestSteps?.at?.epochMs,
    ).maxOrNull()
    val age = latestAt?.let { nowMs - it }
    return TelemetryUiProvenance.resolve(
        isLocalDemo = isLocalDemo,
        isOffline = isOffline,
        hasSamples = sampleCount > 0,
        liveStreamConnected = devices.any { it.state == ProviderConnectionState.CONNECTED },
        sampleAgeMs = age,
        isDerived = false,
    )
}
