package com.fitconnect.android.designui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithCache
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipPath
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.design.EliteSurfaceInstrument
import com.fitconnect.android.designui.identity.HexatarFactory
import com.fitconnect.android.designui.identity.HexatarPalette
import com.fitconnect.android.designui.identity.HexatarPattern
import com.fitconnect.android.designui.identity.HexatarSpec
import com.fitconnect.android.designui.theme.toColor
import kotlin.math.cos
import kotlin.math.sin

val EliteHexatarHeader: Dp get() = EliteSurfaceInstrument.HEXATAR_HEADER_DP.dp
val EliteHexatarProfile: Dp get() = EliteSurfaceInstrument.HEXATAR_PROFILE_DP.dp
val EliteHexatarFeed: Dp get() = EliteSurfaceInstrument.HEXATAR_FEED_DP.dp

fun hexatarPaletteColor(palette: HexatarPalette): Color = when (palette) {
    HexatarPalette.STEEL -> EliteSurfaceColors.PATENT_STEEL.toColor()
    HexatarPalette.CYAN -> EliteSurfaceColors.TELEMETRY.toColor()
    HexatarPalette.MINT -> EliteSurfaceColors.PATENT_MINT.toColor()
    HexatarPalette.AMBER -> EliteSurfaceColors.RECOVERY.toColor()
    HexatarPalette.VOLT -> EliteSurfaceColors.VOLTLINE.toColor()
    HexatarPalette.LEGEND -> EliteSurfaceColors.PATENT_LEGEND.toColor()
}

@Composable
fun EliteHexatar(
    userId: String,
    contentDescription: String,
    modifier: Modifier = Modifier,
    diameter: Dp = EliteHexatarHeader,
    spec: HexatarSpec = remember(userId) { HexatarFactory.of(userId) },
) {
    val fill = hexatarPaletteColor(spec.palette)
    val face = EliteSurfaceColors.INSTRUMENT_FACE.toColor()
    val minPattern = EliteSurfaceInstrument.HEXATAR_FEED_DP.dp
    Box(
        modifier = modifier
            .size(diameter)
            .testTag("elite_hexatar")
            .semantics { this.contentDescription = contentDescription }
            .drawWithCache {
                val d = this.size.minDimension
                val r = d / 2f - 1.6.dp.toPx()
                val center = Offset(this.size.width / 2f, this.size.height / 2f)
                val hex = pointyHex(center, r)
                val stroke = Stroke(width = 1.6.dp.toPx(), cap = StrokeCap.Round)
                val simple = diameter < minPattern
                onDrawBehind {
                    drawPath(hex, color = face)
                    if (simple) {
                        drawPath(hex, color = fill.copy(alpha = 0.85f))
                    } else {
                        clipPath(hex) {
                            rotate(spec.rotationDeg, center) {
                                drawHexatarPattern(spec.pattern, spec.variant, center, r, fill, face)
                            }
                        }
                    }
                    drawPath(hex, color = fill, style = stroke)
                }
            },
        contentAlignment = Alignment.Center,
    ) {}
}

internal fun pointyHex(center: Offset, radius: Float): Path {
    val path = Path()
    var i = 0
    while (i < 6) {
        val rad = Math.toRadians(-90.0 + i * 60.0)
        val x = center.x + radius * cos(rad).toFloat()
        val y = center.y + radius * sin(rad).toFloat()
        if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
        i++
    }
    path.close()
    return path
}

private fun androidx.compose.ui.graphics.drawscope.DrawScope.drawHexatarPattern(
    pattern: HexatarPattern,
    variant: Int,
    center: Offset,
    radius: Float,
    fill: Color,
    face: Color,
) {
    when (pattern) {
        HexatarPattern.ORBIT -> {
            drawPath(pointyHex(center, radius * 0.55f), color = fill, style = Stroke(width = 2.2f))
            drawPath(pointyHex(center, radius * 0.22f), color = fill)
        }
        HexatarPattern.SHARD -> {
            val shard = Path().apply {
                moveTo(center.x, center.y - radius)
                lineTo(center.x + radius, center.y)
                lineTo(center.x, center.y + radius)
                close()
            }
            drawPath(shard, color = fill)
            drawCircle(fill, radius = radius * 0.08f, center = Offset(center.x - radius * 0.18f, center.y - radius * 0.42f))
        }
        HexatarPattern.CLUSTER -> {
            val s = radius * 0.18f
            val spots = listOf(
                Offset(center.x, center.y - s * 1.4f),
                Offset(center.x - s * 1.2f, center.y + s * 0.4f),
                Offset(center.x + s * 1.2f, center.y + s * 0.4f),
                Offset(center.x, center.y + s * 1.5f),
            )
            spots.forEach { drawPath(pointyHex(it, s), color = fill) }
        }
        HexatarPattern.RADIAL -> {
            drawCircle(fill, radius = radius * 0.1f, center = center)
            var i = 0
            while (i < 6) {
                val rad = Math.toRadians(-90.0 + i * 60.0)
                val end = Offset(
                    center.x + radius * 0.82f * cos(rad).toFloat(),
                    center.y + radius * 0.82f * sin(rad).toFloat(),
                )
                drawLine(fill, center, end, strokeWidth = 1.8f, cap = StrokeCap.Round)
                i++
            }
        }
        HexatarPattern.CHEVRON -> {
            val y1 = center.y - radius * 0.15f
            val y2 = center.y + radius * 0.22f
            listOf(y1, y2).forEach { y ->
                drawLine(
                    fill,
                    Offset(center.x - radius * 0.42f, y + radius * 0.18f),
                    Offset(center.x, y - radius * 0.12f),
                    strokeWidth = 2.4f,
                    cap = StrokeCap.Round,
                )
                drawLine(
                    fill,
                    Offset(center.x + radius * 0.42f, y + radius * 0.18f),
                    Offset(center.x, y - radius * 0.12f),
                    strokeWidth = 2.4f,
                    cap = StrokeCap.Round,
                )
            }
        }
        HexatarPattern.TIDE -> {
            val tide = Path().apply {
                moveTo(center.x - radius, center.y)
                lineTo(center.x + radius, center.y)
                lineTo(center.x + radius, center.y + radius)
                lineTo(center.x - radius, center.y + radius)
                close()
            }
            drawPath(tide, color = fill)
            if (variant == 1) {
                drawCircle(face.copy(alpha = 0.35f), radius = radius * 0.12f, center = Offset(center.x, center.y - radius * 0.28f))
            }
        }
        HexatarPattern.ROTOR -> {
            drawPath(pointyHex(center, radius * 0.42f), color = fill)
        }
        HexatarPattern.RIDGE -> {
            val y = center.y + radius * 0.08f
            val path = Path().apply {
                moveTo(center.x - radius * 0.7f, y)
                lineTo(center.x - radius * 0.28f, y - radius * 0.28f)
                lineTo(center.x, y)
                lineTo(center.x + radius * 0.32f, y - radius * 0.22f)
                lineTo(center.x + radius * 0.7f, y + radius * 0.06f)
            }
            drawPath(path, color = fill, style = Stroke(width = 2.2f, cap = StrokeCap.Round))
            drawCircle(fill, radius = radius * 0.08f, center = Offset(center.x + radius * 0.28f, center.y - radius * 0.38f))
        }
    }
}
