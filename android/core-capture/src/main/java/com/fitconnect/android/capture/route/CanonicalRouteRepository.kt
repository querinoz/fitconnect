package com.fitconnect.android.capture.route

import com.fitconnect.android.capture.store.GpsRouteStore
import com.fitconnect.android.capture.store.room.LocationPointEntity
import com.fitconnect.shared.geo.RoutePoint
import com.fitconnect.shared.source.DataSourceKind
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/**
 * Canonical route adapter — Room [LocationPointEntity] is storage truth.
 * Map / UI consume [RoutePoint] ordered by sequenceNumber ASC.
 */
object LocationPointAdapter {
    fun toRoutePoint(entity: LocationPointEntity): RoutePoint =
        RoutePoint(
            latitude = entity.latitude,
            longitude = entity.longitude,
            timestampEpochMs = entity.capturedAtUtcMs,
            altitudeM = entity.altitudeMeters,
            accuracyM = entity.accuracyMeters,
            speedMps = entity.speedMps,
            source = when (entity.feedStatus) {
                "LIVE" -> DataSourceKind.REAL_SENSOR
                "EMULATOR_INJECTED" -> DataSourceKind.EMULATED_SENSOR
                else -> DataSourceKind.LOCAL_DEMO
            },
        )

    fun toRoutePoints(entities: List<LocationPointEntity>): List<RoutePoint> =
        entities
            .sortedWith(compareBy({ it.sequenceNumber }, { it.capturedAtUtcMs }))
            .map(::toRoutePoint)
}

class CanonicalRouteRepository(
    private val store: GpsRouteStore,
) {
    fun observeAcceptedRoute(activityId: String): Flow<List<RoutePoint>> =
        store.observeAcceptedPoints(activityId).map(LocationPointAdapter::toRoutePoints)

    suspend fun loadAcceptedRoute(activityId: String): List<RoutePoint> =
        LocationPointAdapter.toRoutePoints(store.points(activityId).filter { it.verdict == "ACCEPT" })

    suspend fun loadSession(activityId: String) = store.session(activityId)
}
