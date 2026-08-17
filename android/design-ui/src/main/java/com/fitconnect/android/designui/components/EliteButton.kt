package com.fitconnect.android.designui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.EliteBorder
import com.fitconnect.android.designui.theme.EliteOpacity
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility

enum class EliteButtonVariant { Primary, Secondary, Ghost, Destructive }

enum class EliteButtonStatus { Idle, Loading, Success, Error }

/**
 * Elite Surface button. Touch target >= 48dp.
 * States: idle, pressed, loading, disabled, success, error.
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
    contentDescription: String? = null,
) {
    val shape = RoundedCornerShape(EliteRadius.Md)
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val reduceMotion = reduceMotionEnabled()
    val resolved = if (loading) EliteButtonStatus.Loading else status
    val min = Modifier.defaultMinSize(
        minWidth = Accessibility.MIN_TOUCH_TARGET_DP.dp,
        minHeight = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp,
    )
    val desc = Modifier.semantics { this.contentDescription = contentDescription ?: label }
    val padding = PaddingValues(horizontal = EliteSpace.Lg, vertical = EliteSpace.Md)
    val clickable = enabled && resolved != EliteButtonStatus.Loading
    val display = when (resolved) {
        EliteButtonStatus.Loading -> label
        EliteButtonStatus.Success -> label
        EliteButtonStatus.Error -> label
        EliteButtonStatus.Idle -> label
    }
    val pressScale = if (!reduceMotion && pressed && clickable) 0.97f else 1f
    val pressMod = Modifier.graphicsLayer {
        scaleX = pressScale
        scaleY = pressScale
    }
    val container = when {
        resolved == EliteButtonStatus.Success -> EliteSurfaceColors.PERFORMANCE.toColor()
        resolved == EliteButtonStatus.Error -> EliteSurfaceColors.ALERT.toColor()
        else -> MaterialTheme.colorScheme.primary
    }
    val onContainer = MaterialTheme.colorScheme.onPrimary

    when (variant) {
        EliteButtonVariant.Primary -> Button(
            onClick = onClick,
            enabled = clickable,
            shape = shape,
            interactionSource = interaction,
            contentPadding = padding,
            colors = ButtonDefaults.buttonColors(
                containerColor = container,
                contentColor = onContainer,
                disabledContainerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.38f),
                disabledContentColor = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f),
            ),
            modifier = modifier.then(min).then(desc).then(pressMod),
        ) {
            if (resolved == EliteButtonStatus.Loading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(18.dp),
                    strokeWidth = 2.dp,
                    color = onContainer,
                )
            } else {
                Text(display, style = MaterialTheme.typography.titleMedium)
            }
        }

        EliteButtonVariant.Secondary -> OutlinedButton(
            onClick = onClick,
            enabled = clickable,
            shape = shape,
            interactionSource = interaction,
            contentPadding = padding,
            colors = ButtonDefaults.outlinedButtonColors(
                containerColor = EliteSurfaceColors.CARBON.toColor().copy(alpha = EliteOpacity.Glass),
                contentColor = MaterialTheme.colorScheme.onSurface,
                disabledContentColor = MaterialTheme.colorScheme.onSurface.copy(alpha = EliteOpacity.Disabled),
            ),
            border = BorderStroke(
                EliteBorder.Hairline,
                MaterialTheme.colorScheme.outline.copy(alpha = EliteOpacity.Border),
            ),
            modifier = modifier.then(min).then(desc).then(pressMod),
        ) {
            if (resolved == EliteButtonStatus.Loading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(18.dp),
                    strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.onSurface,
                )
            } else {
                Text(display, style = MaterialTheme.typography.titleMedium)
            }
        }

        EliteButtonVariant.Destructive -> Button(
            onClick = onClick,
            enabled = clickable,
            shape = shape,
            interactionSource = interaction,
            contentPadding = padding,
            colors = ButtonDefaults.buttonColors(
                containerColor = EliteSurfaceColors.ALERT.toColor(),
                contentColor = MaterialTheme.colorScheme.onPrimary,
                disabledContainerColor = EliteSurfaceColors.ALERT.toColor().copy(alpha = EliteOpacity.Disabled),
                disabledContentColor = MaterialTheme.colorScheme.onPrimary.copy(alpha = EliteOpacity.Disabled),
            ),
            modifier = modifier.then(min).then(desc).then(pressMod),
        ) {
            if (resolved == EliteButtonStatus.Loading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(18.dp),
                    strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.onPrimary,
                )
            } else {
                Text(display, style = MaterialTheme.typography.titleMedium)
            }
        }

        EliteButtonVariant.Ghost -> TextButton(
            onClick = onClick,
            enabled = clickable,
            shape = shape,
            interactionSource = interaction,
            contentPadding = padding,
            modifier = modifier.then(min).then(desc).then(pressMod),
        ) {
            Text(display, style = MaterialTheme.typography.titleMedium)
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
    IconButton(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier
            .size(Accessibility.MIN_TOUCH_TARGET_DP.dp)
            .semantics { this.contentDescription = contentDescription },
        content = content,
    )
}
