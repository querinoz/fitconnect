package com.fitconnect.ascend.missions

import com.fitconnect.ascend.domain.Mission
import com.fitconnect.ascend.domain.MissionKind
import com.fitconnect.ascend.domain.MissionState
import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.PerformanceEventType
import com.fitconnect.ascend.streaks.StreakLogic

object MissionLogic {
    fun ensurePeriodMissions(existing: List<Mission>, nowEpochMs: Long): List<Mission> {
        val day = StreakLogic.utcDay(nowEpochMs)
        val keep = existing.filter { it.state == MissionState.COMPLETED || it.expiresAtEpochMs > nowEpochMs }
        val result = keep.toMutableList()
        if (result.none { it.kind == MissionKind.DAILY && StreakLogic.utcDay(it.expiresAtEpochMs - 1) == day }) {
            result += Mission(
                id = "daily-$day",
                kind = MissionKind.DAILY,
                objectiveKey = "mission.daily.move_or_recover",
                progress = 0.0,
                target = 1.0,
                rewardXp = 20,
                expiresAtEpochMs = (day + 1) * StreakLogic.DAY_MS,
                state = MissionState.ACTIVE,
                whyKey = "mission.daily.why",
            )
        }
        val week = day / 7
        if (result.none { it.kind == MissionKind.WEEKLY && it.id == "weekly-$week" }) {
            result += Mission(
                id = "weekly-$week",
                kind = MissionKind.WEEKLY,
                objectiveKey = "mission.weekly.distance",
                progress = 0.0,
                target = 20_000.0,
                rewardXp = 45,
                expiresAtEpochMs = (week + 1) * 7L * StreakLogic.DAY_MS,
                state = MissionState.ACTIVE,
                whyKey = "mission.weekly.why",
            )
        }
        val month = day / 30
        if (result.none { it.kind == MissionKind.MONTHLY && it.id == "monthly-$month" }) {
            result += Mission(
                id = "monthly-$month",
                kind = MissionKind.MONTHLY,
                objectiveKey = "mission.monthly.distance",
                progress = 0.0,
                target = 80_000.0,
                rewardXp = 90,
                expiresAtEpochMs = (month + 1) * 30L * StreakLogic.DAY_MS,
                state = MissionState.ACTIVE,
                whyKey = "mission.monthly.why",
            )
        }
        if (result.none { it.kind == MissionKind.PERSONAL }) {
            result += Mission(
                id = "personal-endurance",
                kind = MissionKind.PERSONAL,
                objectiveKey = "mission.personal.endurance",
                progress = 0.0,
                target = 10_000.0,
                rewardXp = 40,
                expiresAtEpochMs = nowEpochMs + 30L * StreakLogic.DAY_MS,
                state = MissionState.ACTIVE,
                whyKey = "mission.personal.why",
            )
        }
        return result.map { mission ->
            if (mission.state == MissionState.ACTIVE && nowEpochMs >= mission.expiresAtEpochMs) {
                mission.copy(state = MissionState.EXPIRED)
            } else {
                mission
            }
        }
    }

    fun apply(missions: List<Mission>, event: PerformanceEvent): Pair<List<Mission>, List<String>> {
        val completed = mutableListOf<String>()
        val next = missions.map { mission ->
            if (mission.state != MissionState.ACTIVE) return@map mission
            val delta = when (mission.kind) {
                MissionKind.DAILY -> when (event.type) {
                    PerformanceEventType.WORKOUT_COMPLETED,
                    PerformanceEventType.RECOVERY_DAY,
                    PerformanceEventType.RECOVERY_TARGET,
                    -> 1.0
                    else -> 0.0
                }
                MissionKind.WEEKLY, MissionKind.MONTHLY, MissionKind.PERSONAL -> when (event.type) {
                    PerformanceEventType.WORKOUT_COMPLETED -> event.payload.distanceM
                    else -> 0.0
                }
                MissionKind.COACH, MissionKind.SQUAD, MissionKind.GLOBAL -> when (event.type) {
                    PerformanceEventType.WORKOUT_COMPLETED -> event.payload.distanceM
                    PerformanceEventType.CHALLENGE_COMPLETED -> mission.target
                    else -> 0.0
                }
            }
            if (delta <= 0.0) return@map mission
            val progress = (mission.progress + delta).coerceAtMost(mission.target)
            val done = progress >= mission.target
            if (done) completed += mission.id
            mission.copy(
                progress = progress,
                state = if (done) MissionState.COMPLETED else MissionState.ACTIVE,
            )
        }
        return next to completed
    }
}
