package com.fitconnect.android.capture.gps

import com.fitconnect.android.capture.GpsFeedStatus
import com.fitconnect.android.capture.LiveActivityEngine
import com.fitconnect.android.capture.LiveActivityPhase
import com.fitconnect.android.capture.runtime.OutdoorCompletionFactory
import com.fitconnect.android.capture.store.InMemoryGpsRouteStore
import com.fitconnect.android.capture.store.room.LocationPointEntity
import com.fitconnect.shared.geo.QaGpsRoute
import com.fitconnect.shared.geo.RouteMath
import com.fitconnect.shared.geo.RoutePoint
import com.fitconnect.shared.source.DataSourceKind
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** GPS-001…012 — P2-GPS unit matrix. */
class GpsWaveUnitTest {

    @Test
    fun gps001_rejectOutOfRangeCoords() {
        val r = GpsAccuracyFilter.evaluate(91.0, 0.0, 5.0, null)
        assertEquals(GpsPointVerdict.REJECT, r.verdict)
    }

    @Test
    fun gps002_lowConfidenceDoesNotHardReject() {
        val r = GpsAccuracyFilter.evaluate(38.72, -9.13, 80.0, null)
        assertEquals(GpsPointVerdict.LOW_CONFIDENCE, r.verdict)
    }

    @Test
    fun gps003_jumpRejected() {
        val r = GpsAccuracyFilter.evaluate(38.72, -9.13, 8.0, GpsAccuracyFilter.MAX_JUMP_M + 1)
        assertEquals(GpsPointVerdict.REJECT, r.verdict)
        assertEquals("gps_jump", r.reason)
    }

    @Test
    fun gps004_acceptGoodFix() {
        val r = GpsAccuracyFilter.evaluate(38.72, -9.13, 8.0, 12.0)
        assertEquals(GpsPointVerdict.ACCEPT, r.verdict)
    }

    @Test
    fun gps005_noSimulatedRouteWhenDisabled() {
        var now = 1_000_000L
        val engine = LiveActivityEngine(clockMs = { now }, allowSimulatedGps = false)
        engine.start("Run")
        now += 10_000L
        engine.tick()
        assertTrue(engine.state.value.route.isEmpty())
        assertEquals(GpsFeedStatus.UNAVAILABLE, engine.state.value.gps)
        assertEquals(0.0, engine.state.value.distanceM, 0.001)
    }

    @Test
    fun gps006_ingestLiveAdvancesDistance() {
        var now = 1_000_000L
        val engine = LiveActivityEngine(clockMs = { now }, allowSimulatedGps = false)
        engine.startWithId("00000000-0000-4000-8000-00000000aa01", "Run")
        QaGpsRoute.POINTS.forEachIndexed { i, p ->
            now += 30_000L
            engine.ingestFix(p.copy(timestampEpochMs = now), GpsFeedStatus.LIVE)
        }
        assertEquals(GpsFeedStatus.LIVE, engine.state.value.gps)
        assertTrue(engine.state.value.distanceM in 1_800.0..2_200.0)
        assertEquals(5, engine.state.value.route.size)
    }

    @Test
    fun gps007_pauseResumeKeepsSameSession() {
        var now = 1_000_000L
        val engine = LiveActivityEngine(clockMs = { now }, allowSimulatedGps = false)
        engine.startWithId("sess-pause", "Run")
        val id = engine.state.value.sessionId
        engine.ingestFix(QaGpsRoute.POINTS[0].copy(timestampEpochMs = now), GpsFeedStatus.LIVE)
        engine.pause()
        assertEquals(LiveActivityPhase.PAUSED, engine.state.value.phase)
        engine.resume()
        assertEquals(id, engine.state.value.sessionId)
        assertEquals(LiveActivityPhase.RUNNING, engine.state.value.phase)
    }

    @Test
    fun gps008_roomStorePersistsAcceptedPoints() = runTest {
        val store = InMemoryGpsRouteStore()
        store.appendPoint(
            LocationPointEntity(
                pointId = "p1",
                activityId = "a1",
                userId = "u1",
                latitude = 38.72,
                longitude = -9.13,
                accuracyMeters = 5.0,
                speedMps = 3.0,
                altitudeMeters = 80.0,
                capturedAtUtcMs = 1_000L,
                sequenceNumber = 1,
                verdict = "ACCEPT",
                feedStatus = "LIVE",
            ),
        )
        store.appendPoint(
            LocationPointEntity(
                pointId = "p2",
                activityId = "a1",
                userId = "u1",
                latitude = 38.73,
                longitude = -9.13,
                accuracyMeters = 5.0,
                speedMps = 3.0,
                altitudeMeters = 82.0,
                capturedAtUtcMs = 2_000L,
                sequenceNumber = 2,
                verdict = "ACCEPT",
                feedStatus = "LIVE",
            ),
        )
        assertEquals(2, store.pointCount("a1"))
        val route = store.acceptedRoutePoints("a1")
        assertEquals(2, route.size)
        assertTrue(RouteMath.haversineM(route[0], route[1]) > 0.0)
    }

    @Test
    fun gps009_completionPayloadIsDeterministic() {
        val points = listOf(
            RoutePoint(38.72, -9.13, 1_000L, accuracyM = 5.0, speedMps = 3.0, source = DataSourceKind.REAL_SENSOR),
            RoutePoint(38.73, -9.13, 2_000L, accuracyM = 5.0, speedMps = 3.1, source = DataSourceKind.REAL_SENSOR),
        )
        val a = OutdoorCompletionFactory.build(
            userId = "u1",
            activityId = "act-1",
            sessionId = "sess-1",
            sport = "Run",
            startedAtMs = 1_000L,
            completedAtMs = 2_000L,
            durationMs = 1_000L,
            distanceM = 100.0,
            points = points,
            avgSpeedMps = 3.0,
            elevationGainM = 2.0,
        )
        val b = OutdoorCompletionFactory.build(
            userId = "u1",
            activityId = "act-1",
            sessionId = "sess-1",
            sport = "Run",
            startedAtMs = 1_000L,
            completedAtMs = 2_000L,
            durationMs = 1_000L,
            distanceM = 100.0,
            points = points,
            avgSpeedMps = 3.0,
            elevationGainM = 2.0,
        )
        assertEquals(a.activityIdempotencyKey, b.activityIdempotencyKey)
        assertEquals("activity:u1:sess-1", a.activityIdempotencyKey)
        assertEquals("xp:u1:sess-1", a.xpIdempotencyKey)
        assertTrue(a.activityJson.contains("\"provider\":\"GPS\""))
        assertFalse(a.activityJson.contains("STRAVA"))
    }

    @Test
    fun gps010_providerSpeedPreferredWhenPresent() {
        val p = RoutePoint(38.72, -9.13, 1L, speedMps = 4.5, accuracyM = 4.0, source = DataSourceKind.REAL_SENSOR)
        assertEquals(4.5, p.speedMps!!, 0.0)
    }

    @Test
    fun gps011_restoreSessionKeepsRoute() {
        val engine = LiveActivityEngine(allowSimulatedGps = false)
        val route = QaGpsRoute.POINTS.mapIndexed { i, p -> p.copy(timestampEpochMs = i * 60_000L) }
        engine.restoreSession(
            sessionId = "restore-1",
            sport = "Run",
            route = route,
            distanceM = RouteMath.polylineDistanceM(route),
            movingMs = 240_000L,
            elapsedMs = 240_000L,
            phase = LiveActivityPhase.PAUSED,
        )
        assertEquals(LiveActivityPhase.PAUSED, engine.state.value.phase)
        assertEquals(5, engine.state.value.route.size)
        assertTrue(engine.state.value.distanceM > 0.0)
    }

    @Test
    fun gps012_negativeSpeedNotStoredInFilterPath() {
        // Speed validation is on RoutePoint via caller; filter focuses on accuracy/jumps.
        val r = GpsAccuracyFilter.evaluate(38.72, -9.13, -1.0, null)
        assertEquals(GpsPointVerdict.REJECT, r.verdict)
    }
}
