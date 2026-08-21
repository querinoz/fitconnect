package com.fitconnect.android.community.domain

/**
 * Canonical Community domain. Strongly typed, audit-carrying, engine-agnostic.
 * Sport context is a plain key resolved through the Sports registry port —
 * no sport list is hardcoded here.
 */

data class Audit(
    val createdAtEpochMs: Long,
    val updatedAtEpochMs: Long,
    val deletedAtEpochMs: Long? = null,
) {
    val deleted: Boolean get() = deletedAtEpochMs != null
}

enum class CommunityRole { ATHLETE, COACH, OFFICIAL }

/** Lightweight profile reference used across posts, comments, groups. */
data class UserProfile(
    val id: String,
    val displayName: String,
    val role: CommunityRole,
    val verifiedCoach: Boolean = false,
    val sportKeys: List<String> = emptyList(),
    val bio: String? = null,
    /** Drawable / asset name for LOCAL_DEMO portraits. Never a live CDN URL. */
    val avatarUri: String? = null,
)

enum class Visibility { PUBLIC, FOLLOWERS, CONNECTIONS, GROUP, COACH_ONLY, PRIVATE }

enum class PostKind {
    TEXT,
    WORKOUT,
    ACHIEVEMENT,
    PROGRESS,
    PHOTO,
    VIDEO,
    ROUTE,
    PROGRAM_UPDATE,
    CHALLENGE_UPDATE,
    COACH_EDUCATION,
    EVENT,
}

enum class MediaKind { IMAGE, VIDEO }

/** Metadata only — binary media lives behind the media pipeline, never inline. */
data class MediaAttachment(
    val id: String,
    val kind: MediaKind,
    val localUri: String?,
    val remoteUrl: String?,
    val thumbnailUrl: String?,
    val sizeBytes: Long,
    val durationMs: Long? = null,
)

/**
 * Structured workout facts attached to a post. Values are produced by the
 * Telemetry/Sports engines via ports — Community never computes them.
 */
data class WorkoutFacts(
    val sportKey: String,
    val durationMinutes: Int,
    val distanceMeters: Double?,
    val calories: Double?,
    val avgHeartRate: Double?,
    val trainingLoad: Double?,
    val personalRecord: Boolean = false,
    val providerId: String = com.fitconnect.shared.fitness.ProviderId.HEALTH_CONNECT.name,
)

data class CommunityPost(
    val id: String,
    val authorId: String,
    val kind: PostKind,
    val text: String,
    val sportKey: String? = null,
    val workoutFacts: WorkoutFacts? = null,
    val media: List<MediaAttachment> = emptyList(),
    val hashtags: List<String> = emptyList(),
    val mentions: List<String> = emptyList(),
    val groupId: String? = null,
    val programId: String? = null,
    val challengeId: String? = null,
    val eventId: String? = null,
    val visibility: Visibility = Visibility.PUBLIC,
    val shareTelemetryFacts: Boolean = false,
    val edited: Boolean = false,
    val audit: Audit,
)

enum class ReactionType { LIKE, FIRE, STRONG, CELEBRATE, SUPPORT, INSIGHTFUL }

enum class ReactionTargetKind { POST, COMMENT }

data class Reaction(
    val actorId: String,
    val targetKind: ReactionTargetKind,
    val targetId: String,
    val type: ReactionType,
    val atEpochMs: Long,
)

data class Comment(
    val id: String,
    val postId: String,
    val parentCommentId: String?,
    val authorId: String,
    val text: String,
    val mentions: List<String> = emptyList(),
    val depth: Int,
    val edited: Boolean = false,
    val audit: Audit,
)

// ---------------------------------------------------------------------------
// Social graph
// ---------------------------------------------------------------------------

enum class RelationshipKind { FOLLOW, CONNECTION, COACH_ATHLETE, TEAM_MEMBER }

data class Relationship(
    val fromId: String,
    val toId: String,
    val kind: RelationshipKind,
    val atEpochMs: Long,
)

data class Block(val actorId: String, val blockedId: String, val atEpochMs: Long)

data class Mute(val actorId: String, val mutedId: String, val atEpochMs: Long)

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

enum class GroupKind { PUBLIC, PRIVATE, INVITE_ONLY, COACH_LED, TEAM, SPORT, LOCAL }

enum class GroupRole { OWNER, MODERATOR, MEMBER }

data class CommunityGroup(
    val id: String,
    val name: String,
    val description: String,
    val kind: GroupKind,
    val sportKey: String? = null,
    val rules: List<String> = emptyList(),
    val ownerId: String,
    val audit: Audit,
)

data class GroupMembership(
    val groupId: String,
    val userId: String,
    val role: GroupRole,
    val atEpochMs: Long,
)

data class GroupInvite(
    val groupId: String,
    val invitedUserId: String,
    val invitedById: String,
    val atEpochMs: Long,
)

// ---------------------------------------------------------------------------
// Saves & shares
// ---------------------------------------------------------------------------

data class SavedPost(val userId: String, val postId: String, val atEpochMs: Long)

enum class ShareTargetKind { GROUP, PROGRAM, DIRECT, EXTERNAL }

data class Share(
    val actorId: String,
    val postId: String,
    val target: ShareTargetKind,
    val targetId: String?,
    val deepLink: String,
    val atEpochMs: Long,
)

// ---------------------------------------------------------------------------
// Moderation
// ---------------------------------------------------------------------------

enum class ReportTargetKind { POST, COMMENT, USER }

enum class ReportReason { SPAM, ABUSE, HARASSMENT, DANGEROUS, INAPPROPRIATE, OTHER }

enum class ModerationStatus { PENDING, REVIEWED, ACTIONED, DISMISSED, APPEALED }

data class Report(
    val id: String,
    val reporterId: String,
    val targetKind: ReportTargetKind,
    val targetId: String,
    val reason: ReportReason,
    val note: String?,
    val status: ModerationStatus,
    val atEpochMs: Long,
)

enum class ModerationActionKind { HIDE_CONTENT, REMOVE_CONTENT, WARN_USER, SUSPEND_USER, NO_ACTION }

data class ModerationAction(
    val id: String,
    val reportId: String,
    val moderatorId: String,
    val kind: ModerationActionKind,
    val atEpochMs: Long,
)

// ---------------------------------------------------------------------------
// Programs
// ---------------------------------------------------------------------------

enum class ProgramLevel { BEGINNER, INTERMEDIATE, ADVANCED, ELITE }

enum class ProgramStatus { DRAFT, REVIEW, PUBLISHED, UNPUBLISHED, ARCHIVED }

data class ProgramExercise(
    val name: String,
    val prescription: String,
    val restSec: Int = 0,
    val videoRef: String? = null,
)

data class ProgramSessionDef(
    val id: String,
    val dayLabel: String,
    val title: String,
    val warmup: List<String> = emptyList(),
    val exercises: List<ProgramExercise> = emptyList(),
    val recoveryNotes: String? = null,
)

data class ProgramWeek(
    val index: Int,
    val focus: String,
    val sessions: List<ProgramSessionDef>,
)

data class ProgramDefinition(
    val id: String,
    val version: Int,
    val coachId: String,
    val title: String,
    val description: String,
    val sportKey: String,
    val level: ProgramLevel,
    val goals: List<String>,
    val weeks: List<ProgramWeek>,
    val nutritionNotes: List<String> = emptyList(),
    val educationNotes: List<String> = emptyList(),
    val equipment: List<String> = emptyList(),
    val requirements: List<String> = emptyList(),
    val priceCents: Long = 0,
    val visibility: Visibility = Visibility.PUBLIC,
    val status: ProgramStatus,
    val template: Boolean = false,
    val audit: Audit,
) {
    val durationWeeks: Int get() = weeks.size
    val totalSessions: Int get() = weeks.sumOf { it.sessions.size }
}

enum class EnrollmentState { ENROLLED, ACTIVE, PAUSED, COMPLETED, LEFT }

data class ProgramEnrollment(
    val id: String,
    val athleteId: String,
    val programId: String,
    val programVersion: Int,
    val state: EnrollmentState,
    val completedSessionIds: Set<String> = emptySet(),
    val currentWeek: Int = 1,
    val streakDays: Int = 0,
    val coachFeedback: List<String> = emptyList(),
    val audit: Audit,
)

// ---------------------------------------------------------------------------
// Challenges & leaderboards & achievements
// ---------------------------------------------------------------------------

enum class ChallengeMetric { DISTANCE, DURATION, SESSIONS, CALORIES, STEPS, CONSISTENCY, CUSTOM }

enum class ChallengeScoring { SUM, MAX, STREAK }

enum class ChallengeScope { INDIVIDUAL, GROUP, COACH_LED, COMMUNITY }

data class ChallengeDefinition(
    val id: String,
    val title: String,
    val description: String,
    val scope: ChallengeScope,
    val metric: ChallengeMetric,
    val customMetricKey: String? = null,
    val target: Double,
    val unit: String,
    val scoring: ChallengeScoring = ChallengeScoring.SUM,
    val startEpochMs: Long,
    val endEpochMs: Long,
    val sportKey: String? = null,
    val groupId: String? = null,
    val visibility: Visibility = Visibility.PUBLIC,
    val eligibility: List<String> = emptyList(),
    val rewards: List<String> = emptyList(),
    val recurring: Boolean = false,
    val audit: Audit,
)

data class ChallengeParticipation(
    val challengeId: String,
    val userId: String,
    val joinedAtEpochMs: Long,
    val score: Double = 0.0,
    val lastActivityEpochMs: Long? = null,
    val completed: Boolean = false,
)

enum class LeaderboardScope { GLOBAL, FRIENDS, GROUP, PROGRAM, CHALLENGE, SPORT }

data class LeaderboardEntry(
    val rank: Int,
    val userId: String,
    val displayName: String,
    val score: Double,
    val unit: String,
)

data class AchievementDefinition(
    val id: String,
    val title: String,
    val description: String,
    val category: String,
)

data class AwardedAchievement(
    val achievementId: String,
    val userId: String,
    val atEpochMs: Long,
    val contextRef: String? = null,
)
