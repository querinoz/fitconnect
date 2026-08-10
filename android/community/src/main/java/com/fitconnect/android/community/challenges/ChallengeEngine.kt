package com.fitconnect.android.community.challenges

import com.fitconnect.android.community.domain.ChallengeDefinition
import com.fitconnect.android.community.domain.ChallengeMetric
import com.fitconnect.android.community.domain.ChallengeParticipation
import com.fitconnect.android.community.domain.ChallengeScoring
import com.fitconnect.android.community.integration.ActivityFactsPort
import com.fitconnect.android.community.safety.ActionRateLimiter
import com.fitconnect.android.community.safety.CommunityAction
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

data class ChallengeStanding(
    val rank: Int,
    val participation: ChallengeParticipation,
)

/**
 * Rule-driven challenges. Definitions carry all rules (metric, target, unit,
 * window, scoring, visibility, rewards) — no rule is hardcoded in screens.
 * Scores come from the Telemetry engine via [ActivityFactsPort]; Community
 * never computes activity metrics itself.
 */
interface ChallengeEngine {
    suspend fun create(definition: ChallengeDefinition): ChallengeDefinition
    suspend fun all(): List<ChallengeDefinition>
    suspend fun active(nowEpochMs: Long): List<ChallengeDefinition>
    suspend fun get(challengeId: String): ChallengeDefinition?
    suspend fun join(challengeId: String, userId: String): Boolean
    suspend fun leave(challengeId: String, userId: String): Boolean
    suspend fun participants(challengeId: String): List<ChallengeParticipation>
    suspend fun isParticipant(challengeId: String, userId: String): Boolean

    /** Pull fresh scores from the facts port and update completion flags. */
    suspend fun refreshScores(challengeId: String): List<ChallengeParticipation>

    /** Deterministic ranking with tie-breaking by earliest activity, then join time. */
    suspend fun standings(challengeId: String, offset: Int = 0, limit: Int = 50): List<ChallengeStanding>
}

class InMemoryChallengeEngine(
    private val facts: ActivityFactsPort,
    private val rateLimiter: ActionRateLimiter,
    private val nowProvider: () -> Long = System::currentTimeMillis,
) : ChallengeEngine {
    private val mutex = Mutex()
    private val definitions = linkedMapOf<String, ChallengeDefinition>()
    private val participations = mutableMapOf<String, MutableMap<String, ChallengeParticipation>>()

    override suspend fun create(definition: ChallengeDefinition): ChallengeDefinition = mutex.withLock {
        require(definition.endEpochMs > definition.startEpochMs) { "Challenge end must be after start" }
        require(definition.target > 0) { "Challenge target must be positive" }
        definitions[definition.id] = definition
        participations.getOrPut(definition.id) { mutableMapOf() }
        definition
    }

    override suspend fun all(): List<ChallengeDefinition> = mutex.withLock {
        definitions.values.filter { !it.audit.deleted }
    }

    override suspend fun active(nowEpochMs: Long): List<ChallengeDefinition> = mutex.withLock {
        definitions.values.filter {
            !it.audit.deleted && nowEpochMs in it.startEpochMs..it.endEpochMs
        }
    }

    override suspend fun get(challengeId: String): ChallengeDefinition? = mutex.withLock {
        definitions[challengeId]
    }

    override suspend fun join(challengeId: String, userId: String): Boolean = mutex.withLock {
        val definition = definitions[challengeId] ?: return@withLock false
        val now = nowProvider()
        if (now > definition.endEpochMs) return@withLock false
        val pool = participations.getValue(challengeId)
        if (pool.containsKey(userId)) return@withLock true // duplicate-participation guard, idempotent
        if (!rateLimiter.tryAcquire(userId, CommunityAction.JOIN_CHALLENGE)) return@withLock false
        pool[userId] = ChallengeParticipation(challengeId, userId, joinedAtEpochMs = now)
        true
    }

    override suspend fun leave(challengeId: String, userId: String): Boolean = mutex.withLock {
        participations[challengeId]?.remove(userId) != null
    }

    override suspend fun participants(challengeId: String): List<ChallengeParticipation> = mutex.withLock {
        participations[challengeId].orEmpty().values.toList()
    }

    override suspend fun isParticipant(challengeId: String, userId: String): Boolean = mutex.withLock {
        participations[challengeId]?.containsKey(userId) == true
    }

    override suspend fun refreshScores(challengeId: String): List<ChallengeParticipation> {
        val definition = mutex.withLock { definitions[challengeId] } ?: return emptyList()
        val current = mutex.withLock { participations[challengeId].orEmpty().values.toList() }
        val updated = current.map { participation ->
            val score = when (definition.scoring) {
                ChallengeScoring.SUM, ChallengeScoring.MAX -> facts.metricTotal(
                    userId = participation.userId,
                    metric = definition.metric,
                    customKey = definition.customMetricKey,
                    fromEpochMs = definition.startEpochMs,
                    toEpochMs = definition.endEpochMs,
                )
                ChallengeScoring.STREAK -> facts.activeDayStreak(participation.userId).toDouble()
            }
            participation.copy(
                score = score,
                lastActivityEpochMs = if (score > participation.score) nowProvider() else participation.lastActivityEpochMs,
                completed = score >= definition.target,
            )
        }
        mutex.withLock {
            val pool = participations.getValue(challengeId)
            updated.forEach { pool[it.userId] = it }
        }
        return updated
    }

    override suspend fun standings(challengeId: String, offset: Int, limit: Int): List<ChallengeStanding> {
        val ranked = mutex.withLock {
            participations[challengeId].orEmpty().values
                .sortedWith(
                    compareByDescending<ChallengeParticipation> { it.score }
                        // Tie-break 1: earliest last progress wins; tie-break 2: earliest join.
                        .thenBy { it.lastActivityEpochMs ?: Long.MAX_VALUE }
                        .thenBy { it.joinedAtEpochMs },
                )
        }
        return ranked
            .mapIndexed { index, participation -> ChallengeStanding(index + 1, participation) }
            .drop(offset)
            .take(limit)
    }

    /** For CONSISTENCY challenges the metric maps to streak scoring. */
    companion object {
        fun defaultScoring(metric: ChallengeMetric): ChallengeScoring =
            if (metric == ChallengeMetric.CONSISTENCY) ChallengeScoring.STREAK else ChallengeScoring.SUM
    }
}
