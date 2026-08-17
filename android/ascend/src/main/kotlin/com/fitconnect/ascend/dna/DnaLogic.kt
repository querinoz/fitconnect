package com.fitconnect.ascend.dna

import com.fitconnect.ascend.domain.AthleteDna
import com.fitconnect.ascend.domain.AthleteType
import com.fitconnect.ascend.domain.DnaDimension
import com.fitconnect.ascend.domain.EvidenceKind
import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.PerformanceEventType
import com.fitconnect.ascend.domain.Streak
import com.fitconnect.ascend.domain.StreakKind
import kotlin.math.min
import kotlin.math.roundToInt

object DnaLogic {
    fun compute(
        events: List<PerformanceEvent>,
        streaks: Map<StreakKind, Streak>,
        sports: Set<String>,
        routes: Set<String>,
        demoLabeled: Boolean,
    ): AthleteDna {
        val workouts = events.filter { it.type == PerformanceEventType.WORKOUT_COMPLETED }
        if (workouts.isEmpty()) {
            return AthleteDna(
                scores = DnaDimension.entries.associateWith { 0 },
                evidence = EvidenceKind.INSUFFICIENT_DATA,
                athleteType = AthleteType.UNCLASSIFIED,
                primaryTrait = null,
                emergingTrait = null,
                evidenceNotesKey = "dna.insufficient",
            )
        }
        val distanceKm = workouts.sumOf { it.payload.distanceM } / 1000.0
        val elevation = workouts.sumOf { it.payload.elevationGainM }
        val avgPace = workouts.mapNotNull { it.payload.avgPaceSecPerKm }.average().takeIf { !it.isNaN() }
        val recoveryDays = events.count {
            it.type == PerformanceEventType.RECOVERY_DAY || it.type == PerformanceEventType.RECOVERY_TARGET
        }
        val sleepDays = events.count { it.type == PerformanceEventType.SLEEP_TARGET }
        val goals = events.count {
            it.type == PerformanceEventType.GOAL_COMPLETED ||
                it.type == PerformanceEventType.DAILY_TARGET_COMPLETED
        }
        val endurance = score(distanceKm / 2.5)
        val power = score(elevation / 40.0)
        val speed = when {
            avgPace == null -> 0
            avgPace <= 240 -> 92
            avgPace <= 300 -> 80
            avgPace <= 360 -> 68
            avgPace <= 420 -> 55
            else -> 40
        }
        val consistency = score((streaks[StreakKind.PERFORMANCE]?.days ?: 0) * 6.0)
        val recovery = score(recoveryDays * 12.0 + sleepDays * 8.0)
        val discipline = score(goals * 10.0 + sleepDays * 6.0)
        val scores = mapOf(
            DnaDimension.ENDURANCE to endurance,
            DnaDimension.POWER to power,
            DnaDimension.SPEED to speed,
            DnaDimension.CONSISTENCY to consistency,
            DnaDimension.RECOVERY to recovery,
            DnaDimension.DISCIPLINE to discipline,
        )
        val ordered = scores.entries.sortedWith(
            compareByDescending<Map.Entry<DnaDimension, Int>> { it.value }
                .thenBy { tieBreak(it.key) },
        )
        val max = ordered.first().value
        val min = ordered.last().value
        val explorer = routes.size >= 3 && sports.size >= 2
        val type = when {
            workouts.size < 3 -> AthleteType.UNCLASSIFIED
            max - min < 15 -> AthleteType.THE_BALANCED
            explorer && ordered.first().key != DnaDimension.SPEED -> AthleteType.THE_EXPLORER
            else -> when (ordered.first().key) {
                DnaDimension.ENDURANCE -> AthleteType.THE_ENGINE
                DnaDimension.SPEED -> AthleteType.THE_SPRINTER
                DnaDimension.POWER -> AthleteType.THE_CLIMBER
                DnaDimension.CONSISTENCY, DnaDimension.DISCIPLINE -> AthleteType.THE_DISCIPLINED
                DnaDimension.RECOVERY -> AthleteType.THE_RECOVERY_MASTER
            }
        }
        return AthleteDna(
            scores = scores,
            evidence = if (demoLabeled) EvidenceKind.LOCAL_DEMO else EvidenceKind.CALCULATED,
            athleteType = type,
            primaryTrait = ordered.first().key,
            emergingTrait = ordered.getOrNull(1)?.key,
            evidenceNotesKey = if (demoLabeled) "dna.demo" else "dna.calculated",
        )
    }

    private fun score(raw: Double): Int = min(99, raw.roundToInt()).coerceAtLeast(0)

    private fun tieBreak(dimension: DnaDimension): Int = when (dimension) {
        DnaDimension.ENDURANCE -> 0
        DnaDimension.CONSISTENCY -> 1
        DnaDimension.DISCIPLINE -> 2
        DnaDimension.RECOVERY -> 3
        DnaDimension.SPEED -> 4
        DnaDimension.POWER -> 5
    }
}
