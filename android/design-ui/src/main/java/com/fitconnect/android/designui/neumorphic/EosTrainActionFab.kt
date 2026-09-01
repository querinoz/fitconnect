package com.fitconnect.android.designui.neumorphic

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.toColor

/**
 * Primary train action — floating glass FAB.
 *
 * Uses connect accent (not voltline) so screen-level hero metrics can own voltline.
 */
@Composable
fun EosTrainActionFab(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val accent = EliteSurfaceColors.CONNECT.toColor()
    val infiniteTransition = rememberInfiniteTransition(label = "glassPulse")
    val borderAlpha by infiniteTransition.animateFloat(
        initialValue = 0.35f,
        targetValue = 0.75f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "borderPulse",
    )

    EosGlassSurface(
        modifier = modifier
            .size(64.dp)
            .testTag("athlete_train_fab")
            .semantics { contentDescription = "Train" },
        cornerRadius = 100.dp,
        onClick = onClick,
    ) {
        Box(
            modifier = Modifier.size(64.dp),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = Icons.Default.PlayArrow,
                contentDescription = null,
                tint = accent.copy(alpha = borderAlpha.coerceAtLeast(0.85f)),
                modifier = Modifier.size(28.dp),
            )
        }
    }
}
