package com.fitconnect.android.designui.maps

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.shared.geo.RoutePoint

/**
 * Route visualization shell: MapLibre primary, Canvas [EliteRouteMap] fallback.
 * Map failure never invents coordinates — capture remains independent.
 */
@Composable
fun FitConnectRouteMap(
    points: List<RoutePoint>,
    mode: EliteMapMode,
    modifier: Modifier = Modifier,
    phase: EliteMapPhase = if (points.size >= 2) EliteMapPhase.Success else EliteMapPhase.Empty,
    completed: Boolean = false,
    followEnabled: Boolean = true,
    qualityLabel: String = "GPS",
    distanceM: Double? = null,
    durationMs: Long? = null,
    avgSpeedMps: Double? = null,
    onRetry: (() -> Unit)? = null,
    onFollowChange: ((Boolean) -> Unit)? = null,
    forceCanvasFallback: Boolean = false,
) {
    var localMapFailed by remember { mutableStateOf(false) }
    val mapFailed = forceCanvasFallback || MapRenderHooks.forceCanvasFallback || localMapFailed
    var camera by remember(followEnabled) {
        mutableStateOf(RouteCameraPolicy(followEnabled = followEnabled))
    }
    val vertices = points.map {
        EliteRouteVertex(it.latitude, it.longitude, altitudeM = it.altitudeM)
    }
    val a11y = RouteCameraLogic.summaryText(
        distanceM = distanceM,
        durationMs = durationMs,
        avgSpeedMps = avgSpeedMps,
        pointCount = points.size,
        qualityLabel = qualityLabel,
    )

    Column(
        modifier = modifier
            .fillMaxWidth()
            .semantics { contentDescription = a11y }
            .testTag("fitconnect_route_map"),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            EliteChip(
                label = qualityLabel,
                selected = true,
                onClick = {},
                modifier = Modifier
                    .testTag("route_gps_quality")
                    .semantics { contentDescription = "GPS quality $qualityLabel" },
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (!completed && points.isNotEmpty()) {
                    Box(modifier = Modifier.testTag("outdoor_recenter")) {
                        EliteButton(
                            label = if (camera.shouldFollow) "Following" else "Recenter",
                            variant = EliteButtonVariant.Ghost,
                            onClick = {
                                camera = camera.recenter()
                                onFollowChange?.invoke(true)
                            },
                            modifier = Modifier
                                .testTag("route_recenter")
                                .semantics { contentDescription = "Recenter map on current location" },
                        )
                    }
                }
            }
        }
        Text(
            text = a11y,
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier
                .testTag("route_a11y_summary")
                .semantics { contentDescription = a11y },
        )
        Box(modifier = Modifier.fillMaxWidth()) {
            if (!mapFailed && phase == EliteMapPhase.Success && points.isNotEmpty()) {
                MapLibreRouteMap(
                    points = points,
                    follow = camera.shouldFollow,
                    completed = completed,
                    contentDescription = a11y,
                    onMapFailed = { localMapFailed = true },
                    onUserGesture = {
                        camera = camera.onUserGesture()
                        onFollowChange?.invoke(false)
                    },
                )
            } else {
                EliteRouteMap(
                    points = vertices,
                    mode = mode,
                    phase = phase,
                    onRetry = onRetry,
                    contentDescription = a11y,
                    modifier = Modifier.testTag(
                        if (mapFailed) "elite_route_map_fallback" else "elite_route_map",
                    ),
                )
                if (mapFailed && phase == EliteMapPhase.Success) {
                    Text(
                        "Map tiles unavailable · showing local route polyline",
                        style = MaterialTheme.typography.labelSmall,
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(8.dp)
                            .testTag("route_map_fallback_banner"),
                    )
                }
            }
        }
    }
}
