package com.fitconnect.ascend.domain

enum class PerformanceEventType {
    WORKOUT_COMPLETED,
    DISTANCE_COMPLETED,
    GOAL_COMPLETED,
    DAILY_TARGET_COMPLETED,
    WEEKLY_TARGET_COMPLETED,
    MONTHLY_TARGET_COMPLETED,
    PERSONAL_RECORD,
    RECOVERY_TARGET,
    SLEEP_TARGET,
    COACH_PLAN_COMPLETED,
    CONSISTENCY_MILESTONE,
    COMMUNITY_ACTION,
    CHALLENGE_COMPLETED,
    MAP_MILESTONE,
    FIRST_ACTIVITY,
    NEW_SPORT,
    NEW_ROUTE,
    ELEVATION_MILESTONE,
    RECOVERY_DAY,
}

enum class EventSource {
    PHONE,
    WATCH,
    SYNC,
    LOCAL_DEMO,
}

enum class XpDimension {
    ACTIVITY,
    CONSISTENCY,
    RECOVERY,
    SLEEP,
    GOALS,
    SKILL,
    PERSONAL_RECORDS,
    COMMUNITY,
    COACH_PLAN,
    PERFORMANCE_QUALITY,
}

enum class AchievementCategory {
    DISTANCE,
    CONSISTENCY,
    CARDIO,
    SPEED,
    ENDURANCE,
    RECOVERY,
    SLEEP,
    PERFORMANCE,
    EXPLORATION,
    COMMUNITY,
    COACHING,
    PERSONAL_RECORD,
    SPORT,
    MILESTONE,
    LEGACY,
}

enum class AchievementRarity {
    COMMON,
    UNCOMMON,
    RARE,
    EPIC,
    LEGENDARY,
    MYTHIC,
}

enum class StreakKind {
    PERFORMANCE,
    TRAINING,
    RECOVERY,
    SLEEP,
    GOAL,
    CONSISTENCY,
}

enum class StreakStatus {
    ACTIVE,
    RECOVERY_PROTECTED,
    COMPLETED,
    BROKEN,
}

enum class ChallengeType {
    DISTANCE,
    TIME,
    ELEVATION,
    CONSISTENCY,
    RECOVERY,
    PERSONAL_BEST,
    SPORT,
    EXPLORATION,
    SQUAD,
    COMMUNITY,
}

enum class ChallengeLifecycle {
    AVAILABLE,
    JOINED,
    ACTIVE,
    COMPLETED,
    EXPIRED,
}

enum class MissionKind {
    DAILY,
    WEEKLY,
    MONTHLY,
    PERSONAL,
    COACH,
    SQUAD,
    GLOBAL,
}

enum class MissionState {
    ACTIVE,
    COMPLETED,
    EXPIRED,
}

enum class RecordKind {
    FASTEST_1K,
    FASTEST_5K,
    FASTEST_10K,
    LONGEST_ACTIVITY,
    HIGHEST_ELEVATION,
    LONGEST_STREAK,
    BEST_RECOVERY,
    BEST_HRV_TREND,
    LONGEST_SESSION,
    BEST_WEEKLY_CONSISTENCY,
}

enum class DnaDimension {
    ENDURANCE,
    POWER,
    SPEED,
    CONSISTENCY,
    RECOVERY,
    DISCIPLINE,
}

enum class AthleteType {
    UNCLASSIFIED,
    THE_ENGINE,
    THE_SPRINTER,
    THE_CLIMBER,
    THE_DISCIPLINED,
    THE_BALANCED,
    THE_RECOVERY_MASTER,
    THE_EXPLORER,
}

enum class MotivationStyle {
    INSUFFICIENT_DATA,
    COMPETITOR,
    ACHIEVER,
    EXPLORER,
    CONSISTENCY,
    SCIENTIST,
}

enum class ProcessStatus {
    APPLIED,
    DUPLICATE,
    REJECTED,
}

enum class EvidenceKind {
    OBSERVED,
    CALCULATED,
    INFERRED,
    INSUFFICIENT_DATA,
    LOCAL_DEMO,
}
