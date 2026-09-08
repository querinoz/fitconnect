package com.fitconnect.android.community.remote

import com.fitconnect.android.community.domain.ReactionTargetKind
import com.fitconnect.android.community.domain.ReactionType
import com.fitconnect.android.community.reactions.ReactionEngine
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/** Remote reactions over `/api/v1/community/posts/{id}/reactions`. Fail-closed on errors. */
class RemoteReactionEngine(
    private val api: CommunityPostsApi,
) : ReactionEngine {
    private val mutex = Mutex()
    private val countsCache = mutableMapOf<String, Map<ReactionType, Int>>()
    private val mine = mutableMapOf<String, ReactionType>()

    override suspend fun react(
        actorId: String,
        targetKind: ReactionTargetKind,
        targetId: String,
        type: ReactionType,
    ): Boolean {
        if (targetKind != ReactionTargetKind.POST) return false
        return when (api.react(targetId, type.name)) {
            is AppResult.Err -> false
            is AppResult.Ok -> {
                mutex.withLock { mine["$actorId:$targetId"] = type }
                true
            }
        }
    }

    override suspend fun unreact(
        actorId: String,
        targetKind: ReactionTargetKind,
        targetId: String,
    ): Boolean {
        if (targetKind != ReactionTargetKind.POST) return false
        val type = mutex.withLock { mine["$actorId:$targetId"] } ?: ReactionType.LIKE
        return when (api.unreact(targetId, type.name)) {
            is AppResult.Err -> false
            is AppResult.Ok -> {
                mutex.withLock { mine.remove("$actorId:$targetId") }
                true
            }
        }
    }

    override suspend fun counts(
        targetKind: ReactionTargetKind,
        targetId: String,
    ): Map<ReactionType, Int> {
        if (targetKind != ReactionTargetKind.POST) return emptyMap()
        return when (val result = api.listReactions(targetId)) {
            is AppResult.Err -> mutex.withLock { countsCache[targetId].orEmpty() }
            is AppResult.Ok -> {
                val mapped = ReactionType.entries.associateWith { type ->
                    result.value[type.name] ?: 0
                }.filterValues { it > 0 }
                mutex.withLock { countsCache[targetId] = mapped }
                mapped
            }
        }
    }

    override suspend fun of(
        actorId: String,
        targetKind: ReactionTargetKind,
        targetId: String,
    ): ReactionType? = mutex.withLock {
        if (targetKind != ReactionTargetKind.POST) null else mine["$actorId:$targetId"]
    }

    override suspend fun total(targetKind: ReactionTargetKind, targetId: String): Int =
        counts(targetKind, targetId).values.sum()
}
