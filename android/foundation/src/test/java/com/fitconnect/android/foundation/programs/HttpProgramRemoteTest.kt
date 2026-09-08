package com.fitconnect.android.foundation.programs

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class HttpProgramRemoteTest {
    @Test
    fun listAthleteMapsEnrollments() = runBlocking {
        val api = FakeApiClient(
            getResponse = AppResult.Ok(
                """{"source":"memory","enrollments":[{"id":"en-1","programId":"prog-vo2-8","title":"VO2 Build","currentWeek":2,"totalWeeks":8,"progressPercent":25,"nextWorkoutTitle":"Threshold","milestones":["W1"]}]}""",
            ),
        )
        val remote = HttpProgramRemote { api }
        val snap = (remote.listAthletePrograms() as AppResult.Ok).value
        assertEquals(1, snap.enrollments.size)
        assertEquals("prog-vo2-8", snap.enrollments[0].programId)
        assertEquals("VO2 Build", snap.enrollments[0].title)
        assertEquals(listOf("W1"), snap.enrollments[0].milestones)
        assertEquals("/api/v1/athletes/programs", api.lastGetPath)
    }

    @Test
    fun listAthleteRejectsSeedSource() = runBlocking {
        val api = FakeApiClient(
            getResponse = AppResult.Ok("""{"enrollments":[],"source":"seed"}"""),
        )
        val remote = HttpProgramRemote { api }
        val result = remote.listAthletePrograms()
        assertTrue(result is AppResult.Err)
        assertTrue((result as AppResult.Err).error.toString().contains("seed_forbidden"))
    }

    @Test
    fun listAthleteAcceptsEmptySource() = runBlocking {
        val api = FakeApiClient(
            getResponse = AppResult.Ok("""{"enrollments":[],"source":"empty"}"""),
        )
        val remote = HttpProgramRemote { api }
        val snap = (remote.listAthletePrograms() as AppResult.Ok).value
        assertTrue(snap.enrollments.isEmpty())
        assertEquals("empty", snap.source)
    }

    @Test
    fun enrollPostsProgramId() = runBlocking {
        val api = FakeApiClient(
            postResponse = AppResult.Ok(
                """{"enrollment":{"id":"en-9","programId":"prog-vo2-8","title":"VO2 Build","currentWeek":1,"totalWeeks":8,"progressPercent":0,"nextWorkoutTitle":"Intro","milestones":[]},"source":"memory"}""",
            ),
        )
        val remote = HttpProgramRemote { api }
        val row = (remote.enrollAthlete("prog-vo2-8") as AppResult.Ok).value
        assertEquals("prog-vo2-8", row.programId)
        assertEquals("/api/v1/athletes/programs", api.lastPostPath)
        assertTrue(api.lastPostBody!!.contains("prog-vo2-8"))
    }

    @Test
    fun listCoachRejectsSeedSource() = runBlocking {
        val api = FakeApiClient(
            getResponse = AppResult.Ok("""{"programs":[],"source":"seed"}"""),
        )
        val remote = HttpProgramRemote { api }
        val result = remote.listCoachPrograms()
        assertTrue(result is AppResult.Err)
        assertTrue((result as AppResult.Err).error.toString().contains("seed_forbidden"))
    }

    @Test
    fun listCoachMapsPublishedRows() = runBlocking {
        val api = FakeApiClient(
            getResponse = AppResult.Ok(
                """{"source":"postgres","programs":[{"id":"cp-1","title":"Build","weeks":6,"state":"published","version":2}]}""",
            ),
        )
        val remote = HttpProgramRemote { api }
        val snap = (remote.listCoachPrograms() as AppResult.Ok).value
        assertEquals(1, snap.programs.size)
        assertEquals("cp-1", snap.programs[0].id)
        assertEquals("published", snap.programs[0].state)
        assertEquals("/api/v1/coaches/programs", api.lastGetPath)
    }

    @Test
    fun coachActionPostsClone() = runBlocking {
        val api = FakeApiClient(
            postResponse = AppResult.Ok(
                """{"program":{"id":"cp-copy","title":"Build (copy)","weeks":6,"state":"draft","version":1},"source":"memory"}""",
            ),
        )
        val remote = HttpProgramRemote { api }
        val row = (remote.coachAction(CoachProgramRemoteAction.CLONE, "cp-1") as AppResult.Ok).value
        assertEquals("cp-copy", row.id)
        assertEquals("draft", row.state)
        assertEquals("/api/v1/coaches/programs", api.lastPostPath)
        assertTrue(api.lastPostBody!!.contains("\"clone\""))
    }

    @Test
    fun emptyRemoteFailClosed() = runBlocking {
        val remote = EmptyProgramRemote()
        val athlete = (remote.listAthletePrograms() as AppResult.Ok).value
        assertTrue(athlete.enrollments.isEmpty())
        assertEquals("empty", athlete.source)
        val coach = (remote.listCoachPrograms() as AppResult.Ok).value
        assertTrue(coach.programs.isEmpty())
        assertTrue(remote.enrollAthlete("x") is AppResult.Err)
        assertTrue(remote.coachAction(CoachProgramRemoteAction.PUBLISH, "x") is AppResult.Err)
    }
}

private class FakeApiClient(
    private val getResponse: AppResult<String> = AppResult.Err(AppError.Unexpected("unset")),
    private val postResponse: AppResult<String> = AppResult.Err(AppError.Unexpected("unset")),
) : ApiClient {
    var lastGetPath: String? = null
    var lastPostPath: String? = null
    var lastPostBody: String? = null

    override suspend fun get(path: String, headers: Map<String, String>): AppResult<String> {
        lastGetPath = path
        return getResponse
    }

    override suspend fun post(
        path: String,
        body: String,
        headers: Map<String, String>,
        mediaType: String,
    ): AppResult<String> {
        lastPostPath = path
        lastPostBody = body
        return postResponse
    }

    override suspend fun put(
        path: String,
        body: String,
        headers: Map<String, String>,
        mediaType: String,
    ): AppResult<String> = AppResult.Err(AppError.Unexpected("unused"))

    override suspend fun delete(path: String, headers: Map<String, String>): AppResult<String> =
        AppResult.Err(AppError.Unexpected("unused"))

    override fun cancelAll() = Unit
}
