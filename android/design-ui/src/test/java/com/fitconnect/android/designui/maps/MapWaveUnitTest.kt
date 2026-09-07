package com.fitconnect.android.designui.maps

import com.fitconnect.shared.geo.QaGpsRoute
import com.fitconnect.shared.geo.RoutePoint
import com.fitconnect.shared.source.DataSourceKind
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** MAP-001…012 — route visualization unit matrix (canonical data, no fake coords). */
class MapWaveUnitTest {

    private fun sample(): List<RoutePoint> =
        QaGpsRoute.POINTS.mapIndexed { i, p ->
            p.copy(
                timestampEpochMs = i * 60_000L,
                source = DataSourceKind.EMULATED_SENSOR,
            )
        }

    @Test
    fun map001_boundsFromCanonicalOrder() {
        val points = sample().reversed() // wrong order input
        val ordered = points.sortedBy { it.timestampEpochMs }
        val bounds = RouteCameraLogic.boundsOf(ordered)
        assertNotNull(bounds)
        assertTrue(bounds!!.minLat <= bounds.maxLat)
    }

    @Test
    fun map002_startMarkerIsFirstAccepted() {
        val points = sample()
        assertEquals(points.first(), RouteCameraLogic.startMarker(points))
    }

    @Test
    fun map003_finishMarkerOnlyWhenCompleted() {
        val points = sample()
        assertNull(RouteCameraLogic.finishMarker(points, completed = false))
        assertEquals(points.last(), RouteCameraLogic.finishMarker(points, completed = true))
    }

    @Test
    fun map004_noMarkerWithoutPoints() {
        assertNull(RouteCameraLogic.startMarker(emptyList()))
        assertNull(RouteCameraLogic.finishMarker(emptyList(), completed = true))
    }

    @Test
    fun map005_followReleasedOnGesture() {
        val policy = RouteCameraPolicy(followEnabled = true)
        assertTrue(policy.shouldFollow)
        val after = policy.onUserGesture()
        assertFalse(after.shouldFollow)
        assertTrue(after.recenter().shouldFollow)
    }

    @Test
    fun map006_neverRebuildMapViewPerPoint() {
        assertFalse(RouteCameraLogic.shouldRebuildMapView(10, 11))
        assertFalse(RouteCameraLogic.shouldRebuildMapView(100, 500))
        assertFalse(RouteCameraLogic.shouldRebuildMapView(0, 1000))
    }

    @Test
    fun map007_phaseSuccessNeedsTwoPoints() {
        assertEquals(
            EliteMapPhase.Success,
            EliteMapPhaseLogic.resolve(2, sessionWaitingForTrace = true, permissionDenied = false, elapsedMs = 0),
        )
        assertEquals(
            EliteMapPhase.Loading,
            EliteMapPhaseLogic.resolve(0, sessionWaitingForTrace = true, permissionDenied = false, elapsedMs = 0),
        )
    }

    @Test
    fun map008_permissionDeniedIsErrorNotFakeRoute() {
        assertEquals(
            EliteMapPhase.Error,
            EliteMapPhaseLogic.resolve(0, sessionWaitingForTrace = true, permissionDenied = true, elapsedMs = 0),
        )
    }

    @Test
    fun map009_a11ySummaryAvoidsZeroFallback() {
        val text = RouteCameraLogic.summaryText(
            distanceM = null,
            durationMs = null,
            avgSpeedMps = null,
            pointCount = 0,
            qualityLabel = "GPS LOST",
        )
        assertTrue(text.contains("unavailable"))
        assertFalse(text.contains("0.00 km"))
    }

    @Test
    fun map010_openFreeMapStyleIsDarkCanonical() {
        assertTrue(FitConnectMapStyles.OPENFREEMAP_DARK.contains("openfreemap"))
        assertTrue(FitConnectMapStyles.OPENFREEMAP_DARK.contains("dark"))
    }

    @Test
    fun map011_currentAcceptedIsLast() {
        val points = sample()
        assertEquals(points.last(), RouteCameraLogic.currentAccepted(points))
    }

    @Test
    fun map012_performanceScaleDoesNotForceRebuild() {
        listOf(10, 100, 500, 1000).forEach { n ->
            assertFalse(RouteCameraLogic.shouldRebuildMapView(n - 1, n))
        }
    }
}
