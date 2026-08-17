package com.fitconnect.ascend.engine

import com.fitconnect.ascend.achievements.AchievementRegistry
import com.fitconnect.ascend.antiabuse.AntiAbuse
import com.fitconnect.ascend.challenges.ChallengeCatalog
import com.fitconnect.ascend.conversions.ConversionEngine
import com.fitconnect.ascend.dna.DnaLogic
import com.fitconnect.ascend.domain.AchievementProgress
import com.fitconnect.ascend.domain.AscendPrefs
import com.fitconnect.ascend.domain.Challenge
import com.fitconnect.ascend.domain.ChallengeLifecycle
import com.fitconnect.ascend.domain.CriterionKind
import com.fitconnect.ascend.domain.Mission
import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.PerformanceEventType
import com.fitconnect.ascend.domain.PerformanceMilestone
import com.fitconnect.ascend.domain.PersonalRecord
import com.fitconnect.ascend.domain.ProcessResult
import com.fitconnect.ascend.domain.ProcessStatus
import com.fitconnect.ascend.domain.ProgressionSnapshot
import com.fitconnect.ascend.domain.RecordKind
import com.fitconnect.ascend.domain.Streak
import com.fitconnect.ascend.domain.StreakKind
import com.fitconnect.ascend.domain.StoredEvent
import com.fitconnect.ascend.domain.XpDimension
import com.fitconnect.ascend.domain.XpExplanation
import com.fitconnect.ascend.levels.LevelTable
import com.fitconnect.ascend.missions.MissionLogic
import com.fitconnect.ascend.motivation.MotivationLogic
import com.fitconnect.ascend.records.RecordLogic
import com.fitconnect.ascend.store.AscendStore
import com.fitconnect.ascend.store.InMemoryAscendStore
import com.fitconnect.ascend.streaks.StreakLogic

class AscendEngine(
    private val store: AscendStore = InMemoryAscendStore(),
    private val scoring: XpScoringModel = XpScoringModel.V1,
    private val clockMs: () -> Long = { System.currentTimeMillis() },
    private val demoLabeledUsers: Set<String> = emptySet(),
) {
    fun snapshot(userId: String): ProgressionSnapshot = project(userId).snapshot

    fun process(event: PerformanceEvent, online: Boolean = true): ProcessResult {
        val previous = project(event.userId)
        val now = clockMs()
        val verdict = AntiAbuse.validate(event, now)
        val stored = StoredEvent(
            event = event,
            accepted = verdict.accepted,
            rejectReason = verdict.reason,
            processedAtEpochMs = now,
        )
        if (!store.append(stored)) {
            return previous.result(
                status = ProcessStatus.DUPLICATE,
                awardedXp = 0,
                explanations = emptyList(),
                newAchievementIds = emptyList(),
                newRecordKinds = emptyList(),
                leveledUp = false,
                previousLevel = previous.snapshot.level.level,
            )
        }
        if (!online) {
            store.enqueueOffline(stored)
        }
        val next = project(event.userId)
        if (!verdict.accepted) {
            return next.result(
                status = ProcessStatus.REJECTED,
                awardedXp = 0,
                explanations = emptyList(),
                newAchievementIds = emptyList(),
                newRecordKinds = emptyList(),
                leveledUp = false,
                previousLevel = previous.snapshot.level.level,
                rejectReason = verdict.reason,
            )
        }
        val newAchievements = next.snapshot.achievements
            .filter { it.unlocked && previous.snapshot.achievements.none { old -> old.definition.id == it.definition.id && old.unlocked } }
            .map { it.definition.id }
        val newRecords = next.snapshot.records.map { it.kind } - previous.snapshot.records.map { it.kind }.toSet()
        val awarded = next.snapshot.totalXp - previous.snapshot.totalXp
        return next.result(
            status = ProcessStatus.APPLIED,
            awardedXp = awarded.coerceAtLeast(0),
            explanations = next.lastExplanations,
            newAchievementIds = newAchievements,
            newRecordKinds = newRecords.toList(),
            leveledUp = next.snapshot.level.level > previous.snapshot.level.level,
            previousLevel = previous.snapshot.level.level,
            dampedForRecovery = next.lastDamped,
        )
    }

    fun joinChallenge(userId: String, challengeId: String): ProgressionSnapshot {
        joined.getOrPut(userId) { mutableSetOf() }.add(challengeId)
        return project(userId).snapshot
    }

    fun setPrefs(userId: String, prefs: AscendPrefs) {
        store.savePrefs(userId, prefs)
    }

    fun pendingReconcile(userId: String): Int = store.queued(userId).size

    fun squadChallenge(challengeId: String, memberIds: List<String>): Challenge? {
        val pieces = memberIds.mapNotNull { id ->
            snapshot(id).challenges.firstOrNull { it.id == challengeId }
        }
        if (pieces.isEmpty()) return null
        val contributions = linkedMapOf<String, Double>()
        memberIds.forEach { member ->
            val piece = pieces.firstOrNull { member in it.contributions.keys }
            val amount = piece?.contributions?.get(member)
                ?: snapshot(member).challenges.firstOrNull { it.id == challengeId }?.progress
            if (amount != null && amount > 0.0) contributions[member] = amount
        }
        pieces.forEach { contributions.putAll(it.contributions) }
        return pieces.first().copy(
            progress = contributions.values.sum(),
            contributions = contributions,
        )
    }

    fun assignCoachMission(userId: String, mission: Mission) {
        coachMissions.getOrPut(userId) { mutableListOf() }.add(mission)
    }

    private val joined = mutableMapOf<String, MutableSet<String>>()
    private val coachMissions = mutableMapOf<String, MutableList<Mission>>()

    private data class Projection(
        val snapshot: ProgressionSnapshot,
        val challenges: List<Challenge>,
        val lastExplanations: List<XpExplanation>,
        val lastDamped: Boolean,
    )

    private fun Projection.result(
        status: ProcessStatus,
        awardedXp: Int,
        explanations: List<XpExplanation>,
        newAchievementIds: List<String>,
        newRecordKinds: List<RecordKind>,
        leveledUp: Boolean,
        previousLevel: Int,
        rejectReason: String? = null,
        dampedForRecovery: Boolean = false,
    ) = ProcessResult(
        status = status,
        snapshot = snapshot,
        awardedXp = awardedXp,
        explanations = explanations,
        newAchievementIds = newAchievementIds,
        newRecordKinds = newRecordKinds,
        leveledUp = leveledUp,
        previousLevel = previousLevel,
        rejectReason = rejectReason,
        dampedForRecovery = dampedForRecovery,
    )

    private fun project(userId: String): Projection {
        val now = clockMs()
        val demo = userId in demoLabeledUsers || userId == "ath-1" || userId.endsWith("@fitconnect.demo")
        val stored = store.events(userId)
        var totalXp = 0
        val dimensionXp = mutableMapOf<XpDimension, Int>()
        var streaks = emptyMap<StreakKind, Streak>()
        var records = emptyMap<RecordKind, PersonalRecord>()
        val sports = linkedSetOf<String>()
        val routes = linkedSetOf<String>()
        val unlocked = linkedMapOf<String, Long>()
        var missions = MissionLogic.ensurePeriodMissions(coachMissions[userId].orEmpty(), now)
        var challenges = ChallengeCatalog.defaults(now).map { challenge ->
            if (challenge.id in joined[userId].orEmpty() &&
                challenge.lifecycle == ChallengeLifecycle.AVAILABLE
            ) {
                challenge.copy(lifecycle = ChallengeLifecycle.JOINED)
            } else {
                challenge
            }
        }
        val acceptedEvents = mutableListOf<PerformanceEvent>()
        var lastExplanations = emptyList<XpExplanation>()
        var lastDamped = false
        var lastCalories = 0
        var lastDistance = 0.0
        var lastElev = 0.0
        var lastDuration = 0L
        val milestones = mutableListOf<PerformanceMilestone>()
        var cardio = 0
        var longestKm = 0.0
        var elevationTotal = 0.0

        stored.forEach { row ->
            if (!row.accepted) return@forEach
            val event = row.event
            acceptedEvents += event
            val award = XpCalculator.award(event, scoring)
            lastExplanations = award.explanations
            lastDamped = award.dampedForRecovery
            totalXp += award.total
            award.byDimension.forEach { (dim, pts) ->
                dimensionXp[dim] = (dimensionXp[dim] ?: 0) + pts
            }
            streaks = StreakLogic.apply(streaks, event)
            val weekly = RecordLogic.weeklySessions(acceptedEvents, event.timestampEpochMs)
            val streakDays = streaks[StreakKind.PERFORMANCE]?.days ?: 0
            val recordResult = RecordLogic.apply(records, event, streakDays, weekly)
            records = recordResult.first
            if (event.type == PerformanceEventType.WORKOUT_COMPLETED) {
                lastCalories = event.payload.caloriesKcal
                lastDistance = event.payload.distanceM
                lastElev = event.payload.elevationGainM
                lastDuration = event.payload.durationMs
                event.payload.sport?.let { sports += it.lowercase() }
                event.payload.routeId?.let { routes += it }
                val km = event.payload.distanceM / 1000.0
                if (km > longestKm) longestKm = km
                elevationTotal += event.payload.elevationGainM
                val sport = event.payload.sport?.lowercase().orEmpty()
                if (sport.contains("run") || sport.contains("ride") || sport.contains("swim") || sport.contains("cycle")) {
                    cardio += 1
                }
            }
            val missionResult = MissionLogic.apply(missions, event)
            missions = MissionLogic.ensurePeriodMissions(missionResult.first, event.timestampEpochMs)
            val challengeResult = ChallengeCatalog.apply(challenges, event, event.timestampEpochMs)
            challenges = challengeResult.first
            val facts = Facts(
                workouts = acceptedEvents.count { it.type == PerformanceEventType.WORKOUT_COMPLETED },
                distanceKm = acceptedEvents.filter { it.type == PerformanceEventType.WORKOUT_COMPLETED }
                    .sumOf { it.payload.distanceM } / 1000.0,
                performanceStreak = streaks[StreakKind.PERFORMANCE]?.days ?: 0,
                trainingStreak = streaks[StreakKind.TRAINING]?.days ?: 0,
                sleepStreak = streaks[StreakKind.SLEEP]?.days ?: 0,
                recoveryStreak = streaks[StreakKind.RECOVERY]?.days ?: 0,
                prCount = records.keys.count { it.name.startsWith("FASTEST") },
                sports = sports.size,
                routes = routes.size,
                elevationM = elevationTotal,
                longestKm = longestKm,
                cardioSessions = cardio,
            )
            AchievementRegistry.ALL.forEach { def ->
                if (def.id in unlocked) return@forEach
                val current = facts.valueOf(def.criterion.kind)
                if (current >= def.criterion.threshold) {
                    unlocked[def.id] = event.timestampEpochMs
                    totalXp += def.xpReward
                    dimensionXp[XpDimension.SKILL] = (dimensionXp[XpDimension.SKILL] ?: 0) + def.xpReward
                    milestones += PerformanceMilestone(def.id, def.nameKey, event.timestampEpochMs)
                }
            }
        }

        streaks = StreakLogic.breakGaps(streaks, StreakLogic.utcDay(now))
        val level = LevelTable.resolve(totalXp)
        val achievements = AchievementRegistry.ALL.map { def ->
            val facts = Facts(
                workouts = acceptedEvents.count { it.type == PerformanceEventType.WORKOUT_COMPLETED },
                distanceKm = acceptedEvents.filter { it.type == PerformanceEventType.WORKOUT_COMPLETED }
                    .sumOf { it.payload.distanceM } / 1000.0,
                performanceStreak = streaks[StreakKind.PERFORMANCE]?.days ?: 0,
                trainingStreak = streaks[StreakKind.TRAINING]?.days ?: 0,
                sleepStreak = streaks[StreakKind.SLEEP]?.days ?: 0,
                recoveryStreak = streaks[StreakKind.RECOVERY]?.days ?: 0,
                prCount = records.keys.count { it.name.startsWith("FASTEST") },
                sports = sports.size,
                routes = routes.size,
                elevationM = elevationTotal,
                longestKm = longestKm,
                cardioSessions = cardio,
            )
            AchievementProgress(
                definition = def,
                current = facts.valueOf(def.criterion.kind),
                target = def.criterion.threshold,
                unlockedAtEpochMs = unlocked[def.id],
                demoOwnershipLabel = if (demo) "ach.owned.demo" else null,
            )
        }
        val dna = DnaLogic.compute(acceptedEvents, streaks, sports, routes, demo)
        val remaining = achievements.count { !it.unlocked }
        val motivation = MotivationLogic.profile(
            events = acceptedEvents,
            streaks = streaks,
            unlockedCount = unlocked.size,
            remainingAchievements = remaining,
            newRoutes = routes.size,
            demoLabeled = demo,
        )
        val snapshot = ProgressionSnapshot(
            userId = userId,
            scoringVersion = scoring.version,
            totalXp = totalXp,
            dimensionXp = dimensionXp.toMap(),
            level = level,
            achievements = achievements,
            streaks = StreakKind.entries.map { kind ->
                streaks[kind] ?: Streak(kind, 0, com.fitconnect.ascend.domain.StreakStatus.BROKEN, null)
            },
            missions = missions,
            challenges = challenges,
            records = records.values.sortedBy { it.kind.name },
            dna = dna,
            motivation = motivation,
            energy = ConversionEngine.energy(lastCalories),
            conversions = ConversionEngine.conversions(lastDistance, lastElev, lastDuration, demo),
            segments = listOfNotNull(ConversionEngine.demoSegment(lastElev, lastDistance)),
            unlocks = LevelTable.unlocked(level.level),
            milestones = milestones,
            prefs = store.prefs(userId),
            demoLabeled = demo,
            processedEventCount = stored.size,
            lastEventId = stored.lastOrNull()?.event?.eventId,
        )
        return Projection(snapshot, challenges, lastExplanations, lastDamped)
    }

    private data class Facts(
        val workouts: Int,
        val distanceKm: Double,
        val performanceStreak: Int,
        val trainingStreak: Int,
        val sleepStreak: Int,
        val recoveryStreak: Int,
        val prCount: Int,
        val sports: Int,
        val routes: Int,
        val elevationM: Double,
        val longestKm: Double,
        val cardioSessions: Int,
    ) {
        fun valueOf(kind: CriterionKind): Double = when (kind) {
            CriterionKind.WORKOUTS -> workouts.toDouble()
            CriterionKind.DISTANCE_KM -> distanceKm
            CriterionKind.PERFORMANCE_STREAK_DAYS -> performanceStreak.toDouble()
            CriterionKind.TRAINING_STREAK_DAYS -> trainingStreak.toDouble()
            CriterionKind.SLEEP_STREAK_DAYS -> sleepStreak.toDouble()
            CriterionKind.RECOVERY_STREAK_DAYS -> recoveryStreak.toDouble()
            CriterionKind.PR_COUNT -> prCount.toDouble()
            CriterionKind.SPORT_COUNT -> sports.toDouble()
            CriterionKind.ROUTE_COUNT -> routes.toDouble()
            CriterionKind.ELEVATION_M -> elevationM
            CriterionKind.LONGEST_KM -> longestKm
            CriterionKind.CARDIO_SESSIONS -> cardioSessions.toDouble()
        }
    }
}
