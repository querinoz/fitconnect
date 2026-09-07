package com.fitconnect.android.coach.data

import com.fitconnect.android.coach.domain.AnalyticsSnapshot
import com.fitconnect.android.coach.domain.AthleteDetail
import com.fitconnect.android.coach.domain.AthleteStatus
import com.fitconnect.android.coach.domain.AvailabilitySlot
import com.fitconnect.android.coach.domain.BookingRequest
import com.fitconnect.android.coach.domain.CalendarEvent
import com.fitconnect.android.coach.domain.CancellationPolicy
import com.fitconnect.android.coach.domain.CoachFileRef
import com.fitconnect.android.coach.domain.CoachOverview
import com.fitconnect.android.coach.domain.CoachProfile
import com.fitconnect.android.coach.domain.CoachProgram
import com.fitconnect.android.coach.domain.CoachSession
import com.fitconnect.android.coach.domain.InboxItem
import com.fitconnect.android.coach.domain.MetricPoint
import com.fitconnect.android.coach.domain.NotificationItem
import com.fitconnect.android.coach.domain.RosterAthlete
import com.fitconnect.android.coach.domain.SessionKind
import com.fitconnect.android.coach.domain.SessionLifecycle
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.foundation.session.SessionStore
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant

/**
 * Canonical remote coach surfaces: roster + sessions.
 * Unsupported domains return [AppError.Unexpected] with NOT_IMPLEMENTED — never demo success.
 */
class HttpCoachRepository(
    private val api: () -> ApiClient,
    private val sessionStore: SessionStore,
    private val localFallback: CoachRepository? = null,
) : CoachRepository {

    data class RemoteMeta(val source: String)

    @Volatile
    var lastRosterSource: String = "unknown"
        private set

    @Volatile
    var lastSessionsSource: String = "unknown"
        private set

    override suspend fun overview(): AppResult<CoachOverview> {
        val roster = when (val r = roster()) {
            is AppResult.Ok -> r.value
            is AppResult.Err -> return r
        }
        val sessions = when (val s = sessions()) {
            is AppResult.Ok -> s.value
            is AppResult.Err -> return s
        }
        val upcoming = sessions.filter { it.lifecycle == SessionLifecycle.UPCOMING }
        val attention = roster.filter { it.readiness < 60 || it.status == AthleteStatus.AT_RISK }
        val pendingBookings = when (val b = bookings()) {
            is AppResult.Ok -> b.value.count {
                it.status == com.fitconnect.android.coach.domain.BookingStatus.PENDING
            }
            is AppResult.Err -> 0
        }
        return AppResult.Ok(
            CoachOverview(
                greeting = "Coach OS",
                aiSummary = when (lastRosterSource) {
                    "postgres" -> "Roster loaded from canonical remote."
                    "empty" -> "No roster rows for this coach yet."
                    else -> "Remote coach surfaces: roster + sessions + programs + bookings."
                },
                agenda = emptyList(),
                upcomingSessions = upcoming,
                athletesNeedingAttention = attention,
                recoveryAlerts = emptyList(),
                unreadMessages = 0,
                pendingBookings = pendingBookings,
                revenueSummaryCents = 0L,
                weeklyMetrics = emptyMap(),
                quickActions = listOf("Open roster", "Open sessions", "Open bookings"),
                liveFeed = emptyList(),
            ),
        )
    }

    override suspend fun roster(
        query: String?,
        tag: String?,
        group: String?,
        team: String?,
        favoritesOnly: Boolean,
        status: AthleteStatus?,
    ): AppResult<List<RosterAthlete>> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            lastRosterSource = "LOCAL_DEMO"
            return localFallback.roster(query, tag, group, team, favoritesOnly, status)
        }
        return when (val raw = api().get("/api/v1/coaches/roster")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                lastRosterSource = root.optString("source", "unknown")
                if (lastRosterSource == "seed") {
                    return AppResult.Err(
                        AppError.Unexpected("coach_roster_seed_forbidden_in_remote_path"),
                    )
                }
                val arr = root.optJSONArray("roster") ?: JSONArray()
                val mapped = buildList {
                    for (i in 0 until arr.length()) {
                        val o = arr.getJSONObject(i)
                        val name = o.optString("name", o.optString("displayName", "Athlete"))
                        add(
                            RosterAthlete(
                                id = o.getString("id"),
                                displayName = name,
                                tags = jsonStringList(o.optJSONArray("sports")),
                                groups = emptyList(),
                                team = null,
                                favorite = false,
                                status = AthleteStatus.ACTIVE,
                                readiness = o.optInt("readiness", 0),
                                recovery = o.optInt("hrv", 0),
                                attendancePercent = 0,
                                medicalNotes = null,
                                privateNotes = null,
                            ),
                        )
                    }
                }
                AppResult.Ok(filterRoster(mapped, query, tag, group, team, favoritesOnly, status))
            }
        }
    }

    override suspend fun athleteDetail(id: String): AppResult<AthleteDetail> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.athleteDetail(id)
        }
        return when (val raw = api().get("/api/v1/coaches/athletes/$id")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                if (root.optString("source") == "seed") {
                    return AppResult.Err(AppError.Unexpected("coach_athlete_seed_forbidden"))
                }
                val o = root.getJSONObject("athlete")
                val roster = RosterAthlete(
                    id = o.getString("id"),
                    displayName = o.optString("name", "Athlete"),
                    tags = jsonStringList(o.optJSONArray("sports")),
                    groups = emptyList(),
                    team = null,
                    favorite = false,
                    status = AthleteStatus.ACTIVE,
                    readiness = o.optInt("readiness", 0),
                    recovery = o.optInt("hrv", 0),
                    attendancePercent = 0,
                    medicalNotes = null,
                    privateNotes = null,
                )
                val sessionIds = jsonStringList(o.optJSONArray("sessionIds"))
                val sleepEff = o.optInt("sleepEfficiency", 0)
                AppResult.Ok(
                    AthleteDetail(
                        roster = roster,
                        hrvMs = o.optInt("hrv", 0),
                        sleepQuality = sleepEff,
                        trainingLoad = 0.0,
                        bodyWeightKg = 0.0,
                        programs = emptyList(),
                        goals = listOfNotNull(o.optString("goalTitle").takeIf { it.isNotBlank() }),
                        achievements = emptyList(),
                        coachNotes = emptyList(),
                        files = emptyList(),
                        devices = emptyList(),
                        performanceTimeline = emptyList(),
                        sessionHistoryIds = sessionIds,
                    ),
                )
            }
        }
    }

    override suspend fun toggleFavorite(athleteId: String): AppResult<Unit> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.toggleFavorite(athleteId)
        }
        val body = JSONObject().put("athleteId", athleteId).toString()
        return when (val raw = api().post("/api/v1/coaches/favorites", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> AppResult.Ok(Unit)
        }
    }

    override suspend fun sessions(): AppResult<List<CoachSession>> {
        val coachId = sessionStore.snapshot().userId
            ?: return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            lastSessionsSource = "LOCAL_DEMO"
            return localFallback.sessions()
        }
        return when (val raw = api().get("/api/v1/sessions?coachId=$coachId")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                lastSessionsSource = root.optString("source", "unknown")
                if (lastSessionsSource == "seed") {
                    return AppResult.Err(
                        AppError.Unexpected("coach_sessions_seed_forbidden_in_remote_path"),
                    )
                }
                val arr = root.optJSONArray("data")
                    ?: root.optJSONArray("sessions")
                    ?: JSONArray()
                val mapped = buildList {
                    for (i in 0 until arr.length()) {
                        val o = arr.getJSONObject(i)
                        val whenIso = o.optString("when")
                        val startMs = runCatching { Instant.parse(whenIso).toEpochMilli() }
                            .getOrDefault(System.currentTimeMillis())
                        val status = o.optString("status", "scheduled")
                        add(
                            CoachSession(
                                id = o.getString("id"),
                                title = o.optString("type", "Session"),
                                athleteIds = listOf(o.optString("athleteId")),
                                athleteNames = emptyList(),
                                startEpochMs = startMs,
                                durationMin = 60,
                                kind = when (o.optString("mode")) {
                                    "Online" -> SessionKind.VIDEO
                                    else -> SessionKind.IN_PERSON
                                },
                                lifecycle = when (status) {
                                    "live" -> SessionLifecycle.LIVE
                                    "completed" -> SessionLifecycle.COMPLETED
                                    "cancelled" -> SessionLifecycle.CANCELLED
                                    else -> SessionLifecycle.UPCOMING
                                },
                                location = null,
                                timezone = "UTC",
                                attachments = emptyList(),
                                coachFeedback = null,
                                athleteFeedback = null,
                                attendance = emptyMap(),
                            ),
                        )
                    }
                }
                AppResult.Ok(mapped)
            }
        }
    }

    override suspend fun session(id: String): AppResult<CoachSession> =
        when (val all = sessions()) {
            is AppResult.Err -> all
            is AppResult.Ok -> all.value.firstOrNull { it.id == id }?.let { AppResult.Ok(it) }
                ?: AppResult.Err(AppError.Unexpected("session_not_found"))
        }

    override suspend fun rescheduleSession(id: String, newStartEpochMs: Long): AppResult<Unit> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.rescheduleSession(id, newStartEpochMs)
        }
        val body = JSONObject()
            .put("action", "reschedule")
            .put("when", Instant.ofEpochMilli(newStartEpochMs).toString())
            .toString()
        return when (val raw = api().put("/api/v1/sessions/$id", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> AppResult.Ok(Unit)
        }
    }

    override suspend fun cancelSession(id: String): AppResult<Unit> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.cancelSession(id)
        }
        val body = JSONObject().put("action", "cancel").toString()
        return when (val raw = api().put("/api/v1/sessions/$id", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> AppResult.Ok(Unit)
        }
    }
    override suspend fun calendarEvents(): AppResult<List<CalendarEvent>> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.calendarEvents()
        }
        return when (val all = sessions()) {
            is AppResult.Err -> all
            is AppResult.Ok -> AppResult.Ok(
                all.value
                    .filter { it.lifecycle != SessionLifecycle.CANCELLED }
                    .map { s ->
                    CalendarEvent(
                        id = "cal-${s.id}",
                        title = s.title,
                        startEpochMs = s.startEpochMs,
                        endEpochMs = s.startEpochMs + s.durationMin * 60_000L,
                        sessionId = s.id,
                        recurringRule = null,
                        travelMinutes = 0,
                        conflict = false,
                    )
                },
            )
        }
    }

    override suspend fun analytics(): AppResult<AnalyticsSnapshot> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.analytics()
        }
        val roster = when (val r = roster()) {
            is AppResult.Ok -> r.value
            is AppResult.Err -> return r
        }
        val sessions = when (val s = sessions()) {
            is AppResult.Ok -> s.value
            is AppResult.Err -> return s
        }
        val completed = sessions.count { it.lifecycle == SessionLifecycle.COMPLETED }
        val upcoming = sessions.count { it.lifecycle == SessionLifecycle.UPCOMING }
        val total = sessions.size.coerceAtLeast(1)
        val avgReadiness = if (roster.isEmpty()) 0
        else roster.map { it.readiness }.average().toInt()
        val atRisk = roster.count { it.status == AthleteStatus.AT_RISK || it.readiness < 60 }
        return AppResult.Ok(
            AnalyticsSnapshot(
                athleteEvolution = roster.take(8).map {
                    MetricPoint(it.displayName.take(8), it.readiness.toFloat())
                },
                recoveryTrend = emptyList(),
                attendancePercent = ((completed.toDouble() / total) * 100).toInt(),
                programCompletionPercent = ((completed.toDouble() / total) * 100).toInt(),
                retentionPercent = 0,
                revenueCents = 0L,
                conversionPercent = 0,
                customMetrics = mapOf(
                    "roster_size" to roster.size.toDouble(),
                    "sessions_upcoming" to upcoming.toDouble(),
                    "sessions_completed" to completed.toDouble(),
                    "avg_readiness" to avgReadiness.toDouble(),
                    "athletes_needing_attention" to atRisk.toDouble(),
                    "retention_unavailable" to 1.0,
                    "conversion_unavailable" to 1.0,
                    "revenue_unavailable" to 1.0,
                ),
            ),
        )
    }

    override suspend fun programs(): AppResult<List<CoachProgram>> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.programs()
        }
        return when (val raw = api().get("/api/v1/coaches/programs")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val source = root.optString("source", "unknown")
                if (source == "seed") {
                    return AppResult.Err(AppError.Unexpected("coach_programs_seed_forbidden_in_remote_path"))
                }
                val arr = root.optJSONArray("programs") ?: JSONArray()
                val mapped = buildList {
                    for (i in 0 until arr.length()) {
                        val o = arr.getJSONObject(i)
                        add(
                            CoachProgram(
                                id = o.getString("id"),
                                title = o.optString("title", "Program"),
                                weeks = o.optInt("weeks", 4),
                                cycles = 1,
                                state = when (o.optString("state", "published")) {
                                    "draft" -> com.fitconnect.android.coach.domain.ProgramPublishState.DRAFT
                                    "archived" -> com.fitconnect.android.coach.domain.ProgramPublishState.ARCHIVED
                                    else -> com.fitconnect.android.coach.domain.ProgramPublishState.PUBLISHED
                                },
                                version = o.optInt("version", 1),
                                blocks = emptyList(),
                                template = true,
                            ),
                        )
                    }
                }
                AppResult.Ok(mapped)
            }
        }
    }

    override suspend fun program(id: String): AppResult<CoachProgram> =
        when (val all = programs()) {
            is AppResult.Err -> all
            is AppResult.Ok -> all.value.firstOrNull { it.id == id }?.let { AppResult.Ok(it) }
                ?: AppResult.Err(AppError.Unexpected("program_not_found"))
        }

    override suspend fun cloneProgram(id: String): AppResult<CoachProgram> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.cloneProgram(id)
        }
        val body = JSONObject().put("action", "clone").put("programId", id).toString()
        return when (val raw = api().post("/api/v1/coaches/programs", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val o = JSONObject(raw.value).optJSONObject("program")
                    ?: return AppResult.Err(AppError.Unexpected("clone_failed"))
                AppResult.Ok(
                    CoachProgram(
                        id = o.getString("id"),
                        title = o.optString("title", "Program"),
                        weeks = o.optInt("weeks", 1),
                        cycles = 1,
                        state = when (o.optString("state", "draft")) {
                            "published" -> com.fitconnect.android.coach.domain.ProgramPublishState.PUBLISHED
                            "archived" -> com.fitconnect.android.coach.domain.ProgramPublishState.ARCHIVED
                            else -> com.fitconnect.android.coach.domain.ProgramPublishState.DRAFT
                        },
                        version = o.optInt("version", 1),
                        blocks = emptyList(),
                        template = true,
                    ),
                )
            }
        }
    }

    override suspend fun publishProgram(id: String): AppResult<Unit> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.publishProgram(id)
        }
        val body = JSONObject().put("action", "publish").put("programId", id).toString()
        return when (val raw = api().post("/api/v1/coaches/programs", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> AppResult.Ok(Unit)
        }
    }

    override suspend fun setProgramDraft(id: String): AppResult<Unit> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.setProgramDraft(id)
        }
        val body = JSONObject().put("action", "draft").put("programId", id).toString()
        return when (val raw = api().post("/api/v1/coaches/programs", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> AppResult.Ok(Unit)
        }
    }

    override suspend fun bookings(): AppResult<List<BookingRequest>> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.bookings()
        }
        return when (val raw = api().get("/api/v1/coaches/bookings")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val source = root.optString("source", "unknown")
                if (source == "seed") {
                    return AppResult.Err(AppError.Unexpected("coach_bookings_seed_forbidden_in_remote_path"))
                }
                val arr = root.optJSONArray("bookings") ?: JSONArray()
                val mapped = buildList {
                    for (i in 0 until arr.length()) {
                        val o = arr.getJSONObject(i)
                        val whenIso = o.optString("requestedAt")
                        val epoch = runCatching { Instant.parse(whenIso).toEpochMilli() }
                            .getOrDefault(System.currentTimeMillis())
                        add(
                            BookingRequest(
                                id = o.getString("id"),
                                athleteName = o.optString("athleteName", o.optString("athleteId", "Athlete")),
                                requestedEpochMs = epoch,
                                status = when (o.optString("status", "pending")) {
                                    "approved" -> com.fitconnect.android.coach.domain.BookingStatus.APPROVED
                                    "rejected" -> com.fitconnect.android.coach.domain.BookingStatus.REJECTED
                                    else -> com.fitconnect.android.coach.domain.BookingStatus.PENDING
                                },
                                paymentStatus = com.fitconnect.android.coach.domain.PaymentStatus.PENDING,
                                notes = o.optString("notes").takeIf { it.isNotBlank() },
                            ),
                        )
                    }
                }
                AppResult.Ok(mapped)
            }
        }
    }

    override suspend fun approveBooking(id: String): AppResult<Unit> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.approveBooking(id)
        }
        val body = JSONObject().put("bookingId", id).put("action", "approve").toString()
        return when (val raw = api().post("/api/v1/coaches/bookings", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> AppResult.Ok(Unit)
        }
    }

    override suspend fun rejectBooking(id: String): AppResult<Unit> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.rejectBooking(id)
        }
        val body = JSONObject().put("bookingId", id).put("action", "reject").toString()
        return when (val raw = api().post("/api/v1/coaches/bookings", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> AppResult.Ok(Unit)
        }
    }

    override suspend fun inbox(): AppResult<List<InboxItem>> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.inbox()
        }
        val coachId = sessionStore.snapshot().userId
            ?: return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        return when (val raw = api().get("/api/v1/messages?coachId=$coachId")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val arr = root.optJSONArray("messages")
                    ?: root.optJSONArray("data")
                    ?: JSONArray()
                val mapped = buildList {
                    for (i in 0 until arr.length()) {
                        val o = arr.getJSONObject(i)
                        val whenIso = o.optString("when", o.optString("sentAt"))
                        val epoch = runCatching { Instant.parse(whenIso).toEpochMilli() }
                            .getOrDefault(System.currentTimeMillis())
                        add(
                            InboxItem(
                                id = o.getString("id"),
                                kind = com.fitconnect.android.coach.domain.InboxKind.MESSAGE,
                                from = o.optString("from", o.optString("athleteId", "Athlete")),
                                preview = o.optString("preview", ""),
                                atEpochMs = epoch,
                                unread = o.optBoolean("unread", true),
                                mentioned = false,
                                hasAttachment = false,
                            ),
                        )
                    }
                }
                AppResult.Ok(mapped)
            }
        }
    }

    override suspend fun markRead(id: String): AppResult<Unit> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.markRead(id)
        }
        val body = JSONObject().put("id", id).toString()
        return when (val raw = api().put("/api/v1/notifications", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> AppResult.Ok(Unit)
        }
    }

    override suspend fun notifications(): AppResult<List<NotificationItem>> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.notifications()
        }
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
                                deepLink = o.optString("deepLink", ""),
                            ),
                        )
                    }
                }
                AppResult.Ok(mapped)
            }
        }
    }

    override suspend fun availability(): AppResult<List<AvailabilitySlot>> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.availability()
        }
        return when (val raw = api().get("/api/v1/coaches/settings")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val arr = root.optJSONArray("availability") ?: JSONArray()
                val mapped = buildList {
                    for (i in 0 until arr.length()) {
                        val o = arr.getJSONObject(i)
                        val day = o.optInt("dayOfWeek", 1)
                        add(
                            AvailabilitySlot(
                                dayLabel = dayLabel(day),
                                startHour = o.optInt("startHour", 9),
                                endHour = o.optInt("endHour", 12),
                                timezone = o.optString("timezone", "UTC"),
                            ),
                        )
                    }
                }
                AppResult.Ok(mapped)
            }
        }
    }

    override suspend fun cancellationPolicy(): AppResult<CancellationPolicy> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.cancellationPolicy()
        }
        return when (val raw = api().get("/api/v1/coaches/settings")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val p = root.optJSONObject("cancellationPolicy")
                    ?: return AppResult.Err(AppError.Unexpected("cancellation_policy_missing"))
                AppResult.Ok(
                    CancellationPolicy(
                        hoursNotice = p.optInt("hoursNotice", 24),
                        refundPercent = 100 - p.optInt("feePercent", 50),
                        reminderHoursBefore = listOf(24, 2),
                    ),
                )
            }
        }
    }

    override suspend fun profile(): AppResult<CoachProfile> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.profile()
        }
        val uid = sessionStore.snapshot().userId
            ?: return AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        return when (val raw = api().get("/api/v1/identity/profile")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val o = JSONObject(raw.value)
                AppResult.Ok(
                    CoachProfile(
                        id = o.optString("uid", uid),
                        displayName = o.optString("displayName", o.optString("email", "Coach")),
                        specialties = emptyList(),
                        timezone = o.optString("timezone", "UTC").ifBlank { "UTC" },
                        languages = emptyList(),
                        bio = "",
                        verificationBadge = false,
                    ),
                )
            }
        }
    }

    override suspend fun documents(): AppResult<List<CoachFileRef>> {
        if (sessionStore.snapshot().isLocalDemo && localFallback != null) {
            return localFallback.documents()
        }
        return when (val raw = api().get("/api/v1/coaches/settings")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val arr = root.optJSONArray("documents") ?: JSONArray()
                val mapped = buildList {
                    for (i in 0 until arr.length()) {
                        val o = arr.getJSONObject(i)
                        add(
                            CoachFileRef(
                                id = o.getString("id"),
                                name = o.optString("name", "document"),
                                mime = o.optString("mime", "application/octet-stream"),
                                sizeBytes = o.optLong("sizeBytes", 0L),
                                category = o.optString("category", "other"),
                            ),
                        )
                    }
                }
                AppResult.Ok(mapped)
            }
        }
    }

    private fun dayLabel(dayOfWeek: Int): String = when (dayOfWeek) {
        1 -> "Mon"
        2 -> "Tue"
        3 -> "Wed"
        4 -> "Thu"
        5 -> "Fri"
        6 -> "Sat"
        7 -> "Sun"
        else -> "Day $dayOfWeek"
    }

    private fun <T> notImplemented(surface: String): AppResult<T> =
        AppResult.Err(AppError.Unexpected("NOT_IMPLEMENTED:$surface"))

    private fun jsonStringList(arr: JSONArray?): List<String> {
        if (arr == null) return emptyList()
        return buildList {
            for (i in 0 until arr.length()) add(arr.getString(i))
        }
    }

    private fun filterRoster(
        items: List<RosterAthlete>,
        query: String?,
        tag: String?,
        group: String?,
        team: String?,
        favoritesOnly: Boolean,
        status: AthleteStatus?,
    ): List<RosterAthlete> = items.filter { a ->
        (query.isNullOrBlank() || a.displayName.contains(query, ignoreCase = true)) &&
            (tag.isNullOrBlank() || a.tags.any { it.equals(tag, true) }) &&
            (group.isNullOrBlank() || a.groups.any { it.equals(group, true) }) &&
            (team.isNullOrBlank() || a.team.equals(team, true)) &&
            (!favoritesOnly || a.favorite) &&
            (status == null || a.status == status)
    }
}
