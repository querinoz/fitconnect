package com.fitconnect.shared

import com.fitconnect.shared.export.ActivityExportFactory
import com.fitconnect.shared.geo.QaGpsRoute
import com.fitconnect.shared.geo.RouteMath
import com.fitconnect.shared.intelligence.BodyState
import com.fitconnect.shared.intelligence.EvidenceKind
import com.fitconnect.shared.intelligence.PerformanceIntelligence
import com.fitconnect.shared.recognition.ActivityRecognitionEngine
import com.fitconnect.shared.recognition.ActivityRecognitionSample
import com.fitconnect.shared.recognition.ActivityRecognitionState
import com.fitconnect.shared.recognition.ActivityRecognitionVerdict
import com.fitconnect.shared.session.ActivitySession
import com.fitconnect.shared.session.ActivitySessionEvent
import com.fitconnect.shared.session.ActivitySessionMachine
import com.fitconnect.shared.session.ActivitySessionState
import com.fitconnect.shared.session.WorkoutRegistry
import com.fitconnect.shared.source.DataSourceKind
import com.fitconnect.shared.wear.SessionControlCommand
import com.fitconnect.shared.wearable.ExternalProviderCatalog
import com.fitconnect.shared.wearable.IntegrationStatus
import com.fitconnect.shared.workout.WorkoutSport
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SharedEcosystemTest {
    @Test
    fun qaRouteIsAboutTwoKilometresAcrossFivePoints() {
        assertEquals(5, QaGpsRoute.POINTS.size)
        val length = QaGpsRoute.lengthM
        assertTrue("length=$length", length in 1_800.0..2_200.0)
        val (gain, loss) = RouteMath.elevation(QaGpsRoute.POINTS)
        assertTrue(gain > 0.0)
        assertTrue(loss > 0.0)
    }

    @Test
    fun sessionCountdownPath() {
        var session = ActivitySession("s1")
        session = ActivitySessionMachine.apply(session, ActivitySessionEvent.PREPARE, 1L)
        assertEquals(ActivitySessionState.READY, session.state)
        session = ActivitySessionMachine.apply(session, ActivitySessionEvent.COUNTDOWN, 2L)
        assertEquals(ActivitySessionState.COUNTDOWN, session.state)
        session = ActivitySessionMachine.apply(session, ActivitySessionEvent.START, 3L)
        assertEquals(ActivitySessionState.ACTIVE, session.state)
    }

    @Test
    fun recognitionNeverAutoConfirms() {
        val engine = ActivityRecognitionEngine()
        val state = engine.ingest(
            ActivityRecognitionSample(1L, speedMps = 3.0, stepsPerMinute = 160.0),
        )
        assertEquals(ActivityRecognitionState.POSSIBLE_RUN, state)
        assertFalse(engine.confirmed)
        assertEquals(ActivityRecognitionVerdict.PRODUCTION_UNVERIFIED, engine.verdict)
        engine.forceConfirmForTest()
        assertEquals(ActivityRecognitionState.CONFIRMED, engine.state)
        assertEquals(ActivityRecognitionVerdict.TEST_FIXTURE, engine.verdict)
    }

    @Test
    fun sleepScoreDoesNotFabricateWhenMissing() {
        val missing = PerformanceIntelligence.sleepScore(null, null)
        assertFalse(missing.available)
        assertNull(missing.score)
        assertEquals("DATA SOURCE REQUIRED", missing.recoveryImpact)
        val body = PerformanceIntelligence.bodyState(null, hrvAvailable = false, sleepAvailable = false)
        assertEquals(BodyState.DATA_SOURCE_REQUIRED, body)
        val directive = PerformanceIntelligence.directive(null, body)
        assertEquals(EvidenceKind.INFERRED, directive.kind)
    }

    @Test
    fun workoutRegistryRejectsDuplicateComplete() {
        val registry = WorkoutRegistry()
        assertTrue(registry.begin("s1"))
        assertTrue(registry.complete("s1"))
        assertTrue(registry.isDuplicate("s1"))
        assertFalse(registry.complete("s1"))
        assertFalse(registry.begin("s1"))
    }

    @Test
    fun exportIsStravaReadyWithoutOauth() {
        val payload = ActivityExportFactory.fromSession(
            sessionId = "s1",
            sport = WorkoutSport.RUN,
            startedAtEpochMs = 1L,
            elapsedMs = 60_000L,
            movingMs = 60_000L,
            distanceM = QaGpsRoute.lengthM,
            averagePaceSecPerKm = 300.0,
            heartRates = QaGpsRoute.HR_FIXTURE_BPM.toList(),
            elevationGainM = 20.0,
            route = QaGpsRoute.POINTS,
            source = DataSourceKind.TEST_FIXTURE,
        )
        assertTrue(payload.stravaReady)
        assertTrue(payload.oauthRequired)
        assertEquals(178, payload.maxHeartRateBpm)
    }

    @Test
    fun startWorkoutAliasNormalizes() {
        val cmd = SessionControlCommand.parse("v=session.v1;op=START_WORKOUT;sport=Hike")
        assertEquals(SessionControlCommand.START, cmd.op)
        assertEquals("Hike", cmd.sportKey)
    }

    @Test
    fun externalVendorsStayPendingHuman() {
        assertEquals(IntegrationStatus.PENDING_HUMAN, ExternalProviderCatalog.garmin.status().integration)
        assertEquals(IntegrationStatus.PENDING_HUMAN, ExternalProviderCatalog.whoop.status().integration)
        assertEquals(IntegrationStatus.PENDING_HUMAN, ExternalProviderCatalog.oura.status().integration)
        assertEquals(IntegrationStatus.BLOCKED_EXTERNAL_DEPENDENCY, ExternalProviderCatalog.xiaomi.status().integration)
    }
}
