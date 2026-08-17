package com.fitconnect.ascend.domain

data class EventPayload(
    val sessionId: String? = null,
    val sport: String? = null,
    val distanceM: Double = 0.0,
    val durationMs: Long = 0L,
    val elevationGainM: Double = 0.0,
    val caloriesKcal: Int = 0,
    val avgPaceSecPerKm: Double? = null,
    val avgHrBpm: Int? = null,
    val recoveryScore: Int? = null,
    val sleepQuality: Int? = null,
    val hrvTrendPercent: Double? = null,
    val routeId: String? = null,
    val challengeId: String? = null,
    val missionId: String? = null,
    val recordKind: RecordKind? = null,
    val recordValue: Double? = null,
    val isRecoveryDay: Boolean = false,
    val demo: Boolean = false,
    val weeklySessions: Int? = null,
)

data class PerformanceEvent(
    val eventId: String,
    val userId: String,
    val type: PerformanceEventType,
    val timestampEpochMs: Long,
    val source: EventSource,
    val payload: EventPayload = EventPayload(),
)

data class StoredEvent(
    val event: PerformanceEvent,
    val accepted: Boolean,
    val rejectReason: String? = null,
    val processedAtEpochMs: Long,
)

data class XpExplanation(
    val dimension: XpDimension,
    val points: Int,
    val reasonKey: String,
)

data class XpAward(
    val byDimension: Map<XpDimension, Int>,
    val explanations: List<XpExplanation>,
    val dampedForRecovery: Boolean,
) {
    val total: Int get() = byDimension.values.sum()
}

data class PerformanceLevel(
    val level: Int,
    val rank: PerformanceRank,
    val xpIntoLevel: Int,
    val xpForLevel: Int,
    val xpToNext: Int,
    val progressPercent: Int,
    val nextUnlock: Unlock? = null,
)

data class PerformanceRank(
    val index: Int,
    val code: String,
    val nameKey: String,
)

data class Unlock(
    val id: String,
    val atLevel: Int,
    val nameKey: String,
    val safetyCritical: Boolean = false,
)

data class AchievementDefinition(
    val id: String,
    val nameKey: String,
    val descriptionKey: String,
    val category: AchievementCategory,
    val rarity: AchievementRarity,
    val xpReward: Int,
    val icon: String,
    val criterion: AchievementCriterion,
)

data class AchievementCriterion(
    val kind: CriterionKind,
    val threshold: Double = 1.0,
)

enum class CriterionKind {
    WORKOUTS,
    DISTANCE_KM,
    PERFORMANCE_STREAK_DAYS,
    TRAINING_STREAK_DAYS,
    SLEEP_STREAK_DAYS,
    RECOVERY_STREAK_DAYS,
    PR_COUNT,
    SPORT_COUNT,
    ROUTE_COUNT,
    ELEVATION_M,
    LONGEST_KM,
    CARDIO_SESSIONS,
}

data class AchievementProgress(
    val definition: AchievementDefinition,
    val current: Double,
    val target: Double,
    val unlockedAtEpochMs: Long?,
    val demoOwnershipLabel: String? = null,
) {
    val unlocked: Boolean get() = unlockedAtEpochMs != null
    val percent: Int get() = if (target <= 0.0) 0 else ((current / target) * 100.0).toInt().coerceIn(0, 100)
}

data class Streak(
    val kind: StreakKind,
    val days: Int,
    val status: StreakStatus,
    val lastDayUtc: Int?,
)

data class Challenge(
    val id: String,
    val nameKey: String,
    val type: ChallengeType,
    val lifecycle: ChallengeLifecycle,
    val target: Double,
    val progress: Double,
    val unit: String,
    val expiresAtEpochMs: Long,
    val rewardXp: Int,
    val squadId: String? = null,
    val contributions: Map<String, Double> = emptyMap(),
    val demoLabeled: Boolean = false,
)

data class Mission(
    val id: String,
    val kind: MissionKind,
    val objectiveKey: String,
    val progress: Double,
    val target: Double,
    val rewardXp: Int,
    val expiresAtEpochMs: Long,
    val state: MissionState,
    val whyKey: String,
)

data class PersonalRecord(
    val kind: RecordKind,
    val value: Double,
    val unit: String,
    val timestampEpochMs: Long,
    val sourceActivityId: String?,
    val previousValue: Double?,
)

data class AthleteDna(
    val scores: Map<DnaDimension, Int>,
    val evidence: EvidenceKind,
    val athleteType: AthleteType,
    val primaryTrait: DnaDimension?,
    val emergingTrait: DnaDimension?,
    val evidenceNotesKey: String,
)

data class EnergyDeployment(
    val kcal: Int,
    val labelKey: String,
    val equivalentKey: String,
    val equivalentAmount: Double,
    val disclaimerKey: String,
)

data class RealWorldConversion(
    val kind: String,
    val headlineKey: String,
    val detailKey: String,
    val demoLabeled: Boolean,
)

data class MapSegment(
    val id: String,
    val nameKey: String,
    val distanceKm: Double,
    val elevationM: Double,
    val bestTimeMs: Long?,
    val demoLabeled: Boolean,
)

data class MotivationProfile(
    val style: MotivationStyle,
    val messageKey: String,
    val evidence: EvidenceKind,
)

data class Reward(
    val xp: Int,
    val achievementIds: List<String> = emptyList(),
    val unlockIds: List<String> = emptyList(),
)

data class PerformanceMilestone(
    val id: String,
    val nameKey: String,
    val atEpochMs: Long,
)

data class AscendPrefs(
    val hapticsEnabled: Boolean = true,
    val progressionNotificationsEnabled: Boolean = true,
)

data class ProcessResult(
    val status: ProcessStatus,
    val snapshot: ProgressionSnapshot,
    val awardedXp: Int,
    val explanations: List<XpExplanation>,
    val newAchievementIds: List<String>,
    val newRecordKinds: List<RecordKind>,
    val leveledUp: Boolean,
    val previousLevel: Int,
    val rejectReason: String? = null,
    val dampedForRecovery: Boolean = false,
)

data class ProgressionSnapshot(
    val userId: String,
    val scoringVersion: String,
    val totalXp: Int,
    val dimensionXp: Map<XpDimension, Int>,
    val level: PerformanceLevel,
    val achievements: List<AchievementProgress>,
    val streaks: List<Streak>,
    val missions: List<Mission>,
    val challenges: List<Challenge>,
    val records: List<PersonalRecord>,
    val dna: AthleteDna,
    val motivation: MotivationProfile,
    val energy: EnergyDeployment?,
    val conversions: List<RealWorldConversion>,
    val segments: List<MapSegment>,
    val unlocks: List<Unlock>,
    val milestones: List<PerformanceMilestone>,
    val prefs: AscendPrefs,
    val demoLabeled: Boolean,
    val processedEventCount: Int,
    val lastEventId: String?,
)
