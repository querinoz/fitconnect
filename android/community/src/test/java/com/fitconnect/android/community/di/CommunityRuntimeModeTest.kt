package com.fitconnect.android.community.di

import com.fitconnect.android.community.feed.FeedKind
import com.fitconnect.android.community.feed.FeedRequest
import com.fitconnect.android.community.posts.PostDraft
import com.fitconnect.android.community.posts.PostResult
import com.fitconnect.android.community.domain.PostKind
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class CommunityRuntimeModeTest {

    @Test
    fun failClosed_neverSeedsAndRefusesCreate() = runBlocking {
        val container = DefaultCommunityContainer(
            resolveMode = { CommunityRuntimeMode.FAIL_CLOSED },
        )
        container.seedIfNeeded()
        assertEquals(CommunityRuntimeMode.FAIL_CLOSED, container.runtimeMode())
        val feed = container.feed.feed(
            FeedRequest(viewerId = "ath-1", kind = FeedKind.FOLLOWING, limit = 40),
        )
        assertTrue(feed.items.isEmpty())
        val created = container.posts.create(
            PostDraft(
                idempotencyKey = "k",
                authorId = "ath-1",
                kind = PostKind.TEXT,
                text = "should not land",
            ),
        )
        assertEquals(PostResult.Invalid, created)
    }

    @Test
    fun localDemo_stillSeeds() = runBlocking {
        val container = DefaultCommunityContainer(
            resolveMode = { CommunityRuntimeMode.LOCAL_DEMO },
        )
        container.seedIfNeeded()
        val following = container.feed.feed(
            FeedRequest(viewerId = "ath-1", kind = FeedKind.FOLLOWING, limit = 40),
        )
        assertTrue(following.items.isNotEmpty())
    }
}
