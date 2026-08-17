package com.fitconnect.android.community.di

import com.fitconnect.android.community.domain.ReactionTargetKind
import com.fitconnect.android.community.feed.FeedKind
import com.fitconnect.android.community.feed.FeedRequest
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertTrue
import org.junit.Test

class CommunityContainerTest {

    @Test
    fun seedIfNeeded_producesFollowingOrPersonalFeedForAth1() = runBlocking {
        val container = DefaultCommunityContainer()
        container.seedIfNeeded()
        container.seedIfNeeded() // idempotent — must not double-seed / rate-limit

        val following = container.feed.feed(
            FeedRequest(viewerId = "ath-1", kind = FeedKind.FOLLOWING, limit = 40),
        )
        val personal = container.feed.feed(
            FeedRequest(viewerId = "ath-1", kind = FeedKind.PERSONAL, limit = 40),
        )

        assertTrue(
            "Expected FOLLOWING or PERSONAL feed for ath-1 to be non-empty after seed",
            following.items.isNotEmpty() || personal.items.isNotEmpty(),
        )
        assertTrue(
            "LOCAL_DEMO world should fill Following with many authors",
            following.items.size >= 12,
        )
        assertTrue(
            "Seeded posts should carry photo or video attachments",
            following.items.any { it.media.isNotEmpty() },
        )
        val hottestCount = following.items.maxOf { post ->
            container.reactions.total(ReactionTargetKind.POST, post.id)
        }
        assertTrue(
            "Seeded reactions should make the world feel occupied",
            hottestCount >= 10,
        )
    }
}
