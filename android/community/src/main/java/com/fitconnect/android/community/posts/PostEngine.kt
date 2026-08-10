package com.fitconnect.android.community.posts

import com.fitconnect.android.community.domain.Audit
import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.android.community.domain.PostKind
import com.fitconnect.android.community.domain.SavedPost
import com.fitconnect.android.community.domain.Share
import com.fitconnect.android.community.domain.ShareTargetKind
import com.fitconnect.android.community.safety.ActionRateLimiter
import com.fitconnect.android.community.safety.CommunityAction
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

data class PostDraft(
    val idempotencyKey: String,
    val authorId: String,
    val kind: PostKind,
    val text: String,
    val sportKey: String? = null,
    val visibility: com.fitconnect.android.community.domain.Visibility = com.fitconnect.android.community.domain.Visibility.PUBLIC,
    val shareTelemetryFacts: Boolean = false,
    val groupId: String? = null,
    val programId: String? = null,
    val challengeId: String? = null,
    val workoutFacts: com.fitconnect.android.community.domain.WorkoutFacts? = null,
    val mediaIds: List<String> = emptyList(),
)

sealed interface PostResult {
    data class Created(val post: CommunityPost) : PostResult
    data class Duplicate(val existing: CommunityPost) : PostResult
    data object RateLimited : PostResult
    data object Invalid : PostResult
}

data class PostPage(val items: List<CommunityPost>, val nextCursor: String?)

/**
 * Post store + lifecycle: idempotent creation (client idempotency keys),
 * duplicate-content guard, editing, soft deletion, saves and shares with
 * deep-link generation. Offline drafts survive until explicitly published.
 */
interface PostEngine {
    suspend fun create(draft: PostDraft): PostResult
    suspend fun edit(postId: String, authorId: String, text: String): Boolean
    suspend fun delete(postId: String, actorId: String, isModerator: Boolean = false): Boolean
    suspend fun get(postId: String): CommunityPost?
    suspend fun byAuthor(authorId: String, cursor: String? = null, limit: Int = 20): PostPage
    suspend fun allVisibleCandidates(cursor: String? = null, limit: Int = 200): PostPage

    suspend fun save(userId: String, postId: String): Boolean
    suspend fun unsave(userId: String, postId: String): Boolean
    suspend fun saved(userId: String): List<CommunityPost>

    suspend fun share(actorId: String, postId: String, target: ShareTargetKind, targetId: String?): Share?

    suspend fun saveDraft(draft: PostDraft)
    suspend fun drafts(authorId: String): List<PostDraft>
    suspend fun discardDraft(authorId: String, idempotencyKey: String)
}

class InMemoryPostEngine(
    private val rateLimiter: ActionRateLimiter,
    private val nowProvider: () -> Long = System::currentTimeMillis,
) : PostEngine {
    private val mutex = Mutex()
    private val posts = linkedMapOf<String, CommunityPost>()
    private val byIdempotencyKey = mutableMapOf<String, String>()
    private val saves = mutableSetOf<SavedPost>()
    private val shares = mutableListOf<Share>()
    private val draftStore = mutableMapOf<String, PostDraft>() // key: author:idempotencyKey
    private var sequence = 0L

    override suspend fun create(draft: PostDraft): PostResult = mutex.withLock {
        if (draft.text.isBlank() && draft.workoutFacts == null && draft.mediaIds.isEmpty()) {
            return@withLock PostResult.Invalid
        }
        // Idempotency: same key → same post, no duplicate.
        byIdempotencyKey["${draft.authorId}:${draft.idempotencyKey}"]?.let { existingId ->
            return@withLock PostResult.Duplicate(posts.getValue(existingId))
        }
        // Duplicate-content guard: identical text by same author within 10 min.
        val now = nowProvider()
        posts.values.lastOrNull {
            it.authorId == draft.authorId && it.text == draft.text.trim() && !it.audit.deleted &&
                now - it.audit.createdAtEpochMs < DUPLICATE_WINDOW_MS && it.kind == draft.kind
        }?.let { return@withLock PostResult.Duplicate(it) }

        if (!rateLimiter.tryAcquire(draft.authorId, CommunityAction.CREATE_POST)) {
            return@withLock PostResult.RateLimited
        }

        val post = CommunityPost(
            id = "post-${++sequence}",
            authorId = draft.authorId,
            kind = draft.kind,
            text = draft.text.trim(),
            sportKey = draft.sportKey,
            workoutFacts = draft.workoutFacts,
            hashtags = extractTags(draft.text, '#'),
            mentions = extractTags(draft.text, '@'),
            groupId = draft.groupId,
            programId = draft.programId,
            challengeId = draft.challengeId,
            visibility = draft.visibility,
            shareTelemetryFacts = draft.shareTelemetryFacts,
            audit = Audit(now, now),
        )
        posts[post.id] = post
        byIdempotencyKey["${draft.authorId}:${draft.idempotencyKey}"] = post.id
        draftStore.remove("${draft.authorId}:${draft.idempotencyKey}")
        PostResult.Created(post)
    }

    override suspend fun edit(postId: String, authorId: String, text: String): Boolean = mutex.withLock {
        val existing = posts[postId] ?: return@withLock false
        if (existing.authorId != authorId || existing.audit.deleted || text.isBlank()) return@withLock false
        posts[postId] = existing.copy(
            text = text.trim(),
            hashtags = extractTags(text, '#'),
            mentions = extractTags(text, '@'),
            edited = true,
            audit = existing.audit.copy(updatedAtEpochMs = nowProvider()),
        )
        true
    }

    override suspend fun delete(postId: String, actorId: String, isModerator: Boolean): Boolean = mutex.withLock {
        val existing = posts[postId] ?: return@withLock false
        if (existing.authorId != actorId && !isModerator) return@withLock false
        posts[postId] = existing.copy(audit = existing.audit.copy(deletedAtEpochMs = nowProvider()))
        true
    }

    override suspend fun get(postId: String): CommunityPost? = mutex.withLock {
        posts[postId]?.takeIf { !it.audit.deleted }
    }

    override suspend fun byAuthor(authorId: String, cursor: String?, limit: Int): PostPage = mutex.withLock {
        page(posts.values.filter { it.authorId == authorId && !it.audit.deleted }, cursor, limit)
    }

    override suspend fun allVisibleCandidates(cursor: String?, limit: Int): PostPage = mutex.withLock {
        page(posts.values.filter { !it.audit.deleted }, cursor, limit)
    }

    override suspend fun save(userId: String, postId: String): Boolean = mutex.withLock {
        if (!posts.containsKey(postId)) return@withLock false
        saves.add(SavedPost(userId, postId, nowProvider()))
    }

    override suspend fun unsave(userId: String, postId: String): Boolean = mutex.withLock {
        saves.removeAll { it.userId == userId && it.postId == postId }
    }

    override suspend fun saved(userId: String): List<CommunityPost> = mutex.withLock {
        saves.filter { it.userId == userId }
            .sortedByDescending { it.atEpochMs }
            .mapNotNull { posts[it.postId] }
            .filter { !it.audit.deleted }
    }

    override suspend fun share(actorId: String, postId: String, target: ShareTargetKind, targetId: String?): Share? =
        mutex.withLock {
            val post = posts[postId]?.takeIf { !it.audit.deleted } ?: return@withLock null
            if (!rateLimiter.tryAcquire(actorId, CommunityAction.SHARE)) return@withLock null
            val share = Share(
                actorId = actorId,
                postId = post.id,
                target = target,
                targetId = targetId,
                deepLink = "fitconnect://app/community/post/${post.id}",
                atEpochMs = nowProvider(),
            )
            shares.add(share)
            share
        }

    override suspend fun saveDraft(draft: PostDraft): Unit = mutex.withLock {
        draftStore["${draft.authorId}:${draft.idempotencyKey}"] = draft
    }

    override suspend fun drafts(authorId: String): List<PostDraft> = mutex.withLock {
        draftStore.values.filter { it.authorId == authorId }
    }

    override suspend fun discardDraft(authorId: String, idempotencyKey: String): Unit = mutex.withLock {
        draftStore.remove("$authorId:$idempotencyKey")
    }

    private fun page(all: Collection<CommunityPost>, cursor: String?, limit: Int): PostPage {
        val sorted = all.sortedByDescending { it.audit.createdAtEpochMs }
        val start = cursor?.toIntOrNull() ?: 0
        val slice = sorted.drop(start).take(limit)
        val next = if (start + limit < sorted.size) (start + limit).toString() else null
        return PostPage(slice, next)
    }

    private fun extractTags(text: String, marker: Char): List<String> =
        text.split(Regex("\\s+"))
            .filter { it.length > 1 && it.startsWith(marker) }
            .map { it.drop(1).trimEnd('.', ',', '!', '?').lowercase() }
            .filter { it.isNotBlank() }
            .distinct()

    private companion object {
        const val DUPLICATE_WINDOW_MS = 10 * 60_000L
    }
}
