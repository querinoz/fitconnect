package com.fitconnect.android.community.posts

import com.fitconnect.android.community.domain.MusicMetadata
import com.fitconnect.android.community.domain.PostKind
import com.fitconnect.android.community.domain.ShareConsent
import com.fitconnect.android.community.domain.WorkoutFacts
import com.fitconnect.android.community.safety.ActionRateLimiter
import com.fitconnect.shared.fitness.ProviderId
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertTrue
import org.junit.Test

class PostPrivacyConsentTest {
    private fun engine() = InMemoryPostEngine(ActionRateLimiter())

    @Test
    fun stravaWorkoutFactsRejected() = runBlocking {
        val result = engine().create(
            PostDraft(
                idempotencyKey = "s1",
                authorId = "u1",
                kind = PostKind.WORKOUT,
                text = "Run",
                workoutFacts = WorkoutFacts(
                    sportKey = "run",
                    durationMinutes = 30,
                    distanceMeters = 5000.0,
                    calories = null,
                    avgHeartRate = null,
                    trainingLoad = null,
                    providerId = ProviderId.STRAVA.name,
                ),
            ),
        )
        assertTrue(result is PostResult.Invalid)
    }

    @Test
    fun musicRequiresConsent() = runBlocking {
        val music = MusicMetadata(
            trackId = "t1",
            trackName = "Track",
            artist = "Artist",
            spotifyUrl = "https://open.spotify.com/track/t1",
            capturedAtEpochMs = 1L,
        )
        val denied = engine().create(
            PostDraft(
                idempotencyKey = "m1",
                authorId = "u1",
                kind = PostKind.MUSIC,
                text = "Listening",
                music = music,
                consent = ShareConsent(shareMusic = false),
            ),
        ) as PostResult.Created
        assertTrue(denied.post.music == null)

        val allowed = engine().create(
            PostDraft(
                idempotencyKey = "m2",
                authorId = "u1",
                kind = PostKind.MUSIC,
                text = "Listening",
                music = music,
                consent = ShareConsent(shareMusic = true),
            ),
        ) as PostResult.Created
        assertTrue(allowed.post.music != null)
    }
}
