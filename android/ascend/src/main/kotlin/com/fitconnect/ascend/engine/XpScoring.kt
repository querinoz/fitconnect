package com.fitconnect.ascend.engine

import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.PerformanceEventType
import com.fitconnect.ascend.domain.XpAward
import com.fitconnect.ascend.domain.XpDimension
import com.fitconnect.ascend.domain.XpExplanation
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * Versioned, deterministic XP model.
 *
 * Award XP is additive per accepted event (capped). Dimension weights do **not**
 * rescale each award; they define the performance-quality index used for DNA
 * and motivation. Volume is already dampened when recovery is poor, so rank
 * (which follows XP thresholds) is not a pure volume metric.
 *
 * Scoring version: ascend.xp.v1
 */
data class XpScoringModel(
    val version: String,
    val weightsPercent: Map<XpDimension, Int>,
    val maxXpPerWorkout: Int,
    val recoveryDampenerBelow: Int,
    val recoveryDampenerFactor: Double,
    val maxCommunityXpPerEvent: Int,
) {
    init {
        require(version.isNotBlank())
        require(weightsPercent.values.sum() == 100) {
            "weights must sum to 100, was ${weightsPercent.values.sum()}"
        }
        require(maxXpPerWorkout > 0)
        require(recoveryDampenerFactor in 0.0..1.0)
    }

    companion object {
        val V1: XpScoringModel = XpScoringModel(
            version = "ascend.xp.v1",
            weightsPercent = mapOf(
                XpDimension.ACTIVITY to 25,
                XpDimension.CONSISTENCY to 20,
                XpDimension.RECOVERY to 15,
                XpDimension.GOALS to 15,
                XpDimension.PERFORMANCE_QUALITY to 10,
                XpDimension.PERSONAL_RECORDS to 5,
                XpDimension.SKILL to 5,
                XpDimension.COMMUNITY to 5,
            ),
            maxXpPerWorkout = 80,
            recoveryDampenerBelow = 45,
            recoveryDampenerFactor = 0.5,
            maxCommunityXpPerEvent = 8,
        )
    }
}

object XpCalculator {
    fun award(event: PerformanceEvent, model: XpScoringModel): XpAward {
        val points = mutableMapOf<XpDimension, Int>()
        val reasons = mutableListOf<XpExplanation>()
        var damped = false

        fun add(dim: XpDimension, value: Int, reason: String) {
            if (value <= 0) return
            points[dim] = (points[dim] ?: 0) + value
            reasons += XpExplanation(dim, value, reason)
        }

        val p = event.payload
        val distanceKm = p.distanceM / 1000.0
        val durationMin = p.durationMs / 60_000.0

        when (event.type) {
            PerformanceEventType.WORKOUT_COMPLETED -> {
                var activity = (15 + (distanceKm * 3.0) + (durationMin / 4.0)).roundToInt()
                    .coerceIn(8, 50)
                val recovery = p.recoveryScore
                if (recovery != null && recovery < model.recoveryDampenerBelow) {
                    activity = (activity * model.recoveryDampenerFactor).roundToInt().coerceAtLeast(4)
                    damped = true
                    add(XpDimension.ACTIVITY, activity, "xp.activity.recovery_weighted")
                } else {
                    add(XpDimension.ACTIVITY, activity, "xp.activity.session")
                }
                var quality = 0
                val pace = p.avgPaceSecPerKm
                if (pace != null && pace in 240.0..480.0) quality += 12
                if (p.avgHrBpm != null) quality += 8
                quality = min(quality, 20)
                add(XpDimension.PERFORMANCE_QUALITY, quality, "xp.quality.session")
            }
            PerformanceEventType.DISTANCE_COMPLETED ->
                add(XpDimension.ACTIVITY, min(25, (distanceKm * 2).roundToInt().coerceAtLeast(5)), "xp.activity.distance")
            PerformanceEventType.GOAL_COMPLETED ->
                add(XpDimension.GOALS, 40, "xp.goals.completed")
            PerformanceEventType.DAILY_TARGET_COMPLETED ->
                add(XpDimension.CONSISTENCY, 20, "xp.consistency.daily")
            PerformanceEventType.WEEKLY_TARGET_COMPLETED ->
                add(XpDimension.CONSISTENCY, 45, "xp.consistency.weekly")
            PerformanceEventType.MONTHLY_TARGET_COMPLETED ->
                add(XpDimension.CONSISTENCY, 90, "xp.consistency.monthly")
            PerformanceEventType.PERSONAL_RECORD ->
                add(XpDimension.PERSONAL_RECORDS, 50, "xp.records.new")
            PerformanceEventType.RECOVERY_TARGET, PerformanceEventType.RECOVERY_DAY ->
                add(XpDimension.RECOVERY, 30, "xp.recovery.target")
            PerformanceEventType.SLEEP_TARGET -> {
                add(XpDimension.SLEEP, 20, "xp.sleep.target")
                add(XpDimension.RECOVERY, 15, "xp.recovery.sleep")
            }
            PerformanceEventType.COACH_PLAN_COMPLETED ->
                add(XpDimension.COACH_PLAN, 30, "xp.coach.plan")
            PerformanceEventType.CONSISTENCY_MILESTONE ->
                add(XpDimension.CONSISTENCY, 25, "xp.consistency.milestone")
            PerformanceEventType.COMMUNITY_ACTION ->
                add(XpDimension.COMMUNITY, model.maxCommunityXpPerEvent, "xp.community.action")
            PerformanceEventType.CHALLENGE_COMPLETED ->
                add(XpDimension.GOALS, 40, "xp.challenge.completed")
            PerformanceEventType.MAP_MILESTONE ->
                add(XpDimension.ACTIVITY, 15, "xp.map.milestone")
            PerformanceEventType.FIRST_ACTIVITY ->
                add(XpDimension.SKILL, 25, "xp.skill.first")
            PerformanceEventType.NEW_SPORT ->
                add(XpDimension.SKILL, 20, "xp.skill.sport")
            PerformanceEventType.NEW_ROUTE ->
                add(XpDimension.SKILL, 12, "xp.skill.route")
            PerformanceEventType.ELEVATION_MILESTONE ->
                add(XpDimension.ACTIVITY, min(25, (p.elevationGainM / 20.0).roundToInt().coerceAtLeast(8)), "xp.activity.elevation")
        }

        if (event.type == PerformanceEventType.WORKOUT_COMPLETED) {
            val cap = model.maxXpPerWorkout
            val total = points.values.sum()
            if (total > cap) {
                val factor = cap.toDouble() / total
                val scaled = points.mapValues { (_, v) -> (v * factor).roundToInt() }.toMutableMap()
                val drift = cap - scaled.values.sum()
                if (drift != 0) {
                    val key = scaled.maxByOrNull { it.value }?.key
                    if (key != null) scaled[key] = (scaled[key] ?: 0) + drift
                }
                points.clear()
                points.putAll(scaled)
            }
        }

        return XpAward(
            byDimension = points.filterValues { it > 0 },
            explanations = reasons.filter { it.points > 0 },
            dampedForRecovery = damped,
        )
    }
}
