package com.fitconnect.android.capture.store

import com.fitconnect.android.capture.store.room.CaptureRoomDatabase
import com.fitconnect.android.capture.store.room.GpsSessionEntity
import com.fitconnect.android.capture.store.room.LocationPointEntity
import com.fitconnect.shared.geo.RoutePoint
import com.fitconnect.shared.source.DataSourceKind
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update

interface GpsRouteStore {
    suspend fun upsertSession(session: GpsSessionEntity)
    suspend fun session(activityId: String): GpsSessionEntity?
    suspend fun activeSession(userId: String): GpsSessionEntity?
    suspend fun appendPoint(point: LocationPointEntity)
    suspend fun points(activityId: String): List<LocationPointEntity>
    suspend fun acceptedRoutePoints(activityId: String): List<RoutePoint>
    suspend fun pointCount(activityId: String): Int
    fun observeAcceptedPoints(activityId: String): Flow<List<LocationPointEntity>>
}

class RoomGpsRouteStore(
    private val db: CaptureRoomDatabase,
) : GpsRouteStore {
    override suspend fun upsertSession(session: GpsSessionEntity) = db.sessions().upsert(session)

    override suspend fun session(activityId: String): GpsSessionEntity? = db.sessions().session(activityId)

    override suspend fun activeSession(userId: String): GpsSessionEntity? = db.sessions().active(userId)

    override suspend fun appendPoint(point: LocationPointEntity) = db.points().upsert(point)

    override suspend fun points(activityId: String): List<LocationPointEntity> =
        db.points().forActivity(activityId)

    override suspend fun acceptedRoutePoints(activityId: String): List<RoutePoint> =
        db.points().acceptedForActivity(activityId).map {
            RoutePoint(
                latitude = it.latitude,
                longitude = it.longitude,
                timestampEpochMs = it.capturedAtUtcMs,
                altitudeM = it.altitudeMeters,
                accuracyM = it.accuracyMeters,
                speedMps = it.speedMps,
                source = when (it.feedStatus) {
                    "LIVE" -> DataSourceKind.REAL_SENSOR
                    "EMULATOR_INJECTED" -> DataSourceKind.EMULATED_SENSOR
                    else -> DataSourceKind.LOCAL_DEMO
                },
            )
        }

    override suspend fun pointCount(activityId: String): Int = db.points().count(activityId)

    override fun observeAcceptedPoints(activityId: String): Flow<List<LocationPointEntity>> =
        db.points().observeAcceptedForActivity(activityId)
}

class InMemoryGpsRouteStore : GpsRouteStore {
    private val sessions = linkedMapOf<String, GpsSessionEntity>()
    private val points = linkedMapOf<String, MutableList<LocationPointEntity>>()
    private val acceptedFlows = mutableMapOf<String, MutableStateFlow<List<LocationPointEntity>>>()

    override suspend fun upsertSession(session: GpsSessionEntity) {
        sessions[session.activityId] = session
    }

    override suspend fun session(activityId: String): GpsSessionEntity? = sessions[activityId]

    override suspend fun activeSession(userId: String): GpsSessionEntity? =
        sessions.values
            .filter { it.userId == userId && it.phase in ACTIVE }
            .maxByOrNull { it.updatedAtUtcMs }

    override suspend fun appendPoint(point: LocationPointEntity) {
        points.getOrPut(point.activityId) { mutableListOf() }
            .removeAll { it.sequenceNumber == point.sequenceNumber }
        points.getOrPut(point.activityId) { mutableListOf() }.add(point)
        acceptedFlows.getOrPut(point.activityId) { MutableStateFlow(emptyList()) }
            .update {
                points[point.activityId].orEmpty()
                    .filter { it.verdict == "ACCEPT" }
                    .sortedBy { it.sequenceNumber }
            }
    }

    override suspend fun points(activityId: String): List<LocationPointEntity> =
        points[activityId].orEmpty().sortedBy { it.sequenceNumber }

    override suspend fun acceptedRoutePoints(activityId: String): List<RoutePoint> =
        points(activityId).filter { it.verdict == "ACCEPT" }.map {
            RoutePoint(
                latitude = it.latitude,
                longitude = it.longitude,
                timestampEpochMs = it.capturedAtUtcMs,
                altitudeM = it.altitudeMeters,
                accuracyM = it.accuracyMeters,
                speedMps = it.speedMps,
                source = DataSourceKind.REAL_SENSOR,
            )
        }

    override suspend fun pointCount(activityId: String): Int = points[activityId]?.size ?: 0

    override fun observeAcceptedPoints(activityId: String): Flow<List<LocationPointEntity>> =
        acceptedFlows.getOrPut(activityId) {
            MutableStateFlow(
                points[activityId].orEmpty()
                    .filter { it.verdict == "ACCEPT" }
                    .sortedBy { it.sequenceNumber },
            )
        }

    private companion object {
        val ACTIVE = setOf("PREPARING", "TRACKING", "PAUSED", "GPS_DEGRADED", "RESUMING")
    }
}
