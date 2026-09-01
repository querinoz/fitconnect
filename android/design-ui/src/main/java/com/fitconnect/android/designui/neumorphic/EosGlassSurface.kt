package com.fitconnect.android.designui.neumorphic

import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.design.EliteSurfaceGlass
import com.fitconnect.android.design.EliteSurfaceRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

/**
 * Floating glass chrome tokens — synced with `--eos-glass-*` and [GLASS_TOKENS].
 *
 * Use for nav, FAB, badges, hero overlays. Never for destructive actions or anchored content.
 */
object EosGlassColors {
    val Fill = EliteSurfaceColors.GLASS_BG.toColor()
    val Border = EliteSurfaceColors.GLASS_BORDER.toColor()

    val FillLo: Color get() = Fill.copy(alpha = 0.06f)
    val FillHi: Color get() = Fill.copy(alpha = 0.08f)
    val BorderLo: Color get() = Border.copy(alpha = 0.12f)
    val BorderHi: Color get() = Border.copy(alpha = 0.14f)
}

/**
 * Standardized floating glass surface (neu-glass spec).
 *
 * Children are composed in the same box as the glass plate so hit-testing reaches tabs/buttons.
 * Optional blur applies to the whole chrome (max 2 glass layers per screen).
 */
@Composable
fun EosGlassSurface(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = EliteSurfaceRadius.NEUMORPHIC.dp,
    blurRadius: Dp = EliteSurfaceGlass.BLUR_STANDARD.dp,
    enableBlur: Boolean = true,
    onClick: (() -> Unit)? = null,
    content: @Composable BoxScope.() -> Unit,
) {
    val shape = RoundedCornerShape(cornerRadius)
    val supportsBlur = enableBlur && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
    val clickModifier = if (onClick != null) {
        Modifier.clickable(
            interactionSource = remember { MutableInteractionSource() },
            indication = null,
            onClick = onClick,
        )
    } else {
        Modifier
    }

    Box(
        modifier = modifier
            .then(clickModifier)
            .clip(shape)
            .then(if (supportsBlur) Modifier.blur(blurRadius) else Modifier)
            .background(EosGlassColors.Fill, shape)
            .border(1.dp, EosGlassColors.Border, shape),
        content = content,
    )
}

/**
 * Compact floating badge — glass fill/border without blur (saves layer budget on dense screens).
 */
@Composable
fun EosGlassBadge(
    text: String,
    modifier: Modifier = Modifier,
    contentColor: Color = EosNeumorphicColors.TextPrimary,
) {
    EosGlassSurface(
        modifier = modifier,
        cornerRadius = 100.dp,
        enableBlur = false,
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall,
            color = contentColor,
            modifier = Modifier.padding(horizontal = EliteSpace.Sm, vertical = EliteSpace.Xxs),
        )
    }
}
