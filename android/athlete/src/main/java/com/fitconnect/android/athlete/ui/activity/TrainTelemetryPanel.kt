package com.fitconnect.android.athlete.ui.activity

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.designui.charts.EliteChartPalette
import com.fitconnect.android.designui.components.EliteSysLabel
import com.fitconnect.android.designui.neumorphic.EosNeumorphicColors
import com.fitconnect.android.designui.neumorphic.EosPremiumWell
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteSpace

@Composable
fun TrainTelemetryPanel(
    cells: List<Pair<String, String>>,
    modifier: Modifier = Modifier,
) {
    EosPremiumWell(
        modifier = modifier
            .fillMaxWidth()
            .testTag("activity_telemetry_panel"),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
            EliteSysLabel("LIVE METRICS")
            cells.chunked(3).forEach { row ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
                ) {
                    row.forEach { (label, value) ->
                        Column(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(EliteSpace.Xxs),
                        ) {
                            EliteSysLabel(label)
                            Text(
                                text = value,
                                style = EliteMetricTextStyle,
                                color = telemetryValueColor(label),
                            )
                        }
                    }
                    repeat(3 - row.size) {
                        Column(modifier = Modifier.weight(1f)) {}
                    }
                }
            }
        }
    }
}

internal fun telemetryValueColor(label: String) = when (label) {
    "ZONE" -> EliteChartPalette.zone(3)
    "GPS" -> EliteChartPalette.Secondary
    "ENERGY" -> EliteChartPalette.Success
    else -> EosNeumorphicColors.TextPrimary
}
