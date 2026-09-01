package com.fitconnect.android.athlete.ui.home

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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitconnect.android.athlete.domain.Provenanced
import com.fitconnect.android.designui.neumorphic.EosNeumorphicColors
import com.fitconnect.android.designui.neumorphic.EosPremiumWell
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteMonoTextStyle
import com.fitconnect.android.designui.theme.EliteSpace
import java.util.Locale

@Composable
fun TodayMetricStrip(
    hrvMs: Provenanced<Int>,
    sleepLabel: Provenanced<String>,
    steps: Provenanced<Int>,
    load: Provenanced<Float>,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .testTag("today_metric_strip"),
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        TodayMetricWell(
            label = "HRV",
            value = "${hrvMs.value}",
            unit = "ms",
            modifier = Modifier.weight(1f),
            testTag = "today_metric_hrv",
        )
        TodayMetricWell(
            label = "SLEEP",
            value = sleepLabel.value,
            unit = null,
            modifier = Modifier.weight(1f),
            testTag = "today_metric_sleep",
        )
        TodayMetricWell(
            label = "STEPS",
            value = formatSteps(steps.value),
            unit = null,
            modifier = Modifier.weight(1f),
            testTag = "today_metric_steps",
        )
        TodayMetricWell(
            label = "LOAD",
            value = "%.0f".format(load.value),
            unit = null,
            modifier = Modifier.weight(1f),
            testTag = "today_metric_load",
        )
    }
}

@Composable
private fun TodayMetricWell(
    label: String,
    value: String,
    unit: String?,
    modifier: Modifier = Modifier,
    testTag: String = "today_metric_well",
) {
    EosPremiumWell(
        modifier = modifier.testTag(testTag),
        cornerRadius = 14.dp,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = EliteSpace.Xs),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            Text(
                text = label,
                style = EliteMonoTextStyle.copy(fontSize = 9.sp),
                color = EosNeumorphicColors.TextMuted,
                maxLines = 1,
            )
            Text(
                text = value,
                style = EliteMetricTextStyle.copy(fontSize = 18.sp),
                color = EosNeumorphicColors.TextPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                textAlign = TextAlign.Center,
            )
            unit?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.labelSmall,
                    color = EosNeumorphicColors.TextMuted,
                )
            }
        }
    }
}

internal fun formatSteps(count: Int): String =
    when {
        count >= 10_000 -> "%.1fk".format(Locale.US, count / 1000.0)
        else -> "%,d".format(Locale.US, count)
    }
