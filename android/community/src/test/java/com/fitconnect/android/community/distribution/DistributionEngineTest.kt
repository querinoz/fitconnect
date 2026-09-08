package com.fitconnect.android.community.distribution

import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class DistributionEngineTest {
    @Test
    fun fitconnectPublishedImmediately_othersQueuedIsolated() = runBlocking {
        val engine = InMemoryDistributionEngine()
        val jobs = engine.enqueue(
            postId = "post-1",
            authorId = "u1",
            platforms = listOf(
                DistributionPlatform.FITCONNECT,
                DistributionPlatform.INSTAGRAM,
                DistributionPlatform.LINKEDIN,
            ),
            idempotencyKey = "k1",
        )
        assertEquals(3, jobs.size)
        assertEquals(DistributionStatus.PUBLISHED, jobs.first { it.platform == DistributionPlatform.FITCONNECT }.status)
        assertTrue(jobs.filter { it.platform != DistributionPlatform.FITCONNECT }.all { it.status == DistributionStatus.QUEUED })

        val processed = engine.processNext(10)
        assertTrue(processed.all { it.status == DistributionStatus.PUBLISHED })
        assertEquals(3, engine.jobsForPost("post-1").size)
    }

    @Test
    fun idempotentEnqueue() = runBlocking {
        val engine = InMemoryDistributionEngine()
        val a = engine.enqueue("p", "u", listOf(DistributionPlatform.X), "idem")
        val b = engine.enqueue("p", "u", listOf(DistributionPlatform.X), "idem")
        assertEquals(a.first().id, b.first().id)
    }

    @Test
    fun capabilityMatrixHasCorePlatforms() {
        val caps = InMemoryDistributionEngine().capabilities()
        assertTrue(caps.any { it.platform == DistributionPlatform.INSTAGRAM && it.image })
        assertFalse(caps.first { it.platform == DistributionPlatform.TIKTOK }.image)
    }
}
