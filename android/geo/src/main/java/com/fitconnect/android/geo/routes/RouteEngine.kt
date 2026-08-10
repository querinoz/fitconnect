package com.fitconnect.android.geo.routes

import com.fitconnect.android.geo.catalog.PlacesCatalog
import com.fitconnect.android.geo.domain.GeoPoint
import com.fitconnect.android.geo.domain.RouteKind
import com.fitconnect.android.geo.domain.haversineKm
import com.fitconnect.android.geo.offline.GeoOfflineStore
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

data class ElevationSample(
    val distanceKm: Double,
    val elevationM: Double,
)

data class RouteDefinition(
    val id: String,
    val title: String,
    val kind: RouteKind,
    val points: List<GeoPoint>,
    val distanceKm: Double,
    val estimatedMinutes: Int,
    val elevation: List<ElevationSample>,
    val favorite: Boolean = false,
    val gpxReady: Boolean = true,
)

/**
 * Route engine — running/cycling/walking/swim/trail, favorites, GPX-ready export architecture.
 */
interface RouteEngine {
    fun all(): List<RouteDefinition>
    fun byKind(kind: RouteKind): List<RouteDefinition>
    fun favorites(): List<RouteDefinition>
    fun get(id: String): RouteDefinition?
    fun save(route: RouteDefinition): RouteDefinition
    fun toggleFavorite(id: String): RouteDefinition?
    fun exportGpxArchitecture(id: String): String?
    fun importGpxArchitecture(gpx: String, title: String, kind: RouteKind): RouteDefinition
}

class DefaultRouteEngine(
    private val offline: GeoOfflineStore,
) : RouteEngine {
    private val store = ConcurrentHashMap<String, RouteDefinition>()

    init {
        val anchor = PlacesCatalog.defaultDevAnchor()
        val coastal = listOf(
            anchor,
            GeoPoint(anchor.latitude - 0.01, anchor.longitude - 0.02),
            GeoPoint(anchor.latitude - 0.02, anchor.longitude - 0.03),
            GeoPoint(anchor.latitude - 0.015, anchor.longitude - 0.04),
        )
        save(
            RouteDefinition(
                id = "rt_coastal",
                title = "Coastal easy",
                kind = RouteKind.RUNNING,
                points = coastal,
                distanceKm = pathDistance(coastal),
                estimatedMinutes = 42,
                elevation = listOf(
                    ElevationSample(0.0, 12.0),
                    ElevationSample(2.0, 28.0),
                    ElevationSample(4.0, 18.0),
                ),
                favorite = true,
            ),
        )
        val ride = listOf(
            anchor,
            GeoPoint(anchor.latitude + 0.03, anchor.longitude - 0.01),
            GeoPoint(anchor.latitude + 0.05, anchor.longitude + 0.01),
        )
        save(
            RouteDefinition(
                id = "rt_ride",
                title = "City loop",
                kind = RouteKind.CYCLING,
                points = ride,
                distanceKm = pathDistance(ride),
                estimatedMinutes = 55,
                elevation = listOf(ElevationSample(0.0, 20.0), ElevationSample(8.0, 65.0)),
            ),
        )
    }

    override fun all(): List<RouteDefinition> = store.values.sortedBy { it.title }

    override fun byKind(kind: RouteKind): List<RouteDefinition> = all().filter { it.kind == kind }

    override fun favorites(): List<RouteDefinition> = all().filter { it.favorite }

    override fun get(id: String): RouteDefinition? = store[id]

    override fun save(route: RouteDefinition): RouteDefinition {
        store[route.id] = route
        offline.storeRoute(route)
        return route
    }

    override fun toggleFavorite(id: String): RouteDefinition? {
        val current = store[id] ?: return null
        return save(current.copy(favorite = !current.favorite))
    }

    override fun exportGpxArchitecture(id: String): String? {
        val route = store[id] ?: return null
        // Architecture payload — full GPX serializer plugs in later.
        return buildString {
            appendLine("""<?xml version="1.0" encoding="UTF-8"?>""")
            appendLine("""<gpx version="1.1" creator="FitConnect">""")
            appendLine("""  <trk><name>${route.title}</name><trkseg>""")
            route.points.forEach {
                appendLine("""    <trkpt lat="${it.latitude}" lon="${it.longitude}"></trkpt>""")
            }
            appendLine("""  </trkseg></trk></gpx>""")
        }
    }

    override fun importGpxArchitecture(gpx: String, title: String, kind: RouteKind): RouteDefinition {
        val latLon = Regex("""lat="([-0-9.]+)" lon="([-0-9.]+)"""")
            .findAll(gpx)
            .map { GeoPoint(it.groupValues[1].toDouble(), it.groupValues[2].toDouble()) }
            .toList()
        val points = latLon.ifEmpty { listOf(PlacesCatalog.defaultDevAnchor()) }
        return save(
            RouteDefinition(
                id = "rt-${UUID.randomUUID().toString().take(8)}",
                title = title,
                kind = kind,
                points = points,
                distanceKm = pathDistance(points),
                estimatedMinutes = (pathDistance(points) * 6).toInt().coerceAtLeast(1),
                elevation = emptyList(),
                gpxReady = true,
            ),
        )
    }

    private fun pathDistance(points: List<GeoPoint>): Double {
        if (points.size < 2) return 0.0
        return points.zipWithNext { a, b -> haversineKm(a, b) }.sum()
    }
}
