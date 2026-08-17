package com.fitconnect.android.designui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.EliteMonoTextStyle

/**
 * Thin wrapper over [EliteInstrumentRing] so recovery, profile, and session share one bezel.
 */
@Composable
fun EliteRecoveryRing(
    score: Int,
    label: String = "Recovery",
    modifier: Modifier = Modifier,
    size: Dp = EliteRingInline,
) {
    val clamped = score.coerceIn(0, 100)
    EliteInstrumentRing(
        progress = clamped / 100f,
        diameter = size,
        contentDescription = "$label $clamped percent",
        modifier = modifier,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "$clamped",
                style = EliteMetricTextStyle,
                color = MaterialTheme.colorScheme.onBackground,
            )
            Text(
                text = label.uppercase(),
                style = EliteMonoTextStyle,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
