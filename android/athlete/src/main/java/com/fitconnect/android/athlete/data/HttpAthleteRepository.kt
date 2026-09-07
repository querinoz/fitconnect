package com.fitconnect.android.athlete.data

import com.fitconnect.android.athlete.domain.Achievement
import com.fitconnect.android.athlete.domain.AthleteGoal
import com.fitconnect.android.athlete.domain.AthleteProfile
import com.fitconnect.android.athlete.domain.AthleteTask
import com.fitconnect.android.athlete.domain.BodyMetrics
import com.fitconnect.android.athlete.domain.CoachCard
import com.fitconnect.android.athlete.domain.CoachMessage
import com.fitconnect.android.athlete.domain.DailyReadiness
import com.fitconnect.android.athlete.domain.HomeSnapshot
import com.fitconnect.android.athlete.domain.NotificationItem
import com.fitconnect.android.athlete.domain.ProgramEnrollment
import com.fitconnect.android.athlete.domain.RecoveryPoint
import com.fitconnect.android.athlete.domain.RecoverySnapshot
import com.fitconnect.android.athlete.domain.SessionStatus
import com.fitconnect.android.athlete.domain.TrainingSession
import com.fitconnect.android.athlete.domain.WeatherBrief
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.foundation.session.SessionStore
import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.telemetry.integration.AthleteTelemetryFacade
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant
import kotlin.math.roundToInt

/**
 * Canonical remote athlete surfaces. LOCAL_DEMO uses [localFallback] only.
 * Never invents Inês / seed metrics for Firebase sessions.
 */
class HttpAthleteRepository(
    private val api: () -> ApiClient,
    private val sessionStore: SessionStore,
    private val telemetry: AthleteTelemetryFacade,
    private val localFallback: AthleteRepository? = null,
) : AthleteRepository {

    private suspend fun athleteId(): String? = sessionStore.snapshot().userId

    private suspend fun useLocal(): Boolean =
        sessionStore.snapshot().isLocalDemo && localFallback != null

    override suspend fun home(): AppResult<HomeSnapshot> {
        if (useLocal()) return localFallback!!.home()
        val uid = athleteId()
            ?: return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        val readiness = loadReadiness(uid)
        val sessions = when (val s = sessions()) {
            is AppResult.Ok -> s.value
            is AppResult.Err -> emptyList()
        }
        val messages = when (val m = messages()) {
            is AppResult.Ok -> m.value
            is AppResult.Err -> emptyList()
        }
        val profile = when (val p = profile()) {
            is AppResult.Ok -> p.value
            is AppResult.Err -> null
        }
        val name = profile?.displayName?.takeIf { it.isNotBlank() } ?: "Athlete"
        return AppResult.Ok(
            HomeSnapshot(
                greeting = "Hello, $name",
                readiness = readiness,
                weather = WeatherBrief("Unavailable", 0),
                nextSession = sessions.firstOrNull { it.status == SessionStatus.UPCOMING },
                coachMessage = messages.firstOrNull(),
                tasks = emptyList(),
                recentActivity = sessions.take(3).map {
                    "${it.status.name.lowercase()} · ${it.title}"
                },
                quickActions = listOf("Start session", "Message coach", "Check readiness"),
            ),
        )
    }

    override suspend fun recovery(): AppResult<RecoverySnapshot> {
        if (useLocal()) return localFallback!!.recovery()
        val uid = athleteId()
            ?: return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        val r = loadReadiness(uid)
        return AppResult.Ok(
            RecoverySnapshot(
                score = r.recoveryScore,
                sleepQuality = r.sleepQuality,
                hrvMs = r.hrvMs,
                restingHrBpm = r.restingHrBpm,
                timeline = listOf(RecoveryPoint("Today", r.score)),
                recommendations = listOfNotNull(
                    r.recoveryRecommendation.takeIf { it.isNotBlank() },
                ),
                warnings = r.warnings,
            ),
        )
    }

    override suspend fun sessions(): AppResult<List<TrainingSession>> {
        if (useLocal()) return localFallback!!.sessions()
        return when (val raw = api().get("/api/v1/sessions")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                if (root.optString("source") == "seed") {
                    return AppResult.Err(AppError.Unexpected("athlete_sessions_seed_forbidden"))
                }
                val arr = root.optJSONArray("data")
                    ?: root.optJSONArray("sessions")
                    ?: JSONArray()
                AppResult.Ok(parseSessions(arr))
            }
        }
    }

    override suspend fun session(id: String): AppResult<TrainingSession> =
        when (val all = sessions()) {
            is AppResult.Err -> all
            is AppResult.Ok -> all.value.firstOrNull { it.id == id }?.let { AppResult.Ok(it) }
                ?: AppResult.Err(AppError.Unexpected("session_not_found"))
        }

    override suspend fun programs(): AppResult<List<ProgramEnrollment>> {
        if (useLocal()) return localFallback!!.programs()
        return when (val raw = api().get("/api/v1/athletes/programs")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val arr = root.optJSONArray("enrollments") ?: JSONArray()
                val mapped = buildList {
                    for (i in 0 until arr.length()) {
                        val o = arr.getJSONObject(i)
                        val milestones = buildList {
                            val m = o.optJSONArray("milestones")
                            if (m != null) {
                                for (j in 0 until m.length()) add(m.getString(j))
                            }
                        }
                        add(
                            ProgramEnrollment(
                                id = o.optString("programId", o.getString("id")),
                                title = o.optString("title", "Program"),
                                currentWeek = o.optInt("currentWeek", 1),
                                totalWeeks = o.optInt("totalWeeks", 1),
                                progressPercent = o.optInt("progressPercent", 0),
                                nextWorkoutTitle = o.optString("nextWorkoutTitle", "Next workout"),
                                milestones = milestones,
                            ),
                        )
                    }
                }
                AppResult.Ok(mapped)
            }
        }
    }

    override suspend fun discoverCoaches(
        specialty: String?,
        maxDistanceKm: Double?,
        language: String?,
        verifiedOnly: Boolean,
    ): AppResult<List<CoachCard>> {
        if (useLocal()) {
            return localFallback!!.discoverCoaches(specialty, maxDistanceKm, language, verifiedOnly)
        }
        return when (val raw = api().get("/api/v1/coaches/discover")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                if (root.optString("source") == "seed") {
                    return AppResult.Err(AppError.Unexpected("discover_seed_forbidden_in_remote_path"))
                }
                val arr = root.optJSONArray("coaches") ?: JSONArray()
                val mapped = buildList {
                    for (i in 0 until arr.length()) {
                        val o = arr.getJSONObject(i)
                        val sports = jsonStringList(o.optJSONArray("sports"))
                        if (!specialty.isNullOrBlank() &&
                            sports.none { it.contains(specialty, ignoreCase = true) }
                        ) {
                            continue
                        }
                        add(
                            CoachCard(
                                id = o.getString("id"),
                                name = o.optString("name", "Coach"),
                                specialties = sports,
                                languages = emptyList(),
                                rating = o.optDouble("rating", 0.0),
                                distanceKm = 0.0,
                                verified = true,
                                available = true,
                                priceTier = if (o.optInt("hourlyRate", 0) > 0) 2 else 1,
                                city = o.optString("city", ""),
                            ),
                        )
                    }
                }
                AppResult.Ok(mapped)
            }
        }
    }

    override suspend fun profile(): AppResult<AthleteProfile> {
        if (useLocal()) return localFallback!!.profile()
        val uid = athleteId()
            ?: return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        return when (val raw = api().get("/api/v1/identity/profile")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val o = JSONObject(raw.value)
                AppResult.Ok(
                    AthleteProfile(
                        id = o.optString("uid", uid),
                        displayName = o.optString("displayName", o.optString("email", "Athlete")),
                        sports = emptyList(),
                        goals = emptyList(),
                        medicalNotes = null,
                        emergencyContact = null,
                        localeTag = o.optString("locale", "en"),
                        subscriptionTier = "standard",
                    ),
                )
            }
        }
    }

    override suspend fun goals(): AppResult<List<AthleteGoal>> {
        if (useLocal()) return localFallback!!.goals()
        return AppResult.Ok(emptyList())
    }

    override suspend fun achievements(): AppResult<List<Achievement>> {
        if (useLocal()) return localFallback!!.achievements()
        return AppResult.Ok(emptyList())
    }

    override suspend fun bodyMetrics(): AppResult<BodyMetrics> {
        if (useLocal()) return localFallback!!.bodyMetrics()
        return when (val raw = api().get("/api/v1/athletes/body-metrics")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val m = root.optJSONObject("metrics")
                    ?: return AppResult.Err(AppError.Unexpected("body_metrics_missing"))
                AppResult.Ok(
                    BodyMetrics(
                        weightKg = m.optDouble("weightKg", 0.0),
                        hydrationLiters = m.optDouble("hydrationLiters", 0.0),
                        nutritionKcal = m.optInt("nutritionKcal", 0),
                    ),
                )
            }
        }
    }

    override suspend fun messages(): AppResult<List<CoachMessage>> {
        if (useLocal()) return localFallback!!.messages()
        return when (val raw = api().get("/api/v1/messages")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val arr = root.optJSONArray("messages") ?: JSONArray()
                val mapped = buildList {
                    for (i in 0 until arr.length()) {
                        val o = arr.getJSONObject(i)
                        val whenIso = o.optString("when", o.optString("sentAt"))
                        val epoch = runCatching { Instant.parse(whenIso).toEpochMilli() }
                            .getOrDefault(System.currentTimeMillis())
                        add(
                            CoachMessage(
                                id = o.getString("id"),
                                from = o.optString("from", "Coach"),
                                preview = o.optString("preview", ""),
                                atEpochMs = epoch,
                                unread = o.optBoolean("unread", true),
                            ),
                        )
                    }
                }
                AppResult.Ok(mapped)
            }
        }
    }

    override suspend fun notifications(): AppResult<List<NotificationItem>> {
        if (useLocal()) return localFallback!!.notifications()
        return when (val raw = api().get("/api/v1/notifications")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val arr = root.optJSONArray("notifications") ?: JSONArray()
                val mapped = buildList {
                    for (i in 0 until arr.length()) {
                        val o = arr.getJSONObject(i)
                        add(
                            NotificationItem(
                                id = o.getString("id"),
                                title = o.optString("title", ""),
                                body = o.optString("body", ""),
                                deepLink = o.optString("deepLink").takeIf { it.isNotBlank() },
                            ),
                        )
                    }
                }
                AppResult.Ok(mapped)
            }
        }
    }

    override suspend fun toggleTask(taskId: String): AppResult<Unit> {
        if (useLocal()) return localFallback!!.toggleTask(taskId)
        val body = JSONObject().put("taskId", taskId).toString()
        return when (val raw = api().post("/api/v1/athletes/tasks/toggle", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> AppResult.Ok(Unit)
        }
    }

    override suspend fun enrollProgram(programId: String): AppResult<Unit> {
        if (useLocal()) return localFallback!!.enrollProgram(programId)
        val body = JSONObject().put("programId", programId).toString()
        return when (val raw = api().post("/api/v1/athletes/programs", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> AppResult.Ok(Unit)
        }
    }

    override suspend fun createBooking(
        coachId: String,
        scheduledAtEpochMs: Long,
        durationMin: Int,
        notes: String?,
        idempotencyKey: String?,
    ): AppResult<String> {
        if (useLocal()) {
            return localFallback!!.createBooking(
                coachId,
                scheduledAtEpochMs,
                durationMin,
                notes,
                idempotencyKey,
            )
        }
        val body = JSONObject()
            .put("coachId", coachId)
            .put("scheduledAt", Instant.ofEpochMilli(scheduledAtEpochMs).toString())
            .put("durationMin", durationMin)
            .put("type", "Intro session")
            .put("mode", "In-person")
        if (!notes.isNullOrBlank()) body.put("notes", notes)
        if (!idempotencyKey.isNullOrBlank()) body.put("idempotencyKey", idempotencyKey)
        return when (val raw = api().post("/api/v1/bookings", body.toString())) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val booking = root.optJSONObject("booking")
                    ?: return AppResult.Err(AppError.Unexpected("booking_create_failed"))
                AppResult.Ok(booking.getString("id"))
            }
        }
    }

    private suspend fun loadReadiness(uid: String): DailyReadiness {
        val vitals = telemetry.readinessVitals(uid)
        val remote = when (val raw = api().get("/api/v1/athletes/$uid/readiness")) {
            is AppResult.Ok -> JSONObject(raw.value)
            is AppResult.Err -> null
        }
        val score = remote?.optInt("score")?.takeIf { it > 0 }
            ?: vitals.hrvMs?.let { 50 } ?: 0
        val hrv = remote?.optInt("hrvMs")?.takeIf { it > 0 }
            ?: vitals.hrvMs?.roundToInt() ?: 0
        val sleepEff = remote?.optInt("sleepEfficiency")?.takeIf { it > 0 }
            ?: vitals.sleepMinutes?.let { ((it / 480.0) * 100).coerceIn(0.0, 100.0).roundToInt() }
            ?: 0
        val rhr = vitals.restingHr?.roundToInt() ?: 0
        return DailyReadiness(
            score = score,
            recoveryScore = score,
            sleepQuality = sleepEff,
            hrvMs = hrv,
            restingHrBpm = rhr,
            trainingLoad = 0.0,
            recommendation = if (score == 0) "No readiness data yet." else "Train to plan.",
            recoveryRecommendation = if (sleepEff == 0) "Sleep data unavailable." else "Protect sleep.",
            warnings = if (score == 0) listOf("Insufficient data") else emptyList(),
            aiSummary = if (score == 0) {
                "Readiness unavailable — connect Health Connect or complete a session."
            } else {
                "Readiness $score · HRV ${hrv}ms"
            },
        )
    }

    private fun parseSessions(arr: JSONArray): List<TrainingSession> = buildList {
        for (i in 0 until arr.length()) {
            val o = arr.getJSONObject(i)
            val whenIso = o.optString("when")
            val startMs = runCatching { Instant.parse(whenIso).toEpochMilli() }
                .getOrDefault(System.currentTimeMillis())
            val status = when (o.optString("status", "scheduled")) {
                "completed" -> SessionStatus.COMPLETED
                "cancelled" -> SessionStatus.CANCELLED
                else -> SessionStatus.UPCOMING
            }
            add(
                TrainingSession(
                    id = o.getString("id"),
                    title = o.optString("type", "Session"),
                    sport = SportId.RUNNING,
                    scheduledAtEpochMs = startMs,
                    durationMin = 60,
                    status = status,
                    exercises = emptyList(),
                    notes = o.optString("mode").takeIf { it.isNotBlank() },
                    coachFeedback = null,
                    mediaUrls = emptyList(),
                ),
            )
        }
    }

    private fun jsonStringList(arr: JSONArray?): List<String> {
        if (arr == null) return emptyList()
        return buildList {
            for (i in 0 until arr.length()) add(arr.getString(i))
        }
    }
}
