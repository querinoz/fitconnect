package com.fitconnect.ascend

import com.fitconnect.ascend.copy.AscendCopy
import com.fitconnect.ascend.demo.AscendDemo
import com.fitconnect.ascend.domain.AscendPrefs
import com.fitconnect.ascend.domain.ChallengeLifecycle
import com.fitconnect.ascend.domain.EventPayload
import com.fitconnect.ascend.domain.EventSource
import com.fitconnect.ascend.domain.EvidenceKind
import com.fitconnect.ascend.domain.MissionKind
import com.fitconnect.ascend.domain.MissionState
import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.PerformanceEventType
import com.fitconnect.ascend.domain.ProcessStatus
import com.fitconnect.ascend.domain.RecordKind
import com.fitconnect.ascend.domain.StreakKind
import com.fitconnect.ascend.domain.StreakStatus
import com.fitconnect.ascend.engine.AscendEngine
import com.fitconnect.ascend.engine.EventIds
import com.fitconnect.ascend.engine.XpScoringModel
import com.fitconnect.ascend.levels.LevelTable
import com.fitconnect.ascend.store.InMemoryAscendStore
import com.fitconnect.ascend.streaks.StreakLogic
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class AscendEngineTest {
    private val now = 1_800_000_000_000L
    private fun engine() = AscendEngine(
        store = InMemoryAscendStore(),
        clockMs = { now },
        demoLabeledUsers = setOf("u1", AscendDemo.INES),
    )

    private fun workout(
        user: String,
        session: String,
        ts: Long = now,
        distanceM: Double = 5_000.0,
        durationMs: Long = 1_800_000L,
        recovery: Int? = 80,
        pace: Double? = 330.0,
        elevation: Double = 20.0,
        kcal: Int = 400,
        sport: String = "run",
        route: String? = "r1",
    ) = PerformanceEvent(
        eventId = EventIds.workoutCompleted(user, session),
        userId = user,
        type = PerformanceEventType.WORKOUT_COMPLETED,
        timestampEpochMs = ts,
        source = EventSource.PHONE,
        payload = EventPayload(
            sessionId = session,
            sport = sport,
            distanceM = distanceM,
            durationMs = durationMs,
            elevationGainM = elevation,
            caloriesKcal = kcal,
            avgPaceSecPerKm = pace,
            avgHrBpm = 150,
            recoveryScore = recovery,
            routeId = route,
            demo = true,
        ),
    )

    @Test
    fun scoringModelIsVersionedAndWeightsSum100() {
        val model = XpScoringModel.V1
        assertEquals("ascend.xp.v1", model.version)
        assertEquals(100, model.weightsPercent.values.sum())
        assertFalse(model.weightsPercent.containsKey(com.fitconnect.ascend.domain.XpDimension.SLEEP))
    }

    @Test
    fun duplicateEventDoesNotDoubleXp() {
        val engine = engine()
        val first = engine.process(workout("u1", "s1"))
        val second = engine.process(workout("u1", "s1"))
        assertEquals(ProcessStatus.APPLIED, first.status)
        assertEquals(ProcessStatus.DUPLICATE, second.status)
        assertEquals(0, second.awardedXp)
        assertEquals(first.snapshot.totalXp, second.snapshot.totalXp)
    }

    @Test
    fun watchAndPhoneShareCanonicalWorkoutId() {
        assertEquals(
            EventIds.workoutCompleted("ath-1", "sess-9"),
            "ath-1:sess-9:WORKOUT_COMPLETED",
        )
        val engine = engine()
        engine.process(workout("ath-1", "sess-9").copy(source = EventSource.WATCH))
        val again = engine.process(workout("ath-1", "sess-9").copy(source = EventSource.PHONE))
        assertEquals(ProcessStatus.DUPLICATE, again.status)
    }

    @Test
    fun rejectedImpossibleSpeedAwardsZeroXp() {
        val engine = engine()
        val result = engine.process(
            workout("u1", "fast", distanceM = 8_000.0, durationMs = 10_000L),
        )
        assertEquals(ProcessStatus.REJECTED, result.status)
        assertEquals(0, result.awardedXp)
        assertEquals("abuse.impossible_speed", result.rejectReason)
        assertEquals(0, result.snapshot.totalXp)
    }

    @Test
    fun offlineQueueDoesNotDropLocalXp() {
        val engine = engine()
        val result = engine.process(workout("u1", "off"), online = false)
        assertEquals(ProcessStatus.APPLIED, result.status)
        assertTrue(result.awardedXp > 0)
        assertEquals(1, engine.pendingReconcile("u1"))
    }

    @Test
    fun poorRecoveryDampsActivityXp() {
        val engine = engine()
        val healthy = engine.process(workout("h", "a", recovery = 80))
        val strained = engine.process(workout("s", "a", recovery = 20))
        assertTrue(strained.dampedForRecovery)
        assertFalse(healthy.dampedForRecovery)
        assertTrue(strained.awardedXp < healthy.awardedXp)
    }

    @Test
    fun moreDistanceWithPoorRecoveryDoesNotAutomaticallyWin() {
        val engine = engine()
        val quality = engine.process(workout("q", "a", distanceM = 6_000.0, recovery = 82))
        val junk = engine.process(workout("j", "a", distanceM = 18_000.0, recovery = 20))
        assertTrue(junk.dampedForRecovery)
        val healthyActivity = quality.snapshot.dimensionXp[com.fitconnect.ascend.domain.XpDimension.ACTIVITY] ?: 0
        val junkActivity = junk.snapshot.dimensionXp[com.fitconnect.ascend.domain.XpDimension.ACTIVITY] ?: 0
        assertTrue(
            "overtraining must not be the efficient ACTIVITY XP path ($junkActivity vs $healthyActivity)",
            junkActivity < healthyActivity * 2,
        )
    }

    @Test
    fun levelsResolveFromCentralTable() {
        val elite = LevelTable.resolve(2_840)
        assertEquals(7, elite.level)
        assertEquals("07", elite.rank.code)
        assertEquals("rank.elite", elite.rank.nameKey)
        assertTrue(elite.xpToNext > 0)
        assertNotNull(elite.nextUnlock)
        assertEquals(15, LevelTable.resolve(30_000).level)
        assertEquals(0, LevelTable.resolve(30_000).xpToNext)
    }

    @Test
    fun recoveryDayProtectsPerformanceStreak() {
        val engine = engine()
        engine.process(workout("u1", "d1", ts = now - StreakLogic.DAY_MS))
        engine.process(
            PerformanceEvent(
                eventId = EventIds.typed("u1", "RECOVERY_DAY", "x"),
                userId = "u1",
                type = PerformanceEventType.RECOVERY_DAY,
                timestampEpochMs = now,
                source = EventSource.LOCAL_DEMO,
                payload = EventPayload(isRecoveryDay = true, recoveryScore = 90, demo = true),
            ),
        )
        val streak = engine.snapshot("u1").streaks.first { it.kind == StreakKind.PERFORMANCE }
        assertEquals(2, streak.days)
        assertEquals(StreakStatus.RECOVERY_PROTECTED, streak.status)
        val training = engine.snapshot("u1").streaks.first { it.kind == StreakKind.TRAINING }
        assertEquals(1, training.days)
    }

    @Test
    fun missedDayBreaksStreak() {
        val engine = engine()
        engine.process(workout("u1", "old", ts = now - 3 * StreakLogic.DAY_MS))
        val streak = engine.snapshot("u1").streaks.first { it.kind == StreakKind.PERFORMANCE }
        assertEquals(StreakStatus.BROKEN, streak.status)
        assertEquals(0, streak.days)
    }

    @Test
    fun recordsKeepHistoryAndIgnoreWorseValues() {
        val engine = engine()
        engine.process(workout("u1", "a", distanceM = 8_000.0, pace = 320.0))
        val first = engine.snapshot("u1").records.first { it.kind == RecordKind.LONGEST_ACTIVITY }
        engine.process(workout("u1", "b", ts = now + 1, distanceM = 5_000.0, pace = 400.0))
        val second = engine.snapshot("u1").records.first { it.kind == RecordKind.LONGEST_ACTIVITY }
        assertEquals(8.0, second.value, 0.01)
        assertEquals(first.timestampEpochMs, second.timestampEpochMs)
    }

    @Test
    fun firstWorkoutUnlocksSignalAndDistanceClub() {
        val engine = engine()
        val result = engine.process(workout("u1", "s", distanceM = 10_200.0))
        assertTrue(result.newAchievementIds.contains("first_session"))
        assertTrue(result.snapshot.achievements.any { it.definition.id == "club_10" && it.unlocked })
        assertEquals("ach.owned.demo", result.snapshot.achievements.first().demoOwnershipLabel)
    }

    @Test
    fun dnaIsDeterministicAndUnclassifiedWithoutHistory() {
        val engine = engine()
        val empty = engine.snapshot("fresh")
        assertEquals(EvidenceKind.INSUFFICIENT_DATA, empty.dna.evidence)
        engine.process(workout("fresh", "1", distanceM = 12_000.0))
        engine.process(workout("fresh", "2", ts = now + 1, distanceM = 11_000.0))
        engine.process(workout("fresh", "3", ts = now + 2, distanceM = 11_500.0))
        val dna = engine.snapshot("fresh").dna
        val again = engine.snapshot("fresh").dna
        assertEquals(dna, again)
        assertNotEquals(com.fitconnect.ascend.domain.AthleteType.UNCLASSIFIED, dna.athleteType)
        assertTrue(dna.scores.values.all { it in 0..99 })
    }

    @Test
    fun energyDisclaimerIsNotAFoodReward() {
        val engine = engine()
        engine.process(workout("u1", "s", kcal = 627))
        val energy = engine.snapshot("u1").energy
        assertNotNull(energy)
        assertEquals("energy.deployed", energy!!.labelKey)
        assertEquals("energy.disclaimer", energy.disclaimerKey)
        val copy = AscendCopy.t("en", energy.disclaimerKey)
        assertTrue(copy.contains("Not a nutritional"))
        assertFalse(copy.contains("earned food", ignoreCase = true))
    }

    @Test
    fun portoConversionAndDemoSegmentAreLabeled() {
        val engine = engine()
        engine.process(workout("u1", "s", distanceM = 9_200.0, elevation = 40.0))
        val snap = engine.snapshot("u1")
        assertTrue(snap.conversions.any { it.headlineKey == "convert.porto_matosinhos" && it.demoLabeled })
        assertTrue(snap.segments.all { it.demoLabeled })
    }

    @Test
    fun dailyMissionCompletesOnWorkoutOrRecovery() {
        val engine = engine()
        engine.process(workout("u1", "s"))
        val daily = engine.snapshot("u1").missions.first { it.kind == MissionKind.DAILY }
        assertEquals(MissionState.COMPLETED, daily.state)
    }

    @Test
    fun challengeJoinProgressAndExpiry() {
        val engine = engine()
        engine.joinChallenge("u1", "local-distance-week")
        engine.process(workout("u1", "s", distanceM = 12_000.0))
        val active = engine.snapshot("u1").challenges.first { it.id == "local-distance-week" }
        assertEquals(ChallengeLifecycle.ACTIVE, active.lifecycle)
        assertEquals(12_000.0, active.progress, 0.1)
        val expired = com.fitconnect.ascend.challenges.ChallengeCatalog.apply(
            listOf(
                active.copy(
                    lifecycle = ChallengeLifecycle.JOINED,
                    expiresAtEpochMs = now - 1,
                ),
            ),
            workout("u1", "later"),
            now,
        ).first.first()
        assertEquals(ChallengeLifecycle.EXPIRED, expired.lifecycle)
    }

    @Test
    fun inesDemoIsDeterministicAndLabeled() {
        val engine = engine()
        AscendDemo.seed(engine, AscendDemo.INES, now)
        val snap = engine.snapshot(AscendDemo.INES)
        assertTrue(snap.demoLabeled)
        assertTrue(snap.totalXp > 0)
        assertTrue(snap.level.level >= 1)
        AscendDemo.seed(engine, AscendDemo.INES, now)
        assertEquals(snap.totalXp, engine.snapshot(AscendDemo.INES).totalXp)
    }

    @Test
    fun prefsDoNotAffectXp() {
        val engine = engine()
        engine.setPrefs("u1", AscendPrefs(hapticsEnabled = false, progressionNotificationsEnabled = false))
        engine.process(workout("u1", "s"))
        val snap = engine.snapshot("u1")
        assertFalse(snap.prefs.hapticsEnabled)
        assertTrue(snap.totalXp > 0)
    }

    @Test
    fun copyFallsBackToEnglish() {
        assertEquals("INITIATE", AscendCopy.t("en", "rank.initiate"))
        assertEquals("INICIANTE", AscendCopy.t("pt", "rank.initiate"))
        assertEquals("INITIATE", AscendCopy.t("de", "rank.initiate"))
    }

    @Test
    fun healthUnlocksAreNeverSafetyCritical() {
        assertTrue(LevelTable.UNLOCKS.none { it.safetyCritical })
    }
}
