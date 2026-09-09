package com.fitconnect.android.designui.maps

import android.graphics.Color as AndroidColor
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.shared.geo.RoutePoint
import org.maplibre.android.MapLibre
import org.maplibre.android.camera.CameraUpdateFactory
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.geometry.LatLngBounds
import org.maplibre.android.maps.MapView
import org.maplibre.android.maps.Style
import org.maplibre.android.style.layers.CircleLayer
import org.maplibre.android.style.layers.LineLayer
import org.maplibre.android.style.layers.PropertyFactory
import org.maplibre.android.style.sources.GeoJsonSource
import org.maplibre.geojson.Feature
import org.maplibre.geojson.FeatureCollection
import org.maplibre.geojson.LineString
import org.maplibre.geojson.Point

/**
 * MapLibre route renderer — OpenFreeMap dark tiles + GeoJson line/markers.
 * Updates [GeoJsonSource] in place; never recreates [MapView] per GPS point.
 * On style/load failure, caller should fall back to [EliteRouteMap] canvas.
 */
object FitConnectMapStyles {
    /** Same dark OpenFreeMap style as web (`packages/maps`). */
    const val OPENFREEMAP_DARK = "https://tiles.openfreemap.org/styles/dark"
}

private const val SOURCE_ROUTE = "fc-route"
private const val SOURCE_START = "fc-start"
private const val SOURCE_FINISH = "fc-finish"
private const val SOURCE_CURRENT = "fc-current"
private const val LAYER_ROUTE = "fc-route-line"
private const val LAYER_ROUTE_GLOW = "fc-route-glow"
private const val LAYER_START = "fc-start-circle"
private const val LAYER_FINISH = "fc-finish-circle"
private const val LAYER_CURRENT = "fc-current-circle"

@Composable
fun MapLibreRouteMap(
    points: List<RoutePoint>,
    modifier: Modifier = Modifier,
    follow: Boolean = true,
    completed: Boolean = false,
    contentDescription: String = "Activity route map",
    onMapFailed: ((String) -> Unit)? = null,
    onUserGesture: (() -> Unit)? = null,
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    var mapView by remember { mutableStateOf<MapView?>(null) }
    var styleReady by remember { mutableStateOf(false) }
    var lastCameraKey by remember { mutableStateOf("") }

    DisposableEffect(Unit) {
        runCatching { MapLibre.getInstance(context.applicationContext) }
            .onFailure { onMapFailed?.invoke(it.message ?: "maplibre_init_failed") }
        onDispose { }
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(280.dp)
            .testTag("maplibre_route_map")
            .semantics { this.contentDescription = contentDescription },
    ) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                MapView(ctx).also { view ->
                    mapView = view
                    view.onCreate(null)
                    view.addOnDidFailLoadingMapListener { error ->
                        styleReady = false
                        onMapFailed?.invoke(error ?: "style_load_failed")
                    }
                    view.getMapAsync { map ->
                        map.uiSettings.isAttributionEnabled = true
                        map.uiSettings.isLogoEnabled = true
                        map.addOnCameraMoveStartedListener { reason ->
                            if (reason == org.maplibre.android.maps.MapLibreMap.OnCameraMoveStartedListener.REASON_API_GESTURE) {
                                onUserGesture?.invoke()
                            }
                        }
                        map.setStyle(Style.Builder().fromUri(FitConnectMapStyles.OPENFREEMAP_DARK)) { style ->
                            ensureLayers(style)
                            styleReady = true
                            applyRoute(style, points, completed)
                        }
                    }
                }
            },
            update = { view ->
                if (!styleReady) return@AndroidView
                view.getMapAsync { map ->
                    val style = map.style ?: return@getMapAsync
                    applyRoute(style, points, completed)
                    val cameraKey = cameraKey(points, follow, completed)
                    if (cameraKey != lastCameraKey) {
                        lastCameraKey = cameraKey
                        applyCamera(map, points, follow, completed)
                    }
                }
            },
        )
    }

    DisposableEffect(lifecycleOwner, mapView) {
        val view = mapView
        if (view == null) return@DisposableEffect onDispose { }
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_START -> view.onStart()
                Lifecycle.Event.ON_RESUME -> view.onResume()
                Lifecycle.Event.ON_PAUSE -> view.onPause()
                Lifecycle.Event.ON_STOP -> view.onStop()
                Lifecycle.Event.ON_DESTROY -> view.onDestroy()
                else -> Unit
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            view.onPause()
            view.onStop()
            view.onDestroy()
            mapView = null
        }
    }

    LaunchedEffect(points.size, follow, completed, styleReady) {
        if (!styleReady) return@LaunchedEffect
        mapView?.getMapAsync { map ->
            val style = map.style ?: return@getMapAsync
            applyRoute(style, points, completed)
            applyCamera(map, points, follow, completed)
        }
    }
}

private fun ensureLayers(style: Style) {
    val volt = (EliteSurfaceColors.VOLTLINE and 0xFFFFFFFFL).toInt()
    val connect = (EliteSurfaceColors.CONNECT and 0xFFFFFFFFL).toInt()
    val telemetry = (EliteSurfaceColors.TELEMETRY and 0xFFFFFFFFL).toInt()
    if (style.getSource(SOURCE_ROUTE) == null) {
        style.addSource(GeoJsonSource(SOURCE_ROUTE, emptyLine()))
        style.addSource(GeoJsonSource(SOURCE_START, emptyPoints()))
        style.addSource(GeoJsonSource(SOURCE_FINISH, emptyPoints()))
        style.addSource(GeoJsonSource(SOURCE_CURRENT, emptyPoints()))
        style.addLayer(
            LineLayer(LAYER_ROUTE_GLOW, SOURCE_ROUTE).withProperties(
                PropertyFactory.lineColor(volt),
                PropertyFactory.lineWidth(10f),
                PropertyFactory.lineOpacity(0.25f),
                PropertyFactory.lineCap("round"),
                PropertyFactory.lineJoin("round"),
            ),
        )
        style.addLayer(
            LineLayer(LAYER_ROUTE, SOURCE_ROUTE).withProperties(
                PropertyFactory.lineColor(volt),
                PropertyFactory.lineWidth(4f),
                PropertyFactory.lineOpacity(0.95f),
                PropertyFactory.lineCap("round"),
                PropertyFactory.lineJoin("round"),
            ),
        )
        style.addLayer(
            CircleLayer(LAYER_START, SOURCE_START).withProperties(
                PropertyFactory.circleRadius(6f),
                PropertyFactory.circleColor(AndroidColor.WHITE),
                PropertyFactory.circleStrokeColor(volt),
                PropertyFactory.circleStrokeWidth(2f),
            ),
        )
        style.addLayer(
            CircleLayer(LAYER_FINISH, SOURCE_FINISH).withProperties(
                PropertyFactory.circleRadius(7f),
                PropertyFactory.circleColor(connect),
                PropertyFactory.circleStrokeColor(AndroidColor.WHITE),
                PropertyFactory.circleStrokeWidth(2f),
            ),
        )
        style.addLayer(
            CircleLayer(LAYER_CURRENT, SOURCE_CURRENT).withProperties(
                PropertyFactory.circleRadius(8f),
                PropertyFactory.circleColor(telemetry),
                PropertyFactory.circleStrokeColor(AndroidColor.WHITE),
                PropertyFactory.circleStrokeWidth(2f),
            ),
        )
    }
}

private fun applyRoute(style: Style, points: List<RoutePoint>, completed: Boolean) {
    val lineSource = style.getSourceAs<GeoJsonSource>(SOURCE_ROUTE) ?: return
    val startSource = style.getSourceAs<GeoJsonSource>(SOURCE_START) ?: return
    val finishSource = style.getSourceAs<GeoJsonSource>(SOURCE_FINISH) ?: return
    val currentSource = style.getSourceAs<GeoJsonSource>(SOURCE_CURRENT) ?: return

    if (points.size >= 2) {
        val coords = points.map { Point.fromLngLat(it.longitude, it.latitude) }
        lineSource.setGeoJson(LineString.fromLngLats(coords))
    } else {
        lineSource.setGeoJson(emptyLine())
    }

    val start = RouteCameraLogic.startMarker(points)
    startSource.setGeoJson(
        if (start != null) {
            FeatureCollection.fromFeature(
                Feature.fromGeometry(Point.fromLngLat(start.longitude, start.latitude)),
            )
        } else {
            emptyPoints()
        },
    )

    val finish = RouteCameraLogic.finishMarker(points, completed)
    finishSource.setGeoJson(
        if (finish != null) {
            FeatureCollection.fromFeature(
                Feature.fromGeometry(Point.fromLngLat(finish.longitude, finish.latitude)),
            )
        } else {
            emptyPoints()
        },
    )

    val current = if (!completed) RouteCameraLogic.currentAccepted(points) else null
    currentSource.setGeoJson(
        if (current != null) {
            FeatureCollection.fromFeature(
                Feature.fromGeometry(Point.fromLngLat(current.longitude, current.latitude)),
            )
        } else {
            emptyPoints()
        },
    )
}

private fun applyCamera(
    map: org.maplibre.android.maps.MapLibreMap,
    points: List<RoutePoint>,
    follow: Boolean,
    completed: Boolean,
) {
    when {
        points.isEmpty() -> Unit
        completed && points.size >= 2 -> {
            val bounds = RouteCameraLogic.boundsOf(points) ?: return
            val llb = LatLngBounds.Builder()
                .include(LatLng(bounds.minLat, bounds.minLon))
                .include(LatLng(bounds.maxLat, bounds.maxLon))
                .build()
            map.easeCamera(CameraUpdateFactory.newLatLngBounds(llb, 64), 600)
        }
        follow -> {
            val cur = points.last()
            map.easeCamera(
                CameraUpdateFactory.newLatLngZoom(
                    LatLng(cur.latitude, cur.longitude),
                    if (points.size == 1) RouteCameraLogic.SINGLE_POINT_ZOOM else RouteCameraLogic.FOLLOW_ZOOM,
                ),
                350,
            )
        }
        points.size == 1 -> {
            val p = points.first()
            map.moveCamera(
                CameraUpdateFactory.newLatLngZoom(
                    LatLng(p.latitude, p.longitude),
                    RouteCameraLogic.SINGLE_POINT_ZOOM,
                ),
            )
        }
    }
}

private fun cameraKey(points: List<RoutePoint>, follow: Boolean, completed: Boolean): String {
    val last = points.lastOrNull()
    return "${points.size}:${last?.latitude}:${last?.longitude}:$follow:$completed"
}

private fun emptyLine(): LineString =
    LineString.fromLngLats(listOf(Point.fromLngLat(0.0, 0.0), Point.fromLngLat(0.0, 0.0)))

private fun emptyPoints(): FeatureCollection = FeatureCollection.fromFeatures(emptyArray())
