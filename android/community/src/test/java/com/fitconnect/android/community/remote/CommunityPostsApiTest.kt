package com.fitconnect.android.community.remote

import com.fitconnect.android.community.domain.PostKind
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.shared.fitness.ProviderId
import kotlinx.coroutines.runBlocking
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class CommunityPostsApiTest {

    @Test
    fun parsePost_mapsAuthorAndKind() {
        val json = JSONObject(
            """
            {
              "id": "p1",
              "kind": "PR",
              "text": "New squat PR",
              "createdAtEpochMs": 1000,
              "author": { "name": "Inês", "sport": "Strength" }
            }
            """.trimIndent(),
        )
        val post = CommunityPostsApi.parsePost(json, source = "memory", authorFallback = "x")
        assertEquals("p1", post.id)
        assertEquals("Inês", post.authorId)
        assertEquals(PostKind.ACHIEVEMENT, post.kind)
        assertEquals("Strength", post.sportKey)
        assertEquals(1000L, post.audit.createdAtEpochMs)
    }

    @Test
    fun parseWorkoutFacts_preservesStravaProvider() {
        val json = JSONObject(
            """
            {
              "id": "p-strava",
              "kind": "Workout",
              "text": "Morning run",
              "providerId": "STRAVA",
              "workoutFacts": {
                "sportKey": "running",
                "durationMinutes": 40,
                "distanceMeters": 8000
              }
            }
            """.trimIndent(),
        )
        val post = CommunityPostsApi.parsePost(json, source = "supabase", authorFallback = "a2")
        assertEquals(ProviderId.STRAVA.name, post.workoutFacts?.providerId)
        assertEquals(false, post.shareTelemetryFacts)
    }

    @Test
    fun parsePosts_emptyArray() {
        assertTrue(CommunityPostsApi.parsePosts(JSONArray(), "memory").isEmpty())
    }

    @Test
    fun list_failClosedOnApiError() = runBlocking {
        val api = CommunityPostsApi {
            FakeApiClient(getBody = AppResult.Err(AppError.Api(503, code = "persistence_not_configured")))
        }
        val result = api.list()
        assertTrue(result is AppResult.Err)
    }

    @Test
    fun list_parsesOkPayload() = runBlocking {
        val payload = JSONObject()
            .put("source", "supabase")
            .put(
                "posts",
                JSONArray().put(
                    JSONObject()
                        .put("id", "c-1")
                        .put("kind", "Check-in")
                        .put("text", "Hello")
                        .put("author", JSONObject().put("name", "Aoife").put("sport", "Running")),
                ),
            )
            .toString()
        val api = CommunityPostsApi {
            FakeApiClient(getBody = AppResult.Ok(payload))
        }
        val result = api.list()
        assertTrue(result is AppResult.Ok)
        val posts = (result as AppResult.Ok).value
        assertEquals(1, posts.size)
        assertEquals("Aoife", posts[0].authorId)
        assertNull(posts[0].workoutFacts)
    }

    @Test
    fun remotePostEngine_stripsStravaFromCandidates() = runBlocking {
        val payload = JSONObject()
            .put("source", "supabase")
            .put(
                "posts",
                JSONArray()
                    .put(
                        JSONObject()
                            .put("id", "ok")
                            .put("kind", "Check-in")
                            .put("text", "Safe")
                            .put("author", JSONObject().put("name", "a1")),
                    )
                    .put(
                        JSONObject()
                            .put("id", "leak")
                            .put("kind", "Workout")
                            .put("text", "Strava secret")
                            .put("providerId", "STRAVA")
                            .put(
                                "workoutFacts",
                                JSONObject()
                                    .put("sportKey", "running")
                                    .put("durationMinutes", 30),
                            )
                            .put("author", JSONObject().put("name", "a2")),
                    ),
            )
            .toString()
        val engine = RemotePostEngine(
            CommunityPostsApi { FakeApiClient(getBody = AppResult.Ok(payload)) },
        )
        val page = engine.allVisibleCandidates(limit = 50)
        assertEquals(1, page.items.size)
        assertEquals("ok", page.items.single().id)
        assertTrue(page.items.none { it.text.contains("Strava") })
    }

    @Test
    fun remotePostEngine_rejectsStravaCreate() = runBlocking {
        val engine = RemotePostEngine(
            CommunityPostsApi { FakeApiClient() },
        )
        val result = engine.create(
            com.fitconnect.android.community.posts.PostDraft(
                idempotencyKey = "k1",
                authorId = "u1",
                kind = PostKind.WORKOUT,
                text = "Should refuse",
                workoutFacts = com.fitconnect.android.community.domain.WorkoutFacts(
                    sportKey = "running",
                    durationMinutes = 20,
                    distanceMeters = 3000.0,
                    calories = null,
                    avgHeartRate = null,
                    trainingLoad = null,
                    providerId = ProviderId.STRAVA.name,
                ),
            ),
        )
        assertEquals(com.fitconnect.android.community.posts.PostResult.Invalid, result)
    }

    @Test
    fun failClosedPostEngine_staysEmpty() = runBlocking {
        val engine = FailClosedPostEngine()
        assertTrue(engine.allVisibleCandidates().items.isEmpty())
        assertEquals(
            com.fitconnect.android.community.posts.PostResult.Invalid,
            engine.create(
                com.fitconnect.android.community.posts.PostDraft(
                    idempotencyKey = "x",
                    authorId = "u",
                    kind = PostKind.TEXT,
                    text = "nope",
                ),
            ),
        )
    }
}

private class FakeApiClient(
    private val getBody: AppResult<String> = AppResult.Err(AppError.Network(AppError.NetworkKind.OFFLINE)),
    private val postBody: AppResult<String> = AppResult.Err(AppError.Network(AppError.NetworkKind.OFFLINE)),
) : ApiClient {
    override suspend fun get(path: String, headers: Map<String, String>): AppResult<String> = getBody
    override suspend fun post(
        path: String,
        body: String,
        headers: Map<String, String>,
        mediaType: String,
    ): AppResult<String> = postBody
    override suspend fun put(
        path: String,
        body: String,
        headers: Map<String, String>,
        mediaType: String,
    ): AppResult<String> = postBody
    override suspend fun delete(path: String, headers: Map<String, String>): AppResult<String> =
        AppResult.Ok("{}")
    override fun cancelAll() = Unit
}
