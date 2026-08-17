package com.fitconnect.ascend.challenges

import com.fitconnect.ascend.domain.Challenge
import com.fitconnect.ascend.domain.ChallengeLifecycle
import com.fitconnect.ascend.domain.ChallengeType
import com.fitconnect.ascend.domain.PerformanceEvent
import com.fitconnect.ascend.domain.PerformanceEventType
import com.fitconnect.ascend.streaks.StreakLogic

object ChallengeCatalog {
    fun defaults(nowEpochMs: Long): List<Challenge> {
        val weekEnd = nowEpochMs + 7L * StreakLogic.DAY_MS
        return listOf(
            Challenge(
                id = "local-distance-week",
                nameKey = "challenge.distance_week",
                type = ChallengeType.DISTANCE,
                lifecycle = ChallengeLifecycle.AVAILABLE,
                target = 50_000.0,
                progress = 0.0,
                unit = "m",
                expiresAtEpochMs = weekEnd,
                rewardXp = 40,
                demoLabeled = true,
            ),
            Challenge(
                id = "squad-fc-week",
                nameKey = "challenge.squad_week",
                type = ChallengeType.SQUAD,
                lifecycle = ChallengeLifecycle.AVAILABLE,
                target = 50_000.0,
                progress = 0.0,
                unit = "m",
                expiresAtEpochMs = weekEnd,
                rewardXp = 40,
                squadId = "fc-performance",
                demoLabeled = true,
            ),
        )
    }

    fun apply(challenges: List<Challenge>, event: PerformanceEvent, nowEpochMs: Long): Pair<List<Challenge>, List<String>> {
        val completed = mutableListOf<String>()
        val next = challenges.map { challenge ->
            var current = challenge
            if (current.lifecycle != ChallengeLifecycle.COMPLETED &&
                current.lifecycle != ChallengeLifecycle.EXPIRED &&
                nowEpochMs >= current.expiresAtEpochMs
            ) {
                current = current.copy(lifecycle = ChallengeLifecycle.EXPIRED)
            }
            if (current.lifecycle != ChallengeLifecycle.JOINED &&
                current.lifecycle != ChallengeLifecycle.ACTIVE
            ) {
                return@map current
            }
            if (event.type != PerformanceEventType.WORKOUT_COMPLETED) return@map current
            val add = when (current.type) {
                ChallengeType.DISTANCE, ChallengeType.SQUAD, ChallengeType.COMMUNITY -> event.payload.distanceM
                ChallengeType.ELEVATION -> event.payload.elevationGainM
                ChallengeType.TIME -> event.payload.durationMs.toDouble()
                ChallengeType.CONSISTENCY, ChallengeType.RECOVERY, ChallengeType.PERSONAL_BEST,
                ChallengeType.SPORT, ChallengeType.EXPLORATION,
                -> 1.0
            }
            val contributions = current.contributions + (
                event.userId to (current.contributions[event.userId] ?: 0.0) + add
                )
            val progress = contributions.values.sum()
            val done = progress >= current.target
            if (done) completed += current.id
            current.copy(
                contributions = contributions,
                progress = progress,
                lifecycle = if (done) ChallengeLifecycle.COMPLETED else ChallengeLifecycle.ACTIVE,
            )
        }
        return next to completed
    }

    fun join(challenges: List<Challenge>, challengeId: String, nowEpochMs: Long): List<Challenge> =
        challenges.map { challenge ->
            if (challenge.id != challengeId) return@map challenge
            if (nowEpochMs >= challenge.expiresAtEpochMs) {
                challenge.copy(lifecycle = ChallengeLifecycle.EXPIRED)
            } else if (challenge.lifecycle == ChallengeLifecycle.AVAILABLE) {
                challenge.copy(lifecycle = ChallengeLifecycle.JOINED)
            } else {
                challenge
            }
        }
}
