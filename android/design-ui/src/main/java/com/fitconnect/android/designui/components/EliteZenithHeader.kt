package com.fitconnect.android.designui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.style.TextOverflow
import com.fitconnect.android.designui.components.HoneycombDivider
import com.fitconnect.android.designui.theme.EliteSpace

/**
 * Zenith command header — Athlete/Coach remake surfaces.
 */
@Composable
fun EliteZenithHeader(
    sysLabel: String,
    title: String,
    subtitle: String? = null,
    modifier: Modifier = Modifier,
    badge: (@Composable () -> Unit)? = null,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("elite_zenith_header"),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            EliteSysLabel(sysLabel)
            badge?.invoke()
        }
        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
        subtitle?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        HoneycombDivider()
    }
}
