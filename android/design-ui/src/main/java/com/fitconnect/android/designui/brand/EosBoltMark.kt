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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
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
 * Canonical circular FitConnect mark (reticle + F + ECG).
 * When [assemble] is true the mark scales in, then Voltline rings pulse softly.
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
    val glow = rememberInfiniteTransition(label = "markGlow")
    val glowAlpha by glow.animateFloat(
        initialValue = 0.35f,
        targetValue = if (reduceMotion || !assemble) 0.45f else 0.85f,
        animationSpec = infiniteRepeatable(
            animation = tween(1100),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "markGlowA",
    )
    val t = progress.value
    Canvas(
        modifier = modifier
            .size(size)
            .graphicsLayer {
                scaleX = 0.82f + 0.18f * t
                scaleY = 0.82f + 0.18f * t
                alpha = 0.25f + 0.75f * t
            }
            .testTag("eos_bolt_mark")
            .semantics {
                if (contentDescription != null) {
                    this.contentDescription = contentDescription
                }
            },
    ) {
        drawFitConnectMark(
            sizePx = size.toPx(),
            volt = volt,
            white = white,
            alpha = 1f,
            glowAlpha = glowAlpha * t,
        )
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
                ),
            ) { append("FIT") }
            withStyle(
                SpanStyle(
                    color = volt,
                    fontWeight = FontWeight.Bold,
                ),
            ) { append("CONNECT") }
        },
        fontSize = fontSize,
        letterSpacing = 2.2.sp,
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
