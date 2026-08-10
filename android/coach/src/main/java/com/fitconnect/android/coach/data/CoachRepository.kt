package com.fitconnect.android.coach.data

import com.fitconnect.android.coach.domain.ActivityFeedItem
import com.fitconnect.android.coach.domain.AnalyticsSnapshot
import com.fitconnect.android.coach.domain.AthleteDetail
import com.fitconnect.android.coach.domain.AthleteStatus
import com.fitconnect.android.coach.domain.AvailabilitySlot
import com.fitconnect.android.coach.domain.BookingRequest
import com.fitconnect.android.coach.domain.BookingStatus
import com.fitconnect.android.coach.domain.CalendarEvent
import com.fitconnect.android.coach.domain.CancellationPolicy
import com.fitconnect.android.coach.domain.CoachFileRef
import com.fitconnect.android.coach.domain.CoachOverview
import com.fitconnect.android.coach.domain.CoachProfile
import com.fitconnect.android.coach.domain.CoachProgram
import com.fitconnect.android.coach.domain.CoachSession
import com.fitconnect.android.coach.domain.InboxItem
import com.fitconnect.android.coach.domain.InboxKind
import com.fitconnect.android.coach.domain.MetricPoint
import com.fitconnect.android.coach.domain.NotificationItem
import com.fitconnect.android.coach.domain.PaymentStatus
import com.fitconnect.android.coach.domain.ProgramBlock
import com.fitconnect.android.coach.domain.ProgramExercise
import com.fitconnect.android.coach.domain.ProgramPublishState
import com.fitconnect.android.coach.domain.RosterAthlete
import com.fitconnect.android.coach.domain.SessionKind
import com.fitconnect.android.coach.domain.SessionLifecycle
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.foundation.offline.OfflineCoordinator
import com.fitconnect.android.foundation.offline.SyncWork
import com.fitconnect.android.geo.availability.AvailabilityEngine
import com.fitconnect.android.geo.booking.BookingEngine
import com.fitconnect.android.geo.domain.BookingLifecycle
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

interface CoachRepository {
    suspend fun overview(): AppResult<CoachOverview>
    suspend fun roster(
        query: String? = null,
        tag: String? = null,
        group: String? = null,
        team: String? = null,
        favoritesOnly: Boolean = false,
        status: AthleteStatus? = null,
    ): AppResult<List<RosterAthlete>>
    suspend fun athleteDetail(id: String): AppResult<AthleteDetail>
    suspend fun toggleFavorite(athleteId: String): AppResult<Unit>
    suspend fun sessions(): AppResult<List<CoachSession>>
    suspend fun session(id: String): AppResult<CoachSession>
    suspend fun rescheduleSession(id: String, newStartEpochMs: Long): AppResult<Unit>
    suspend fun cancelSession(id: String): AppResult<Unit>
    suspend fun calendarEvents(): AppResult<List<CalendarEvent>>
    suspend fun programs(): AppResult<List<CoachProgram>>
    suspend fun program(id: String): AppResult<CoachProgram>
    suspend fun cloneProgram(id: String): AppResult<CoachProgram>
    suspend fun publishProgram(id: String): AppResult<Unit>
    suspend fun setProgramDraft(id: String): AppResult<Unit>
    suspend fun bookings(): AppResult<List<BookingRequest>>
    suspend fun approveBooking(id: String): AppResult<Unit>
    suspend fun rejectBooking(id: String): AppResult<Unit>
    suspend fun inbox(): AppResult<List<InboxItem>>
    suspend fun markRead(id: String): AppResult<Unit>
    suspend fun notifications(): AppResult<List<NotificationItem>>
    suspend fun analytics(): AppResult<AnalyticsSnapshot>
    suspend fun availability(): AppResult<List<AvailabilitySlot>>
    suspend fun cancellationPolicy(): AppResult<CancellationPolicy>
    suspend fun profile(): AppResult<CoachProfile>
    suspend fun documents(): AppResult<List<CoachFileRef>>
}

class LocalCoachRepository(
    private val connectivity: ConnectivityMonitor,
    private val offline: OfflineCoordinator,
    private val booking: BookingEngine,
    private val availability: AvailabilityEngine,
) : CoachRepository {

    private val cache = ConcurrentHashMap<String, Any>()

    private val roster = mutableListOf(
        RosterAthlete(
            id = "a1", displayName = "Inês Costa", tags = listOf("endurance", "vip"),
            groups = listOf("Morning"), team = "Squad A", favorite = true,
            status = AthleteStatus.ACTIVE, readiness = 82, recovery = 78,
            attendancePercent = 94, medicalNotes = "No flags", privateNotes = "Responds well to Z2 volume",
        ),
        RosterAthlete(
            id = "a2", displayName = "Sam Okonkwo", tags = listOf("strength"),
            groups = listOf("Evening"), team = "Squad A", favorite = false,
            status = AthleteStatus.AT_RISK, readiness = 54, recovery = 48,
            attendancePercent = 71, medicalNotes = "Knee niggle — monitor", privateNotes = "Needs load cut",
        ),
        RosterAthlete(
            id = "a3", displayName = "Riley Chen", tags = listOf("triathlon", "vip"),
            groups = listOf("Morning"), team = "Squad B", favorite = true,
            status = AthleteStatus.ACTIVE, readiness = 76, recovery = 80,
            attendancePercent = 88, medicalNotes = null, privateNotes = "Brick sessions preferred Tue",
        ),
        RosterAthlete(
            id = "a4", displayName = "Marina Santos", tags = listOf("new", "multisport"),
            groups = listOf("Onboarding"), team = null, favorite = false,
            status = AthleteStatus.NEW, readiness = 70, recovery = 72,
            attendancePercent = 100, medicalNotes = "Clearance on file", privateNotes = null,
        ),
    )

    private val sessions = mutableListOf(
        CoachSession(
            id = "cs1", title = "Threshold intervals",
            athleteIds = listOf("a1"), athleteNames = listOf("Inês Costa"),
            startEpochMs = System.currentTimeMillis() + 3_600_000, durationMin = 55,
            kind = SessionKind.IN_PERSON, lifecycle = SessionLifecycle.UPCOMING,
            location = "Track · Lane 3", timezone = "Europe/Lisbon",
            attachments = listOf("threshold-warmup.pdf"), coachFeedback = null,
            athleteFeedback = null, attendance = mapOf("a1" to true),
        ),
        CoachSession(
            id = "cs2", title = "Video form check",
            athleteIds = listOf("a2"), athleteNames = listOf("Sam Okonkwo"),
            startEpochMs = System.currentTimeMillis() + 86_400_000, durationMin = 30,
            kind = SessionKind.VIDEO, lifecycle = SessionLifecycle.UPCOMING,
            location = null, timezone = "Europe/Lisbon",
            attachments = emptyList(), coachFeedback = null, athleteFeedback = null,
            attendance = emptyMap(),
        ),
        CoachSession(
            id = "cs3", title = "Aerobic endurance",
            athleteIds = listOf("a1", "a3"), athleteNames = listOf("Inês Costa", "Riley Chen"),
            startEpochMs = System.currentTimeMillis() - 86_400_000, durationMin = 90,
            kind = SessionKind.LIVE, lifecycle = SessionLifecycle.COMPLETED,
            location = "Coastal loop", timezone = "Europe/Lisbon",
            attachments = listOf("form-check.jpg"),
            coachFeedback = "Solid pacing — protect tomorrow.",
            athleteFeedback = "Felt strong after 60'",
            attendance = mapOf("a1" to true, "a3" to true),
        ),
    )

    private val programs = mutableListOf(
        CoachProgram(
            id = "cp1", title = "VO2 Build · 8 weeks", weeks = 8, cycles = 2,
            state = ProgramPublishState.PUBLISHED, version = 3, template = false,
            blocks = listOf(
                ProgramBlock(
                    id = "b1", week = 3, dayLabel = "Tue", title = "Threshold",
                    warmup = listOf("10 min easy", "Drills"),
                    exercises = listOf(
                        ProgramExercise("Intervals", "5×4 min", isSuperset = false, interval = "4/2", restSec = 120),
                        ProgramExercise("Strides", "4×20s", isSuperset = true, interval = null, restSec = 60),
                    ),
                    cooldown = listOf("10 min easy", "Mobility"),
                    notes = "Keep last rep honest",
                    attachments = listOf("f6"),
                ),
            ),
        ),
        CoachProgram(
            id = "cp2", title = "Base Template", weeks = 4, cycles = 1,
            state = ProgramPublishState.DRAFT, version = 1, template = true,
            blocks = listOf(
                ProgramBlock(
                    id = "b2", week = 1, dayLabel = "Mon", title = "Easy",
                    warmup = listOf("5 min"), exercises = listOf(
                        ProgramExercise("Z2", "45 min", false, null, 0),
                    ),
                    cooldown = listOf("Stretch"), notes = null, attachments = emptyList(),
                ),
            ),
        ),
    )

    private val inbox = mutableListOf(
        InboxItem("i1", InboxKind.MESSAGE, "Inês Costa", "Can we move Thursday?", System.currentTimeMillis() - 3_600_000, true, false, false),
        InboxItem("i2", InboxKind.MENTION, "Squad A", "@Maya recovery flag on Sam", System.currentTimeMillis() - 7_200_000, true, true, false),
        InboxItem("i3", InboxKind.FILE, "Riley Chen", "Shared brick plan.pdf", System.currentTimeMillis() - 86_400_000, false, false, true),
        InboxItem("i4", InboxKind.ANNOUNCEMENT, "You", "Week 3 focus: quality over volume", System.currentTimeMillis() - 172_800_000, false, false, false),
    )

    override suspend fun overview(): AppResult<CoachOverview> {
        val upcoming = sessions.filter { it.lifecycle == SessionLifecycle.UPCOMING }
        val attention = roster.filter { it.status == AthleteStatus.AT_RISK || it.recovery < 55 }
        val snap = CoachOverview(
            greeting = "Good evening, Coach Tomás",
            aiSummary = "Two athletes need load protection. Three sessions remain today. Revenue pacing ahead of last week.",
            agenda = calendarSeed().take(3),
            upcomingSessions = upcoming,
            athletesNeedingAttention = attention,
            recoveryAlerts = listOf("Sam Okonkwo · recovery 48 — cut intensity", "ACWR spike · Squad A"),
            unreadMessages = inbox.count { it.unread },
            pendingBookings = booking.list(BookingLifecycle.PENDING).size,
            revenueSummaryCents = 184_500,
            weeklyMetrics = mapOf(
                "sessions" to 14.0,
                "attendance" to 91.0,
                "completion" to 78.0,
            ),
            quickActions = listOf("Build program", "Approve bookings", "Message roster", "Open calendar"),
            liveFeed = listOf(
                ActivityFeedItem("af1", "Alex completed aerobic endurance", System.currentTimeMillis() - 3_600_000),
                ActivityFeedItem("af2", "Booking request · Marina Santos", System.currentTimeMillis() - 5_400_000),
                ActivityFeedItem("af3", "Riley uploaded form video", System.currentTimeMillis() - 8_000_000),
            ),
        )
        cache["overview"] = snap
        return AppResult.Ok(snap)
    }

    override suspend fun roster(
        query: String?,
        tag: String?,
        group: String?,
        team: String?,
        favoritesOnly: Boolean,
        status: AthleteStatus?,
    ): AppResult<List<RosterAthlete>> {
        val filtered = roster.filter { a ->
            (query == null || a.displayName.contains(query, ignoreCase = true)) &&
                (tag == null || a.tags.any { it.equals(tag, ignoreCase = true) }) &&
                (group == null || a.groups.any { it.equals(group, ignoreCase = true) }) &&
                (team == null || a.team?.equals(team, ignoreCase = true) == true) &&
                (!favoritesOnly || a.favorite) &&
                (status == null || a.status == status)
        }
        return AppResult.Ok(filtered)
    }

    override suspend fun athleteDetail(id: String): AppResult<AthleteDetail> {
        val base = roster.find { it.id == id }
            ?: return AppResult.Err(AppError.Unexpected("Athlete not found"))
        return AppResult.Ok(
            AthleteDetail(
                roster = base,
                hrvMs = if (id == "a2") 38 else 64,
                sleepQuality = if (id == "a2") 52 else 86,
                trainingLoad = if (id == "a2") 1.45 else 1.08,
                bodyWeightKg = 71.2,
                programs = listOf("VO2 Build · 8 weeks"),
                goals = listOf("Sub-40 10K", "Consistency"),
                achievements = listOf("7-day streak", "First threshold block"),
                coachNotes = listOf(base.privateNotes ?: "No private notes"),
                files = listOf(CoachFileRef("f4", "medical-clearance.pdf", "application/pdf", 420_000, "DOCUMENT")),
                devices = listOf("Garmin", "Health Connect"),
                performanceTimeline = listOf(
                    MetricPoint("W1", 70f), MetricPoint("W2", 74f), MetricPoint("W3", 78f), MetricPoint("W4", base.readiness.toFloat()),
                ),
                sessionHistoryIds = sessions.filter { id in it.athleteIds }.map { it.id },
            ),
        )
    }

    override suspend fun toggleFavorite(athleteId: String): AppResult<Unit> {
        val idx = roster.indexOfFirst { it.id == athleteId }
        if (idx < 0) return AppResult.Err(AppError.Unexpected("Athlete missing"))
        roster[idx] = roster[idx].copy(favorite = !roster[idx].favorite)
        enqueueIfOffline("coach.athlete.favorite", """{"id":"$athleteId"}""")
        return AppResult.Ok(Unit)
    }

    override suspend fun sessions(): AppResult<List<CoachSession>> = AppResult.Ok(sessions.toList())

    override suspend fun session(id: String): AppResult<CoachSession> =
        sessions.find { it.id == id }?.let { AppResult.Ok(it) }
            ?: AppResult.Err(AppError.Unexpected("Session not found"))

    override suspend fun rescheduleSession(id: String, newStartEpochMs: Long): AppResult<Unit> {
        val idx = sessions.indexOfFirst { it.id == id }
        if (idx < 0) return AppResult.Err(AppError.Unexpected("Session missing"))
        sessions[idx] = sessions[idx].copy(
            startEpochMs = newStartEpochMs,
            lifecycle = SessionLifecycle.RESCHEDULED,
        )
        enqueueIfOffline("coach.session.reschedule", """{"id":"$id","start":$newStartEpochMs}""")
        return AppResult.Ok(Unit)
    }

    override suspend fun cancelSession(id: String): AppResult<Unit> {
        val idx = sessions.indexOfFirst { it.id == id }
        if (idx < 0) return AppResult.Err(AppError.Unexpected("Session missing"))
        sessions[idx] = sessions[idx].copy(lifecycle = SessionLifecycle.CANCELLED)
        enqueueIfOffline("coach.session.cancel", """{"id":"$id"}""")
        return AppResult.Ok(Unit)
    }

    override suspend fun calendarEvents(): AppResult<List<CalendarEvent>> = AppResult.Ok(calendarSeed())

    override suspend fun programs(): AppResult<List<CoachProgram>> = AppResult.Ok(programs.toList())

    override suspend fun program(id: String): AppResult<CoachProgram> =
        programs.find { it.id == id }?.let { AppResult.Ok(it) }
            ?: AppResult.Err(AppError.Unexpected("Program not found"))

    override suspend fun cloneProgram(id: String): AppResult<CoachProgram> {
        val source = programs.find { it.id == id }
            ?: return AppResult.Err(AppError.Unexpected("Program not found"))
        val clone = source.copy(
            id = "cp-${UUID.randomUUID().toString().take(8)}",
            title = "${source.title} (copy)",
            state = ProgramPublishState.DRAFT,
            version = 1,
            template = false,
        )
        programs.add(clone)
        enqueueIfOffline("coach.program.clone", """{"from":"$id","to":"${clone.id}"}""")
        return AppResult.Ok(clone)
    }

    override suspend fun publishProgram(id: String): AppResult<Unit> {
        val idx = programs.indexOfFirst { it.id == id }
        if (idx < 0) return AppResult.Err(AppError.Unexpected("Program missing"))
        programs[idx] = programs[idx].copy(
            state = ProgramPublishState.PUBLISHED,
            version = programs[idx].version + 1,
        )
        enqueueIfOffline("coach.program.publish", """{"id":"$id"}""")
        return AppResult.Ok(Unit)
    }

    override suspend fun setProgramDraft(id: String): AppResult<Unit> {
        val idx = programs.indexOfFirst { it.id == id }
        if (idx < 0) return AppResult.Err(AppError.Unexpected("Program missing"))
        programs[idx] = programs[idx].copy(state = ProgramPublishState.DRAFT)
        enqueueIfOffline("coach.program.draft", """{"id":"$id"}""")
        return AppResult.Ok(Unit)
    }

    override suspend fun bookings(): AppResult<List<BookingRequest>> =
        AppResult.Ok(booking.list().map { it.toCoachBooking() })

    override suspend fun approveBooking(id: String): AppResult<Unit> {
        return when (val result = booking.confirm(id)) {
            is AppResult.Ok -> {
                enqueueIfOffline("coach.booking.approve", """{"id":"$id"}""")
                AppResult.Ok(Unit)
            }
            is AppResult.Err -> result
        }
    }

    override suspend fun rejectBooking(id: String): AppResult<Unit> {
        return when (val result = booking.reject(id)) {
            is AppResult.Ok -> {
                enqueueIfOffline("coach.booking.decline", """{"id":"$id"}""")
                AppResult.Ok(Unit)
            }
            is AppResult.Err -> result
        }
    }

    override suspend fun inbox(): AppResult<List<InboxItem>> = AppResult.Ok(inbox.toList())

    override suspend fun markRead(id: String): AppResult<Unit> {
        val idx = inbox.indexOfFirst { it.id == id }
        if (idx < 0) return AppResult.Err(AppError.Unexpected("Inbox item missing"))
        inbox[idx] = inbox[idx].copy(unread = false)
        enqueueIfOffline("coach.inbox.read", """{"id":"$id"}""")
        return AppResult.Ok(Unit)
    }

    override suspend fun notifications(): AppResult<List<NotificationItem>> = AppResult.Ok(
        listOf(
            NotificationItem("n1", "Recovery alert", "Sam Okonkwo recovery 48", "fitconnect://app/coach/athletes/a2"),
            NotificationItem("n2", "Booking pending", "Marina Santos consult", "fitconnect://app/coach/bookings"),
        ),
    )

    override suspend fun analytics(): AppResult<AnalyticsSnapshot> = AppResult.Ok(
        AnalyticsSnapshot(
            athleteEvolution = listOf(MetricPoint("W1", 68f), MetricPoint("W2", 72f), MetricPoint("W3", 75f), MetricPoint("W4", 78f)),
            recoveryTrend = listOf(MetricPoint("Mon", 70f), MetricPoint("Tue", 66f), MetricPoint("Wed", 74f), MetricPoint("Thu", 71f)),
            attendancePercent = 91,
            programCompletionPercent = 78,
            retentionPercent = 86,
            revenueCents = 742_000,
            conversionPercent = 34,
            customMetrics = mapOf("avg_hrv" to 58.0, "at_risk_count" to 1.0),
        ),
    )

    override suspend fun availability(): AppResult<List<AvailabilitySlot>> {
        val profile = availability.profile("p_coach_maya")
            ?: return AppResult.Ok(emptyList())
        val dayNames = listOf("", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
        return AppResult.Ok(
            profile.workingHours.map { hours ->
                AvailabilitySlot(
                    dayLabel = dayNames.getOrElse(hours.dayOfWeek) { "Day" },
                    startHour = hours.startHour,
                    endHour = hours.endHour,
                    timezone = profile.timezone,
                )
            },
        )
    }

    override suspend fun cancellationPolicy(): AppResult<CancellationPolicy> {
        val policy = booking.policy()
        return AppResult.Ok(
            CancellationPolicy(
                hoursNotice = policy.hoursNotice,
                refundPercent = policy.refundPercent,
                reminderHoursBefore = policy.reminderHoursBefore,
            ),
        )
    }

    override suspend fun profile(): AppResult<CoachProfile> = AppResult.Ok(
        CoachProfile(
            id = "coach-maya",
            displayName = "Tomás Rivera",
            specialties = listOf("Running", "Triathlon"),
            timezone = "Europe/Lisbon",
            languages = listOf("EN", "PT"),
            bio = "Performance coach · endurance systems · offline-first OS",
            verificationBadge = true,
        ),
    )

    override suspend fun documents(): AppResult<List<CoachFileRef>> = AppResult.Ok(
        listOf(
            CoachFileRef("f1", "threshold-warmup.pdf", "application/pdf", 240_000, "PDF"),
            CoachFileRef("f2", "drill-video.mp4", "video/mp4", 12_000_000, "VIDEO"),
            CoachFileRef("f5", "A-skip library", "application/x-exercise", 0, "EXERCISE_LIBRARY"),
        ),
    )

    private fun calendarSeed(): List<CalendarEvent> {
        val now = System.currentTimeMillis()
        return listOf(
            CalendarEvent("e1", "Threshold intervals", now + 3_600_000, now + 6_900_000, "cs1", null, 15, false),
            CalendarEvent("e2", "Video form check", now + 86_400_000, now + 88_200_000, "cs2", "FREQ=WEEKLY", 0, false),
            CalendarEvent("e3", "Squad A brick", now + 50_400_000, now + 54_000_000, null, null, 25, true),
            CalendarEvent("e4", "Availability block", now + 172_800_000, now + 190_800_000, null, null, 0, false),
        )
    }

    private suspend fun enqueueIfOffline(type: String, payload: String) {
        if (!connectivity.online.value) {
            offline.enqueue(SyncWork(type = type, payloadJson = payload))
        }
    }

    private fun com.fitconnect.android.geo.booking.Booking.toCoachBooking(): BookingRequest {
        val status = when (status) {
            BookingLifecycle.PENDING, BookingLifecycle.WAITLISTED -> BookingStatus.PENDING
            BookingLifecycle.CONFIRMED, BookingLifecycle.RESCHEDULED, BookingLifecycle.COMPLETED -> BookingStatus.APPROVED
            BookingLifecycle.CANCELLED, BookingLifecycle.NO_SHOW -> BookingStatus.REJECTED
            BookingLifecycle.DRAFT -> BookingStatus.PENDING
        }
        val payment = when (status) {
            BookingStatus.APPROVED -> PaymentStatus.PAID
            else -> PaymentStatus.PENDING
        }
        return BookingRequest(
            id = id,
            athleteName = request.clientName,
            requestedEpochMs = request.startEpochMs,
            status = status,
            paymentStatus = payment,
            notes = request.notes,
        )
    }
}
