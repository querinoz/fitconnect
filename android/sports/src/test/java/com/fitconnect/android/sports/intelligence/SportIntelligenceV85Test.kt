package com.fitconnect.android.sports.intelligence

import com.fitconnect.android.sports.domain.SportId
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SportIntelligenceV85Test {

    @Test
    fun trainCoreRegistryLookupCoversRequiredSports() {
        assertTrue(SportIntelligenceCatalog.trainCoreCovered())
        SportId.TRAIN_CORE.forEach { id ->
            val profile = SportIntelligenceCatalog.require(id)
            assertEquals(id, profile.sportId)
            assertTrue(profile.sessionTypes.isNotEmpty())
            assertTrue(profile.primaryMetrics.isNotEmpty())
        }
        assertEquals("Strength", SportIntelligenceCatalog.require(SportId.STRENGTH).displayName)
        assertEquals("HYROX", SportIntelligenceCatalog.require(SportId.HYROX).displayName)
        assertNotNull(SportIntelligenceCatalog.get(SportId.GYM)) // alias → strength
    }

    @Test
    fun restTimerElapsedUsesWallClockNotTicksAlone() {
        val start = 1_000_000L
        val timer = WallClockRestTimer.start(durationMs = 90_000L, nowWallMs = start)
        assertEquals(90_000L, timer.remainingMs(start))
        assertEquals(0L, timer.elapsedMs(start))

        val mid = start + 30_000L
        assertEquals(60_000L, timer.remainingMs(mid))
        assertEquals(30_000L, timer.elapsedMs(mid))

        // Jump ahead without intermediate ticks — wall clock still correct
        val late = start + 90_000L
        assertEquals(0L, timer.remainingMs(late))
        assertTrue(timer.isComplete(late))

        val frozen = timer.freeze(start + 20_000L)
        assertEquals(70_000L, frozen.remainingMs(start + 50_000L)) // frozen ignores wall advance
        val resumed = frozen.resume(start + 50_000L)
        assertEquals(70_000L, resumed.remainingMs(start + 50_000L))
        assertEquals(60_000L, resumed.remainingMs(start + 60_000L))
    }

    @Test
    fun adaptationExplanationIsHonestWithoutInventedBiometrics() {
        val available = SessionAdaptation.explain(
            sportId = SportId.RUNNING,
            sessionType = "tempo",
            readiness = HonestMetric.available(72),
        )
        assertTrue(available.contains("readiness 72"))
        assertTrue(available.contains("tempo"))

        val missing = SessionAdaptation.explain(
            sportId = SportId.STRENGTH,
            sessionType = "hypertrophy",
            readiness = HonestMetric.missing(),
        )
        assertTrue(missing.contains("readiness missing"))
        assertFalse(missing.contains("readiness 0"))

        val notConnected = SessionAdaptation.explain(
            sportId = SportId.HYROX,
            sessionType = "station_practice",
            readiness = HonestMetric.notConnected(),
            priorSessionType = "easy",
        )
        assertTrue(notConnected.contains("not connected"))
        assertTrue(notConnected.contains("prior easy"))
    }

    @Test
    fun honestyStatesNeverCarryValueUnlessAvailable() {
        assertEquals(HonestyStatus.NOT_CONNECTED, HonestMetric.notConnected<Int>().status)
        assertNull(HonestMetric.notConnected<Int>().value)
        assertEquals(HonestyStatus.MISSING, HonestMetric.missing<Int>().status)
        assertEquals(HonestyStatus.UNAVAILABLE, HonestMetric.unavailable<Int>().status)
        assertEquals(HonestyStatus.LOADING, HonestMetric.loading<Int>().status)
        assertEquals(HonestyStatus.ERROR, HonestMetric.error<Int>().status)
        assertEquals(72, HonestMetric.available(72).value)

        val fromNull = HonestMetric.fromNullable<Int>(null)
        assertEquals(HonestyStatus.MISSING, fromNull.status)
        assertEquals("—", fromNull.displayOrDash())

        val bundle = SessionHonestyBundle(
            readiness = HonestMetric.available(80),
            heartRateBpm = HonestMetric.notConnected(),
            caloriesKcal = HonestMetric.missing(),
        )
        assertEquals("80", bundle.readinessDisplay())
        assertEquals("—", bundle.hrDisplay())
        assertEquals("—", bundle.caloriesDisplay())
    }

    @Test
    fun stateMachineTransitionsAndCrashRecovery() {
        val clock = object : WorkoutWallClock {
            var now = 5_000L
            override fun nowMs(): Long = now
        }
        val store = BlobActiveWorkoutStore(MemoryActiveWorkoutBlobBackend())
        val controller = ActiveWorkoutController(store, clock)

        val rec = SportIntelligenceCatalog.recommendToday(
            sportId = SportId.STRENGTH,
            honesty = SessionHonestyBundle(readiness = HonestMetric.available(68)),
        )
        var result = controller.dispatch(ActiveWorkoutCommand.Preview(rec, sessionId = "s1"))
        assertEquals(ActiveWorkoutPhase.PREVIEW, result.state.phase)
        assertNull(result.rejected)

        result = controller.dispatch(ActiveWorkoutCommand.StartWarmup)
        assertEquals(ActiveWorkoutPhase.WARMUP, result.state.phase)

        result = controller.dispatch(ActiveWorkoutCommand.StartActive)
        assertEquals(ActiveWorkoutPhase.ACTIVE, result.state.phase)

        result = controller.dispatch(ActiveWorkoutCommand.CompleteSet(restDurationMs = 60_000L))
        assertEquals(ActiveWorkoutPhase.REST, result.state.phase)
        assertEquals(ActiveWorkoutHaptic.SET_COMPLETE, result.haptic)
        assertNotNull(result.state.rest)

        result = controller.dispatch(ActiveWorkoutCommand.Pause)
        assertEquals(ActiveWorkoutPhase.PAUSED, result.state.phase)
        assertTrue(result.state.rest!!.isFrozen())

        // Crash recovery from store
        val recovered = ActiveWorkoutController(store, clock).recoverFromStore()
        assertEquals(ActiveWorkoutPhase.PAUSED, recovered.state.phase)
        assertEquals("s1", recovered.state.sessionId)

        result = controller.dispatch(ActiveWorkoutCommand.Resume)
        assertEquals(ActiveWorkoutPhase.REST, result.state.phase)

        clock.now = result.state.rest!!.endsAtWallMs
        result = controller.dispatch(ActiveWorkoutCommand.Tick)
        assertEquals(ActiveWorkoutPhase.ACTIVE, result.state.phase)
        assertEquals(ActiveWorkoutHaptic.REST_COMPLETE, result.haptic)

        result = controller.dispatch(ActiveWorkoutCommand.Complete)
        assertEquals(ActiveWorkoutPhase.COMPLETE, result.state.phase)

        // Illegal transition
        val idle = ActiveWorkoutMachine.reduce(
            ActiveWorkoutSnapshot.idle(),
            ActiveWorkoutCommand.CompleteSet(30_000L),
            clock,
        )
        assertNotNull(idle.rejected)
    }

    @Test
    fun todayRecommendationIncludesExplainableReasons() {
        val rec = SportIntelligenceCatalog.recommendToday(
            sportId = SportId.CROSSFIT,
            honesty = SessionHonestyBundle(readiness = HonestMetric.unavailable("no HC")),
        )
        assertTrue(rec.reasons.isNotEmpty())
        assertTrue(rec.primaryReason().isNotBlank())
        assertTrue(rec.readinessLabel().contains("UNAVAILABLE"))
        assertTrue(rec.estimatedDurationMin > 0)
    }

    @Test
    fun codecRoundTripPreservesSnapshot() {
        val original = ActiveWorkoutSnapshot(
            phase = ActiveWorkoutPhase.REST,
            sportId = SportId.PADEL,
            sessionType = "drills",
            intent = "drills · controlled effort",
            currentAction = "Rest",
            primaryMetricKey = "load",
            primaryMetricLabel = "load",
            nextAction = "Set 2",
            setIndex = 1,
            totalSets = 1,
            rest = WallClockRestTimer.start(45_000L, 10_000L),
            startedAtWallMs = 9_000L,
            honesty = SessionHonestyBundle(
                readiness = HonestMetric.available(55),
                heartRateBpm = HonestMetric.loading(),
            ),
            sessionId = "padel-1",
        )
        val encoded = ActiveWorkoutCodec.encode(original)
        val decoded = ActiveWorkoutCodec.decode(encoded)!!
        assertEquals(original.phase, decoded.phase)
        assertEquals(original.sportId, decoded.sportId)
        assertEquals(original.sessionId, decoded.sessionId)
        assertEquals(original.rest!!.endsAtWallMs, decoded.rest!!.endsAtWallMs)
        assertEquals(55, decoded.honesty.readiness.value)
        assertEquals(HonestyStatus.LOADING, decoded.honesty.heartRateBpm.status)
    }
}
