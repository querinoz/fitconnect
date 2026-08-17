package com.fitconnect.ascend.motivation

import com.fitconnect.ascend.domain.EvidenceKind
import com.fitconnect.ascend.domain.MotivationProfile
import com.fitconnect.ascend.domain.MotivationStyle
import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.PerformanceEventType
import com.fitconnect.ascend.domain.Streak
import com.fitconnect.ascend.domain.StreakKind

object MotivationLogic {
    fun profile(
        events: List<PerformanceEvent>,
        streaks: Map<StreakKind, Streak>,
        unlockedCount: Int,
        remainingAchievements: Int,
        newRoutes: Int,
        demoLabeled: Boolean,
    ): MotivationProfile {
        if (events.size < 8) {
            return MotivationProfile(
                MotivationStyle.INSUFFICIENT_DATA,
                "motivation.insufficient",
                EvidenceKind.INSUFFICIENT_DATA,
            )
        }
        val workouts = events.count { it.type == PerformanceEventType.WORKOUT_COMPLETED }
        val community = events.count { it.type == PerformanceEventType.COMMUNITY_ACTION }
        val sleep = events.count { it.type == PerformanceEventType.SLEEP_TARGET }
        val consistencyDays = streaks[StreakKind.PERFORMANCE]?.days ?: 0
        val style = when {
            consistencyDays >= 14 -> MotivationStyle.CONSISTENCY
            newRoutes >= 3 -> MotivationStyle.EXPLORER
            remainingAchievements in 1..4 && unlockedCount >= 3 -> MotivationStyle.ACHIEVER
            sleep >= 5 && workouts >= 5 -> MotivationStyle.SCIENTIST
            community >= 2 || workouts >= 10 -> MotivationStyle.COMPETITOR
            else -> MotivationStyle.ACHIEVER
        }
        val key = when (style) {
            MotivationStyle.COMPETITOR -> "motivation.competitor"
            MotivationStyle.ACHIEVER -> "motivation.achiever"
            MotivationStyle.EXPLORER -> "motivation.explorer"
            MotivationStyle.CONSISTENCY -> "motivation.consistency"
            MotivationStyle.SCIENTIST -> "motivation.scientist"
            MotivationStyle.INSUFFICIENT_DATA -> "motivation.insufficient"
        }
        return MotivationProfile(
            style = style,
            messageKey = key,
            evidence = if (demoLabeled) EvidenceKind.LOCAL_DEMO else EvidenceKind.INFERRED,
        )
    }
}
