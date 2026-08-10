package com.fitconnect.android.designui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.EliteBorder
import com.fitconnect.android.designui.theme.EliteElevation
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteOpacity
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

enum class EliteCardVariant { Solid, Glass, Metric, Person }

@Composable
fun EliteCard(
    modifier: Modifier = Modifier,
    variant: EliteCardVariant = EliteCardVariant.Solid,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    val shape = RoundedCornerShape(EliteRadius.Lg)
    val container = when (variant) {
        EliteCardVariant.Glass -> MaterialTheme.colorScheme.surface.copy(alpha = EliteOpacity.Glass)
        EliteCardVariant.Metric -> EliteSurfaceColors.SURFACE_CONTAINER.toColor()
        EliteCardVariant.Person -> MaterialTheme.colorScheme.surfaceVariant
        EliteCardVariant.Solid -> MaterialTheme.colorScheme.surface
    }
    val border = when (variant) {
        EliteCardVariant.Glass -> BorderStroke(
            EliteBorder.Hairline,
            MaterialTheme.colorScheme.outline.copy(alpha = EliteOpacity.Border),
        )
        else -> null
    }
    val colors = CardDefaults.cardColors(containerColor = container)
    val elevation = CardDefaults.cardElevation(
        defaultElevation = if (variant == EliteCardVariant.Solid) EliteElevation.Low else EliteElevation.None,
    )

    if (onClick != null) {
        Card(
            onClick = onClick,
            modifier = modifier.fillMaxWidth(),
            shape = shape,
            colors = colors,
            elevation = elevation,
            border = border,
        ) {
            Column(modifier = Modifier.padding(EliteSpace.Lg)) {
                content()
            }
        }
    } else {
        Card(
            modifier = modifier.fillMaxWidth(),
            shape = shape,
            colors = colors,
            elevation = elevation,
            border = border,
        ) {
            Column(modifier = Modifier.padding(EliteSpace.Lg)) {
                content()
            }
        }
    }
}

@Composable
fun EliteMetricCard(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    accent: Color = MaterialTheme.colorScheme.primary,
) {
    EliteCard(modifier = modifier, variant = EliteCardVariant.Metric) {
        Text(
            text = label.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text(
            text = value,
            style = EliteMetricTextStyle,
            color = accent,
            modifier = Modifier.padding(top = EliteSpace.Xs),
        )
    }
}

/** Person shell — Athlete/Coach cards reuse this layout; no feature data here. */
@Composable
fun ElitePersonCard(
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
) {
    EliteCard(modifier = modifier, variant = EliteCardVariant.Person, onClick = onClick) {
        Text(title, style = MaterialTheme.typography.titleMedium)
        Text(
            subtitle,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = EliteSpace.Xs),
        )
    }
}
