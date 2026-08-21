package com.fitconnect.android.designui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.theme.EliteSpace

/**
 * Sequential effort scale — one hue, position + label. Not a rainbow,
 * not red/green HR zones (deuteranopia).
 */
@Composable
fun EffortZoneStrip(
    secondsInZone: IntArray,
    modifier: Modifier = Modifier,
) {
    val primary = MaterialTheme.colorScheme.primary
    Row(
        modifier = modifier
            .fillMaxWidth()
            .testTag("effort_zones")
            .semantics {
                contentDescription = "Effort zones 1 to 5, sequential scale"
            },
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
    ) {
        (1..5).forEach { zone ->
            val sec = secondsInZone.getOrElse(zone - 1) { 0 }
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(EliteSpace.Xxs),
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(12.dp)
                        .background(primary.copy(alpha = 0.12f + zone * 0.16f)),
                )
                Text(
                    "Z$zone",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurface,
                )
                Text(
                    "${sec}s",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}
