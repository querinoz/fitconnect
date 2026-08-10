package com.fitconnect.android.coach.domain

enum class AthleteStatus { ACTIVE, AT_RISK, INJURED, PAUSED, NEW }

enum class SessionKind { IN_PERSON, VIDEO, LIVE, ASYNC }

enum class SessionLifecycle { UPCOMING, LIVE, COMPLETED, CANCELLED, RESCHEDULED }

enum class BookingStatus { PENDING, APPROVED, REJECTED, CANCELLED, PAID }

enum class ProgramPublishState { DRAFT, PUBLISHED, ARCHIVED }

enum class CalendarViewMode { DAY, WEEK, MONTH, AGENDA }

enum class PaymentStatus { PENDING, PAID, REFUNDED, FAILED }

enum class InboxKind { MESSAGE, ANNOUNCEMENT, FILE, VOICE, IMAGE, MENTION }

data class CoachProfile(
    val id: String,
    val displayName: String,
    val specialties: List<String>,
    val timezone: String,
    val languages: List<String>,
    val bio: String,
    val verificationBadge: Boolean,
)

data class RosterAthlete(
    val id: String,
    val displayName: String,
    val tags: List<String>,
    val groups: List<String>,
    val team: String?,
    val favorite: Boolean,
    val status: AthleteStatus,
    val readiness: Int,
    val recovery: Int,
    val attendancePercent: Int,
    val medicalNotes: String?,
    val privateNotes: String?,
)

data class AthleteDetail(
    val roster: RosterAthlete,
    val hrvMs: Int,
    val sleepQuality: Int,
    val trainingLoad: Double,
    val bodyWeightKg: Double,
    val programs: List<String>,
    val goals: List<String>,
    val achievements: List<String>,
    val coachNotes: List<String>,
    val files: List<CoachFileRef>,
    val devices: List<String>,
    val performanceTimeline: List<MetricPoint>,
    val sessionHistoryIds: List<String>,
)

data class MetricPoint(val label: String, val value: Float)

data class CoachSession(
    val id: String,
    val title: String,
    val athleteIds: List<String>,
    val athleteNames: List<String>,
    val startEpochMs: Long,
    val durationMin: Int,
    val kind: SessionKind,
    val lifecycle: SessionLifecycle,
    val location: String?,
    val timezone: String,
    val attachments: List<String>,
    val coachFeedback: String?,
    val athleteFeedback: String?,
    val attendance: Map<String, Boolean>,
)

data class CalendarEvent(
    val id: String,
    val title: String,
    val startEpochMs: Long,
    val endEpochMs: Long,
    val sessionId: String?,
    val recurringRule: String?,
    val travelMinutes: Int,
    val conflict: Boolean,
)

data class ProgramBlock(
    val id: String,
    val week: Int,
    val dayLabel: String,
    val title: String,
    val warmup: List<String>,
    val exercises: List<ProgramExercise>,
    val cooldown: List<String>,
    val notes: String?,
    val attachments: List<String>,
)

data class ProgramExercise(
    val name: String,
    val detail: String,
    val isSuperset: Boolean,
    val interval: String?,
    val restSec: Int,
)

data class CoachProgram(
    val id: String,
    val title: String,
    val weeks: Int,
    val cycles: Int,
    val state: ProgramPublishState,
    val version: Int,
    val blocks: List<ProgramBlock>,
    val template: Boolean,
)

data class BookingRequest(
    val id: String,
    val athleteName: String,
    val requestedEpochMs: Long,
    val status: BookingStatus,
    val paymentStatus: PaymentStatus,
    val notes: String?,
)

data class InboxItem(
    val id: String,
    val kind: InboxKind,
    val from: String,
    val preview: String,
    val atEpochMs: Long,
    val unread: Boolean,
    val mentioned: Boolean,
    val hasAttachment: Boolean,
)

data class NotificationItem(
    val id: String,
    val title: String,
    val body: String,
    val deepLink: String,
)

data class AnalyticsSnapshot(
    val athleteEvolution: List<MetricPoint>,
    val recoveryTrend: List<MetricPoint>,
    val attendancePercent: Int,
    val programCompletionPercent: Int,
    val retentionPercent: Int,
    val revenueCents: Long,
    val conversionPercent: Int,
    val customMetrics: Map<String, Double>,
)

data class RevenueSnapshot(
    val weekCents: Long,
    val monthCents: Long,
    val pendingPayoutCents: Long,
    val subscriptions: Int,
    val bookingsPaid: Int,
    val invoicesOpen: Int,
    val transfersPending: Int,
    val payoutStatus: String,
)

data class AvailabilitySlot(
    val dayLabel: String,
    val startHour: Int,
    val endHour: Int,
    val timezone: String,
)

data class CoachFileRef(
    val id: String,
    val name: String,
    val mime: String,
    val sizeBytes: Long,
    val category: String,
)

data class ActivityFeedItem(
    val id: String,
    val text: String,
    val atEpochMs: Long,
)

data class CoachOverview(
    val greeting: String,
    val aiSummary: String,
    val agenda: List<CalendarEvent>,
    val upcomingSessions: List<CoachSession>,
    val athletesNeedingAttention: List<RosterAthlete>,
    val recoveryAlerts: List<String>,
    val unreadMessages: Int,
    val pendingBookings: Int,
    val revenueSummaryCents: Long,
    val weeklyMetrics: Map<String, Double>,
    val quickActions: List<String>,
    val liveFeed: List<ActivityFeedItem>,
)

data class CancellationPolicy(
    val hoursNotice: Int,
    val refundPercent: Int,
    val reminderHoursBefore: List<Int>,
)
