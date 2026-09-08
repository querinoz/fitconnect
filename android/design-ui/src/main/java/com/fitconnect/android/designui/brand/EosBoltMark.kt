package com.fitconnect.android.designui.brand

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Fill
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.designui.theme.toColor

/**
 * Two-piece bolt / S. When [assemble] is true the halves slide in and lock,
 * then the Voltline piece pulses a soft glow (skipped under reduced motion).
 */
@Composable
fun EosBoltMark(
    modifier: Modifier = Modifier,
    size: Dp = 48.dp,
    assemble: Boolean = false,
    contentDescription: String? = "FitConnect",
) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val white = Color.White
    val reduceMotion = reduceMotionEnabled()
    val progress = remember { Animatable(if (!assemble || reduceMotion) 1f else 0f) }
    LaunchedEffect(assemble, reduceMotion) {
        if (!assemble || reduceMotion) {
            progress.snapTo(1f)
        } else {
            progress.snapTo(0f)
            progress.animateTo(
                1f,
                spring(dampingRatio = 0.72f, stiffness = 280f),
            )
        }
    }
    val glow = rememberInfiniteTransition(label = "boltGlow")
    val glowAlpha by glow.animateFloat(
        initialValue = 0.35f,
        targetValue = if (reduceMotion || !assemble) 0.45f else 0.85f,
        animationSpec = infiniteRepeatable(
            animation = tween(1100),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "boltGlowA",
    )
    val t = progress.value
    Canvas(
        modifier = modifier
            .size(size)
            .testTag("eos_bolt_mark")
            .semantics {
                if (contentDescription != null) {
                    this.contentDescription = contentDescription
                }
            },
    ) {
        val dim = size.toPx()
        val top = EosBoltGeometry.topPath(dim)
        val bottom = EosBoltGeometry.bottomPath(dim)
        val slide = dim * 0.22f * (1f - t)
        translate(left = -slide, top = -slide * 0.7f) {
            if (t > 0.55f) {
                drawPath(
                    path = top,
                    color = volt.copy(alpha = glowAlpha * t),
                    style = Fill,
                )
            }
            drawPath(path = top, color = volt.copy(alpha = 0.35f + 0.65f * t), style = Fill)
        }
        translate(left = slide, top = slide * 0.85f) {
            drawPath(path = bottom, color = white.copy(alpha = 0.35f + 0.65f * t), style = Fill)
        }
        if (t > 0.92f) {
            drawCircle(
                color = volt.copy(alpha = 0.12f * glowAlpha),
                radius = dim * 0.42f,
                center = Offset(dim * 0.48f, dim * 0.38f),
            )
        }
    }
}

@Composable
fun EosFitConnectWordmark(
    modifier: Modifier = Modifier,
    fontSize: androidx.compose.ui.unit.TextUnit = 18.sp,
) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    Text(
        text = buildAnnotatedString {
            withStyle(
                SpanStyle(
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontStyle = FontStyle.Italic,
                ),
            ) { append("Fit") }
            withStyle(
                SpanStyle(
                    color = volt,
                    fontWeight = FontWeight.Bold,
                    fontStyle = FontStyle.Italic,
                ),
            ) { append("Connect") }
        },
        fontSize = fontSize,
        letterSpacing = 0.2.sp,
        modifier = modifier,
        maxLines = 1,
    )
}

@Composable
fun EosFitConnectLockup(
    modifier: Modifier = Modifier,
    markSize: Dp = 32.dp,
    assemble: Boolean = false,
    wordmarkSize: androidx.compose.ui.unit.TextUnit = 18.sp,
) {
    Row(
        modifier = modifier.testTag("eos_fitconnect_lockup"),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        EosBoltMark(size = markSize, assemble = assemble, contentDescription = null)
        EosFitConnectWordmark(fontSize = wordmarkSize)
    }
}
