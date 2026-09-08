package com.fitconnect.android.designui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.atmosphere.HoneycombMesh
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.toColor
import kotlin.math.min

/**
 * Hexagonal metric chip — brand signature honeycomb without wallpaper noise.
 */
@Composable
fun HexMetric(
    value: String,
    label: String,
    modifier: Modifier = Modifier,
    size: Dp = 72.dp,
) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    Box(
        modifier = modifier
            .size(size)
            .testTag("hex_metric")
            .semantics { contentDescription = "$label $value" },
        contentAlignment = Alignment.Center,
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val r = min(this.size.width, this.size.height) * 0.42f
            val path = hexPath(this.size.width / 2f, this.size.height / 2f, r)
            drawPath(path, color = volt.copy(alpha = 0.12f))
            drawPath(path, color = volt.copy(alpha = 0.45f), style = Stroke(width = 1.5.dp.toPx()))
            // inner micro-grid line
            drawLine(
                color = volt.copy(alpha = 0.2f),
                start = Offset(this.size.width * 0.28f, this.size.height * 0.5f),
                end = Offset(this.size.width * 0.72f, this.size.height * 0.5f),
                strokeWidth = 1.dp.toPx(),
            )
        }
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onBackground,
        )
    }
}

@Composable
fun HexProgress(
    progress: Int,
    modifier: Modifier = Modifier,
    size: Dp = 72.dp,
    strokeWidth: Dp = 3.dp,
    label: String = "Progress",
) {
    val clamped = progress.coerceIn(0, 100)
    val active = EliteSurfaceColors.VOLTLINE.toColor()
    val track = EliteSurfaceColors.INSTRUMENT_TRACK.toColor()
    val edgeFractions = remember(clamped) { hexProgressEdgeFractions(clamped) }

    Box(
        modifier = modifier
            .size(size)
            .testTag("hex_progress")
            .semantics { contentDescription = "$label $clamped percent" },
        contentAlignment = Alignment.Center,
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val radius = min(this.size.width, this.size.height) * 0.42f
            val verts = HoneycombMesh.hexVertices(this.size.width / 2f, this.size.height / 2f, radius)
            val stroke = Stroke(width = strokeWidth.toPx())

            drawPath(
                path = hexPath(this.size.width / 2f, this.size.height / 2f, radius),
                color = active.copy(alpha = 0.08f),
            )

            repeat(6) { index ->
                val start = Offset(verts[index * 2], verts[index * 2 + 1])
                val next = (index + 1) % 6
                val end = Offset(verts[next * 2], verts[next * 2 + 1])
                drawLine(
                    color = track,
                    start = start,
                    end = end,
                    strokeWidth = stroke.width,
                )
                val fraction = edgeFractions[index]
                if (fraction > 0f) {
                    val progressEnd = Offset(
                        x = start.x + ((end.x - start.x) * fraction),
                        y = start.y + ((end.y - start.y) * fraction),
                    )
                    drawLine(
                        color = active,
                        start = start,
                        end = progressEnd,
                        strokeWidth = stroke.width,
                    )
                }
            }
        }
        Text(
            text = "$clamped%",
            style = EliteMonoTextStyle,
            color = active,
        )
    }
}

enum class HexBadgeTone {
    Neutral,
    Volt,
    Telemetry,
    Success,
    Warning,
    Alert,
    Iris,
}

@Composable
fun HexBadge(
    text: String,
    modifier: Modifier = Modifier,
    size: Dp = 40.dp,
    tone: HexBadgeTone = HexBadgeTone.Volt,
) {
    val palette = hexBadgePalette(tone)
    Box(
        modifier = modifier
            .size(size)
            .testTag("hex_badge")
            .semantics { contentDescription = "$text status" },
        contentAlignment = Alignment.Center,
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val radius = min(this.size.width, this.size.height) * 0.42f
            val path = hexPath(this.size.width / 2f, this.size.height / 2f, radius)
            drawPath(path = path, color = palette.fill)
            drawPath(
                path = path,
                color = palette.stroke,
                style = Stroke(width = 1.5.dp.toPx()),
            )
        }
        Text(
            text = text.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = palette.content,
        )
    }
}

@Composable
fun HexStatus(
    text: String,
    modifier: Modifier = Modifier,
) {
    Text(
        text = text.uppercase(),
        style = EliteMonoTextStyle,
        color = EliteSurfaceColors.VOLTLINE.toColor(),
        modifier = modifier.testTag("hex_status"),
    )
}

internal fun normalizedHexProgress(progress: Int): Float =
    progress.coerceIn(0, 100) / 100f

internal fun hexProgressEdgeFractions(progress: Int): List<Float> {
    val scaled = normalizedHexProgress(progress) * 6f
    return List(6) { index ->
        (scaled - index).coerceIn(0f, 1f)
    }
}

private data class HexBadgePalette(
    val fill: Color,
    val stroke: Color,
    val content: Color,
)

@Composable
private fun hexBadgePalette(tone: HexBadgeTone): HexBadgePalette = when (tone) {
    HexBadgeTone.Neutral -> HexBadgePalette(
        fill = EliteSurfaceColors.CARBON.toColor(),
        stroke = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f),
        content = MaterialTheme.colorScheme.onBackground,
    )
    HexBadgeTone.Volt -> HexBadgePalette(
        fill = EliteSurfaceColors.VOLTLINE.toColor().copy(alpha = 0.18f),
        stroke = EliteSurfaceColors.VOLTLINE.toColor().copy(alpha = 0.5f),
        content = EliteSurfaceColors.VOLTLINE.toColor(),
    )
    HexBadgeTone.Telemetry -> HexBadgePalette(
        fill = EliteSurfaceColors.TELEMETRY.toColor().copy(alpha = 0.18f),
        stroke = EliteSurfaceColors.TELEMETRY.toColor().copy(alpha = 0.5f),
        content = EliteSurfaceColors.TELEMETRY.toColor(),
    )
    HexBadgeTone.Success -> HexBadgePalette(
        fill = EliteSurfaceColors.PERFORMANCE.toColor().copy(alpha = 0.18f),
        stroke = EliteSurfaceColors.PERFORMANCE.toColor().copy(alpha = 0.5f),
        content = EliteSurfaceColors.PERFORMANCE.toColor(),
    )
    HexBadgeTone.Warning -> HexBadgePalette(
        fill = EliteSurfaceColors.RECOVERY.toColor().copy(alpha = 0.2f),
        stroke = EliteSurfaceColors.RECOVERY.toColor().copy(alpha = 0.56f),
        content = EliteSurfaceColors.RECOVERY.toColor(),
    )
    HexBadgeTone.Alert -> HexBadgePalette(
        fill = EliteSurfaceColors.ALERT.toColor().copy(alpha = 0.18f),
        stroke = EliteSurfaceColors.ALERT.toColor().copy(alpha = 0.5f),
        content = EliteSurfaceColors.ALERT.toColor(),
    )
    HexBadgeTone.Iris -> HexBadgePalette(
        fill = EliteSurfaceColors.IRIS.toColor().copy(alpha = 0.18f),
        stroke = EliteSurfaceColors.IRIS.toColor().copy(alpha = 0.5f),
        content = EliteSurfaceColors.IRIS.toColor(),
    )
}

private fun hexPath(cx: Float, cy: Float, radius: Float): Path {
    val verts = HoneycombMesh.hexVertices(cx, cy, radius)
    return Path().apply {
        moveTo(verts[0], verts[1])
        var index = 2
        while (index < verts.size) {
            lineTo(verts[index], verts[index + 1])
            index += 2
        }
        close()
    }
}
