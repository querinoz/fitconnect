package com.fitconnect.android.community.reactions

import com.fitconnect.android.community.domain.Reaction
import com.fitconnect.android.community.domain.ReactionTargetKind
import com.fitconnect.android.community.domain.ReactionType
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * Extensible, idempotent reactions. One reaction per (actor, target); setting
 * the same type twice is a no-op, setting a different type replaces. New
 * [ReactionType] values require zero engine changes.
 */
interface ReactionEngine {
    suspend fun react(actorId: String, targetKind: ReactionTargetKind, targetId: String, type: ReactionType): Boolean
    suspend fun unreact(actorId: String, targetKind: ReactionTargetKind, targetId: String): Boolean
    suspend fun counts(targetKind: ReactionTargetKind, targetId: String): Map<ReactionType, Int>
    suspend fun of(actorId: String, targetKind: ReactionTargetKind, targetId: String): ReactionType?
    suspend fun total(targetKind: ReactionTargetKind, targetId: String): Int
}

class InMemoryReactionEngine : ReactionEngine {
    private val mutex = Mutex()

    // Keyed by target; one entry per actor — concurrent double-reacts collapse.
    private val byTarget = mutableMapOf<String, MutableMap<String, Reaction>>()

    private fun key(kind: ReactionTargetKind, id: String) = "${kind.name}:$id"

    override suspend fun react(
        actorId: String,
        targetKind: ReactionTargetKind,
        targetId: String,
        type: ReactionType,
    ): Boolean = mutex.withLock {
        val target = byTarget.getOrPut(key(targetKind, targetId)) { mutableMapOf() }
        val existing = target[actorId]
        if (existing?.type == type) return@withLock false // idempotent
        target[actorId] = Reaction(actorId, targetKind, targetId, type, System.currentTimeMillis())
        true
    }

    override suspend fun unreact(actorId: String, targetKind: ReactionTargetKind, targetId: String): Boolean =
        mutex.withLock { byTarget[key(targetKind, targetId)]?.remove(actorId) != null }

    override suspend fun counts(targetKind: ReactionTargetKind, targetId: String): Map<ReactionType, Int> =
        mutex.withLock {
            byTarget[key(targetKind, targetId)].orEmpty().values
                .groupingBy { it.type }
                .eachCount()
        }

    override suspend fun of(actorId: String, targetKind: ReactionTargetKind, targetId: String): ReactionType? =
        mutex.withLock { byTarget[key(targetKind, targetId)]?.get(actorId)?.type }

    override suspend fun total(targetKind: ReactionTargetKind, targetId: String): Int =
        mutex.withLock { byTarget[key(targetKind, targetId)]?.size ?: 0 }
}
