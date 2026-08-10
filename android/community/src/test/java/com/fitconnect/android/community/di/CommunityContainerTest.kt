package com.fitconnect.android.community.di

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
            FeedRequest(viewerId = "ath-1", kind = FeedKind.FOLLOWING),
        )
        val personal = container.feed.feed(
            FeedRequest(viewerId = "ath-1", kind = FeedKind.PERSONAL),
        )

        assertTrue(
            "Expected FOLLOWING or PERSONAL feed for ath-1 to be non-empty after seed",
            following.items.isNotEmpty() || personal.items.isNotEmpty(),
        )
    }
}
