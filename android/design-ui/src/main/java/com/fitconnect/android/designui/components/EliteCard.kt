package com.fitconnect.android.designui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import com.fitconnect.android.designui.theme.EliteBorder
import com.fitconnect.android.designui.theme.EliteElevation
import com.fitconnect.android.designui.theme.EliteGlass
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteOpacity
import com.fitconnect.android.designui.theme.EliteRadius
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

enum class EliteCardVariant { Solid, Glass, Metric, Person, Bento }

@Composable
fun EliteCard(
    modifier: Modifier = Modifier,
    variant: EliteCardVariant = EliteCardVariant.Solid,
    fillMaxWidth: Boolean = true,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    val shape = RoundedCornerShape(
        if (variant == EliteCardVariant.Bento || variant == EliteCardVariant.Glass) {
            EliteRadius.Xl
        } else {
            EliteRadius.Lg
        },
    )
    val container = when (variant) {
        EliteCardVariant.Glass -> MaterialTheme.colorScheme.surface.copy(alpha = EliteGlass.L2)
        EliteCardVariant.Metric -> MaterialTheme.colorScheme.surfaceVariant
        EliteCardVariant.Person -> MaterialTheme.colorScheme.surfaceVariant
        EliteCardVariant.Bento -> com.fitconnect.android.design.EliteSurfaceColors.CARBON.toColor()
        EliteCardVariant.Solid -> MaterialTheme.colorScheme.surface
    }
    val cardModifier = if (fillMaxWidth) modifier.fillMaxWidth() else modifier
    val border = when (variant) {
        EliteCardVariant.Glass, EliteCardVariant.Bento -> BorderStroke(
            EliteBorder.Hairline,
            MaterialTheme.colorScheme.onBackground.copy(alpha = EliteOpacity.Border),
        )
        else -> null
    }
    val colors = CardDefaults.cardColors(containerColor = container)
    val elevation = CardDefaults.cardElevation(
        defaultElevation = if (variant == EliteCardVariant.Solid) EliteElevation.Low else EliteElevation.None,
    )
    val body: @Composable () -> Unit = {
        Box {
            if (variant == EliteCardVariant.Glass) {
                Box(
                    modifier = Modifier
                        .matchParentSize()
                        .clip(shape)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    MaterialTheme.colorScheme.onSurface.copy(alpha = EliteGlass.Highlight),
                                    Color.Transparent,
                                ),
                            ),
                        ),
                )
            }
            Column(modifier = Modifier.padding(EliteSpace.Lg), content = content)
        }
    }

    if (onClick != null) {
        Card(
            onClick = onClick,
            modifier = cardModifier,
            shape = shape,
            colors = colors,
            elevation = elevation,
            border = border,
        ) { body() }
    } else {
        Card(
            modifier = cardModifier,
            shape = shape,
            colors = colors,
            elevation = elevation,
            border = border,
        ) { body() }
    }
}

@Composable
fun EliteMetricCard(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    fillMaxWidth: Boolean = true,
    accent: Color = MaterialTheme.colorScheme.primary,
) {
    EliteCard(modifier = modifier, variant = EliteCardVariant.Metric, fillMaxWidth = fillMaxWidth) {
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
