package com.fitconnect.android.foundation.network

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.perf.PerformanceBudget
import kotlinx.coroutines.delay
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.min
import kotlin.random.Random

enum class RetryClass { RETRYABLE, NON_RETRYABLE }

fun AppError.retryClass(): RetryClass = when (this) {
    is AppError.Network -> when (kind) {
        AppError.NetworkKind.TIMEOUT,
        AppError.NetworkKind.UNKNOWN,
        AppError.NetworkKind.DNS,
        -> RetryClass.RETRYABLE
        AppError.NetworkKind.OFFLINE,
        AppError.NetworkKind.TLS,
        -> RetryClass.NON_RETRYABLE
    }
    is AppError.Api -> if (statusCode in 500..599 || statusCode == 429) RetryClass.RETRYABLE else RetryClass.NON_RETRYABLE
    is AppError.Auth -> RetryClass.NON_RETRYABLE
    is AppError.Storage, is AppError.Unexpected -> RetryClass.NON_RETRYABLE
}

/**
 * Request policy: timeouts are owned by OkHttp; this layer adds bounded retries
 * with exponential backoff + jitter, and short-window GET deduplication.
 * Never retries non-retryable errors. Never loops forever.
 */
class RequestPolicy(
    private val maxAttempts: Int = 3,
    private val baseBackoffMs: Long = 200,
    private val maxBackoffMs: Long = 5_000,
    private val random: Random = Random.Default,
) {
    private val inFlight = ConcurrentHashMap<String, Long>()

    suspend fun <T> withRetry(block: suspend (attempt: Int) -> AppResult<T>): AppResult<T> {
        var last: AppResult<T>? = null
        repeat(maxAttempts) { attemptIndex ->
            val attempt = attemptIndex + 1
            val result = block(attempt)
            last = result
            when (result) {
                is AppResult.Ok -> return result
                is AppResult.Err -> {
                    if (result.error.retryClass() == RetryClass.NON_RETRYABLE) return result
                    if (attempt >= maxAttempts) return result
                    val exp = min(maxBackoffMs, baseBackoffMs * (1L shl (attemptIndex)))
                    val jitter = random.nextLong(0, exp / 3 + 1)
                    delay(exp + jitter)
                }
            }
        }
        return last ?: AppResult.Err(AppError.Unexpected("retry exhausted"))
    }

    /** Returns true if this caller should proceed; false if a duplicate is in-flight. */
    fun beginDedupe(key: String, nowMs: Long = System.currentTimeMillis()): Boolean {
        val prior = inFlight[key]
        if (prior != null && nowMs - prior < PerformanceBudget.REQUEST_DEDUPE_MS) return false
        inFlight[key] = nowMs
        return true
    }

    fun endDedupe(key: String) {
        inFlight.remove(key)
    }
}

/**
 * Bounded LRU for HTTP GET bodies — prevents unbounded ConcurrentHashMap growth.
 */
class LruStringCache(private val maxEntries: Int = PerformanceBudget.HTTP_CACHE_ENTRIES) {
    private val map = object : LinkedHashMap<String, String>(maxEntries, 0.75f, true) {
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, String>?): Boolean =
            size > maxEntries
    }

    @Synchronized
    fun get(key: String): String? = map[key]

    @Synchronized
    fun put(key: String, value: String) {
        map[key] = value
    }

    @Synchronized
    fun clear() = map.clear()

    @Synchronized
    fun size(): Int = map.size
}
