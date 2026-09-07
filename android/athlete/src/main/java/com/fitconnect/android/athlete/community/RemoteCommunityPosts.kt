package com.fitconnect.android.athlete.community

import com.fitconnect.android.community.domain.Audit
import com.fitconnect.android.community.domain.Comment
import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.android.community.domain.PostKind
import com.fitconnect.android.community.domain.Visibility
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import org.json.JSONArray
import org.json.JSONObject

/**
 * Canonical community feed over `/api/v1/community/posts` (+ comments/reactions).
 * Never seeds LOCAL_DEMO posts onto a Firebase session.
 */
class RemoteCommunityPosts(
    private val api: () -> ApiClient,
) {
    suspend fun list(): AppResult<List<CommunityPost>> =
        when (val raw = api().get("/api/v1/community/posts")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val arr = root.optJSONArray("posts") ?: JSONArray()
                AppResult.Ok(parsePosts(arr, root.optString("source")))
            }
        }

    suspend fun create(text: String, authorId: String): AppResult<CommunityPost> {
        val body = JSONObject()
            .put("text", text)
            .put("kind", "Check-in")
            .toString()
        return when (val raw = api().post("/api/v1/community/posts", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val post = root.optJSONObject("post")
                    ?: return AppResult.Err(AppError.Unexpected("create_failed"))
                AppResult.Ok(parsePost(post, root.optString("source"), authorId))
            }
        }
    }

    suspend fun listComments(postId: String): AppResult<List<Comment>> =
        when (val raw = api().get("/api/v1/community/posts/$postId/comments")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val arr = JSONObject(raw.value).optJSONArray("comments") ?: JSONArray()
                AppResult.Ok(
                    buildList {
                        for (i in 0 until arr.length()) {
                            val o = arr.getJSONObject(i)
                            val created = runCatching {
                                java.time.Instant.parse(o.optString("createdAt")).toEpochMilli()
                            }.getOrDefault(System.currentTimeMillis())
                            add(
                                Comment(
                                    id = o.getString("id"),
                                    postId = postId,
                                    parentCommentId = null,
                                    authorId = o.optString("authorId"),
                                    text = o.optString("text"),
                                    depth = 0,
                                    audit = Audit(created, created),
                                ),
                            )
                        }
                    },
                )
            }
        }

    suspend fun addComment(postId: String, text: String): AppResult<Comment> {
        val body = JSONObject().put("text", text).toString()
        return when (val raw = api().post("/api/v1/community/posts/$postId/comments", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val o = JSONObject(raw.value).optJSONObject("comment")
                    ?: return AppResult.Err(AppError.Unexpected("comment_create_failed"))
                val created = System.currentTimeMillis()
                AppResult.Ok(
                    Comment(
                        id = o.getString("id"),
                        postId = postId,
                        parentCommentId = null,
                        authorId = o.optString("authorId"),
                        text = o.optString("text"),
                        depth = 0,
                        audit = Audit(created, created),
                    ),
                )
            }
        }
    }

    suspend fun react(postId: String, emoji: String = "LIKE"): AppResult<Unit> {
        val body = JSONObject().put("emoji", emoji).toString()
        return when (val raw = api().post("/api/v1/community/posts/$postId/reactions", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> AppResult.Ok(Unit)
        }
    }

    suspend fun unreact(postId: String, emoji: String = "LIKE"): AppResult<Unit> =
        when (val raw = api().delete("/api/v1/community/posts/$postId/reactions?emoji=$emoji")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> AppResult.Ok(Unit)
        }

    suspend fun listReactions(postId: String): AppResult<Map<String, Int>> =
        when (val raw = api().get("/api/v1/community/posts/$postId/reactions")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val arr = JSONObject(raw.value).optJSONArray("reactions") ?: JSONArray()
                val counts = mutableMapOf<String, Int>()
                for (i in 0 until arr.length()) {
                    val emoji = arr.getJSONObject(i).optString("emoji", "LIKE")
                    counts[emoji] = (counts[emoji] ?: 0) + 1
                }
                AppResult.Ok(counts)
            }
        }

    private fun parsePosts(arr: JSONArray, source: String): List<CommunityPost> =
        buildList {
            for (i in 0 until arr.length()) {
                add(parsePost(arr.getJSONObject(i), source, authorFallback = "remote"))
            }
        }

    private fun parsePost(o: JSONObject, source: String, authorFallback: String): CommunityPost {
        val author = o.optJSONObject("author")
        val authorId = author?.optString("id")?.takeIf { it.isNotBlank() }
            ?: author?.optString("name")?.takeIf { it.isNotBlank() }
            ?: authorFallback
        val kind = when (o.optString("kind", "Check-in").lowercase()) {
            "workout" -> PostKind.WORKOUT
            "pr", "personal_record", "achievement" -> PostKind.ACHIEVEMENT
            else -> PostKind.TEXT
        }
        val created = o.optLong("createdAtEpochMs", System.currentTimeMillis())
        return CommunityPost(
            id = o.optString("id", "post-$created"),
            authorId = authorId,
            kind = kind,
            text = o.optString("text", ""),
            sportKey = author?.optString("sport"),
            visibility = Visibility.PUBLIC,
            audit = Audit(
                createdAtEpochMs = created,
                updatedAtEpochMs = created,
            ),
        )
    }
}
