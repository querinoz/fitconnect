package com.fitconnect.android.designui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithCache
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.design.EliteSurfaceInstrument
import com.fitconnect.android.design.EliteSurfaceMotion
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.designui.theme.toColor

/**
 * Ascend LEVEL ring — dashed outer track, thick Voltline glow, clean floor face.
 * Distinct from [EliteInstrumentRing] (Home/Profile bezel instrument).
 */
@Composable
fun AscendHeroRing(
    progress: Float,
    diameter: Dp,
    contentDescription: String,
    modifier: Modifier = Modifier,
    trackColor: Color = EliteSurfaceColors.VOLTLINE.toColor(),
    pulsing: Boolean = false,
    content: @Composable BoxScope.() -> Unit,
) {
    val reduceMotion = reduceMotionEnabled()
    val animated = remember { Animatable(0f) }
    val target = progress.coerceIn(0f, 1f)
    val infiniteTransition = rememberInfiniteTransition(label = "ascend-ring-pulse")
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = EliteSurfaceInstrument.HALO_ALPHA,
        targetValue = if (reduceMotion || !pulsing) {
            EliteSurfaceInstrument.HALO_ALPHA
        } else {
            0.42f
        },
        animationSpec = infiniteRepeatable(
            animation = tween(EliteSurfaceMotion.DATA_MS),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "ascend-halo",
    )

    LaunchedEffect(target, reduceMotion) {
        if (reduceMotion) {
            animated.snapTo(target)
        } else {
            animated.animateTo(
                target,
                tween(EliteSurfaceMotion.SCREEN_MS + EliteSurfaceMotion.DATA_MS),
            )
        }
    }
    val sweep = animated.value
    val face = EliteSurfaceColors.INSTRUMENT_FACE.toColor()
    val muted = EliteSurfaceColors.INSTRUMENT_MUTED.toColor()
    val track = EliteSurfaceColors.INSTRUMENT_TRACK.toColor()
    Box(
        modifier = modifier
            .size(diameter)
            .testTag("ascend_hero_ring")
            .semantics { this.contentDescription = contentDescription }
            .drawWithCache {
                val d = size.minDimension
                val center = Offset(size.width / 2f, size.height / 2f)
                val dash = EliteSpace.Xs.toPx()
                val gap = EliteSpace.Sm.toPx()
                val outerR = d * 0.48f
                val trackR = d * EliteSurfaceInstrument.TRACK_RADIUS
                val strokeW = d * EliteSurfaceInstrument.STROKE * 1.85f
                val haloW = d * EliteSurfaceInstrument.HALO * 1.35f
                val topLeft = Offset(center.x - trackR, center.y - trackR)
                val arcSize = Size(trackR * 2f, trackR * 2f)
                val dashEffect = PathEffect.dashPathEffect(floatArrayOf(dash, gap), 0f)
                onDrawBehind {
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                trackColor.copy(alpha = pulseAlpha),
                                trackColor.copy(alpha = 0f),
                            ),
                            center = center,
                            radius = d * 0.52f,
                        ),
                        radius = d * 0.50f,
                        center = center,
                    )
                    drawCircle(color = face, radius = d * 0.42f, center = center)
                    drawCircle(
                        color = muted.copy(alpha = 0.42f),
                        radius = outerR,
                        center = center,
                        style = Stroke(
                            width = EliteSpace.Xxs.toPx(),
                            pathEffect = dashEffect,
                        ),
                    )
                    drawArc(
                        color = track,
                        startAngle = -90f,
                        sweepAngle = 360f,
                        useCenter = false,
                        topLeft = topLeft,
                        size = arcSize,
                        style = Stroke(width = strokeW * 0.72f, cap = StrokeCap.Round),
                    )
                    if (sweep > 0.01f) {
                        drawArc(
                            color = trackColor.copy(alpha = pulseAlpha),
                            startAngle = -90f,
                            sweepAngle = 360f * sweep,
                            useCenter = false,
                            topLeft = topLeft,
                            size = arcSize,
                            style = Stroke(width = haloW, cap = StrokeCap.Round),
                        )
                        drawArc(
                            color = trackColor,
                            startAngle = -90f,
                            sweepAngle = 360f * sweep,
                            useCenter = false,
                            topLeft = topLeft,
                            size = arcSize,
                            style = Stroke(width = strokeW, cap = StrokeCap.Round),
                        )
                    }
                }
            },
        contentAlignment = Alignment.Center,
        content = content,
    )
}
