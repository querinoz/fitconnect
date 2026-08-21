package com.fitconnect.android.community.feed

import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.android.community.domain.ReactionTargetKind
import com.fitconnect.android.community.graph.SocialGraph
import com.fitconnect.android.community.groups.GroupEngine
import com.fitconnect.android.community.posts.PostEngine
import com.fitconnect.android.community.privacy.RestrictedWorkout
import com.fitconnect.android.community.privacy.VisibilityResolver
import com.fitconnect.android.community.reactions.ReactionEngine

enum class FeedKind {
    PERSONAL,
    FOLLOWING,
    COACH,
    GROUP,
    PROGRAM,
    CHALLENGE,
    SPORT,
    LOCAL,
    OFFICIAL,
}

data class FeedRequest(
    val viewerId: String,
    val kind: FeedKind,
    val contextId: String? = null, // group / program / challenge / sport key
    val cursor: String? = null,
    val limit: Int = 20,
)

data class RankSignal(
    val post: CommunityPost,
    val reactionCount: Int,
    val commentCount: Int,
    val authorFollowed: Boolean,
)

/**
 * Ranking is a swappable strategy — never hardcoded in UI. Future
 * personalization plugs in as a new ranker implementation.
 */
interface FeedRanker {
    fun score(signal: RankSignal, nowEpochMs: Long): Double
}

/** Recency-dominant with engagement + relationship boost. */
class ChronoEngagementRanker : FeedRanker {
    override fun score(signal: RankSignal, nowEpochMs: Long): Double {
        val ageHours = (nowEpochMs - signal.post.audit.createdAtEpochMs).coerceAtLeast(0) / 3_600_000.0
        val recency = 100.0 / (1.0 + ageHours)
        val engagement = signal.reactionCount * 2.0 + signal.commentCount * 3.0
        val relationship = if (signal.authorFollowed) 25.0 else 0.0
        return recency + engagement + relationship
    }
}

data class FeedPage(val items: List<CommunityPost>, val nextCursor: String?)

/**
 * Feed engine — candidate selection per feed kind, visibility filtering,
 * block/mute suppression, pluggable ranking, cursor pagination.
 */
class FeedEngine(
    private val posts: PostEngine,
    private val graph: SocialGraph,
    private val groups: GroupEngine,
    private val reactions: ReactionEngine,
    private val commentCounts: suspend (postId: String) -> Int,
    private val visibility: VisibilityResolver,
    private val ranker: FeedRanker,
    private val nowProvider: () -> Long = System::currentTimeMillis,
) {
    suspend fun feed(request: FeedRequest): FeedPage {
        val candidates = candidatesFor(request)
        val visible = mutableListOf<CommunityPost>()
        for (post in candidates) {
            if (graph.isMuted(request.viewerId, post.authorId)) continue
            if (request.viewerId != post.authorId && RestrictedWorkout.isHiddenFromOthers(post)) continue
            if (!visibility.canView(request.viewerId, post)) continue
            visible += visibility.redact(request.viewerId, post)
        }
        val following = graph.following(request.viewerId)
        val now = nowProvider()
        val ranked = visible
            .map { post ->
                val signal = RankSignal(
                    post = post,
                    reactionCount = reactions.total(ReactionTargetKind.POST, post.id),
                    commentCount = commentCounts(post.id),
                    authorFollowed = post.authorId in following,
                )
                post to ranker.score(signal, now)
            }
            .sortedByDescending { it.second }
            .map { it.first }

        val start = request.cursor?.toIntOrNull() ?: 0
        val slice = ranked.drop(start).take(request.limit)
        val next = if (start + request.limit < ranked.size) (start + request.limit).toString() else null
        return FeedPage(slice, next)
    }

    private suspend fun candidatesFor(request: FeedRequest): List<CommunityPost> {
        val all = posts.allVisibleCandidates(limit = CANDIDATE_WINDOW).items
        return when (request.kind) {
            FeedKind.PERSONAL -> {
                val circle = graph.following(request.viewerId) +
                    graph.connections(request.viewerId) +
                    request.viewerId
                all.filter { it.authorId in circle || it.groupId != null }
            }
            FeedKind.FOLLOWING -> {
                val following = graph.following(request.viewerId)
                all.filter { it.authorId in following }
            }
            FeedKind.COACH -> {
                val coaches = graph.coachOf(request.viewerId)
                all.filter { it.authorId in coaches }
            }
            FeedKind.GROUP -> all.filter { it.groupId == request.contextId }
            FeedKind.PROGRAM -> all.filter { it.programId == request.contextId }
            FeedKind.CHALLENGE -> all.filter { it.challengeId == request.contextId }
            FeedKind.SPORT -> all.filter { it.sportKey == request.contextId }
            FeedKind.LOCAL -> all.filter { it.groupId != null } // local groups surface via Discovery port
            FeedKind.OFFICIAL -> all.filter { it.authorId == OFFICIAL_ACCOUNT_ID }
        }
    }

    companion object {
        const val OFFICIAL_ACCOUNT_ID = "fitconnect-official"
        private const val CANDIDATE_WINDOW = 200
    }
}
