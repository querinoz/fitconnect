package com.fitconnect.android.athlete.community

import com.fitconnect.android.community.domain.Comment
import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.android.community.remote.CommunityPostsApi
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient

/**
 * Athlete-facing facade over [CommunityPostsApi].
 * Prefer [com.fitconnect.android.community.di.CommunityContainer] engines in UI.
 */
class RemoteCommunityPosts(
    private val api: () -> ApiClient,
) {
    private val client = CommunityPostsApi(api)

    suspend fun list(): AppResult<List<CommunityPost>> = client.list()

    suspend fun create(text: String, authorId: String): AppResult<CommunityPost> =
        client.create(text, authorId)

    suspend fun listComments(postId: String): AppResult<List<Comment>> =
        client.listComments(postId)

    suspend fun addComment(postId: String, text: String): AppResult<Comment> =
        client.addComment(postId, text, authorFallback = "")

    suspend fun react(postId: String, emoji: String = "LIKE"): AppResult<Unit> =
        client.react(postId, emoji)

    suspend fun unreact(postId: String, emoji: String = "LIKE"): AppResult<Unit> =
        client.unreact(postId, emoji)

    suspend fun listReactions(postId: String): AppResult<Map<String, Int>> =
        client.listReactions(postId)
}
