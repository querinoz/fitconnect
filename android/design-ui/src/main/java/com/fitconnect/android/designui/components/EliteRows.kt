package com.fitconnect.android.designui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility

@Composable
fun EliteSettingsRow(
    title: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    trailing: String? = null,
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .defaultMinSize(minHeight = Accessibility.MIN_TOUCH_TARGET_DP.dp)
                .clickable(role = Role.Button, onClick = onClick)
                .padding(vertical = EliteSpace.Sm),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(EliteSpace.Md),
        ) {
            if (icon != null) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = EliteSurfaceColors.INSTRUMENT_MUTED.toColor(),
                    modifier = Modifier.size(22.dp),
                )
            }
            Text(
                title,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.weight(1f),
            )
            if (trailing != null) {
                EliteSysLabel(trailing)
            }
        }
        EliteDivider()
    }
}

@Composable
fun EliteMetricTile(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    accentVolt: Boolean = false,
) {
    EliteBentoCard(modifier = modifier) {
        Column {
            Text(
                text = value,
                style = EliteMetricTextStyle,
                color = if (accentVolt) {
                    MaterialTheme.colorScheme.primary
                } else {
                    MaterialTheme.colorScheme.onBackground
                },
            )
            EliteSysLabel(label)
        }
    }
}

@Composable
fun EliteOfflineBanner(
    cacheLabel: String,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(EliteSpace.Sm),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        EliteBadge(
            text = "NO CONNECTION · $cacheLabel",
            containerColor = EliteSurfaceColors.TELEMETRY.toColor().copy(alpha = 0.18f),
            contentColor = EliteSurfaceColors.TELEMETRY.toColor(),
        )
    }
}
