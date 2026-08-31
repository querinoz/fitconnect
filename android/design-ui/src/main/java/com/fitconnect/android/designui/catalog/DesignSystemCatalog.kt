package com.fitconnect.android.designui.catalog

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.unit.dp
import androidx.compose.ui.graphics.Color
import com.fitconnect.android.designui.atmosphere.HoneycombAtmosphere
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.designui.charts.EliteChart
import com.fitconnect.android.designui.charts.EliteChartKind
import com.fitconnect.android.designui.charts.EliteChartModel
import com.fitconnect.android.designui.charts.EliteChartPoint
import com.fitconnect.android.designui.components.EliteAchievementTile
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteHeader
import com.fitconnect.android.designui.components.EliteHexatar
import com.fitconnect.android.designui.components.EliteHexatarProfile
import com.fitconnect.android.designui.components.EliteTierBadge
import com.fitconnect.android.designui.components.EliteTierChip
import com.fitconnect.android.designui.components.EliteTierProgress
import com.fitconnect.android.designui.components.fillColor
import com.fitconnect.android.designui.identity.Patent
import com.fitconnect.android.designui.identity.PatentRank
import com.fitconnect.android.designui.components.EliteDivider
import com.fitconnect.android.designui.components.EliteEmptyState
import com.fitconnect.android.designui.components.EliteErrorView
import com.fitconnect.android.designui.components.EliteInstrumentRing
import com.fitconnect.android.designui.components.EliteLoading
import com.fitconnect.android.designui.components.EliteMetricCard
import com.fitconnect.android.designui.components.EliteMetricTile
import com.fitconnect.android.designui.components.EliteOfflineBanner
import com.fitconnect.android.designui.components.ElitePersonCard
import com.fitconnect.android.designui.components.ElitePrimeInstrument
import com.fitconnect.android.designui.components.EliteRingHero
import com.fitconnect.android.designui.components.EliteRingInline
import com.fitconnect.android.designui.components.EliteSegmentedControl
import com.fitconnect.android.designui.components.EliteSettingsRow
import com.fitconnect.android.designui.components.EliteSkeleton
import com.fitconnect.android.designui.components.EliteSlider
import com.fitconnect.android.designui.components.EliteSwitch
import com.fitconnect.android.designui.components.EliteTextField
import com.fitconnect.android.designui.maps.EliteMapMode
import com.fitconnect.android.designui.maps.EliteMapPhase
import com.fitconnect.android.designui.maps.EliteRouteMap
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.components.EliteGlassCard
import com.fitconnect.android.designui.theme.LocalHapticGenerator
import com.fitconnect.android.foundation.haptics.HapticPreset
import com.fitconnect.android.designui.atmosphere.LocalEnergyPulseTrigger

/**
 * Living catalog for Design System 2.0 — not a product feature screen.
 * Used for Visual QA and to prove components consume tokens only.
 */
@Composable
fun DesignSystemCatalog(
    modifier: Modifier = Modifier,
) {
    var text by remember { mutableStateOf("") }
    var checked by remember { mutableStateOf(true) }
    var segment by remember { mutableIntStateOf(0) }
    var slider by remember { mutableFloatStateOf(0.4f) }
    var pulsing by remember { mutableStateOf(false) }
    val haptics = LocalHapticGenerator.current
    val pulseTrigger = LocalEnergyPulseTrigger.current

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("screen_design_catalog"),
        contentPadding = PaddingValues(EliteSpace.Lg),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Lg),
    ) {
        item {
            Text("Elite Surface", style = MaterialTheme.typography.displayMedium)
            Text(
                "Design System 2.0 catalog",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        item {
            Section("Premium") {
                EliteGlassCard {
                    Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                        Text("Ultra Premium Glass", style = MaterialTheme.typography.titleMedium, color = Color.White)
                        Text("Real-time backdrop blur (API 31+)", style = MaterialTheme.typography.bodySmall, color = Color.White.copy(alpha = 0.7f))
                        EliteButton(
                            "Test Haptics (Success)", 
                            onClick = { haptics.generate(HapticPreset.SUCCESS) }
                        )
                        EliteButton(
                            "Trigger Energy Pulse", 
                            onClick = { 
                                pulseTrigger.value = System.currentTimeMillis()
                                haptics.generate(HapticPreset.HEAVY_CLICK)
                            },
                            variant = EliteButtonVariant.Secondary
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
                        ) {
                            Text("Biometric Pulse (Ring)", color = Color.White.copy(alpha = 0.7f))
                            EliteSwitch(
                                checked = pulsing,
                                onCheckedChange = { pulsing = it }
                            )
                        }
                    }
                }
            }
        }
        item {
            Section("Atmosphere") {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .testTag("catalog_honeycomb"),
                ) {
                    HoneycombAtmosphere(strokeColor = MaterialTheme.colorScheme.primary)
                }
            }
        }
        item {
            Section("Buttons") {
                EliteButton("Primary", onClick = {})
                EliteButton("Secondary", onClick = {}, variant = EliteButtonVariant.Secondary)
                EliteButton("Ghost", onClick = {}, variant = EliteButtonVariant.Ghost)
                EliteButton("Destructive", onClick = {}, variant = EliteButtonVariant.Destructive)
            }
        }
        item {
            Section("Inputs") {
                EliteTextField(value = text, onValueChange = { text = it }, label = "Email")
                EliteSwitch(checked = checked, onCheckedChange = { checked = it })
                EliteSegmentedControl(
                    options = listOf("Day", "Week", "Month"),
                    selectedIndex = segment,
                    onSelected = { segment = it },
                )
                EliteSlider(value = slider, onValueChange = { slider = it })
            }
        }
        item {
            Section("Cockpit") {
                ElitePrimeInstrument(score = 88, subtitle = "Peak Readiness", pulsing = pulsing)
                com.fitconnect.android.designui.components.EliteWordmarkHeader(initials = "FC")
                EliteInstrumentRing(
                    progress = 0.78f,
                    diameter = EliteRingInline,
                    contentDescription = "Recovery 78 percent, status prime",
                    pulsing = pulsing
                ) {
                    androidx.compose.material3.Text("78", style = MaterialTheme.typography.headlineMedium)
                }
                EliteButton("Primary loading", onClick = {}, loading = true)
                EliteButton("Primary success", onClick = {}, status = com.fitconnect.android.designui.components.EliteButtonStatus.Success)
            }
        }
        item {
            Section("Neumorphic") {
                com.fitconnect.android.designui.neumorphic.EliteReadinessNeumorphicCard(
                    telemetry = com.fitconnect.android.designui.neumorphic.ReadinessTelemetry(
                        readinessPercent = 85,
                        hrvMs = 68,
                        load = 0.82f,
                    ),
                    athleteLabel = "INÊS MARTINS",
                )
            }
        }
        item {
            Section("Cards") {
                EliteMetricCard(label = "Readiness", value = "82")
                ElitePersonCard(title = "Person shell", subtitle = "Athlete/Coach reuse this card")
                EliteCard { Text("Solid card body", style = MaterialTheme.typography.bodyMedium) }
            }
        }
        item {
            Section("States") {
                EliteEmptyState(
                    title = "Empty state",
                    body = "Reusable empty pattern for future modules.",
                    actionLabel = "Action",
                    onAction = {},
                )
                EliteErrorView(
                    title = "Couldn't load",
                    body = "One sentence. Outline retry.",
                    onRetry = {},
                )
                EliteSkeleton()
                EliteLoading()
            }
        }
        item {
            Section("Chart API") {
                EliteChart(
                    model = EliteChartModel(
                        kind = EliteChartKind.READINESS,
                        points = listOf(
                            EliteChartPoint(0f, 40f),
                            EliteChartPoint(1f, 55f),
                            EliteChartPoint(2f, 48f),
                            EliteChartPoint(3f, 70f),
                            EliteChartPoint(4f, 82f),
                        ),
                        contentDescription = "Sample readiness series",
                    ),
                )
            }
        }
        item {
            Section("Identity") {
                val demoRank = PatentRank(Patent.INICIADO, 1)
                EliteHeader(
                    userId = "catalog-athlete",
                    userName = "Catalog",
                    streakDays = 4,
                    rank = demoRank,
                    onLogoTap = {},
                    onAvatarTap = {},
                    onNotificationsTap = {},
                )
                EliteHexatar(
                    userId = "catalog-athlete",
                    contentDescription = "Catalog hexatar",
                    diameter = EliteHexatarProfile,
                )
                EliteTierBadge(rank = demoRank)
                EliteTierChip(rank = demoRank)
                EliteTierProgress(
                    title = "INICIADO",
                    progress = 0.2f,
                    remaining = "8 sessions to INICIADO",
                    fill = Patent.INICIADO.fillColor(),
                )
                EliteAchievementTile(
                    emoji = "🏆",
                    label = "First PR",
                    domain = MaterialTheme.colorScheme.primary,
                    unlocked = true,
                )
            }
        }
        item {
            Section("Rows") {
                EliteMetricTile(label = "STREAK", value = "31", accentVolt = true)
                EliteSettingsRow(title = "Appearance", trailing = "HONEYCOMB · SUBTLE", onClick = {})
                EliteOfflineBanner(cacheLabel = "CACHE UNAVAILABLE")
            }
        }
        item {
            Section("Map states") {
                EliteRouteMap(
                    points = emptyList(),
                    mode = EliteMapMode.ROUTE,
                    phase = EliteMapPhase.Empty,
                )
            }
        }
    }
}

@Composable
private fun Section(
    title: String,
    content: @Composable () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
        Text(title, style = MaterialTheme.typography.titleLarge)
        content()
    }
}
