package com.fitconnect.android.designui.components

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.EliteBorder
import com.fitconnect.android.designui.theme.EliteElevation
import com.fitconnect.android.designui.theme.EliteGlass
import com.fitconnect.android.designui.theme.EliteOpacity
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility

enum class EliteButtonVariant { Primary, Secondary, Ghost, Destructive }

enum class EliteButtonStatus { Idle, Loading, Success, Error }

/**
 * Volumetric Elite Surface button — gradient face, Voltline glow, press scale.
 * Touch target >= 48dp.
 */
@Composable
fun EliteButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: EliteButtonVariant = EliteButtonVariant.Primary,
    enabled: Boolean = true,
    loading: Boolean = false,
    status: EliteButtonStatus = EliteButtonStatus.Idle,
    leadingIcon: ImageVector? = null,
    contentDescription: String? = null,
) {
    val pill = variant == EliteButtonVariant.Primary || variant == EliteButtonVariant.Destructive
    val shape = RoundedCornerShape(if (pill) EliteRadius.Full else EliteRadius.Md)
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val reduceMotion = reduceMotionEnabled()
    val haptic = LocalHapticFeedback.current
    val resolved = if (loading) EliteButtonStatus.Loading else status
    val clickable = enabled && resolved != EliteButtonStatus.Loading
    val press = !reduceMotion && pressed && clickable
    val scale by animateFloatAsState(
        targetValue = if (press) 0.96f else 1f,
        animationSpec = spring(dampingRatio = 0.72f, stiffness = 520f),
        label = "btn_scale",
    )
    val restElevation = when (variant) {
        EliteButtonVariant.Primary, EliteButtonVariant.Destructive -> EliteElevation.Overlay
        EliteButtonVariant.Secondary -> EliteElevation.Mid
        EliteButtonVariant.Ghost -> EliteElevation.None
    }
    val elevation by animateDpAsState(
        targetValue = when {
            reduceMotion -> EliteElevation.None
            press -> EliteElevation.Low
            else -> restElevation
        },
        animationSpec = spring(dampingRatio = 0.8f, stiffness = 400f),
        label = "btn_elev",
    )
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val floor = EliteSurfaceColors.FLOOR.toColor()
    val alert = EliteSurfaceColors.ALERT.toColor()
    val performance = EliteSurfaceColors.PERFORMANCE.toColor()
    val carbon = EliteSurfaceColors.CARBON.toColor()
    val fillBase = when {
        resolved == EliteButtonStatus.Success -> performance
        resolved == EliteButtonStatus.Error -> alert
        variant == EliteButtonVariant.Destructive -> alert
        variant == EliteButtonVariant.Primary -> volt
        else -> carbon.copy(alpha = EliteOpacity.Glass)
    }
    val glow = when (variant) {
        EliteButtonVariant.Primary -> volt
        EliteButtonVariant.Destructive -> alert
        else -> Color.Black
    }
    val contentColor = when (variant) {
        EliteButtonVariant.Primary, EliteButtonVariant.Destructive -> floor
        EliteButtonVariant.Ghost -> MaterialTheme.colorScheme.onSurface
        EliteButtonVariant.Secondary -> MaterialTheme.colorScheme.onSurface
    }
    val face = when (variant) {
        EliteButtonVariant.Ghost -> Brush.verticalGradient(listOf(Color.Transparent, Color.Transparent))
        EliteButtonVariant.Secondary -> Brush.verticalGradient(
            listOf(
                Color.White.copy(alpha = EliteGlass.Highlight),
                carbon.copy(alpha = EliteOpacity.Glass),
            ),
        )
        else -> Brush.verticalGradient(
            listOf(
                androidx.compose.ui.graphics.lerp(fillBase, Color.White, 0.22f),
                fillBase,
                androidx.compose.ui.graphics.lerp(fillBase, floor, 0.28f),
            ),
        )
    }
    val rim = when (variant) {
        EliteButtonVariant.Primary, EliteButtonVariant.Destructive ->
            Color.White.copy(alpha = if (press) 0.12f else EliteGlass.Highlight + 0.08f)
        EliteButtonVariant.Secondary -> volt.copy(alpha = 0.35f)
        EliteButtonVariant.Ghost -> Color.Transparent
    }
    Box(
        modifier = modifier
            .defaultMinSize(
                minWidth = Accessibility.MIN_TOUCH_TARGET_DP.dp,
                minHeight = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp,
            )
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .shadow(
                elevation = elevation,
                shape = shape,
                ambientColor = glow.copy(alpha = if (variant == EliteButtonVariant.Ghost) 0f else 0.45f),
                spotColor = glow.copy(alpha = if (variant == EliteButtonVariant.Ghost) 0f else 0.7f),
            )
            .clip(shape)
            .background(face, shape)
            .border(EliteBorder.Hairline, rim, shape)
            .clickable(
                interactionSource = interaction,
                indication = null,
                enabled = clickable,
                role = Role.Button,
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.ContextClick)
                    onClick()
                },
            )
            .semantics {
                this.contentDescription = contentDescription ?: label
                this.role = Role.Button
            }
            .padding(
                horizontal = EliteSpace.Xl,
                vertical = if (pill) EliteSpace.Lg else EliteSpace.Md,
            ),
        contentAlignment = Alignment.Center,
    ) {
        if (variant != EliteButtonVariant.Ghost) {
            Box(
                modifier = Modifier
                    .matchParentSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.White.copy(alpha = if (press) 0.04f else EliteGlass.Highlight),
                                Color.Transparent,
                            ),
                        ),
                    ),
            )
        }
        if (resolved == EliteButtonStatus.Loading) {
            CircularProgressIndicator(
                modifier = Modifier.size(18.dp),
                strokeWidth = 2.dp,
                color = contentColor,
            )
        } else {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
            ) {
                leadingIcon?.let { icon ->
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = contentColor.copy(alpha = if (clickable) 1f else EliteOpacity.Disabled),
                        modifier = Modifier.size(18.dp),
                    )
                }
                Text(
                    text = label,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = contentColor.copy(alpha = if (clickable) 1f else EliteOpacity.Disabled),
                )
            }
        }
    }
}

@Composable
fun EliteIconButton(
    onClick: () -> Unit,
    contentDescription: String,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    content: @Composable () -> Unit,
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val reduceMotion = reduceMotionEnabled()
    val scale by animateFloatAsState(
        targetValue = if (!reduceMotion && pressed && enabled) 0.92f else 1f,
        animationSpec = spring(dampingRatio = 0.7f, stiffness = 480f),
        label = "icon_btn_scale",
    )
    IconButton(
        onClick = onClick,
        enabled = enabled,
        interactionSource = interaction,
        modifier = modifier
            .size(Accessibility.MIN_TOUCH_TARGET_DP.dp)
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .semantics { this.contentDescription = contentDescription },
        content = content,
    )
}
