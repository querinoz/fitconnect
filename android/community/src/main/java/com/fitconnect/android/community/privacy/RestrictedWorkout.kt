package com.fitconnect.android.community.privacy

import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.shared.fitness.ProviderId

/**
 * Social surfaces never show STRAVA-backed sessions to anyone but the owner.
 * Database RLS is the legal barrier; this is the Room/in-memory equivalent.
 */
object RestrictedWorkout {
    fun isHiddenFromOthers(post: CommunityPost): Boolean {
        val provider = post.workoutFacts?.providerId ?: return false
        return ProviderId.fromWire(provider) == ProviderId.STRAVA
    }
}
