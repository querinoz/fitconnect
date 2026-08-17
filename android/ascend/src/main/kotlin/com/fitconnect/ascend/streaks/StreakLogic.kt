package com.fitconnect.ascend.streaks

import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.PerformanceEventType
import com.fitconnect.ascend.domain.Streak
import com.fitconnect.ascend.domain.StreakKind
import com.fitconnect.ascend.domain.StreakStatus

object StreakLogic {
    const val DAY_MS = 86_400_000L

    fun utcDay(epochMs: Long): Int = (epochMs / DAY_MS).toInt()

    fun apply(current: Map<StreakKind, Streak>, event: PerformanceEvent): Map<StreakKind, Streak> {
        val day = utcDay(event.timestampEpochMs)
        val next = current.toMutableMap()
        StreakKind.entries.forEach { kind ->
            if (kind !in next) next[kind] = Streak(kind, 0, StreakStatus.BROKEN, null)
        }
        when (event.type) {
            PerformanceEventType.WORKOUT_COMPLETED -> {
                bump(next, StreakKind.TRAINING, day, protect = false)
                bump(next, StreakKind.PERFORMANCE, day, protect = false)
                bump(next, StreakKind.CONSISTENCY, day, protect = false)
            }
            PerformanceEventType.RECOVERY_DAY, PerformanceEventType.RECOVERY_TARGET -> {
                bump(next, StreakKind.RECOVERY, day, protect = false)
                bump(next, StreakKind.PERFORMANCE, day, protect = true)
                bump(next, StreakKind.CONSISTENCY, day, protect = true)
            }
            PerformanceEventType.SLEEP_TARGET -> {
                bump(next, StreakKind.SLEEP, day, protect = false)
                bump(next, StreakKind.CONSISTENCY, day, protect = true)
            }
            PerformanceEventType.DAILY_TARGET_COMPLETED, PerformanceEventType.GOAL_COMPLETED -> {
                bump(next, StreakKind.GOAL, day, protect = false)
                bump(next, StreakKind.CONSISTENCY, day, protect = true)
            }
            else -> Unit
        }
        return next
    }

    fun breakGaps(streaks: Map<StreakKind, Streak>, todayUtc: Int): Map<StreakKind, Streak> =
        streaks.mapValues { (_, streak) ->
            val last = streak.lastDayUtc ?: return@mapValues streak
            if (todayUtc - last <= 1) streak
            else streak.copy(status = StreakStatus.BROKEN, days = 0)
        }

    private fun bump(
        map: MutableMap<StreakKind, Streak>,
        kind: StreakKind,
        day: Int,
        protect: Boolean,
    ) {
        val current = map[kind] ?: Streak(kind, 0, StreakStatus.BROKEN, null)
        if (current.lastDayUtc == day) {
            map[kind] = current.copy(
                status = if (protect && current.status != StreakStatus.ACTIVE) {
                    StreakStatus.RECOVERY_PROTECTED
                } else {
                    current.status
                },
            )
            return
        }
        val continued = current.lastDayUtc == null || current.lastDayUtc == day - 1
        val days = if (continued) current.days + 1 else 1
        val status = when {
            protect && current.lastDayUtc == day - 1 -> StreakStatus.RECOVERY_PROTECTED
            else -> StreakStatus.ACTIVE
        }
        map[kind] = Streak(kind, days, status, day)
    }
}
