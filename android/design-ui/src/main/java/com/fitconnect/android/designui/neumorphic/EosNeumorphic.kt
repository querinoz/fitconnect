package com.fitconnect.android.designui.neumorphic

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.toColor

/** Neumorphic mold tokens — synced with --eos-mold-surface / neu-* CSS vars. */
object EosNeumorphicColors {
    val Floor = EliteSurfaceColors.FLOOR.toColor()
    val MoldSurface = EliteSurfaceColors.MOLD_SURFACE.toColor()
    val Voltline = EliteSurfaceColors.VOLTLINE.toColor()
    val TextPrimary = Color(0xFFFFFFFF)
    val TextMuted = EliteSurfaceColors.NEU_MUTED.toColor()
    val HighlightEdge = EliteSurfaceColors.NEU_HIGHLIGHT_EDGE.toColor()
    val ShadowDeep = EliteSurfaceColors.NEU_SHADOW_DEEP.toColor()
    val Rim = Color(0x80111827)
}

enum class EosNeumorphicStyle {
    Convex,
    Concave,
}

/**
 * Molded OLED-dark surface with dual-direction shadows (no Material elevation).
 *
 * Accessibility: 1px contrast rim + explicit [EosNeumorphicColors.TextPrimary] on metrics;
 * primary readiness values use [EosNeumorphicColors.Voltline].
 */
@Composable
fun EosNeumorphicSurface(
    modifier: Modifier = Modifier,
    style: EosNeumorphicStyle = EosNeumorphicStyle.Convex,
    cornerRadius: Dp = 16.dp,
    onClick: (() -> Unit)? = null,
    content: @Composable BoxScope.() -> Unit,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val pressed = interactionSource.collectIsPressedAsState().value
    val effectiveStyle = if (pressed && onClick != null) {
        EosNeumorphicStyle.Concave
    } else {
        style
    }
    val shape = RoundedCornerShape(cornerRadius)
    val rimColor = if (effectiveStyle == EosNeumorphicStyle.Concave) {
        EosNeumorphicColors.ShadowDeep.copy(alpha = 0.55f)
    } else {
        EosNeumorphicColors.Rim
    }

    val base = Modifier
        .eosNeumorphicShadow(effectiveStyle, cornerRadius)
        .clip(shape)
        .background(EosNeumorphicColors.MoldSurface)
        .border(1.dp, rimColor, shape)
        .then(
            if (effectiveStyle == EosNeumorphicStyle.Concave) {
                Modifier.eosNeumorphicInsetOverlay(cornerRadius)
            } else {
                Modifier
            },
        )

    val clickable = if (onClick != null) {
        base.clickable(
            interactionSource = interactionSource,
            indication = null,
            onClick = onClick,
        )
    } else {
        base
    }

    Box(modifier = modifier.then(clickable), content = content)
}

fun Modifier.eosNeumorphicShadow(
    style: EosNeumorphicStyle,
    cornerRadius: Dp = 16.dp,
): Modifier = drawBehind {
    val radiusPx = cornerRadius.toPx()
    val offset = 6.dp.toPx()

    when (style) {
        EosNeumorphicStyle.Convex -> {
            drawRoundRect(
                color = EosNeumorphicColors.ShadowDeep.copy(alpha = 0.75f),
                topLeft = Offset(offset, offset),
                size = size,
                cornerRadius = CornerRadius(radiusPx, radiusPx),
            )
            drawRoundRect(
                color = EosNeumorphicColors.HighlightEdge.copy(alpha = 0.45f),
                topLeft = Offset(-offset * 0.35f, -offset * 0.35f),
                size = size,
                cornerRadius = CornerRadius(radiusPx, radiusPx),
            )
        }
        EosNeumorphicStyle.Concave -> {
            drawRoundRect(
                color = EosNeumorphicColors.ShadowDeep.copy(alpha = 0.35f),
                topLeft = Offset(offset * 0.4f, offset * 0.4f),
                size = size,
                cornerRadius = CornerRadius(radiusPx, radiusPx),
            )
        }
    }
}

private fun Modifier.eosNeumorphicInsetOverlay(cornerRadius: Dp): Modifier = drawBehind {
    val radiusPx = cornerRadius.toPx()
    drawRoundRect(
        brush = Brush.radialGradient(
            colors = listOf(
                EosNeumorphicColors.ShadowDeep.copy(alpha = 0.55f),
                Color.Transparent,
            ),
            center = Offset.Zero,
            radius = size.maxDimension * 0.75f,
        ),
        cornerRadius = CornerRadius(radiusPx, radiusPx),
    )
    drawRoundRect(
        brush = Brush.radialGradient(
            colors = listOf(
                EosNeumorphicColors.HighlightEdge.copy(alpha = 0.22f),
                Color.Transparent,
            ),
            center = Offset(size.width, size.height),
            radius = size.maxDimension * 0.55f,
        ),
        cornerRadius = CornerRadius(radiusPx, radiusPx),
    )
    drawRoundRect(
        color = EosNeumorphicColors.HighlightEdge.copy(alpha = 0.08f),
        cornerRadius = CornerRadius(radiusPx, radiusPx),
        style = Stroke(width = 1.dp.toPx()),
    )
}
