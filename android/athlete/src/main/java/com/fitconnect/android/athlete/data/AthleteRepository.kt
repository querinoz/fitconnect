package com.fitconnect.android.athlete.data

import com.fitconnect.android.athlete.domain.Achievement
import com.fitconnect.android.athlete.domain.AthleteGoal
import com.fitconnect.android.athlete.domain.AthleteProfile
import com.fitconnect.android.athlete.domain.AthleteTask
import com.fitconnect.android.athlete.domain.BodyMetrics
import com.fitconnect.android.athlete.domain.CoachCard
import com.fitconnect.android.athlete.domain.CoachMessage
import com.fitconnect.android.athlete.domain.DailyReadiness
import com.fitconnect.android.athlete.domain.ExerciseItem
import com.fitconnect.android.athlete.domain.HomeSnapshot
import com.fitconnect.android.athlete.domain.NotificationItem
import com.fitconnect.android.athlete.domain.ProgramEnrollment
import com.fitconnect.android.athlete.domain.RecoveryPoint
import com.fitconnect.android.athlete.domain.RecoverySnapshot
import com.fitconnect.android.athlete.domain.SessionStatus
import com.fitconnect.android.athlete.domain.TrainingSession
import com.fitconnect.android.athlete.domain.WeatherBrief
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.foundation.offline.OfflineCoordinator
import com.fitconnect.android.foundation.offline.SyncWork
import com.fitconnect.android.geo.catalog.PlacesCatalog
import com.fitconnect.android.geo.di.GeoContainer
import com.fitconnect.android.geo.domain.DiscoveryQuery
import com.fitconnect.android.geo.domain.PlaceKind
import com.fitconnect.android.sports.di.SportsContainer
import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.sports.performance.LoadSeries
import com.fitconnect.android.sports.performance.ReadinessInputs
import com.fitconnect.android.telemetry.integration.AthleteTelemetryFacade
import com.fitconnect.shared.identity.LocalDemoIdentity
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.roundToInt

interface AthleteRepository {
    suspend fun home(): AppResult<HomeSnapshot>
    suspend fun recovery(): AppResult<RecoverySnapshot>
    suspend fun sessions(): AppResult<List<TrainingSession>>
    suspend fun session(id: String): AppResult<TrainingSession>
    suspend fun programs(): AppResult<List<ProgramEnrollment>>
    suspend fun discoverCoaches(
        specialty: String? = null,
        maxDistanceKm: Double? = null,
        language: String? = null,
        verifiedOnly: Boolean = false,
    ): AppResult<List<CoachCard>>
    suspend fun profile(): AppResult<AthleteProfile>
    suspend fun goals(): AppResult<List<AthleteGoal>>
    suspend fun achievements(): AppResult<List<Achievement>>
    suspend fun bodyMetrics(): AppResult<BodyMetrics>
    suspend fun messages(): AppResult<List<CoachMessage>>
    suspend fun notifications(): AppResult<List<NotificationItem>>
    suspend fun toggleTask(taskId: String): AppResult<Unit>
    suspend fun enrollProgram(programId: String): AppResult<Unit>
}

/**
 * Offline-first local OS data. Serves complete Athlete OS surfaces; sync work
 * is queued when mutations happen offline.
 */
class LocalAthleteRepository(
    private val connectivity: ConnectivityMonitor,
    private val offline: OfflineCoordinator,
    private val sports: SportsContainer,
    private val geo: GeoContainer,
    private val telemetry: AthleteTelemetryFacade,
) : AthleteRepository {

    private val cache = ConcurrentHashMap<String, Any>()
    private val tasks = mutableListOf(
        AthleteTask("t1", "Morning HRV check-in", false),
        AthleteTask("t2", "Hydrate 2.5L", false),
        AthleteTask("t3", "Mobility 10 min", true),
    )

    private val sessions = listOf(
        TrainingSession(
            id = "s1",
            title = "Threshold intervals",
            sport = SportId.RUNNING,
            scheduledAtEpochMs = System.currentTimeMillis() + 3_600_000,
            durationMin = 55,
            status = SessionStatus.UPCOMING,
            exercises = listOf(
                ExerciseItem("Warm-up", "12 min easy"),
                ExerciseItem("Intervals", "5×4 min @ threshold"),
                ExerciseItem("Cool-down", "10 min easy"),
            ),
            notes = "Keep form tall on last two reps.",
            coachFeedback = null,
            mediaUrls = emptyList(),
        ),
        TrainingSession(
            id = "s2",
            title = "Aerobic endurance",
            sport = SportId.CYCLING,
            scheduledAtEpochMs = System.currentTimeMillis() - 86_400_000,
            durationMin = 90,
            status = SessionStatus.COMPLETED,
            exercises = listOf(ExerciseItem("Endurance", "Z2 steady")),
            notes = null,
            coachFeedback = "Great pacing — TSS on target.",
            mediaUrls = listOf("attachment://session-s2"),
        ),
    )

    override suspend fun home(): AppResult<HomeSnapshot> {
        val loads = LoadSeries(listOf(45.0, 52.0, 48.0, 70.0, 55.0, 60.0, 62.0, 58.0))
        // Normalized telemetry drives readiness; deterministic baseline until a
        // provider has synced data for this athlete.
        val vitals = telemetry.readinessVitals(ATHLETE_ID)
        val inputs = ReadinessInputs(
            hrvMs = vitals.hrvMs?.roundToInt() ?: 64,
            sleepQuality = vitals.sleepMinutes?.let { ((it / 480.0) * 100).coerceIn(0.0, 100.0).roundToInt() } ?: 86,
            restingHrBpm = vitals.restingHr?.roundToInt() ?: 48,
            subjective = 80,
            acuteLoad = 0.0,
            chronicLoad = 0.0,
        )
        val perf = sports.athleteFacade.performance("ath-1", inputs, loads)
        val readiness = DailyReadiness(
            score = perf.readiness,
            recoveryScore = perf.recoveryScore,
            sleepQuality = inputs.sleepQuality,
            hrvMs = inputs.hrvMs,
            restingHrBpm = inputs.restingHrBpm,
            trainingLoad = perf.trainingLoad / 100.0,
            recommendation = perf.recommendations.firstOrNull().orEmpty(),
            recoveryRecommendation = "Prioritize 8h sleep; limit late caffeine.",
            warnings = listOfNotNull(
                if (perf.risk != "low") "Load risk ${perf.risk} — watch tomorrow's load." else null,
            ),
            aiSummary = "Readiness ${perf.readiness}. Trend ${perf.trend}. ${perf.recommendations.joinToString(" ")}",
        )
        val snap = HomeSnapshot(
            greeting = "Good evening, Inês",
            readiness = readiness,
            weather = WeatherBrief("Clear · light wind", 18),
            nextSession = sessions.first { it.status == SessionStatus.UPCOMING },
            coachMessage = CoachMessage(
                id = "m1",
                from = "Coach Maya",
                preview = "Let's keep today sharp but short — trust the plan.",
                atEpochMs = System.currentTimeMillis() - 1_800_000,
                unread = true,
            ),
            tasks = tasks.toList(),
            recentActivity = listOf(
                "Completed · Aerobic endurance · yesterday",
                "HRV morning sample · 64 ms",
                "Hydration logged · 1.8 L",
            ),
            quickActions = listOf("Start session", "Log sleep", "Message coach", "Check readiness"),
        )
        cache["home"] = snap
        return AppResult.Ok(snap)
    }

    override suspend fun recovery(): AppResult<RecoverySnapshot> {
        val vitals = telemetry.readinessVitals(ATHLETE_ID)
        val snap = RecoverySnapshot(
            score = 78,
            sleepQuality = vitals.sleepMinutes?.let { ((it / 480.0) * 100).coerceIn(0.0, 100.0).roundToInt() } ?: 86,
            hrvMs = vitals.hrvMs?.roundToInt() ?: 64,
            restingHrBpm = vitals.restingHr?.roundToInt() ?: 48,
            timeline = listOf(
                RecoveryPoint("Mon", 72),
                RecoveryPoint("Tue", 68),
                RecoveryPoint("Wed", 74),
                RecoveryPoint("Thu", 80),
                RecoveryPoint("Fri", 78),
            ),
            recommendations = listOf(
                "Keep bedtime before 23:00",
                "Add 10 min nasal breathing post-session",
            ),
            warnings = listOf("Two hard days stacked — protect tomorrow"),
        )
        cache["recovery"] = snap
        return AppResult.Ok(snap)
    }

    override suspend fun sessions(): AppResult<List<TrainingSession>> {
        cache["sessions"] = sessions
        return AppResult.Ok(sessions)
    }

    override suspend fun session(id: String): AppResult<TrainingSession> {
        val found = sessions.find { it.id == id }
            ?: return AppResult.Err(
                com.fitconnect.android.foundation.common.AppError.Unexpected("Session not found"),
            )
        return AppResult.Ok(found)
    }

    override suspend fun programs(): AppResult<List<ProgramEnrollment>> =
        AppResult.Ok(
            listOf(
                ProgramEnrollment(
                    id = "p1",
                    title = "VO2 Build · 8 weeks",
                    currentWeek = 3,
                    totalWeeks = 8,
                    progressPercent = 34,
                    nextWorkoutTitle = "Threshold intervals",
                    milestones = listOf("Week 1 base", "First threshold block", "Mid-volume check"),
                ),
            ),
        )

    override suspend fun discoverCoaches(
        specialty: String?,
        maxDistanceKm: Double?,
        language: String?,
        verifiedOnly: Boolean,
    ): AppResult<List<CoachCard>> {
        val sportId = specialty?.let { raw ->
            sports.registry.discover(raw).firstOrNull()?.id
        }
        val hits = geo.discovery.search(
            DiscoveryQuery(
                kinds = setOf(PlaceKind.COACH),
                center = geo.location.lastKnown()?.point ?: PlacesCatalog.defaultDevAnchor(),
                radiusKm = maxDistanceKm,
                sportId = sportId,
                language = language,
                verifiedOnly = verifiedOnly,
            ),
        )
        val cards = hits.map { hit ->
            CoachCard(
                id = hit.place.id,
                name = hit.place.name,
                specialties = hit.place.sportIds.map { sports.registry.require(it).displayName },
                languages = hit.place.languages,
                rating = hit.place.rating,
                distanceKm = hit.distanceKm ?: 0.0,
                verified = hit.place.verified,
                available = hit.place.availableNow,
                priceTier = hit.place.priceTier,
                city = hit.place.city.ifBlank { "Lisbon" },
            )
        }.filter { coach ->
            specialty == null || coach.specialties.any { it.contains(specialty, ignoreCase = true) }
        }
        return AppResult.Ok(cards)
    }

    override suspend fun profile(): AppResult<AthleteProfile> =
        AppResult.Ok(
            AthleteProfile(
                id = "ath-1",
                displayName = "Inês Costa",
                sports = listOf(SportId.RUNNING, SportId.CYCLING, SportId.GYM),
                goals = listOf("Sub-40 10K", "Build aerobic base"),
                medicalNotes = "No contraindications on file",
                emergencyContact = "Sam Rivera · +1 555 0100",
                localeTag = "en",
                subscriptionTier = "Elite",
            ),
        )

    override suspend fun goals(): AppResult<List<AthleteGoal>> =
        AppResult.Ok(
            listOf(
                AthleteGoal("g1", "Sub-40 10K", 62),
                AthleteGoal("g2", "Consistency · 5 sessions/week", 80),
            ),
        )

    override suspend fun achievements(): AppResult<List<Achievement>> =
        AppResult.Ok(
            listOf(
                Achievement("a1", "7-day streak", true),
                Achievement("a2", "First threshold block", true),
                Achievement("a3", "VO2 PR", false),
            ),
        )

    override suspend fun bodyMetrics(): AppResult<BodyMetrics> =
        AppResult.Ok(BodyMetrics(weightKg = 71.2, hydrationLiters = 1.8, nutritionKcal = 2140))

    override suspend fun messages(): AppResult<List<CoachMessage>> =
        AppResult.Ok(
            listOf(
                CoachMessage("m1", "Coach Maya", "Let's keep today sharp but short — trust the plan.", System.currentTimeMillis() - 1_800_000, true),
                CoachMessage("m2", "Coach Maya", "Sleep looks solid. Nice work.", System.currentTimeMillis() - 90_000_000, false),
            ),
        )

    override suspend fun notifications(): AppResult<List<NotificationItem>> =
        AppResult.Ok(
            listOf(
                NotificationItem("n1", "Session in 1 hour", "Threshold intervals", "fitconnect://app/athlete/training/s1"),
                NotificationItem("n2", "Recovery insight", "HRV stable vs 7-day baseline", "fitconnect://app/athlete/recovery"),
            ),
        )

    override suspend fun toggleTask(taskId: String): AppResult<Unit> {
        val idx = tasks.indexOfFirst { it.id == taskId }
        if (idx < 0) {
            return AppResult.Err(com.fitconnect.android.foundation.common.AppError.Unexpected("Task missing"))
        }
        tasks[idx] = tasks[idx].copy(done = !tasks[idx].done)
        if (!connectivity.online.value) {
            offline.enqueue(
                SyncWork(
                    type = "athlete.task.toggle",
                    payloadJson = """{"id":"$taskId"}""",
                    idempotencyKey = "athlete.task.toggle:$taskId:${System.currentTimeMillis() / 60_000}",
                ),
            )
        }
        cache.remove("home")
        return AppResult.Ok(Unit)
    }

    override suspend fun enrollProgram(programId: String): AppResult<Unit> {
        if (!connectivity.online.value) {
            offline.enqueue(
                SyncWork(
                    type = "athlete.program.enroll",
                    payloadJson = """{"id":"$programId"}""",
                    idempotencyKey = "athlete.program.enroll:$programId",
                    conflictStrategy = com.fitconnect.android.foundation.offline.ConflictStrategy.SERVER_AUTHORITATIVE,
                ),
            )
        }
        return AppResult.Ok(Unit)
    }

    companion object {
        const val ATHLETE_ID = LocalDemoIdentity.ATHLETE_ID
    }
}
