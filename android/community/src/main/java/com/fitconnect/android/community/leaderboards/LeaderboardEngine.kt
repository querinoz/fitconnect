package com.fitconnect.android.community.leaderboards

import com.fitconnect.android.community.challenges.ChallengeEngine
import com.fitconnect.android.community.domain.LeaderboardEntry
import com.fitconnect.android.community.domain.LeaderboardScope
import com.fitconnect.android.community.domain.UserProfile
import com.fitconnect.android.community.graph.SocialGraph
import com.fitconnect.android.community.groups.GroupEngine

data class LeaderboardRequest(
    val viewerId: String,
    val scope: LeaderboardScope,
    val contextId: String? = null, // challenge / group / program / sport key
    val offset: Int = 0,
    val limit: Int = 25,
)

/**
 * Leaderboard calculation isolated from UI. Backed by challenge standings and
 * scoped by graph/group membership; snapshots are cached per (scope, context)
 * with a short TTL to prevent unnecessary realtime recomputation.
 */
class LeaderboardEngine(
    private val challenges: ChallengeEngine,
    private val graph: SocialGraph,
    private val groups: GroupEngine,
    private val profileLookup: suspend (String) -> UserProfile?,
    private val nowProvider: () -> Long = System::currentTimeMillis,
    private val cacheTtlMs: Long = 30_000,
) {
    private data class CacheEntry(val atEpochMs: Long, val entries: List<LeaderboardEntry>)

    private val cache = mutableMapOf<String, CacheEntry>()

    suspend fun leaderboard(request: LeaderboardRequest): List<LeaderboardEntry> {
        val challengeId = request.contextId ?: return emptyList()
        val cacheKey = "${request.scope}:$challengeId"
        val now = nowProvider()
        val cached = synchronized(cache) { cache[cacheKey] }
        val full = if (cached != null && now - cached.atEpochMs < cacheTtlMs) {
            cached.entries
        } else {
            val computed = compute(challengeId)
            synchronized(cache) { cache[cacheKey] = CacheEntry(now, computed) }
            computed
        }
        val scoped = scopeFilter(request, full)
        return scoped.drop(request.offset).take(request.limit)
    }

    private suspend fun compute(challengeId: String): List<LeaderboardEntry> {
        challenges.refreshScores(challengeId)
        val definition = challenges.get(challengeId) ?: return emptyList()
        return challenges.standings(challengeId, offset = 0, limit = MAX_BOARD).map { standing ->
            LeaderboardEntry(
                rank = standing.rank,
                userId = standing.participation.userId,
                displayName = profileLookup(standing.participation.userId)?.displayName
                    ?: standing.participation.userId,
                score = standing.participation.score,
                unit = definition.unit,
            )
        }
    }

    private suspend fun scopeFilter(request: LeaderboardRequest, entries: List<LeaderboardEntry>): List<LeaderboardEntry> =
        when (request.scope) {
            LeaderboardScope.GLOBAL, LeaderboardScope.CHALLENGE, LeaderboardScope.SPORT, LeaderboardScope.PROGRAM -> entries
            LeaderboardScope.FRIENDS -> {
                val circle = graph.following(request.viewerId) + graph.connections(request.viewerId) + request.viewerId
                entries.filter { it.userId in circle }.reRank()
            }
            LeaderboardScope.GROUP -> {
                val groupId = request.contextId ?: return emptyList()
                val members = groups.members(groupId).map { it.userId }.toSet()
                entries.filter { it.userId in members }.reRank()
            }
        }

    private fun List<LeaderboardEntry>.reRank(): List<LeaderboardEntry> =
        mapIndexed { index, entry -> entry.copy(rank = index + 1) }

    private companion object {
        const val MAX_BOARD = 500
    }
}
