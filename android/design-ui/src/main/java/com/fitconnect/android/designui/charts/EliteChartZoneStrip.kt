package com.fitconnect.android.designui.charts

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.theme.EliteSpace

/**
 * Z1–Z5 effort distribution using the canonical chart zone palette.
 */
@Composable
fun EliteChartZoneStrip(
    secondsInZone: IntArray,
    modifier: Modifier = Modifier,
) {
    val maxSec = secondsInZone.maxOrNull()?.coerceAtLeast(1) ?: 1
    Row(
        modifier = modifier
            .fillMaxWidth()
            .testTag("effort_zones")
            .semantics {
                contentDescription = "Effort zones 1 to 5, chart palette"
            },
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xs),
    ) {
        (1..5).forEach { zone ->
            val sec = secondsInZone.getOrElse(zone - 1) { 0 }
            val zoneColor = EliteChartPalette.zone(zone)
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(EliteSpace.Xxs),
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height((12 + 28 * (sec.toFloat() / maxSec)).dp.coerceAtMost(40.dp))
                        .clip(RoundedCornerShape(4.dp))
                        .background(zoneColor.copy(alpha = if (sec > 0) 0.92f else 0.28f)),
                )
                Text(
                    "Z$zone",
                    style = MaterialTheme.typography.labelSmall,
                    color = zoneColor,
                )
                Text(
                    "${sec}s",
                    style = MaterialTheme.typography.labelSmall,
                    color = EliteChartPalette.Axis,
                )
            }
        }
    }
}
