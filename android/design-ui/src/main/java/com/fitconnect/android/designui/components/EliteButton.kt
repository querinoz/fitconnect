package com.fitconnect.android.designui.components

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.a11y.Accessibility

enum class EliteButtonVariant { Primary, Secondary, Ghost }

/**
 * Elite Surface button. Touch target >= 48dp. Variants map to brand roles —
 * Primary = Voltline CTA, Secondary = tonal, Ghost = text.
 */
@Composable
fun EliteButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: EliteButtonVariant = EliteButtonVariant.Primary,
    enabled: Boolean = true,
    loading: Boolean = false,
    contentDescription: String? = null,
) {
    val shape = RoundedCornerShape(EliteRadius.Md)
    val min = Modifier.defaultMinSize(
        minWidth = Accessibility.MIN_TOUCH_TARGET_DP.dp,
        minHeight = Accessibility.PREFERRED_TOUCH_TARGET_DP.dp,
    )
    val desc = Modifier.semantics { this.contentDescription = contentDescription ?: label }
    val padding = PaddingValues(horizontal = EliteSpace.Lg, vertical = EliteSpace.Md)
    val clickable = enabled && !loading
    val display = if (loading) "…" else label

    when (variant) {
        EliteButtonVariant.Primary -> Button(
            onClick = onClick,
            enabled = clickable,
            shape = shape,
            contentPadding = padding,
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary,
                disabledContainerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.38f),
                disabledContentColor = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f),
            ),
            modifier = modifier.then(min).then(desc),
        ) { Text(display, style = MaterialTheme.typography.titleMedium) }

        EliteButtonVariant.Secondary -> FilledTonalButton(
            onClick = onClick,
            enabled = clickable,
            shape = shape,
            contentPadding = padding,
            modifier = modifier.then(min).then(desc),
        ) { Text(display, style = MaterialTheme.typography.titleMedium) }

        EliteButtonVariant.Ghost -> TextButton(
            onClick = onClick,
            enabled = clickable,
            shape = shape,
            contentPadding = padding,
            modifier = modifier.then(min).then(desc),
        ) { Text(display, style = MaterialTheme.typography.titleMedium) }
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
