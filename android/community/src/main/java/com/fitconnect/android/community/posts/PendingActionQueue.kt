package com.fitconnect.android.community.posts

import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

enum class PendingActionKind { POST, COMMENT, REACTION, FOLLOW, PROGRAM_PROGRESS }

data class PendingAction(
    val id: String,
    val kind: PendingActionKind,
    val actorId: String,
    val payloadRef: String,
    val queuedAtEpochMs: Long,
    val attempts: Int = 0,
)

/**
 * Offline pending-action queue: comments, reactions, follows and program
 * progress created offline are queued here and drained on reconnect. Actions
 * never silently disappear — failed drains stay in the queue with an attempt
 * count, and callers decide conflict resolution per kind (all community
 * mutations are idempotent, so replays are safe).
 */
class PendingActionQueue(
    private val nowProvider: () -> Long = System::currentTimeMillis,
    private val maxAttempts: Int = 5,
) {
    private val mutex = Mutex()
    private val queue = linkedMapOf<String, PendingAction>()
    private var sequence = 0L

    suspend fun enqueue(kind: PendingActionKind, actorId: String, payloadRef: String): PendingAction = mutex.withLock {
        val action = PendingAction("pa-${++sequence}", kind, actorId, payloadRef, nowProvider())
        queue[action.id] = action
        action
    }

    suspend fun pending(): List<PendingAction> = mutex.withLock { queue.values.toList() }

    /**
     * Drains the queue through [execute]. Successful actions are removed;
     * failures are retained with an incremented attempt count until
     * [maxAttempts], after which they surface in [deadLettered] for user
     * resolution instead of being dropped.
     */
    suspend fun drain(execute: suspend (PendingAction) -> Boolean): Int {
        val snapshot = mutex.withLock { queue.values.toList() }
        var drained = 0
        for (action in snapshot) {
            val ok = runCatching { execute(action) }.getOrDefault(false)
            mutex.withLock {
                if (ok) {
                    queue.remove(action.id)
                    drained++
                } else {
                    queue[action.id] = action.copy(attempts = action.attempts + 1)
                }
            }
        }
        return drained
    }

    suspend fun deadLettered(): List<PendingAction> = mutex.withLock {
        queue.values.filter { it.attempts >= maxAttempts }
    }

    suspend fun discard(actionId: String): Boolean = mutex.withLock { queue.remove(actionId) != null }
}
