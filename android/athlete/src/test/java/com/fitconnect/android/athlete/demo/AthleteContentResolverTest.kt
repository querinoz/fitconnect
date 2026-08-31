package com.fitconnect.android.athlete.demo

import com.fitconnect.android.athlete.domain.AthleteDataProvenance
import com.fitconnect.android.athlete.domain.CoachMessage
import com.fitconnect.android.athlete.domain.DailyReadiness
import com.fitconnect.android.athlete.domain.HomeSnapshot
import com.fitconnect.android.athlete.domain.SessionStatus
import com.fitconnect.android.athlete.domain.TrainingSession
import com.fitconnect.android.athlete.domain.WeatherBrief
import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.telemetry.aggregate.AggregationEngine
import com.fitconnect.android.telemetry.integration.AthleteTelemetryFacade
import com.fitconnect.android.telemetry.store.InMemoryTelemetryStore
import com.fitconnect.android.telemetry.time.SystemTelemetryClock
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AthleteContentResolverTest {

    private val athleteId = "ath-test"

    private fun homeSnapshot(readiness: DailyReadiness) = HomeSnapshot(
        greeting = "Good evening, Test",
        readiness = readiness,
        weather = WeatherBrief("Clear", 18),
        nextSession = TrainingSession(
            id = "s1",
            title = "Run",
            sport = SportId.RUNNING,
            scheduledAtEpochMs = 0L,
            durationMin = 45,
            status = SessionStatus.UPCOMING,
            exercises = emptyList(),
            notes = null,
            coachFeedback = null,
            mediaUrls = emptyList(),
        ),
        coachMessage = CoachMessage("m1", "Coach", "Hi", 0L, false),
        tasks = emptyList(),
        recentActivity = emptyList(),
        quickActions = emptyList(),
    )

    private fun readiness(
        recoveryScore: Int = 85,
        hrvMs: Int = AthleteDemoCatalog.FALLBACK_HRV_MS,
        trainingLoad: Double = 0.82,
    ) = DailyReadiness(
        score = recoveryScore,
        recoveryScore = recoveryScore,
        sleepQuality = AthleteDemoCatalog.FALLBACK_SLEEP_QUALITY,
        hrvMs = hrvMs,
        restingHrBpm = AthleteDemoCatalog.FALLBACK_RESTING_HR_BPM,
        trainingLoad = trainingLoad,
        recommendation = "Go easy",
        recoveryRecommendation = "Sleep",
        warnings = emptyList(),
        aiSummary = "Summary",
    )

    private val emptyFacade = AthleteTelemetryFacade(
        InMemoryTelemetryStore(),
        AggregationEngine(InMemoryTelemetryStore()),
        SystemTelemetryClock,
    )

    @Test
    fun marksAllDemoWhenTelemetryEmpty() = runBlocking {
        val ui = AthleteContentResolver.todayReadiness(
            athleteId = athleteId,
            home = homeSnapshot(readiness()),
            telemetry = emptyFacade,
        )
        assertTrue(ui.isAnyDemo)
        assertEquals(AthleteDataProvenance.LOCAL_DEMO, ui.hrvMs.provenance)
        assertEquals(AthleteDemoCatalog.FALLBACK_SLEEP_LABEL, ui.sleepLabel.value)
        assertEquals(AthleteDataProvenance.LOCAL_DEMO, ui.readinessPercent.provenance)
    }

    @Test
    fun readinessChartAppendsLatestScore() {
        val points = AthleteContentResolver.readinessChartPoints(88)
        assertEquals(5, points.size)
        assertEquals(88f, points.last().y)
        assertEquals(4f, points.last().x)
    }

    @Test
    fun discoverMapPreviewUsesCatalogWhenRouteMissing() {
        val ui = AthleteContentResolver.discoverMapPreview(null, null)
        assertTrue(ui.isAnyDemo)
        assertEquals(AthleteDemoCatalog.DISCOVER_MAP_DISTANCE_KM, ui.distanceKm.value, 0.01)
        assertEquals(AthleteDemoCatalog.DISCOVER_MAP_HR_BPM, ui.heartRateBpm.value)
    }

    @Test
    fun vaultBadgesSeparatesShareableAndPrivate() {
        val ui = AthleteContentResolver.vaultBadges()
        assertTrue(ui.isDemo)
        assertTrue(ui.shareableKm > 0.0)
        assertTrue(ui.privateKm > 0.0)
        assertTrue(ui.summary.contains(AthleteDemoCatalog.MODE_LABEL))
    }

    @Test
    fun profileSurfaceMarksDemo() {
        val ui = AthleteContentResolver.profileSurface("Test Athlete")
        assertTrue(ui.isAnyDemo)
        assertEquals(AthleteDataProvenance.LOCAL_DEMO, ui.displayName.provenance)
        assertEquals(AthleteDemoCatalog.HEXATAR_DETERMINISTIC_NOTE, ui.hexatarNote)
    }

    @Test
    fun trainSurfaceDetectsDemoCapture() {
        val demo = AthleteContentResolver.trainSurface(AthleteDemoCatalog.TRAIN_CAPTURE_SOURCE)
        assertTrue(demo.isDemoCapture)
        val live = AthleteContentResolver.trainSurface("HEALTH_CONNECT")
        assertTrue(!live.isDemoCapture)
    }
}
