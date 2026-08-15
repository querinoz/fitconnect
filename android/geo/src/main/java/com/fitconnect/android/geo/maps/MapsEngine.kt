package com.fitconnect.android.geo.maps

import com.fitconnect.android.geo.domain.GeoBounds
import com.fitconnect.android.geo.domain.GeoPoint
import com.fitconnect.android.geo.domain.MapProviderKind
import com.fitconnect.android.geo.domain.MapStyleKind
import java.util.concurrent.ConcurrentHashMap

data class MapMarker(
    val id: String,
    val position: GeoPoint,
    val title: String,
    val clusterable: Boolean = true,
    val zIndex: Int = 0,
)

data class MapCluster(
    val id: String,
    val position: GeoPoint,
    val count: Int,
    val memberIds: List<String>,
)

data class MapPolyline(
    val id: String,
    val points: List<GeoPoint>,
    val widthDp: Float = 3f,
)

data class MapPolygon(
    val id: String,
    val points: List<GeoPoint>,
)

data class MapCircle(
    val id: String,
    val center: GeoPoint,
    val radiusM: Double,
)

data class HeatmapPoint(
    val position: GeoPoint,
    val intensity: Float,
)

data class MapCamera(
    val center: GeoPoint,
    val zoom: Double,
    val bearing: Double = 0.0,
    val tilt: Double = 0.0,
)

data class MapScene(
    val style: MapStyleKind,
    val camera: MapCamera,
    val markers: List<MapMarker> = emptyList(),
    val clusters: List<MapCluster> = emptyList(),
    val polylines: List<MapPolyline> = emptyList(),
    val polygons: List<MapPolygon> = emptyList(),
    val circles: List<MapCircle> = emptyList(),
    val heatmap: List<HeatmapPoint> = emptyList(),
    val livePosition: GeoPoint? = null,
    val showUserLocation: Boolean = true,
)

/**
 * Provider abstraction — MapLibre preferred; Google Maps pluggable.
 * UI binds to [MapController]; never imports vendor SDKs directly.
 */
interface MapProvider {
    val kind: MapProviderKind
    /** True when the controller is in-process and must be labeled LOCAL_DEMO. */
    val localDemo: Boolean
    fun supportedStyles(): Set<MapStyleKind>
    fun createController(): MapController
}

interface MapController {
    fun render(scene: MapScene)
    fun currentScene(): MapScene
    fun setStyle(style: MapStyleKind)
    fun setCamera(camera: MapCamera)
    fun setLivePosition(point: GeoPoint?)
    fun clear()
}

interface MapsEngine {
    fun preferredProvider(): MapProvider
    fun provider(kind: MapProviderKind): MapProvider
    fun cluster(markers: List<MapMarker>, cellDegrees: Double = 0.05): List<MapCluster>
    fun boundsFor(points: List<GeoPoint>): GeoBounds?
}

/**
 * Deterministic in-memory map. Preferred until a production SDK is bound.
 * UI must show LOCAL_DEMO — this is not live GPS tiles.
 */
class LocalDemoMapProvider : MapProvider {
    override val kind: MapProviderKind = MapProviderKind.LOCAL_DEMO
    override val localDemo: Boolean = true
    override fun supportedStyles(): Set<MapStyleKind> =
        setOf(MapStyleKind.DARK, MapStyleKind.LIGHT)
    override fun createController(): MapController = InMemoryMapController(MapStyleKind.DARK)
}

/**
 * MapLibre adapter slot. Controller is still in-memory until the SDK is wired.
 * Do not treat [kind] as a live tile server.
 */
class MapLibreProvider : MapProvider {
    override val kind: MapProviderKind = MapProviderKind.MAPLIBRE
    override val localDemo: Boolean = true
    override fun supportedStyles(): Set<MapStyleKind> =
        setOf(MapStyleKind.DARK, MapStyleKind.LIGHT, MapStyleKind.SATELLITE, MapStyleKind.TERRAIN)
    override fun createController(): MapController = InMemoryMapController(MapStyleKind.DARK)
}

/**
 * Google Maps adapter slot. Same in-memory controller until Play Services maps
 * are bound. Not a production map.
 */
class GoogleMapsProvider : MapProvider {
    override val kind: MapProviderKind = MapProviderKind.GOOGLE
    override val localDemo: Boolean = true
    override fun supportedStyles(): Set<MapStyleKind> =
        setOf(MapStyleKind.DARK, MapStyleKind.LIGHT, MapStyleKind.SATELLITE, MapStyleKind.TERRAIN)
    override fun createController(): MapController = InMemoryMapController(MapStyleKind.LIGHT)
}

class InMemoryMapController(
    initialStyle: MapStyleKind,
) : MapController {
    private var scene = MapScene(
        style = initialStyle,
        camera = MapCamera(GeoPoint(0.0, 0.0), zoom = 2.0),
        showUserLocation = true,
    )

    override fun render(scene: MapScene) {
        this.scene = scene
    }

    override fun currentScene(): MapScene = scene

    override fun setStyle(style: MapStyleKind) {
        scene = scene.copy(style = style)
    }

    override fun setCamera(camera: MapCamera) {
        scene = scene.copy(camera = camera)
    }

    override fun setLivePosition(point: GeoPoint?) {
        scene = scene.copy(livePosition = point)
    }

    override fun clear() {
        scene = scene.copy(
            markers = emptyList(),
            clusters = emptyList(),
            polylines = emptyList(),
            polygons = emptyList(),
            circles = emptyList(),
            heatmap = emptyList(),
        )
    }
}

class DefaultMapsEngine(
    private val localDemo: MapProvider = LocalDemoMapProvider(),
    private val mapLibre: MapProvider = MapLibreProvider(),
    private val google: MapProvider = GoogleMapsProvider(),
) : MapsEngine {
    private val providers = mapOf(
        MapProviderKind.LOCAL_DEMO to localDemo,
        MapProviderKind.MAPLIBRE to mapLibre,
        MapProviderKind.GOOGLE to google,
    )

    override fun preferredProvider(): MapProvider = localDemo

    override fun provider(kind: MapProviderKind): MapProvider =
        providers.getValue(kind)

    override fun cluster(markers: List<MapMarker>, cellDegrees: Double): List<MapCluster> {
        val buckets = ConcurrentHashMap<String, MutableList<MapMarker>>()
        markers.filter { it.clusterable }.forEach { marker ->
            val key = "${(marker.position.latitude / cellDegrees).toInt()}:${(marker.position.longitude / cellDegrees).toInt()}"
            buckets.getOrPut(key) { mutableListOf() }.add(marker)
        }
        return buckets.entries.mapIndexed { index, (_, members) ->
            val lat = members.map { it.position.latitude }.average()
            val lon = members.map { it.position.longitude }.average()
            MapCluster(
                id = "cluster-$index",
                position = GeoPoint(lat, lon),
                count = members.size,
                memberIds = members.map { it.id },
            )
        }
    }

    override fun boundsFor(points: List<GeoPoint>): GeoBounds? {
        if (points.isEmpty()) return null
        val minLat = points.minOf { it.latitude }
        val maxLat = points.maxOf { it.latitude }
        val minLon = points.minOf { it.longitude }
        val maxLon = points.maxOf { it.longitude }
        return GeoBounds(GeoPoint(minLat, minLon), GeoPoint(maxLat, maxLon))
    }
}
