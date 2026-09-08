package com.fitconnect.android.athlete.ui.home

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DirectionsRun
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.FitnessCenter
import androidx.compose.material.icons.outlined.SelfImprovement
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.components.EliteInstrumentRing
import com.fitconnect.android.designui.components.EliteQuickAccessItem
import com.fitconnect.android.designui.components.EliteQuickAccessRail
import com.fitconnect.android.designui.components.EliteSessionHeroCard
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.components.EliteWeekProgressHero
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteElevation
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

@Composable
fun TodayWeekProgressSection(
    readinessPercent: Int,
    hrvLabel: String,
    loadLabel: String,
    modifier: Modifier = Modifier,
) {
    EliteWeekProgressHero(
        progressPercent = readinessPercent.coerceIn(0, 100),
        title = "This week performance",
        leftLabel = "HRV",
        leftValue = hrvLabel,
        rightLabel = "LOAD",
        rightValue = loadLabel,
        modifier = modifier,
    )
}

/**
 * Contract dashboard: side-by-side Readiness + Load rings (sparse primary signal).
 */
@Composable
fun TodayDualRingSection(
    readinessPercent: Int,
    loadNormalized: Float,
    readinessStatus: String,
    loadStatus: String,
    modifier: Modifier = Modifier,
    recoveryCaption: String? = null,
    activityCaption: String? = null,
) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val telemetry = EliteSurfaceColors.TELEMETRY.toColor()
    val loadPct = (loadNormalized.coerceIn(0f, 1.5f) / 1.5f * 100f).toInt().coerceIn(0, 100)
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        EosPremiumCard(modifier = Modifier.weight(1f)) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
                modifier = Modifier.fillMaxWidth(),
            ) {
                EliteInstrumentRing(
                    progress = readinessPercent / 100f,
                    diameter = 112.dp,
                    contentDescription = "Readiness $readinessPercent percent",
                    trackColor = volt,
                    pulsing = readinessPercent in 1..99,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Readiness", style = MaterialTheme.typography.labelSmall)
                        Text(
                            "$readinessPercent%",
                            style = MaterialTheme.typography.titleLarge,
                            color = volt,
                        )
                    }
                }
                Text(readinessStatus, style = MaterialTheme.typography.labelMedium, color = volt)
                recoveryCaption?.let {
                    Text(it, style = EliteMonoTextStyle.copy(fontSize = 10.sp), color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        EosPremiumCard(modifier = Modifier.weight(1f)) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
                modifier = Modifier.fillMaxWidth(),
            ) {
                EliteInstrumentRing(
                    progress = loadPct / 100f,
                    diameter = 112.dp,
                    contentDescription = "Load $loadPct percent",
                    trackColor = telemetry,
                    pulsing = loadPct in 1..99,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Load", style = MaterialTheme.typography.labelSmall)
                        Text(
                            "$loadPct%",
                            style = MaterialTheme.typography.titleLarge,
                            color = telemetry,
                        )
                    }
                }
                Text(loadStatus, style = MaterialTheme.typography.labelMedium, color = telemetry)
                activityCaption?.let {
                    Text(it, style = EliteMonoTextStyle.copy(fontSize = 10.sp), color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

@Composable
fun TodayQuickAccessSection(
    onOpenTraining: () -> Unit,
    onOpenDiscover: () -> Unit,
    onOpenRecovery: () -> Unit,
    onOpenPrograms: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        EliteSysLabel("QUICK ACCESS")
        EliteQuickAccessRail(
            items = listOf(
                EliteQuickAccessItem("train", "Train", Icons.Outlined.DirectionsRun, onOpenTraining),
                EliteQuickAccessItem("discover", "Discover", Icons.Outlined.Explore, onOpenDiscover),
                EliteQuickAccessItem("recover", "Recover", Icons.Outlined.SelfImprovement, onOpenRecovery),
                EliteQuickAccessItem("programs", "Programs", Icons.Outlined.FitnessCenter, onOpenPrograms),
            ),
        )
    }
}

@Composable
fun TodaySessionHeroSection(
    session: TodaySessionCardUi?,
    recommendation: String,
    onStart: () -> Unit,
    onOpenSession: (String) -> Unit,
    modifier: Modifier = Modifier,
    hideDemoMeta: Boolean = true,
) {
    val title = session?.title ?: "Outdoor / train"
    val subtitle = session?.subtitle ?: recommendation
    EliteSessionHeroCard(
        title = title,
        subtitle = subtitle,
        metaLeft = if (session?.isDemo == true && !hideDemoMeta) "LOCAL_DEMO" else "SESSION",
        metaRight = "Start when ready",
        ctaLabel = "Start Session",
        onCta = {
            if (session == null || session.id.startsWith("demo:")) {
                onStart()
            } else {
                onOpenSession(session.id)
            }
        },
        onClick = {
            if (session == null || session.id.startsWith("demo:")) {
                onStart()
            } else {
                onOpenSession(session.id)
            }
        },
        modifier = modifier,
    )
}

@Composable
fun TodayTelemetryDeck(
    powerWatts: Int,
    speedKmh: Int,
    endurancePercent: Int,
    sessionsCount: Int,
    streakDays: Int,
    efficiencyPercent: Int,
    modifier: Modifier = Modifier,
) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val telemetry = EliteSurfaceColors.TELEMETRY.toColor()
    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("today_telemetry_deck"),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        EosPremiumCard {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
            ) {
                Text(
                    "Performance Metrics",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                    color = Color.White,
                )
                GlowMetricBar(label = "POWER", value = "${powerWatts}W", fraction = (powerWatts / 400f).coerceIn(0.15f, 1f), color = volt)
                GlowMetricBar(label = "SPEED", value = "${speedKmh}km/h", fraction = (speedKmh / 45f).coerceIn(0.15f, 1f), color = volt)
                GlowMetricBar(label = "ENDURANCE", value = "$endurancePercent%", fraction = endurancePercent / 100f, color = volt)
            }
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(EliteSpace.Md),
        ) {
            // Athlete-facing labels (never "CPU/Memory" — coach/system chrome is out of Zenith IA).
            EosPremiumCard(modifier = Modifier.weight(1f)) {
                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                    Text("Load Trend", style = EliteMonoTextStyle.copy(fontSize = 10.sp), color = telemetry)
                    TelemetryAreaChart(
                        color = telemetry,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(72.dp)
                            .semantics { contentDescription = "Training load trend" },
                    )
                }
            }
            EosPremiumCard(modifier = Modifier.weight(1f)) {
                Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs)) {
                    Text("Session Volume", style = EliteMonoTextStyle.copy(fontSize = 10.sp), color = volt)
                    TelemetryBarChart(
                        color = volt,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(72.dp)
                            .semantics { contentDescription = "Session volume bars" },
                    )
                }
            }
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
        ) {
            SummaryTile(title = "Sessions", value = "$sessionsCount", modifier = Modifier.weight(1f))
            SummaryTile(title = "Streak", value = "$streakDays", modifier = Modifier.weight(1f))
            SummaryTile(title = "Efficiency", value = "$efficiencyPercent%", modifier = Modifier.weight(1f))
        }
    }
}

@Composable
private fun GlowMetricBar(label: String, value: String, fraction: Float, color: Color) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(label, style = EliteMonoTextStyle.copy(fontSize = 11.sp), color = Color.White)
            Text(value, style = EliteMonoTextStyle.copy(fontSize = 11.sp), color = color)
        }
        Canvas(
            Modifier
                .fillMaxWidth()
                .height(10.dp)
                .shadow(
                    EliteElevation.Mid,
                    RoundedCornerShape(999.dp),
                    ambientColor = color.copy(alpha = 0.5f),
                    spotColor = color.copy(alpha = 0.7f),
                ),
        ) {
            val track = Color.White.copy(alpha = 0.08f)
            val radius = androidx.compose.ui.geometry.CornerRadius(size.height / 2f)
            drawRoundRect(track, cornerRadius = radius)
            val w = size.width * fraction.coerceIn(0.08f, 1f)
            drawRoundRect(
                color = color,
                size = androidx.compose.ui.geometry.Size(w, size.height),
                cornerRadius = radius,
            )
        }
    }
}

@Composable
private fun TelemetryAreaChart(color: Color, modifier: Modifier = Modifier) {
    val points = listOf(0.28f, 0.42f, 0.35f, 0.58f, 0.5f, 0.72f, 0.66f, 0.84f)
    Canvas(modifier) {
        val path = Path()
        val fill = Path()
        points.forEachIndexed { i, yFrac ->
            val x = size.width * i / (points.lastIndex.coerceAtLeast(1).toFloat())
            val y = size.height * (1f - yFrac)
            if (i == 0) {
                path.moveTo(x, y)
                fill.moveTo(x, size.height)
                fill.lineTo(x, y)
            } else {
                path.lineTo(x, y)
                fill.lineTo(x, y)
            }
        }
        fill.lineTo(size.width, size.height)
        fill.close()
        drawPath(fill, Brush.verticalGradient(listOf(color.copy(alpha = 0.45f), Color.Transparent)))
        drawPath(path, color, style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round))
    }
}

@Composable
private fun TelemetryBarChart(color: Color, modifier: Modifier = Modifier) {
    val heights = listOf(0.35f, 0.55f, 0.42f, 0.78f, 0.62f, 0.9f)
    Canvas(modifier) {
        val gap = 6.dp.toPx()
        val barW = (size.width - gap * (heights.size - 1)) / heights.size
        heights.forEachIndexed { i, hFrac ->
            val h = size.height * hFrac
            val x = i * (barW + gap)
            drawRoundRect(
                color = color.copy(alpha = 0.18f),
                topLeft = Offset(x, 0f),
                size = androidx.compose.ui.geometry.Size(barW, size.height),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(4.dp.toPx()),
            )
            drawRoundRect(
                color = color,
                topLeft = Offset(x, size.height - h),
                size = androidx.compose.ui.geometry.Size(barW, h),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(4.dp.toPx()),
            )
        }
    }
}

@Composable
private fun SummaryTile(title: String, value: String, modifier: Modifier = Modifier) {
    EosPremiumCard(modifier = modifier) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(EliteSpace.Xxs),
        ) {
            Text(title, style = EliteMonoTextStyle.copy(fontSize = 10.sp), color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold), color = Color.White)
        }
    }
}
