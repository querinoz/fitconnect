package com.fitconnect.android.designui.maps

import com.fitconnect.shared.geo.RoutePoint

/**
 * Camera policy for route maps — never invents points.
 * Manual gestures release follow; recenter re-enables it.
 */
data class RouteCameraPolicy(
    val followEnabled: Boolean = true,
    val hasUserGesture: Boolean = false,
) {
    val shouldFollow: Boolean get() = followEnabled && !hasUserGesture

    fun onUserGesture(): RouteCameraPolicy = copy(hasUserGesture = true, followEnabled = false)

    fun recenter(): RouteCameraPolicy = copy(followEnabled = true, hasUserGesture = false)
}

data class RouteBounds(
    val minLat: Double,
    val maxLat: Double,
    val minLon: Double,
    val maxLon: Double,
) {
    val centerLat: Double get() = (minLat + maxLat) / 2.0
    val centerLon: Double get() = (minLon + maxLon) / 2.0
}

object RouteCameraLogic {
    const val FOLLOW_ZOOM = 15.5
    const val SINGLE_POINT_ZOOM = 16.0

    fun boundsOf(points: List<RoutePoint>): RouteBounds? {
        if (points.isEmpty()) return null
        return RouteBounds(
            minLat = points.minOf { it.latitude },
            maxLat = points.maxOf { it.latitude },
            minLon = points.minOf { it.longitude },
            maxLon = points.maxOf { it.longitude },
        )
    }

    fun startMarker(points: List<RoutePoint>): RoutePoint? = points.firstOrNull()

    fun finishMarker(points: List<RoutePoint>, completed: Boolean): RoutePoint? =
        if (completed && points.size >= 2) points.last() else null

    fun currentAccepted(points: List<RoutePoint>): RoutePoint? = points.lastOrNull()

    /** MAP-012 performance: updating source is O(n) geometry build; never recreate MapView. */
    fun shouldRebuildMapView(previousCount: Int, nextCount: Int): Boolean = false

    fun summaryText(
        distanceM: Double?,
        durationMs: Long?,
        avgSpeedMps: Double?,
        pointCount: Int,
        qualityLabel: String,
    ): String {
        val dist = distanceM?.let { "%.2f km".format(it / 1000.0) } ?: "distance unavailable"
        val dur = durationMs?.let { formatDuration(it) } ?: "duration unavailable"
        val spd = avgSpeedMps?.let { "%.1f km/h".format(it * 3.6) } ?: "speed unavailable"
        return "Route $pointCount points. $dist. $dur. $spd. $qualityLabel."
    }

    private fun formatDuration(ms: Long): String {
        val totalSec = (ms / 1000).toInt().coerceAtLeast(0)
        val h = totalSec / 3600
        val m = (totalSec % 3600) / 60
        val s = totalSec % 60
        return if (h > 0) "%d:%02d:%02d".format(h, m, s) else "%02d:%02d".format(m, s)
    }
}
