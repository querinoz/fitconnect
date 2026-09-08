package com.fitconnect.android.geo.booking

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.geo.domain.BookingLifecycle
import com.fitconnect.android.geo.domain.BookingTargetKind
import com.fitconnect.android.geo.domain.SessionMode
import java.time.Instant
import org.json.JSONArray
import org.json.JSONObject

/** Wire shape returned by `/api/v1/bookings` and `/api/v1/coaches/bookings`. */
data class RemoteBookingRow(
    val id: String,
    val athleteId: String,
    val athleteName: String,
    val coachId: String,
    val scheduledAtEpochMs: Long,
    val durationMin: Int,
    val status: BookingLifecycle,
    val notes: String?,
    val source: String? = null,
)

/**
 * HTTP contract for remote booking persistence.
 * Athlete list/create: GET|POST /api/v1/bookings
 * Coach list/actions: GET|POST /api/v1/coaches/bookings
 * Cancel/reschedule: PUT /api/v1/sessions/{id}
 */
interface BookingRemote {
    suspend fun createAthleteBooking(
        coachId: String,
        scheduledAtEpochMs: Long,
        durationMin: Int,
        notes: String?,
        idempotencyKey: String?,
        mode: SessionMode = SessionMode.PRIVATE,
    ): AppResult<RemoteBookingRow>

    /** Athlete lists own bookings (auth subject). */
    suspend fun listAthleteBookings(): AppResult<List<RemoteBookingRow>>

    suspend fun listCoachBookings(): AppResult<List<RemoteBookingRow>>

    suspend fun coachAction(bookingId: String, action: CoachBookingAction): AppResult<Unit>

    suspend fun sessionAction(
        sessionId: String,
        action: SessionBookingAction,
        scheduledAtEpochMs: Long? = null,
    ): AppResult<Unit>
}

enum class CoachBookingAction { APPROVE, REJECT }

enum class SessionBookingAction { CANCEL, RESCHEDULE }

class HttpBookingRemote(
    private val api: () -> ApiClient,
) : BookingRemote {
    override suspend fun createAthleteBooking(
        coachId: String,
        scheduledAtEpochMs: Long,
        durationMin: Int,
        notes: String?,
        idempotencyKey: String?,
        mode: SessionMode,
    ): AppResult<RemoteBookingRow> {
        val body = JSONObject()
            .put("coachId", coachId)
            .put("scheduledAt", Instant.ofEpochMilli(scheduledAtEpochMs).toString())
            .put("durationMin", durationMin)
            .put("type", "Intro session")
            .put("mode", if (mode == SessionMode.PRIVATE) "In-person" else "Online")
        if (!notes.isNullOrBlank()) body.put("notes", notes)
        if (!idempotencyKey.isNullOrBlank()) body.put("idempotencyKey", idempotencyKey)
        val headers = buildMap {
            if (!idempotencyKey.isNullOrBlank()) put("Idempotency-Key", idempotencyKey)
        }
        return when (val raw = api().post("/api/v1/bookings", body.toString(), headers)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> parseCreate(raw.value)
        }
    }

    override suspend fun listAthleteBookings(): AppResult<List<RemoteBookingRow>> {
        return when (val raw = api().get("/api/v1/bookings")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val source = root.optString("source", "unknown")
                if (source == "seed") {
                    return AppResult.Err(
                        AppError.Unexpected("athlete_bookings_seed_forbidden_in_remote_path"),
                    )
                }
                val arr = root.optJSONArray("bookings") ?: JSONArray()
                val rows = buildList {
                    for (i in 0 until arr.length()) {
                        add(parseAthleteRow(arr.getJSONObject(i), source))
                    }
                }
                AppResult.Ok(rows)
            }
        }
    }

    override suspend fun listCoachBookings(): AppResult<List<RemoteBookingRow>> {
        return when (val raw = api().get("/api/v1/coaches/bookings")) {
            is AppResult.Err -> raw
            is AppResult.Ok -> {
                val root = JSONObject(raw.value)
                val source = root.optString("source", "unknown")
                if (source == "seed") {
                    return AppResult.Err(
                        AppError.Unexpected("coach_bookings_seed_forbidden_in_remote_path"),
                    )
                }
                val arr = root.optJSONArray("bookings") ?: JSONArray()
                val rows = buildList {
                    for (i in 0 until arr.length()) {
                        add(parseCoachRow(arr.getJSONObject(i), source))
                    }
                }
                AppResult.Ok(rows)
            }
        }
    }

    override suspend fun coachAction(bookingId: String, action: CoachBookingAction): AppResult<Unit> {
        val apiAction = when (action) {
            CoachBookingAction.APPROVE -> "approve"
            CoachBookingAction.REJECT -> "reject"
        }
        val body = JSONObject().put("bookingId", bookingId).put("action", apiAction).toString()
        return when (val raw = api().post("/api/v1/coaches/bookings", body)) {
            is AppResult.Err -> raw
            is AppResult.Ok -> AppResult.Ok(Unit)
        }
    }

    override suspend fun sessionAction(
        sessionId: String,
        action: SessionBookingAction,
        scheduledAtEpochMs: Long?,
    ): AppResult<Unit> {
        val body = JSONObject().put(
            "action",
            when (action) {
                SessionBookingAction.CANCEL -> "cancel"
                SessionBookingAction.RESCHEDULE -> "reschedule"
            },
        )
        if (scheduledAtEpochMs != null) {
            body.put("when", Instant.ofEpochMilli(scheduledAtEpochMs).toString())
        }
        return when (val raw = api().put("/api/v1/sessions/$sessionId", body.toString())) {
            is AppResult.Err -> raw
            is AppResult.Ok -> AppResult.Ok(Unit)
        }
    }

    private fun parseCreate(json: String): AppResult<RemoteBookingRow> {
        val root = JSONObject(json)
        val booking = root.optJSONObject("booking")
            ?: return AppResult.Err(AppError.Unexpected("booking_create_failed"))
        return AppResult.Ok(parseAthleteRow(booking, root.optString("source")))
    }

    private fun parseAthleteRow(o: JSONObject, source: String): RemoteBookingRow {
        val scheduledAt = o.optString("scheduledAt")
        val epoch = runCatching { Instant.parse(scheduledAt).toEpochMilli() }
            .getOrDefault(System.currentTimeMillis())
        val status = when (o.optString("status", "pending")) {
            "approved" -> BookingLifecycle.CONFIRMED
            "rejected", "cancelled" -> BookingLifecycle.CANCELLED
            else -> BookingLifecycle.PENDING
        }
        return RemoteBookingRow(
            id = o.getString("id"),
            athleteId = o.optString("athleteId", ""),
            athleteName = o.optString("athleteId", "Athlete"),
            coachId = o.optString("coachId", ""),
            scheduledAtEpochMs = epoch,
            durationMin = o.optInt("durationMin", 60),
            status = status,
            notes = o.optString("notes").takeIf { it.isNotBlank() },
            source = source.takeIf { it.isNotBlank() },
        )
    }

    private fun parseCoachRow(o: JSONObject, source: String): RemoteBookingRow {
        val whenIso = o.optString("requestedAt")
        val epoch = runCatching { Instant.parse(whenIso).toEpochMilli() }
            .getOrDefault(System.currentTimeMillis())
        val status = when (o.optString("status", "pending")) {
            "approved" -> BookingLifecycle.CONFIRMED
            "rejected", "cancelled" -> BookingLifecycle.CANCELLED
            else -> BookingLifecycle.PENDING
        }
        return RemoteBookingRow(
            id = o.getString("id"),
            athleteId = o.optString("athleteId", ""),
            athleteName = o.optString("athleteName", o.optString("athleteId", "Athlete")),
            coachId = "",
            scheduledAtEpochMs = epoch,
            durationMin = 60,
            status = status,
            notes = o.optString("notes").takeIf { it.isNotBlank() },
            source = source,
        )
    }
}

fun RemoteBookingRow.toLocalBooking(
    targetId: String = coachId.ifBlank { "unknown-coach" },
    clientId: String = athleteId.ifBlank { "unknown-athlete" },
    clientName: String = athleteName,
    mode: SessionMode = SessionMode.PRIVATE,
    syncState: BookingSyncState = BookingSyncState.SYNCED,
): Booking = Booking(
    id = id,
    request = BookingRequest(
        targetKind = BookingTargetKind.COACH,
        targetId = targetId,
        clientId = clientId,
        clientName = clientName,
        startEpochMs = scheduledAtEpochMs,
        durationMin = durationMin,
        mode = mode,
        notes = notes,
    ),
    status = status,
    syncState = syncState,
)
