package com.fitconnect.android.community.privacy

import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.shared.fitness.ProviderId

/**
 * Client-side social feed filter (AGENTS.md §1).
 * Database RLS remains the legal barrier; this mirrors it for remote/in-memory engines.
 */
object SocialFeedFilter {
    /** True when [post] must never appear on another user's social surface. */
    fun isStravaSocialLeak(post: CommunityPost): Boolean {
        val provider = post.workoutFacts?.providerId ?: return false
        return ProviderId.fromWire(provider) == ProviderId.STRAVA
    }

    fun retainForViewer(viewerId: String, posts: List<CommunityPost>): List<CommunityPost> =
        posts.filter { post ->
            viewerId == post.authorId || !RestrictedWorkout.isHiddenFromOthers(post)
        }

    /** Drop STRAVA-backed workout rows entirely from anonymous / public timelines. */
    fun retainPublicSafe(posts: List<CommunityPost>): List<CommunityPost> =
        posts.filterNot { isStravaSocialLeak(it) }
}
