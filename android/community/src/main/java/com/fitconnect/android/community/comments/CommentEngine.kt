package com.fitconnect.android.community.comments

import com.fitconnect.android.community.domain.Audit
import com.fitconnect.android.community.domain.Comment
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

data class CommentPage(val items: List<Comment>, val nextOffset: Int?)

/**
 * Comments with bounded nesting (max depth [MAX_DEPTH]), editing, soft
 * deletion and pagination. Reactions on comments go through ReactionEngine.
 */
interface CommentEngine {
    suspend fun add(postId: String, parentCommentId: String?, authorId: String, text: String, mentions: List<String> = emptyList()): Comment?
    suspend fun edit(commentId: String, authorId: String, text: String): Boolean
    suspend fun delete(commentId: String, actorId: String, isModerator: Boolean = false): Boolean
    suspend fun forPost(postId: String, offset: Int = 0, limit: Int = 20): CommentPage
    suspend fun replies(commentId: String, offset: Int = 0, limit: Int = 20): CommentPage
    suspend fun count(postId: String): Int
}

class InMemoryCommentEngine : CommentEngine {
    private val mutex = Mutex()
    private val comments = linkedMapOf<String, Comment>()
    private var sequence = 0L

    override suspend fun add(
        postId: String,
        parentCommentId: String?,
        authorId: String,
        text: String,
        mentions: List<String>,
    ): Comment? = mutex.withLock {
        if (text.isBlank()) return@withLock null
        val depth = if (parentCommentId == null) {
            0
        } else {
            val parent = comments[parentCommentId] ?: return@withLock null
            if (parent.postId != postId || parent.depth >= MAX_DEPTH) return@withLock null
            parent.depth + 1
        }
        val now = System.currentTimeMillis()
        val comment = Comment(
            id = "c-${++sequence}",
            postId = postId,
            parentCommentId = parentCommentId,
            authorId = authorId,
            text = text.trim(),
            mentions = mentions,
            depth = depth,
            audit = Audit(now, now),
        )
        comments[comment.id] = comment
        comment
    }

    override suspend fun edit(commentId: String, authorId: String, text: String): Boolean = mutex.withLock {
        val existing = comments[commentId] ?: return@withLock false
        if (existing.authorId != authorId || existing.audit.deleted || text.isBlank()) return@withLock false
        comments[commentId] = existing.copy(
            text = text.trim(),
            edited = true,
            audit = existing.audit.copy(updatedAtEpochMs = System.currentTimeMillis()),
        )
        true
    }

    override suspend fun delete(commentId: String, actorId: String, isModerator: Boolean): Boolean = mutex.withLock {
        val existing = comments[commentId] ?: return@withLock false
        if (existing.authorId != actorId && !isModerator) return@withLock false
        comments[commentId] = existing.copy(
            audit = existing.audit.copy(deletedAtEpochMs = System.currentTimeMillis()),
        )
        true
    }

    override suspend fun forPost(postId: String, offset: Int, limit: Int): CommentPage = mutex.withLock {
        page(comments.values.filter { it.postId == postId && it.parentCommentId == null && !it.audit.deleted }, offset, limit)
    }

    override suspend fun replies(commentId: String, offset: Int, limit: Int): CommentPage = mutex.withLock {
        page(comments.values.filter { it.parentCommentId == commentId && !it.audit.deleted }, offset, limit)
    }

    override suspend fun count(postId: String): Int = mutex.withLock {
        comments.values.count { it.postId == postId && !it.audit.deleted }
    }

    private fun page(all: List<Comment>, offset: Int, limit: Int): CommentPage {
        val sorted = all.sortedBy { it.audit.createdAtEpochMs }
        val slice = sorted.drop(offset).take(limit)
        return CommentPage(slice, if (offset + limit < sorted.size) offset + limit else null)
    }

    companion object {
        /** Post → comment → reply. No deeper nesting, ever. */
        const val MAX_DEPTH = 1
    }
}
