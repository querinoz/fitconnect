package com.fitconnect.android.capture.route

import com.fitconnect.android.capture.runtime.OutdoorTrackingPhase
import com.fitconnect.android.capture.store.InMemoryGpsRouteStore
import com.fitconnect.android.capture.store.room.LocationPointEntity
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class CanonicalRouteRepositoryTest {
    @Test
    fun map_dataSource_ordersBySequenceNotInsertionChaos() = runTest {
        val store = InMemoryGpsRouteStore()
        store.appendPoint(point("a1", seq = 2, lat = 38.73))
        store.appendPoint(point("a1", seq = 1, lat = 38.72))
        val repo = CanonicalRouteRepository(store)
        val route = repo.loadAcceptedRoute("a1")
        assertEquals(2, route.size)
        assertEquals(38.72, route[0].latitude, 0.0001)
        assertEquals(38.73, route[1].latitude, 0.0001)
        val observed = repo.observeAcceptedRoute("a1").first()
        assertEquals(route.map { it.latitude }, observed.map { it.latitude })
    }

    @Test
    fun map_gpsQuality_fromSubsystemNotTimer() {
        assertEquals(
            GpsQualityUi.GOOD,
            GpsQualityResolver.resolve(OutdoorTrackingPhase.TRACKING, acceptedPoints = 3, lastVerdict = "ok"),
        )
        assertEquals(
            GpsQualityUi.DEGRADED,
            GpsQualityResolver.resolve(OutdoorTrackingPhase.GPS_DEGRADED, acceptedPoints = 3, lastVerdict = "accuracy_low"),
        )
        assertEquals(
            GpsQualityUi.LOST,
            GpsQualityResolver.resolve(OutdoorTrackingPhase.PREPARING, acceptedPoints = 0, lastVerdict = ""),
        )
        assertEquals(
            GpsQualityUi.RECOVERING,
            GpsQualityResolver.resolve(OutdoorTrackingPhase.RESUMING, acceptedPoints = 2, lastVerdict = "ok"),
        )
        assertTrue(GpsQualityResolver.label(GpsQualityUi.GOOD).contains("GOOD"))
    }

    private fun point(activityId: String, seq: Int, lat: Double) =
        LocationPointEntity(
            pointId = "$activityId:$seq",
            activityId = activityId,
            userId = "u1",
            latitude = lat,
            longitude = -9.13,
            accuracyMeters = 5.0,
            speedMps = 3.0,
            altitudeMeters = 80.0,
            capturedAtUtcMs = seq * 1_000L,
            sequenceNumber = seq,
            verdict = "ACCEPT",
            feedStatus = "EMULATOR_INJECTED",
        )
}
