package com.fitconnect.android.designui.maps

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.components.EliteEmptyState
import com.fitconnect.android.designui.components.EliteErrorView
import com.fitconnect.android.designui.components.EliteSkeleton
import com.fitconnect.android.designui.theme.toColor

enum class EliteMapPhase {
    Loading,
    Success,
    Empty,
    Error,
}

enum class EliteMapMode {
    LIVE,
    ROUTE,
    HEATMAP,
    PACE,
    HEART_RATE,
    ELEVATION,
}

/**
 * Race-detail / activity map state. Empty GPS is Empty, never a spinner or a fake path.
 * Loading may last at most [timeoutMs] while a session is waiting for a trace.
 */
object EliteMapPhaseLogic {
    fun resolve(
        pointCount: Int,
        sessionWaitingForTrace: Boolean,
        permissionDenied: Boolean,
        elapsedMs: Long,
        timeoutMs: Int = com.fitconnect.android.design.EliteSurfaceInstrument.LOAD_TIMEOUT_MS,
    ): EliteMapPhase {
        if (pointCount >= 2) return EliteMapPhase.Success
        if (permissionDenied) return EliteMapPhase.Error
        if (!sessionWaitingForTrace) return EliteMapPhase.Empty
        return if (elapsedMs >= timeoutMs) EliteMapPhase.Error else EliteMapPhase.Loading
    }
}

data class EliteRouteVertex(
    val latitude: Double,
    val longitude: Double,
    val paceSecPerKm: Double? = null,
    val hrBpm: Int? = null,
    val altitudeM: Double? = null,
)

/**
 * Dark tactical route canvas. Tokens only — Volt trail on carbon floor.
 * Not MapLibre tiles; LOCAL MAP / recorded polyline.
 */
@Composable
fun EliteRouteMap(
    points: List<EliteRouteVertex>,
    mode: EliteMapMode,
    modifier: Modifier = Modifier,
    cursorIndex: Int? = null,
    phase: EliteMapPhase = if (points.size >= 2) EliteMapPhase.Success else EliteMapPhase.Empty,
    onRetry: (() -> Unit)? = null,
    contentDescription: String = "Activity route",
) {
    when (phase) {
        EliteMapPhase.Loading -> {
            EliteSkeleton(
                modifier = modifier
                    .fillMaxWidth()
                    .height(280.dp)
                    .testTag("elite_route_map_loading"),
                height = 280,
            )
            return
        }
        EliteMapPhase.Empty -> {
            EliteEmptyState(
                title = "Your first session draws this map.",
                body = "A recorded GPS trace is required. Routes are never invented.",
                actionLabel = "Start session",
                onAction = onRetry,
                modifier = modifier.testTag("elite_route_map_empty"),
            )
            return
        }
        EliteMapPhase.Error -> {
            EliteErrorView(
                title = "Map unavailable",
                body = "The trace did not load. Retry or continue without a map.",
                retryLabel = "Try again",
                onRetry = onRetry,
                modifier = modifier.testTag("elite_route_map_error"),
            )
            return
        }
        EliteMapPhase.Success -> Unit
    }
    if (points.size < 2) {
        EliteEmptyState(
            title = "Your first session draws this map.",
            body = "A recorded GPS trace is required. Routes are never invented.",
            actionLabel = "Start session",
            onAction = onRetry,
            modifier = modifier.testTag("elite_route_map_empty"),
        )
        return
    }
    val floor = EliteSurfaceColors.FLOOR.toColor()
    val carbon = EliteSurfaceColors.CARBON.toColor()
    val volt = EliteSurfaceColors.VOLTLINE.toColor()
    val connect = EliteSurfaceColors.CONNECT.toColor()
    val telemetry = EliteSurfaceColors.TELEMETRY.toColor()
    val alert = EliteSurfaceColors.ALERT.toColor()
    val recovery = EliteSurfaceColors.RECOVERY.toColor()
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(280.dp)
            .background(
                Brush.verticalGradient(listOf(floor, carbon)),
            )
            .testTag("elite_route_map")
            .semantics { this.contentDescription = contentDescription },
    ) {
        Canvas(modifier = Modifier.matchParentSize().padding(12.dp)) {
            val grid = volt.copy(alpha = 0.06f)
            val stepX = size.width / 8f
            val stepY = size.height / 6f
            var gx = 0f
            while (gx <= size.width) {
                drawLine(grid, Offset(gx, 0f), Offset(gx, size.height), strokeWidth = 1f)
                gx += stepX
            }
            var gy = 0f
            while (gy <= size.height) {
                drawLine(grid, Offset(0f, gy), Offset(size.width, gy), strokeWidth = 1f)
                gy += stepY
            }
            val minLat = points.minOf { it.latitude }
            val maxLat = points.maxOf { it.latitude }
            val minLon = points.minOf { it.longitude }
            val maxLon = points.maxOf { it.longitude }
            val dLat = (maxLat - minLat).let { if (it == 0.0) 0.0008 else it }
            val dLon = (maxLon - minLon).let { if (it == 0.0) 0.0008 else it }
            fun project(p: EliteRouteVertex): Offset {
                val x = ((p.longitude - minLon) / dLon).toFloat() * size.width
                val y = (1f - ((p.latitude - minLat) / dLat).toFloat()) * size.height
                return Offset(x, y)
            }
            val path = Path()
            val first = project(points.first())
            path.moveTo(first.x, first.y)
            points.drop(1).forEach { path.lineTo(project(it).x, project(it).y) }
            val strokeColor = when (mode) {
                EliteMapMode.LIVE, EliteMapMode.ROUTE -> volt
                EliteMapMode.HEATMAP -> connect
                EliteMapMode.PACE -> telemetry
                EliteMapMode.HEART_RATE -> alert
                EliteMapMode.ELEVATION -> recovery
            }
            drawPath(
                path,
                color = strokeColor.copy(alpha = 0.28f),
                style = Stroke(width = 14f, cap = StrokeCap.Round),
            )
            drawPath(
                path,
                color = strokeColor,
                style = Stroke(width = 5f, cap = StrokeCap.Round),
            )
            drawCircle(Color.White, radius = 7f, center = first)
            drawCircle(volt, radius = 4f, center = first)
            val last = project(points.last())
            drawCircle(connect, radius = 8f, center = last)
            val cursor = cursorIndex?.let { points.getOrNull(it.coerceIn(0, points.lastIndex)) }
            if (cursor != null) {
                drawCircle(telemetry, radius = 10f, center = project(cursor))
            }
        }
    }
}
