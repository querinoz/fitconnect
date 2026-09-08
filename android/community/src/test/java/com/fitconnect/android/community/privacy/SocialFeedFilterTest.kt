package com.fitconnect.android.community.privacy

import com.fitconnect.android.community.domain.Audit
import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.android.community.domain.PostKind
import com.fitconnect.android.community.domain.WorkoutFacts
import com.fitconnect.shared.fitness.ProviderId
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SocialFeedFilterTest {

    @Test
    fun retainForViewer_hidesOthersStravaSessions() {
        val own = post("me", ProviderId.STRAVA, "own strava")
        val other = post("them", ProviderId.STRAVA, "other strava")
        val hc = post("them", ProviderId.HEALTH_CONNECT, "ok")
        val filtered = SocialFeedFilter.retainForViewer("me", listOf(own, other, hc))
        assertEquals(listOf("own strava", "ok"), filtered.map { it.text })
    }

    @Test
    fun retainPublicSafe_dropsAllStrava() {
        val posts = listOf(
            post("a", ProviderId.STRAVA, "strava"),
            post("b", ProviderId.HEALTH_CONNECT, "hc"),
            post("c", ProviderId.LOCAL_DEMO, "demo"),
        )
        val safe = SocialFeedFilter.retainPublicSafe(posts)
        assertEquals(listOf("hc", "demo"), safe.map { it.text })
        assertFalse(safe.any { SocialFeedFilter.isStravaSocialLeak(it) })
    }

    @Test
    fun isStravaSocialLeak_falseWithoutFacts() {
        val bare = CommunityPost(
            id = "p",
            authorId = "a",
            kind = PostKind.TEXT,
            text = "hi",
            audit = Audit(1, 1),
        )
        assertFalse(SocialFeedFilter.isStravaSocialLeak(bare))
        assertTrue(RestrictedWorkout.isHiddenFromOthers(post("x", ProviderId.STRAVA, "s")))
    }

    private fun post(author: String, provider: ProviderId, text: String) = CommunityPost(
        id = text,
        authorId = author,
        kind = PostKind.WORKOUT,
        text = text,
        workoutFacts = WorkoutFacts(
            sportKey = "running",
            durationMinutes = 30,
            distanceMeters = 5_000.0,
            calories = null,
            avgHeartRate = null,
            trainingLoad = null,
            providerId = provider.name,
        ),
        shareTelemetryFacts = true,
        audit = Audit(1, 1),
    )
}
