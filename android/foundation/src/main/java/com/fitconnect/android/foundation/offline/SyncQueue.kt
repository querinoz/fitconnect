package com.fitconnect.android.foundation.offline

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.perf.PerformanceBudget
import java.util.UUID
import java.util.concurrent.ConcurrentLinkedQueue

/**
 * Offline-first outbox. Idempotency keys prevent duplicate mutations on retry.
 * Conflict strategy is declared per work item — never silent corruption.
 */
enum class ConflictStrategy {
    /** Server wins; client mutation discarded after server confirms newer state. */
    SERVER_AUTHORITATIVE,
    /** Last writer wins by timestamp (used for non-critical prefs). */
    LAST_WRITE_WINS,
    /** Client keeps local until user resolves (bookings, payments). */
    MANUAL,
    /** Merge fields when schema allows (e.g. reaction sets). */
    MERGE,
}

data class SyncWork(
    val id: String = UUID.randomUUID().toString(),
    val type: String,
    val payloadJson: String,
    val createdAtEpochMs: Long = System.currentTimeMillis(),
    val attempts: Int = 0,
    val idempotencyKey: String = UUID.randomUUID().toString(),
    val conflictStrategy: ConflictStrategy = ConflictStrategy.SERVER_AUTHORITATIVE,
)

interface SyncQueue {
    suspend fun enqueue(work: SyncWork): AppResult<Unit>
    suspend fun peek(limit: Int = 20): List<SyncWork>
    suspend fun acknowledge(id: String): AppResult<Unit>
    suspend fun size(): Int
    /** Wipe all pending work — required on logout / account switch. */
    suspend fun clear(): AppResult<Unit>
}

class InMemorySyncQueue(
    private val maxSize: Int = PerformanceBudget.OFFLINE_QUEUE_MAX,
) : SyncQueue {
    private val queue = ConcurrentLinkedQueue<SyncWork>()
    private val idempotency = ConcurrentHashMapKeys()

    override suspend fun enqueue(work: SyncWork): AppResult<Unit> {
        if (idempotency.contains(work.idempotencyKey)) {
            return AppResult.Ok(Unit) // duplicate — safe no-op
        }
        if (queue.size >= maxSize) {
            return AppResult.Err(AppError.Storage("Offline queue full ($maxSize)"))
        }
        queue.add(work)
        idempotency.add(work.idempotencyKey)
        return AppResult.Ok(Unit)
    }

    override suspend fun peek(limit: Int): List<SyncWork> =
        queue.toList().take(limit)

    override suspend fun acknowledge(id: String): AppResult<Unit> {
        val removed = queue.firstOrNull { it.id == id }
        queue.removeIf { it.id == id }
        removed?.let { idempotency.remove(it.idempotencyKey) }
        return AppResult.Ok(Unit)
    }

    override suspend fun size(): Int = queue.size

    override suspend fun clear(): AppResult<Unit> {
        queue.clear()
        idempotency.clear()
        return AppResult.Ok(Unit)
    }
}

/** Tiny concurrent key set without dragging in full ConcurrentHashMap API surface for values. */
private class ConcurrentHashMapKeys {
    private val keys = java.util.concurrent.ConcurrentHashMap<String, Boolean>()
    fun contains(key: String) = keys.containsKey(key)
    fun add(key: String) {
        keys[key] = true
    }
    fun remove(key: String) {
        keys.remove(key)
    }
    fun clear() {
        keys.clear()
    }
}
