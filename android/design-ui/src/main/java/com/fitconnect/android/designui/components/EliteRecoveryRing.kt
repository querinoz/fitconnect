package com.fitconnect.android.designui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.theme.EliteMetricTextStyle
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import com.fitconnect.android.designui.theme.toColor

/**
 * Elite OS recovery / readiness ring — cinematic telemetry, not Material progress.
 */
@Composable
fun EliteRecoveryRing(
    score: Int,
    label: String = "Recovery",
    modifier: Modifier = Modifier,
    size: Dp = 148.dp,
    stroke: Dp = 12.dp,
) {
    val clamped = score.coerceIn(0, 100)
    val reduceMotion = reduceMotionEnabled()
    val progress by animateFloatAsState(
        targetValue = clamped / 100f,
        animationSpec = if (reduceMotion) tween(0) else tween(900),
        label = "recovery_ring",
    )
    val track = com.fitconnect.android.designui.theme.eliteTrackColor()
    val arc = when {
        clamped >= 75 -> EliteSurfaceColors.PERFORMANCE.toColor()
        clamped >= 50 -> EliteSurfaceColors.VOLTLINE.toColor()
        clamped >= 30 -> EliteSurfaceColors.RECOVERY.toColor()
        else -> EliteSurfaceColors.ALERT.toColor()
    }

    Box(
        modifier = modifier
            .size(size)
            .testTag("elite_recovery_ring")
            .semantics { contentDescription = "$label $clamped percent" },
        contentAlignment = Alignment.Center,
    ) {
        Canvas(modifier = Modifier.size(size)) {
            val strokePx = stroke.toPx()
            val diameter = this.size.minDimension - strokePx
            val topLeft = Offset(strokePx / 2f, strokePx / 2f)
            val arcSize = Size(diameter, diameter)
            drawArc(
                color = track,
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = strokePx, cap = StrokeCap.Round),
            )
            drawArc(
                color = arc,
                startAngle = -90f,
                sweepAngle = 360f * progress,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = strokePx, cap = StrokeCap.Round),
            )
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "$clamped",
                style = EliteMetricTextStyle,
                color = MaterialTheme.colorScheme.onBackground,
            )
            Text(
                text = label.uppercase(),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
