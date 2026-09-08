package com.fitconnect.android.community.remote

import com.fitconnect.android.community.domain.Audit
import com.fitconnect.android.community.domain.Comment
import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.android.community.domain.PostKind
import com.fitconnect.android.community.domain.Visibility
import com.fitconnect.android.community.domain.WorkoutFacts
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.shared.fitness.ProviderId
import org.json.JSONArray
import org.json.JSONObject

/**
 * HTTP adapter for `/api/v1/community/posts` (+ comments / reactions).
 * Parsing is pure and unit-tested — never invents LOCAL_DEMO rows.
 */
class CommunityPostsApi(
    private val api: () -> ApiClient,
) {
    suspend fun list(): AppResult<List<CommunityPost>> =
        when (val raw = api().get("/api/v1/community/posts")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                if (root.has("error")) {
                    return AppResult.Err(
                        AppError.Api(
                            statusCode = 503,
                            code = root.optString("error", "persistence_not_configured"),
                        ),
                    )
                }
                val arr = root.optJSONArray("posts") ?: JSONArray()
                AppResult.Ok(parsePosts(arr, root.optString("source")))
            }
        }

    suspend fun create(text: String, authorId: String, kindWire: String = "Check-in"): AppResult<CommunityPost> {
        val body = JSONObject()
            .put("text", text)
            .put("kind", kindWire)
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
                            add(parseComment(arr.getJSONObject(i), postId))
                        }
                    },
                )
            }
        }

    suspend fun addComment(postId: String, text: String, authorFallback: String): AppResult<Comment> {
        val body = JSONObject().put("text", text).toString()
        return when (val raw = api().post("/api/v1/community/posts/$postId/comments", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val o = JSONObject(raw.value).optJSONObject("comment")
                    ?: return AppResult.Err(AppError.Unexpected("comment_create_failed"))
                AppResult.Ok(parseComment(o, postId, authorFallback))
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

    companion object {
        fun parsePosts(arr: JSONArray, source: String): List<CommunityPost> =
            buildList {
                for (i in 0 until arr.length()) {
                    add(parsePost(arr.getJSONObject(i), source, authorFallback = "remote"))
                }
            }

        fun parsePost(o: JSONObject, source: String, authorFallback: String): CommunityPost {
            val author = o.optJSONObject("author")
            val authorId = o.optString("authorId").takeIf { it.isNotBlank() }
                ?: author?.optString("id")?.takeIf { it.isNotBlank() }
                ?: author?.optString("name")?.takeIf { it.isNotBlank() }
                ?: authorFallback
            val kind = when (o.optString("kind", "Check-in").lowercase()) {
                "workout" -> PostKind.WORKOUT
                "pr", "personal_record", "achievement" -> PostKind.ACHIEVEMENT
                else -> PostKind.TEXT
            }
            val created = when {
                o.has("createdAtEpochMs") -> o.optLong("createdAtEpochMs")
                o.has("createdAt") -> runCatching {
                    java.time.Instant.parse(o.optString("createdAt")).toEpochMilli()
                }.getOrDefault(System.currentTimeMillis())
                else -> System.currentTimeMillis()
            }
            val workoutFacts = parseWorkoutFacts(o, author?.optString("sport"))
            return CommunityPost(
                id = o.optString("id", "post-$created"),
                authorId = authorId,
                kind = kind,
                text = o.optString("text", o.optString("content", "")),
                sportKey = o.optString("sportKey").takeIf { it.isNotBlank() }
                    ?: author?.optString("sport")?.takeIf { it.isNotBlank() },
                workoutFacts = workoutFacts,
                shareTelemetryFacts = workoutFacts != null &&
                    ProviderId.fromWire(workoutFacts.providerId) != ProviderId.STRAVA,
                visibility = Visibility.PUBLIC,
                audit = Audit(
                    createdAtEpochMs = created,
                    updatedAtEpochMs = created,
                ),
            )
        }

        /**
         * Wire provider when present. Missing provider → HEALTH_CONNECT (shareable).
         * STRAVA is never treated as socially shareable facts.
         */
        fun parseWorkoutFacts(o: JSONObject, sportFallback: String?): WorkoutFacts? {
            val factsObj = o.optJSONObject("workoutFacts")
            val providerRaw = sequenceOf(
                factsObj?.optString("providerId"),
                o.optString("providerId"),
                o.optString("provider"),
            ).mapNotNull { it?.takeIf { s -> s.isNotBlank() } }.firstOrNull()

            val highlight = o.optJSONObject("highlight")
            val hasMetric = factsObj != null ||
                (highlight != null && highlight.optString("value").isNotBlank()) ||
                providerRaw != null

            if (!hasMetric) return null

            val sport = factsObj?.optString("sportKey")?.takeIf { it.isNotBlank() }
                ?: o.optString("sportKey").takeIf { it.isNotBlank() }
                ?: sportFallback
                ?: "unknown"

            val provider = ProviderId.fromWire(providerRaw ?: ProviderId.HEALTH_CONNECT.name)
            return WorkoutFacts(
                sportKey = sport,
                durationMinutes = factsObj?.optInt("durationMinutes", 0) ?: 0,
                distanceMeters = factsObj?.optDouble("distanceMeters")?.takeIf { !it.isNaN() },
                calories = factsObj?.optDouble("calories")?.takeIf { !it.isNaN() },
                avgHeartRate = factsObj?.optDouble("avgHeartRate")?.takeIf { !it.isNaN() },
                trainingLoad = factsObj?.optDouble("trainingLoad")?.takeIf { !it.isNaN() },
                personalRecord = factsObj?.optBoolean("personalRecord", false)
                    ?: o.optString("kind").equals("PR", ignoreCase = true),
                providerId = provider.name,
            )
        }

        private fun parseComment(o: JSONObject, postId: String, authorFallback: String = ""): Comment {
            val created = when {
                o.has("createdAtEpochMs") -> o.optLong("createdAtEpochMs")
                o.has("createdAt") -> runCatching {
                    java.time.Instant.parse(o.optString("createdAt")).toEpochMilli()
                }.getOrDefault(System.currentTimeMillis())
                else -> System.currentTimeMillis()
            }
            return Comment(
                id = o.getString("id"),
                postId = postId,
                parentCommentId = o.optString("parentCommentId").takeIf { it.isNotBlank() },
                authorId = o.optString("authorId").ifBlank { authorFallback },
                text = o.optString("text"),
                depth = o.optInt("depth", 0),
                audit = Audit(created, created),
            )
        }
    }
}
