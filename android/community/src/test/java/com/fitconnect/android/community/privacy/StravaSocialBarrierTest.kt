package com.fitconnect.android.community.privacy

import com.fitconnect.android.community.di.DefaultCommunityContainer
import com.fitconnect.android.community.domain.PostKind
import com.fitconnect.android.community.domain.WorkoutFacts
import com.fitconnect.android.community.feed.FeedKind
import com.fitconnect.android.community.feed.FeedRequest
import com.fitconnect.android.community.posts.PostDraft
import com.fitconnect.shared.fitness.ProviderId
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertTrue
import org.junit.Test

class StravaSocialBarrierTest {
    @Test
    fun followingFeedHidesOtherUsersStravaSessions() = runBlocking {
        val container = DefaultCommunityContainer()
        container.seedIfNeeded()
        val hidden = container.posts.create(
            PostDraft(
                idempotencyKey = "strava-barrier",
                authorId = "a1",
                kind = PostKind.WORKOUT,
                text = "Should not leak",
                sportKey = "running",
                workoutFacts = WorkoutFacts(
                    sportKey = "running",
                    durationMinutes = 30,
                    distanceMeters = 5_000.0,
                    calories = 400.0,
                    avgHeartRate = 140.0,
                    trainingLoad = 50.0,
                    providerId = ProviderId.STRAVA.name,
                ),
                shareTelemetryFacts = true,
                skipRateLimit = true,
            ),
        )
        assertTrue(hidden is com.fitconnect.android.community.posts.PostResult.Created)
        val following = container.feed.feed(
            FeedRequest(viewerId = "ath-1", kind = FeedKind.FOLLOWING, limit = 80),
        )
        assertTrue(following.items.none { it.text.contains("Should not leak") })
        assertTrue(
            following.items.none { post ->
                post.workoutFacts?.providerId == ProviderId.STRAVA.name && post.authorId != "ath-1"
            },
        )
    }
}
