package com.fitconnect.android.community.privacy

import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.android.community.domain.Visibility
import com.fitconnect.android.community.graph.SocialGraph
import com.fitconnect.android.community.groups.GroupEngine

/**
 * Single authorization point for content visibility. Every feed, search and
 * detail read goes through [canView]. Health/telemetry-derived facts are
 * additionally gated by the author's explicit per-post opt-in.
 */
class VisibilityResolver(
    private val graph: SocialGraph,
    private val groups: GroupEngine,
) {
    suspend fun canView(viewerId: String, post: CommunityPost): Boolean {
        if (post.audit.deleted) return false
        if (viewerId == post.authorId) return true
        if (RestrictedWorkout.isHiddenFromOthers(post)) return false
        if (graph.isBlocked(viewerId, post.authorId)) return false
        return when (post.visibility) {
            Visibility.PUBLIC -> true
            Visibility.FOLLOWERS -> viewerId in graph.followers(post.authorId)
            Visibility.CONNECTIONS -> viewerId in graph.connections(post.authorId)
            Visibility.GROUP -> post.groupId != null && groups.isMember(post.groupId, viewerId)
            Visibility.COACH_ONLY -> viewerId in graph.coachOf(post.authorId)
            Visibility.PRIVATE -> false
        }
    }

    /**
     * Telemetry facts are stripped unless the author explicitly opted in —
     * sensitive health data never becomes public by default.
     */
    fun redact(viewerId: String, post: CommunityPost): CommunityPost =
        if (post.workoutFacts != null && !post.shareTelemetryFacts && viewerId != post.authorId) {
            post.copy(workoutFacts = null)
        } else {
            post
        }
}
