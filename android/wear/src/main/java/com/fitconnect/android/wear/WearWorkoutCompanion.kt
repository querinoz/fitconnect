package com.fitconnect.android.wear

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.fitconnect.shared.telemetry.MetricAvailability

/**
 * Glanceable Wear companion for an active TRAIN session.
 * Shows current action, one primary metric, time, and next — never a 10-metric dump.
 */
data class WearWorkoutCompanionState(
    val phase: String = "IDLE",
    val currentAction: String = "—",
    val primaryMetricLabel: String = "—",
    val primaryMetricValue: String? = null,
    val metricAvailability: MetricAvailability = MetricAvailability.UNAVAILABLE,
    val timeLabel: String = "—",
    val nextAction: String = "—",
    val deviceStatus: WearCompanionDeviceStatus = WearCompanionDeviceStatus.UNKNOWN,
    val hapticEvent: WearCompanionHaptic? = null,
)

enum class WearCompanionDeviceStatus {
    CONNECTED,
    SYNCING,
    NOT_CONNECTED,
    UNAVAILABLE,
    ERROR,
    UNKNOWN,
}

enum class WearCompanionHaptic {
    SET_COMPLETE,
    REST_COMPLETE,
}

object WearCompanionHonesty {
    fun metricDisplay(value: String?, availability: MetricAvailability): String =
        if (availability == MetricAvailability.AVAILABLE && !value.isNullOrBlank()) value else "—"

    fun deviceLabel(status: WearCompanionDeviceStatus): String = when (status) {
        WearCompanionDeviceStatus.CONNECTED -> "PHONE LINKED"
        WearCompanionDeviceStatus.SYNCING -> "SYNCING"
        WearCompanionDeviceStatus.NOT_CONNECTED -> "NOT CONNECTED"
        WearCompanionDeviceStatus.UNAVAILABLE -> "UNAVAILABLE"
        WearCompanionDeviceStatus.ERROR -> "LINK ERROR"
        WearCompanionDeviceStatus.UNKNOWN -> "LINK UNKNOWN"
    }
}

@Composable
fun WearWorkoutCompanion(
    state: WearWorkoutCompanionState,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    LaunchedEffect(state.hapticEvent) {
        when (state.hapticEvent) {
            WearCompanionHaptic.SET_COMPLETE -> WearCompanionHaptics.pulse(context, strong = false)
            WearCompanionHaptic.REST_COMPLETE -> WearCompanionHaptics.pulse(context, strong = true)
            null -> Unit
        }
    }

    val metric = WearCompanionHonesty.metricDisplay(state.primaryMetricValue, state.metricAvailability)
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterVertically),
    ) {
        Text(
            text = state.phase.uppercase(),
            color = MaterialTheme.colorScheme.secondary,
            style = MaterialTheme.typography.titleMedium,
            modifier = Modifier.semantics { heading() },
        )
        Text(
            text = state.currentAction,
            style = MaterialTheme.typography.displaySmall,
            color = MaterialTheme.colorScheme.primary,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
        WearMetricRing(
            label = state.primaryMetricLabel,
            valueText = metric.takeIf { it != "—" },
            progress = null,
            availability = state.metricAvailability,
        )
        Text(
            text = state.timeLabel,
            style = MaterialTheme.typography.titleMedium,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
        Text(
            text = "NEXT · ${state.nextAction}",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
        Text(
            text = WearCompanionHonesty.deviceLabel(state.deviceStatus),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.tertiary,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

object WearCompanionHaptics {
    fun pulse(context: Context, strong: Boolean) {
        val vibrator = vibrator(context) ?: return
        val ms = if (strong) 80L else 40L
        val amplitude = if (strong) 180 else 120
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(ms, amplitude))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(ms)
        }
    }

    private fun vibrator(context: Context): Vibrator? =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager = context.getSystemService(VibratorManager::class.java)
            manager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
}
