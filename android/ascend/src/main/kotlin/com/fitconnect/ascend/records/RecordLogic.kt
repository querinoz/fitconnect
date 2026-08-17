package com.fitconnect.ascend.records

import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.PerformanceEventType
import com.fitconnect.ascend.domain.PersonalRecord
import com.fitconnect.ascend.domain.RecordKind
import com.fitconnect.ascend.domain.StreakKind
import com.fitconnect.ascend.streaks.StreakLogic

object RecordLogic {
    fun apply(
        current: Map<RecordKind, PersonalRecord>,
        event: PerformanceEvent,
        performanceStreakDays: Int,
        weeklySessions: Int,
    ): Pair<Map<RecordKind, PersonalRecord>, List<RecordKind>> {
        if (event.type != PerformanceEventType.WORKOUT_COMPLETED &&
            event.type != PerformanceEventType.PERSONAL_RECORD &&
            event.type != PerformanceEventType.RECOVERY_TARGET
        ) {
            val streakUpdate = maybeImprove(
                current,
                RecordKind.LONGEST_STREAK,
                performanceStreakDays.toDouble(),
                "days",
                event,
                higherIsBetter = true,
            )
            return streakUpdate
        }
        var map = current
        val improved = mutableListOf<RecordKind>()
        fun consider(kind: RecordKind, value: Double?, unit: String, higher: Boolean) {
            if (value == null) return
            val (next, hit) = maybeImprove(map, kind, value, unit, event, higher)
            map = next
            improved += hit
        }
        val p = event.payload
        val km = p.distanceM / 1000.0
        val pace = p.avgPaceSecPerKm
        if (km >= 0.95 && pace != null) consider(RecordKind.FASTEST_1K, pace, "sec/km", higher = false)
        if (km >= 4.9 && pace != null) consider(RecordKind.FASTEST_5K, pace, "sec/km", higher = false)
        if (km >= 9.8 && pace != null) consider(RecordKind.FASTEST_10K, pace, "sec/km", higher = false)
        consider(RecordKind.LONGEST_ACTIVITY, km, "km", higher = true)
        consider(RecordKind.HIGHEST_ELEVATION, p.elevationGainM, "m", higher = true)
        consider(RecordKind.LONGEST_SESSION, p.durationMs.toDouble(), "ms", higher = true)
        consider(RecordKind.LONGEST_STREAK, performanceStreakDays.toDouble(), "days", higher = true)
        p.recoveryScore?.let { consider(RecordKind.BEST_RECOVERY, it.toDouble(), "score", higher = true) }
        p.hrvTrendPercent?.let { consider(RecordKind.BEST_HRV_TREND, it, "%", higher = true) }
        consider(RecordKind.BEST_WEEKLY_CONSISTENCY, weeklySessions.toDouble(), "sessions", higher = true)
        return map to improved
    }

    private fun maybeImprove(
        current: Map<RecordKind, PersonalRecord>,
        kind: RecordKind,
        value: Double,
        unit: String,
        event: PerformanceEvent,
        higherIsBetter: Boolean,
    ): Pair<Map<RecordKind, PersonalRecord>, List<RecordKind>> {
        val existing = current[kind]
        val better = when {
            existing == null -> true
            higherIsBetter -> value > existing.value
            else -> value < existing.value
        }
        if (!better) return current to emptyList()
        val record = PersonalRecord(
            kind = kind,
            value = value,
            unit = unit,
            timestampEpochMs = event.timestampEpochMs,
            sourceActivityId = event.payload.sessionId,
            previousValue = existing?.value,
        )
        return current + (kind to record) to listOf(kind)
    }

    fun weeklySessions(events: List<PerformanceEvent>, atEpochMs: Long): Int {
        val day = StreakLogic.utcDay(atEpochMs)
        val start = day - 6
        return events.count { stored ->
            stored.type == PerformanceEventType.WORKOUT_COMPLETED &&
                StreakLogic.utcDay(stored.timestampEpochMs) in start..day
        }
    }
}
