package com.fitconnect.android.geo.booking

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.geo.domain.BookingLifecycle
import com.fitconnect.android.geo.domain.SessionMode
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class HttpBookingRemoteTest {
    @Test
    fun createParsesBookingId() = runBlocking {
        val api = FakeApiClient(
            postResponse = AppResult.Ok(
                """{"booking":{"id":"bk-1","athleteId":"a1","coachId":"c1","scheduledAt":"2030-01-15T10:00:00Z","durationMin":60,"status":"pending"},"source":"memory"}""",
            ),
        )
        val remote = HttpBookingRemote { api }
        val result = remote.createAthleteBooking(
            coachId = "c1",
            scheduledAtEpochMs = 1_893_456_000_000L,
            durationMin = 60,
            notes = null,
            idempotencyKey = "idem-1",
            mode = SessionMode.PRIVATE,
        )
        assertTrue(result is AppResult.Ok)
        assertEquals("bk-1", (result as AppResult.Ok).value.id)
        assertEquals("/api/v1/bookings", api.lastPostPath)
        assertTrue(api.lastPostHeaders.containsKey("Idempotency-Key"))
    }

    @Test
    fun listAthleteMapsOwnRows() = runBlocking {
        val api = FakeApiClient(
            getResponse = AppResult.Ok(
                """{"source":"memory","bookings":[{"id":"bk-a","athleteId":"a1","coachId":"c1","scheduledAt":"2030-03-01T09:00:00Z","durationMin":45,"status":"pending","notes":null}]}""",
            ),
        )
        val remote = HttpBookingRemote { api }
        val rows = (remote.listAthleteBookings() as AppResult.Ok).value
        assertEquals(1, rows.size)
        assertEquals("bk-a", rows[0].id)
        assertEquals("c1", rows[0].coachId)
        assertEquals(BookingLifecycle.PENDING, rows[0].status)
        assertEquals("/api/v1/bookings", api.lastGetPath)
    }

    @Test
    fun listAthleteRejectsSeedSource() = runBlocking {
        val api = FakeApiClient(
            getResponse = AppResult.Ok("""{"bookings":[],"source":"seed"}"""),
        )
        val remote = HttpBookingRemote { api }
        val result = remote.listAthleteBookings()
        assertTrue(result is AppResult.Err)
        assertTrue((result as AppResult.Err).error.toString().contains("seed_forbidden"))
    }

    @Test
    fun listRejectsSeedSource() = runBlocking {
        val api = FakeApiClient(
            getResponse = AppResult.Ok("""{"bookings":[],"source":"seed"}"""),
        )
        val remote = HttpBookingRemote { api }
        val result = remote.listCoachBookings()
        assertTrue(result is AppResult.Err)
        assertTrue((result as AppResult.Err).error.toString().contains("seed_forbidden"))
    }

    @Test
    fun coachActionPostsApprove() = runBlocking {
        val api = FakeApiClient(postResponse = AppResult.Ok("""{"ok":true}"""))
        val remote = HttpBookingRemote { api }
        val result = remote.coachAction("bk-9", CoachBookingAction.APPROVE)
        assertTrue(result is AppResult.Ok)
        assertEquals("/api/v1/coaches/bookings", api.lastPostPath)
        assertTrue(api.lastPostBody!!.contains("\"approve\""))
    }

    @Test
    fun listMapsPendingRows() = runBlocking {
        val api = FakeApiClient(
            getResponse = AppResult.Ok(
                """{"source":"postgres","bookings":[{"id":"bk-2","athleteId":"a2","athleteName":"Sam","requestedAt":"2030-02-01T12:00:00Z","status":"pending","notes":"Intro"}]}""",
            ),
        )
        val remote = HttpBookingRemote { api }
        val rows = (remote.listCoachBookings() as AppResult.Ok).value
        assertEquals(1, rows.size)
        assertEquals(BookingLifecycle.PENDING, rows[0].status)
        assertEquals("Sam", rows[0].athleteName)
    }
}

private class FakeApiClient(
    private val getResponse: AppResult<String> = AppResult.Err(AppError.Unexpected("unset")),
    private val postResponse: AppResult<String> = AppResult.Err(AppError.Unexpected("unset")),
    private val putResponse: AppResult<String> = AppResult.Err(AppError.Unexpected("unset")),
) : ApiClient {
    var lastGetPath: String? = null
    var lastPostPath: String? = null
    var lastPostBody: String? = null
    var lastPostHeaders: Map<String, String> = emptyMap()

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
        lastPostHeaders = headers
        return postResponse
    }

    override suspend fun put(
        path: String,
        body: String,
        headers: Map<String, String>,
        mediaType: String,
    ): AppResult<String> = putResponse

    override suspend fun delete(path: String, headers: Map<String, String>): AppResult<String> =
        AppResult.Err(AppError.Unexpected("unused"))

    override fun cancelAll() = Unit
}
