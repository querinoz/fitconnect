package com.fitconnect.android.designui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor

/**
 * Telemetry insight stack: label → primary metric → trend → context → insight → optional action.
 * Does not invent data — callers supply real or clearly marked DEMO values.
 */
@Composable
fun EliteTelemetryInsight(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    unit: String? = null,
    trend: String? = null,
    context: String? = null,
    insight: String? = null,
    demo: Boolean = false,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
) {
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val a11y = buildString {
        append(label)
        append(' ')
        append(value)
        unit?.let { append(' '); append(it) }
        trend?.let { append(". "); append(it) }
        insight?.let { append(". "); append(it) }
        if (demo) append(". Demo data")
    }
    EosPremiumCard(
        modifier = modifier
            .testTag("elite_telemetry_insight")
            .semantics { contentDescription = a11y },
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                EliteSysLabel(label.uppercase())
                if (demo) {
                    EliteBadge(text = "DEMO")
                }
            }
            Row(
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
            ) {
                Text(
                    text = value,
                    style = EliteMonoTextStyle.copy(
                        fontSize = MaterialTheme.typography.displaySmall.fontSize,
                        color = MaterialTheme.colorScheme.onSurface,
                    ),
                )
                unit?.let {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(bottom = EliteSpace.Xxs),
                    )
                }
            }
            trend?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.labelLarge,
                    color = volt,
                )
            }
            context?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            insight?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.titleSmall,
                    color = MaterialTheme.colorScheme.onSurface,
                )
            }
            if (actionLabel != null && onAction != null) {
                EliteButton(
                    label = actionLabel,
                    onClick = onAction,
                    variant = EliteButtonVariant.Secondary,
                )
            }
        }
    }
}
