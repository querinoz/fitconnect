package com.fitconnect.android.designui.neumorphic

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.design.EliteSurfaceType
import com.fitconnect.android.designui.theme.EliteElevation
import com.fitconnect.android.designui.theme.EliteGlass
import com.fitconnect.android.designui.theme.EliteNavChrome
import com.fitconnect.android.designui.theme.EliteOpacity
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.designui.theme.toColor

/**
 * Central TRAIN action — solid Voltline orb, floor icon, contained glow.
 */
@Composable
fun EosTrainActionFab(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    selected: Boolean = false,
    contentDescription: String = "Train",
) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val floor = EliteSurfaceColors.FLOOR.toColor()
    val onSurface = EliteSurfaceColors.ON_SURFACE.toColor()
    val reduceMotion = reduceMotionEnabled()
    val haptic = LocalHapticFeedback.current
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val infiniteTransition = rememberInfiniteTransition(label = "trainFabPulse")
    val glowAlpha by infiniteTransition.animateFloat(
        initialValue = EliteOpacity.Muted,
        targetValue = if (reduceMotion) EliteOpacity.Muted else EliteOpacity.Subtle,
        animationSpec = infiniteRepeatable(
            animation = tween(1100, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "fabGlow",
    )
    val pressScale by animateFloatAsState(
        targetValue = if (!reduceMotion && pressed) 0.92f else 1f,
        animationSpec = spring(dampingRatio = 0.68f, stiffness = 520f),
        label = "fab_press",
    )

    Box(
        modifier = modifier
            .size(EliteNavChrome.Fab)
            .graphicsLayer {
                scaleX = pressScale
                scaleY = pressScale
            }
            .shadow(
                elevation = if (reduceMotion || pressed) EliteElevation.Mid else EliteElevation.Overlay,
                shape = CircleShape,
                ambientColor = volt.copy(alpha = EliteOpacity.Muted),
                spotColor = volt.copy(alpha = glowAlpha),
            )
            .clip(CircleShape)
            .background(volt)
            .clickable(
                interactionSource = interaction,
                indication = null,
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.ContextClick)
                    onClick()
                },
            )
            .semantics { this.contentDescription = contentDescription },
        contentAlignment = Alignment.Center,
    ) {
        Box(
            modifier = Modifier
                .matchParentSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            onSurface.copy(alpha = EliteGlass.Highlight),
                            onSurface.copy(alpha = 0f),
                        ),
                    ),
                ),
        )
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(EliteSpace.Xxs),
        ) {
            Icon(
                imageVector = Icons.Filled.FitnessCenter,
                contentDescription = null,
                tint = floor,
                modifier = Modifier
                    .size(if (selected) EliteSpace.Xxl else EliteSpace.Xl + EliteSpace.Sm)
                    .graphicsLayer { rotationZ = -18f },
            )
            Text(
                text = "TRAIN",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.Bold,
                    letterSpacing = EliteSurfaceType.OVERLINE_TRACKING.sp,
                ),
                color = floor,
            )
        }
    }
}
