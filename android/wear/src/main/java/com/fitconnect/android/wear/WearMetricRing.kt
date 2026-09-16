package com.fitconnect.android.wear

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text
import com.fitconnect.shared.telemetry.MetricAvailability

/**
 * Glanceable Zenith metric ring for Wear OS.
 * When [availability] is not AVAILABLE, shows an honest dash — never invents HR/readiness.
 */
@Composable
fun WearMetricRing(
    label: String,
    valueText: String?,
    progress: Float?,
    availability: MetricAvailability,
    modifier: Modifier = Modifier,
    size: Dp = 72.dp,
) {
    val scheme = MaterialTheme.colorScheme
    val track = scheme.outlineVariant
    val arc = when (availability) {
        MetricAvailability.AVAILABLE -> scheme.primary
        MetricAvailability.PERMISSION_REQUIRED,
        MetricAvailability.PERMISSION_DENIED,
        MetricAvailability.NEEDS_UPDATE,
        -> scheme.tertiary
        else -> scheme.onSurfaceVariant
    }
    val display = when {
        availability != MetricAvailability.AVAILABLE -> "—"
        valueText.isNullOrBlank() -> "—"
        else -> valueText
    }
    val sweep = ((progress ?: 0f).coerceIn(0f, 1f)) * 360f
    val a11y = buildString {
        append(label)
        append(": ")
        append(
            when (availability) {
                MetricAvailability.AVAILABLE -> display
                MetricAvailability.PERMISSION_REQUIRED,
                MetricAvailability.PERMISSION_DENIED,
                -> "permission required"
                MetricAvailability.UNSUPPORTED -> "unsupported"
                MetricAvailability.SYNCING -> "syncing"
                MetricAvailability.FAILED -> "failed"
                MetricAvailability.NEEDS_UPDATE -> "needs update"
                MetricAvailability.UNAVAILABLE -> "unavailable"
            },
        )
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .semantics { contentDescription = a11y },
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(contentAlignment = Alignment.Center, modifier = Modifier.size(size)) {
            Canvas(modifier = Modifier.size(size)) {
                val stroke = Stroke(width = size.toPx() * 0.08f, cap = StrokeCap.Round)
                val inset = stroke.width / 2f
                drawArc(
                    color = track,
                    startAngle = -90f,
                    sweepAngle = 360f,
                    useCenter = false,
                    topLeft = Offset(inset, inset),
                    size = Size(this.size.width - stroke.width, this.size.height - stroke.width),
                    style = stroke,
                )
                if (availability == MetricAvailability.AVAILABLE && progress != null) {
                    drawArc(
                        color = arc,
                        startAngle = -90f,
                        sweepAngle = sweep,
                        useCenter = false,
                        topLeft = Offset(inset, inset),
                        size = Size(this.size.width - stroke.width, this.size.height - stroke.width),
                        style = stroke,
                    )
                }
            }
            Text(
                text = display,
                style = MaterialTheme.typography.titleMedium,
                color = scheme.onSurface,
            )
        }
        Text(
            text = label.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = scheme.onSurfaceVariant,
        )
    }
}
