package com.fitconnect.android.foundation.network

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class RequestPolicyTest {
    @Test
    fun lruEvictsOldest() {
        val cache = LruStringCache(2)
        cache.put("a", "1")
        cache.put("b", "2")
        cache.put("c", "3")
        assertEquals(null, cache.get("a"))
        assertEquals("2", cache.get("b"))
        assertEquals("3", cache.get("c"))
    }

    @Test
    fun nonRetryableAuthNotRetried() = runBlocking {
        var calls = 0
        val policy = RequestPolicy(maxAttempts = 3, baseBackoffMs = 1, maxBackoffMs = 2)
        val result = policy.withRetry {
            calls++
            AppResult.Err(AppError.Auth(AppError.AuthKind.UNAUTHENTICATED))
        }
        assertTrue(result is AppResult.Err)
        assertEquals(1, calls)
    }

    @Test
    fun retryableNetworkRetriesThenSucceeds() = runBlocking {
        var calls = 0
        val policy = RequestPolicy(maxAttempts = 3, baseBackoffMs = 1, maxBackoffMs = 2)
        val result = policy.withRetry {
            calls++
            if (calls < 3) AppResult.Err(AppError.Network(AppError.NetworkKind.TIMEOUT))
            else AppResult.Ok("ok")
        }
        assertEquals(AppResult.Ok("ok"), result)
        assertEquals(3, calls)
    }

    @Test
    fun dedupeBlocksSecondCaller() {
        val policy = RequestPolicy()
        assertTrue(policy.beginDedupe("GET:/x"))
        assertFalse(policy.beginDedupe("GET:/x"))
        policy.endDedupe("GET:/x")
        assertTrue(policy.beginDedupe("GET:/x"))
    }
}
