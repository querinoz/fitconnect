package com.fitconnect.android.athlete.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.sp
import com.fitconnect.android.athlete.domain.Provenanced
import com.fitconnect.android.designui.components.HoneycombDivider
import com.fitconnect.android.designui.components.HexMetric
import com.fitconnect.android.designui.components.HexStatus
import com.fitconnect.android.designui.neumorphic.EosNeumorphicColors
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.telemetry.domain.TelemetryUiLabel
import java.util.Locale

@Composable
fun TodayMetricStrip(
    hrvMs: Provenanced<Int>,
    sleepLabel: Provenanced<String>,
    steps: Provenanced<Int>,
    load: Provenanced<Float>,
    modifier: Modifier = Modifier,
) {
    val railLabel = dominantTelemetryLabel(hrvMs.uiLabel, sleepLabel.uiLabel, steps.uiLabel, load.uiLabel)
    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("today_metric_strip"),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        HoneycombDivider()
        HexStatus(text = "TELEMETRY · $railLabel")
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                HexMetric(
                    value = "${hrvMs.value}",
                    label = "HRV",
                    modifier = Modifier.testTag("today_metric_hrv"),
                )
                Text(hrvMs.uiLabel.name, style = EliteMonoTextStyle.copy(fontSize = 9.sp), color = EosNeumorphicColors.TextMuted)
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                HexMetric(
                    value = sleepLabel.value.take(4),
                    label = "SLEEP",
                    modifier = Modifier.testTag("today_metric_sleep"),
                )
                Text(sleepLabel.uiLabel.name, style = EliteMonoTextStyle.copy(fontSize = 9.sp), color = EosNeumorphicColors.TextMuted)
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                HexMetric(
                    value = formatSteps(steps.value),
                    label = "STEPS",
                    modifier = Modifier.testTag("today_metric_steps"),
                )
                Text(steps.uiLabel.name, style = EliteMonoTextStyle.copy(fontSize = 9.sp), color = EosNeumorphicColors.TextMuted)
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                HexMetric(
                    value = "%.0f".format(load.value),
                    label = "LOAD",
                    modifier = Modifier.testTag("today_metric_load"),
                )
                Text(load.uiLabel.name, style = EliteMonoTextStyle.copy(fontSize = 9.sp), color = EosNeumorphicColors.TextMuted)
            }
        }
    }
}

/** Prefer TEST over LIVE when any field is demo — never silent demo-as-live. */
internal fun dominantTelemetryLabel(vararg labels: TelemetryUiLabel): String {
    if (labels.any { it == TelemetryUiLabel.TEST }) return TelemetryUiLabel.TEST.name
    if (labels.any { it == TelemetryUiLabel.UNAVAILABLE }) return TelemetryUiLabel.UNAVAILABLE.name
    if (labels.any { it == TelemetryUiLabel.OFFLINE }) return TelemetryUiLabel.OFFLINE.name
    if (labels.any { it == TelemetryUiLabel.STALE }) return TelemetryUiLabel.STALE.name
    if (labels.any { it == TelemetryUiLabel.DERIVED }) return TelemetryUiLabel.DERIVED.name
    if (labels.any { it == TelemetryUiLabel.LIVE }) return TelemetryUiLabel.LIVE.name
    return TelemetryUiLabel.SYNCED.name
}

internal fun formatSteps(count: Int): String =
    when {
        count >= 10_000 -> "%.1fk".format(Locale.US, count / 1000.0)
        else -> "%,d".format(Locale.US, count)
    }
