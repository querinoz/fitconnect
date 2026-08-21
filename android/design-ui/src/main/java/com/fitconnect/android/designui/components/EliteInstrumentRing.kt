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
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.design.EliteSurfaceInstrument
import com.fitconnect.android.design.EliteSurfaceMotion
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.designui.theme.toColor
import kotlin.math.cos
import kotlin.math.sin

/**
 * Physical instrument ring. Proportions are fractions of diameter D so
 * Home (224dp) and Profile (160dp) share visual weight.
 * Glow is a radial + wide arc fallback (API 26+). Never silent-disable.
 */
@Composable
fun EliteInstrumentRing(
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
    
    val infiniteTransition = rememberInfiniteTransition(label = "ring-pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse-scale"
    )
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 0.8f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse-alpha"
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
    val bezel = EliteSurfaceColors.INSTRUMENT_BEZEL.toColor()
    val groove = EliteSurfaceColors.INSTRUMENT_GROOVE.toColor()
    val face = EliteSurfaceColors.INSTRUMENT_FACE.toColor()
    val track = EliteSurfaceColors.INSTRUMENT_TRACK.toColor()
    val white = Color.White
    Box(
        modifier = modifier
            .size(diameter)
            .testTag("elite_instrument_ring")
            .semantics { this.contentDescription = contentDescription }
            .drawWithCache {
                val d = size.minDimension
                val center = Offset(size.width / 2f, size.height / 2f)
                val bezelW = d * EliteSurfaceInstrument.BEZEL
                val grooveW = d * EliteSurfaceInstrument.GROOVE
                val haloW = d * EliteSurfaceInstrument.HALO
                val strokeW = d * EliteSurfaceInstrument.STROKE
                val specularW = d * EliteSurfaceInstrument.SPECULAR
                val trackR = d * EliteSurfaceInstrument.TRACK_RADIUS
                val topLeft = Offset(center.x - trackR, center.y - trackR)
                val arcSize = Size(trackR * 2f, trackR * 2f)
                val glowBrush = Brush.radialGradient(
                    colors = listOf(
                        trackColor.copy(alpha = EliteSurfaceInstrument.HALO_ALPHA),
                        trackColor.copy(alpha = 0f),
                    ),
                    center = center,
                    radius = d * 0.52f,
                )
                onDrawBehind {
                    drawCircle(color = bezel, radius = d / 2f, center = center)
                    drawCircle(color = groove, radius = d / 2f - bezelW * 0.35f, center = center)
                    drawCircle(color = face, radius = d / 2f - bezelW - grooveW * 0.15f, center = center)
                    
                    val currentPulseAlpha = if (pulsing && !reduceMotion) pulseAlpha else EliteSurfaceInstrument.HALO_ALPHA
                    val currentPulseRadius = if (pulsing && !reduceMotion) d * 0.48f * pulseScale else d * 0.48f
                    
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                trackColor.copy(alpha = currentPulseAlpha),
                                trackColor.copy(alpha = 0f),
                            ),
                            center = center,
                            radius = currentPulseRadius * 1.1f,
                        ),
                        radius = currentPulseRadius,
                        center = center
                    )
                    
                    drawArc(
                        color = track,
                        startAngle = -90f,
                        sweepAngle = 360f,
                        useCenter = false,
                        topLeft = topLeft,
                        size = arcSize,
                        style = Stroke(width = strokeW * 0.7f, cap = StrokeCap.Round),
                    )
                    drawArc(
                        color = trackColor.copy(alpha = EliteSurfaceInstrument.HALO_ALPHA),
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
                    drawArc(
                        color = white.copy(alpha = EliteSurfaceInstrument.SPECULAR_ALPHA),
                        startAngle = -180f,
                        sweepAngle = 90f,
                        useCenter = false,
                        topLeft = topLeft,
                        size = arcSize,
                        style = Stroke(width = specularW, cap = StrokeCap.Round),
                    )
                    if (sweep > 0.02f) {
                        val rad = Math.toRadians((-90.0 + 360.0 * sweep))
                        val tip = Offset(
                            center.x + trackR * cos(rad).toFloat(),
                            center.y + trackR * sin(rad).toFloat(),
                        )
                        drawCircle(color = white.copy(alpha = 0.55f), radius = strokeW * 0.42f, center = tip)
                    }
                }
            },
        contentAlignment = Alignment.Center,
        content = content,
    )
}

val EliteRingHero: Dp get() = EliteSurfaceInstrument.HERO_DP.dp
val EliteRingProfile: Dp get() = EliteSurfaceInstrument.PROFILE_DP.dp
val EliteRingInline: Dp get() = EliteSurfaceInstrument.INLINE_DP.dp
