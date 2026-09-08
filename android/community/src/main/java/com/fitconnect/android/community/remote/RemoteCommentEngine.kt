package com.fitconnect.android.community.remote

import com.fitconnect.android.community.comments.CommentEngine
import com.fitconnect.android.community.comments.CommentPage
import com.fitconnect.android.community.domain.Comment
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/** Remote comments over `/api/v1/community/posts/{id}/comments`. Fail-closed on errors. */
class RemoteCommentEngine(
    private val api: CommunityPostsApi,
) : CommentEngine {
    private val mutex = Mutex()
    private val cache = mutableMapOf<String, List<Comment>>()

    override suspend fun add(
        postId: String,
        parentCommentId: String?,
        authorId: String,
        text: String,
        mentions: List<String>,
    ): Comment? {
        if (text.isBlank() || parentCommentId != null) return null
        return when (val result = api.addComment(postId, text.trim(), authorId)) {
            is AppResult.Err -> null
            is AppResult.Ok -> {
                mutex.withLock {
                    cache[postId] = listOf(result.value) + cache[postId].orEmpty()
                }
                result.value
            }
        }
    }

    override suspend fun edit(commentId: String, authorId: String, text: String): Boolean = false

    override suspend fun delete(commentId: String, actorId: String, isModerator: Boolean): Boolean = false

    override suspend fun forPost(postId: String, offset: Int, limit: Int): CommentPage {
        val items = when (val result = api.listComments(postId)) {
            is AppResult.Err -> mutex.withLock { cache[postId].orEmpty() }
            is AppResult.Ok -> {
                mutex.withLock { cache[postId] = result.value }
                result.value
            }
        }
        val slice = items.drop(offset).take(limit)
        val next = if (offset + limit < items.size) offset + limit else null
        return CommentPage(slice, next)
    }

    override suspend fun replies(commentId: String, offset: Int, limit: Int): CommentPage =
        CommentPage(emptyList(), null)

    override suspend fun count(postId: String): Int {
        val page = forPost(postId, offset = 0, limit = 200)
        return page.items.size
    }
}
