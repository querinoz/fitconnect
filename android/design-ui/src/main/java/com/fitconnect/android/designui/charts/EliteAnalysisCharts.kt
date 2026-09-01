package com.fitconnect.android.designui.charts

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteSpace

@Composable
fun EliteWeeklyLoadChart(
    bars: List<EliteWeeklyLoadBar>,
    modifier: Modifier = Modifier,
    heroLoad: Float? = null,
    heroColor: Color = EliteChartPalette.Hero,
    heroLabel: String = "TODAY LOAD",
    contentDescription: String = "Weekly training load",
) {
    val maxLoad = bars.maxOfOrNull { it.load }?.coerceAtLeast(1f) ?: 1f
    val hero = heroLoad ?: bars.firstOrNull { it.isToday }?.load

    Column(
        modifier = modifier.semantics { this.contentDescription = contentDescription },
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        hero?.let { value ->
            Text(
                text = "${value.toInt()}",
                style = MaterialTheme.typography.headlineLarge.copy(fontWeight = FontWeight.Bold),
                color = heroColor,
            )
            Text(
                text = heroLabel,
                style = EliteMonoTextStyle,
                color = EliteChartPalette.Axis,
            )
        }
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp),
        ) {
            val barWidth = size.width / (bars.size * 2f)
            val gap = barWidth
            bars.forEachIndexed { index, bar ->
                val fraction = bar.load / maxLoad
                val barHeight = size.height * 0.72f * fraction
                val left = gap + index * (barWidth + gap)
                val top = size.height - barHeight - 16f
                drawRoundRect(
                    color = if (bar.isToday) heroColor else EliteChartPalette.Muted,
                    topLeft = Offset(left, top),
                    size = Size(barWidth, barHeight),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(6f, 6f),
                )
            }
            drawLine(
                color = EliteChartPalette.Axis.copy(alpha = 0.35f),
                start = Offset(0f, size.height - 12f),
                end = Offset(size.width, size.height - 12f),
                strokeWidth = 1f,
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            bars.forEach { bar ->
                Text(
                    text = bar.label,
                    style = EliteMonoTextStyle,
                    color = if (bar.isToday) heroColor else EliteChartPalette.Axis,
                )
            }
        }
    }
}

@Composable
fun EliteHrvTrendChart(
    points: List<EliteChartPoint>,
    modifier: Modifier = Modifier,
    deltaPercent: Float? = null,
    contentDescription: String = "HRV trend",
) {
    Column(
        modifier = modifier.semantics { this.contentDescription = contentDescription },
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
    ) {
        deltaPercent?.let { delta ->
            val color = if (delta >= 0f) EliteChartPalette.Success else EliteChartPalette.Negative
            Text(
                text = "${if (delta >= 0) "+" else ""}${"%.1f".format(delta)}%",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = color,
            )
        }
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp),
        ) {
            if (points.size < 2) return@Canvas
            val minY = points.minOf { it.y }
            val maxY = points.maxOf { it.y }.coerceAtLeast(minY + 0.0001f)
            val minX = points.minOf { it.x }
            val maxX = points.maxOf { it.x }.coerceAtLeast(minX + 0.0001f)
            fun mapX(x: Float) = ((x - minX) / (maxX - minX)) * size.width
            fun mapY(y: Float) = size.height - ((y - minY) / (maxY - minY)) * size.height

            repeat(4) { i ->
                val y = size.height * (i / 3f)
                drawLine(
                    EliteChartPalette.Axis.copy(alpha = 0.2f),
                    Offset(0f, y),
                    Offset(size.width, y),
                    strokeWidth = 1f,
                )
            }

            val path = Path()
            points.forEachIndexed { index, p ->
                val o = Offset(mapX(p.x), mapY(p.y))
                if (index == 0) path.moveTo(o.x, o.y) else path.lineTo(o.x, o.y)
            }
            drawPath(
                path = path,
                color = EliteChartPalette.Secondary,
                style = Stroke(width = 3f, cap = StrokeCap.Round),
            )
            points.forEachIndexed { index, p ->
                val isLast = index == points.lastIndex
                val center = Offset(mapX(p.x), mapY(p.y))
                drawCircle(
                    color = if (isLast) EliteChartPalette.Secondary else EliteChartPalette.Muted,
                    radius = if (isLast) 5f else 3f,
                    center = center,
                )
            }
        }
    }
}

@Composable
fun EliteZoneRingChart(
    segments: List<EliteZoneSegment>,
    modifier: Modifier = Modifier,
    contentDescription: String = "Training zone distribution",
) {
    val total = segments.sumOf { it.minutes }.coerceAtLeast(1)
    Column(
        modifier = modifier.semantics { this.contentDescription = contentDescription },
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Canvas(modifier = Modifier.size(140.dp)) {
                val stroke = 18f
                val diameter = size.minDimension - stroke
                val topLeft = Offset((size.width - diameter) / 2f, (size.height - diameter) / 2f)
                var startAngle = -90f
                segments.forEach { segment ->
                    val sweep = 360f * segment.minutes / total
                    drawArc(
                        color = EliteChartPalette.zone(segment.zone),
                        startAngle = startAngle,
                        sweepAngle = sweep,
                        useCenter = false,
                        topLeft = topLeft,
                        size = Size(diameter, diameter),
                        style = Stroke(width = stroke, cap = StrokeCap.Butt),
                    )
                    startAngle += sweep
                }
            }
            Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Xxs)) {
                segments.forEach { segment ->
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Canvas(modifier = Modifier.size(10.dp)) {
                            drawCircle(EliteChartPalette.zone(segment.zone), radius = size.minDimension / 2f)
                        }
                        Text(
                            text = "${segment.label} · ${segment.minutes}m",
                            style = MaterialTheme.typography.bodySmall,
                            color = EliteChartPalette.Axis,
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun EliteStreakTrendChart(
    values: List<Int>,
    labels: List<String>,
    heroDays: Int,
    modifier: Modifier = Modifier,
    contentDescription: String = "Streak trend",
) {
    val max = values.maxOrNull()?.coerceAtLeast(1) ?: 1
    Column(
        modifier = modifier.semantics { this.contentDescription = contentDescription },
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        Text(
            text = "$heroDays",
            style = MaterialTheme.typography.headlineLarge.copy(fontWeight = FontWeight.Bold),
            color = EliteChartPalette.Hero,
        )
        Text(
            text = "DAY STREAK",
            style = EliteMonoTextStyle,
            color = EliteChartPalette.Axis,
        )
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(100.dp),
        ) {
            val barWidth = size.width / (values.size * 2f)
            val gap = barWidth
            values.forEachIndexed { index, value ->
                val fraction = value.toFloat() / max
                val barHeight = size.height * 0.75f * fraction
                val left = gap + index * (barWidth + gap)
                val top = size.height - barHeight - 12f
                drawRoundRect(
                    color = EliteChartPalette.Muted,
                    topLeft = Offset(left, top),
                    size = Size(barWidth, barHeight),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(6f, 6f),
                )
            }
            val heroIndex = values.indexOf(heroDays).takeIf { it >= 0 } ?: values.lastIndex
            val heroFraction = values[heroIndex].toFloat() / max
            val heroHeight = size.height * 0.75f * heroFraction
            val heroLeft = gap + heroIndex * (barWidth + gap)
            val heroTop = size.height - heroHeight - 12f
            drawRoundRect(
                color = EliteChartPalette.Hero,
                topLeft = Offset(heroLeft, heroTop),
                size = Size(barWidth, heroHeight),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(6f, 6f),
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            labels.forEachIndexed { index, label ->
                Text(
                    text = label,
                    style = EliteMonoTextStyle,
                    color = if (values.getOrNull(index) == heroDays) {
                        EliteChartPalette.Hero
                    } else {
                        EliteChartPalette.Axis
                    },
                )
            }
        }
    }
}

@Composable
fun EliteXpProgressChart(
    values: List<Int>,
    labels: List<String>,
    todayIndex: Int,
    modifier: Modifier = Modifier,
    contentDescription: String = "XP progress",
) {
    EliteWeeklyLoadChart(
        modifier = modifier.semantics { this.contentDescription = contentDescription },
        bars = values.mapIndexed { index, value ->
            EliteWeeklyLoadBar(
                label = labels[index],
                load = value.toFloat(),
                isToday = index == todayIndex,
            )
        },
        heroLoad = values.getOrNull(todayIndex)?.toFloat(),
        heroColor = EliteChartPalette.Success,
        heroLabel = "XP THIS WEEK",
        contentDescription = contentDescription,
    )
}
