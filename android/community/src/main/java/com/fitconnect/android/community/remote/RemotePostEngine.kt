package com.fitconnect.android.community.remote

import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.android.community.domain.Share
import com.fitconnect.android.community.domain.ShareTargetKind
import com.fitconnect.android.community.posts.PostDraft
import com.fitconnect.android.community.posts.PostEngine
import com.fitconnect.android.community.posts.PostPage
import com.fitconnect.android.community.posts.PostResult
import com.fitconnect.android.community.privacy.SocialFeedFilter
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.shared.fitness.ProviderId
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * Remote-backed [PostEngine]. Fail-closed: API errors → empty pages / Invalid creates.
 * Never seeds LOCAL_DEMO content. STRAVA workout posts are stripped from candidate lists.
 */
class RemotePostEngine(
    private val api: CommunityPostsApi,
    private val nowProvider: () -> Long = System::currentTimeMillis,
) : PostEngine {
    private val mutex = Mutex()
    private var cache: List<CommunityPost> = emptyList()
    private val saves = mutableSetOf<Pair<String, String>>()
    private val drafts = mutableMapOf<String, PostDraft>()

    @Volatile
    var lastError: String? = null
        private set

    override suspend fun create(draft: PostDraft): PostResult {
        if (draft.text.isBlank() && draft.workoutFacts == null && draft.media.isEmpty()) {
            return PostResult.Invalid
        }
        val provider = draft.workoutFacts?.providerId
        if (provider != null && ProviderId.fromWire(provider) == ProviderId.STRAVA) {
            // Never publish STRAVA-backed sessions to the social API.
            return PostResult.Invalid
        }
        val kindWire = when (draft.kind) {
            com.fitconnect.android.community.domain.PostKind.ACHIEVEMENT -> "PR"
            com.fitconnect.android.community.domain.PostKind.WORKOUT -> "Check-in"
            else -> "Check-in"
        }
        return when (val result = api.create(draft.text.trim(), draft.authorId, kindWire)) {
            is AppResult.Err -> {
                lastError = result.error.toString()
                PostResult.Invalid
            }
            is AppResult.Ok -> {
                mutex.withLock {
                    cache = listOf(result.value) + cache.filterNot { it.id == result.value.id }
                }
                PostResult.Created(result.value)
            }
        }
    }

    override suspend fun edit(postId: String, authorId: String, text: String): Boolean = false

    override suspend fun delete(postId: String, actorId: String, isModerator: Boolean): Boolean = false

    override suspend fun get(postId: String): CommunityPost? = mutex.withLock {
        cache.firstOrNull { it.id == postId }
            ?: refreshUnlocked().firstOrNull { it.id == postId }
    }

    override suspend fun byAuthor(authorId: String, cursor: String?, limit: Int): PostPage {
        val all = refresh().filter { it.authorId == authorId }
        return page(all, cursor, limit)
    }

    override suspend fun allVisibleCandidates(cursor: String?, limit: Int): PostPage {
        val all = SocialFeedFilter.retainPublicSafe(refresh())
        return page(all, cursor, limit)
    }

    override suspend fun save(userId: String, postId: String): Boolean = mutex.withLock {
        saves.add(userId to postId)
        true
    }

    override suspend fun unsave(userId: String, postId: String): Boolean = mutex.withLock {
        saves.remove(userId to postId)
    }

    override suspend fun saved(userId: String): List<CommunityPost> = mutex.withLock {
        val ids = saves.filter { it.first == userId }.map { it.second }.toSet()
        cache.filter { it.id in ids }
    }

    override suspend fun share(
        actorId: String,
        postId: String,
        target: ShareTargetKind,
        targetId: String?,
    ): Share? = null

    override suspend fun saveDraft(draft: PostDraft): Unit = mutex.withLock {
        drafts["${draft.authorId}:${draft.idempotencyKey}"] = draft
    }

    override suspend fun drafts(authorId: String): List<PostDraft> = mutex.withLock {
        drafts.values.filter { it.authorId == authorId }
    }

    override suspend fun discardDraft(authorId: String, idempotencyKey: String): Unit = mutex.withLock {
        drafts.remove("$authorId:$idempotencyKey")
    }

    private suspend fun refresh(): List<CommunityPost> = mutex.withLock { refreshUnlocked() }

    private suspend fun refreshUnlocked(): List<CommunityPost> {
        lastError = null
        return when (val result = api.list()) {
            is AppResult.Err -> {
                lastError = result.error.toString()
                cache = emptyList()
                emptyList()
            }
            is AppResult.Ok -> {
                cache = result.value
                cache
            }
        }
    }

    private fun page(all: List<CommunityPost>, cursor: String?, limit: Int): PostPage {
        val sorted = all.sortedByDescending { it.audit.createdAtEpochMs }
        val start = cursor?.toIntOrNull() ?: 0
        val slice = sorted.drop(start).take(limit)
        val next = if (start + limit < sorted.size) (start + limit).toString() else null
        return PostPage(slice, next)
    }
}
