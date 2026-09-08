package com.fitconnect.android.foundation.offline

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.network.ApiClient
import org.json.JSONObject

/** HTTP-backed offline flush for coach calendar / booking / program mutations. */
object CoachOfflineHandlers {
    /** Canonical mutation types — keep OfflineKillMatrixTest in sync. */
    val MUTATION_TYPES: List<String> = listOf(
        "coach.booking.approve",
        "coach.booking.decline",
        "coach.booking.reject",
        "coach.session.reschedule",
        "coach.session.cancel",
        "coach.program.publish",
        "coach.program.draft",
        "coach.program.clone",
        "coach.athlete.favorite",
        "coach.inbox.read",
    )

    fun register(
        registry: RegistryOfflineExecutor,
        api: ApiClient,
        logger: Logger,
        onBookingActionSynced: ((work: SyncWork, action: String) -> Unit)? = null,
    ) {
        registry.register("coach.booking.approve", bookingAction(api, logger, "approve", onBookingActionSynced))
        registry.register("coach.booking.decline", bookingAction(api, logger, "reject", onBookingActionSynced))
        registry.register("coach.booking.reject", bookingAction(api, logger, "reject", onBookingActionSynced))
        registry.register("coach.session.reschedule", sessionPatch(api, logger, "reschedule"))
        registry.register("coach.session.cancel", sessionPatch(api, logger, "cancel"))
        registry.register("coach.program.publish", programAction(api, logger, "publish"))
        registry.register("coach.program.draft", programAction(api, logger, "draft"))
        registry.register("coach.program.clone", programAction(api, logger, "clone"))
        registry.register("coach.athlete.favorite", favoriteToggle(api, logger))
        registry.register("coach.inbox.read", inboxRead(api, logger))
    }

    private fun favoriteToggle(api: ApiClient, logger: Logger): OfflineWorkExecutor =
        OfflineWorkExecutor { work ->
            val athleteId = JSONObject(work.payloadJson).optString("athleteId")
                .ifBlank { JSONObject(work.payloadJson).optString("id") }
            if (athleteId.isBlank()) {
                return@OfflineWorkExecutor AppResult.Err(AppError.Unexpected("athleteId_missing"))
            }
            val body = JSONObject().put("athleteId", athleteId).toString()
            when (val result = api.post("/api/v1/coaches/favorites", body)) {
                is AppResult.Ok -> {
                    logger.i("CoachOffline", "athlete.favorite synced ${work.idempotencyKey}")
                    AppResult.Ok(Unit)
                }
                is AppResult.Err -> result
            }
        }

    private fun inboxRead(api: ApiClient, logger: Logger): OfflineWorkExecutor =
        OfflineWorkExecutor { work ->
            val id = JSONObject(work.payloadJson).optString("id")
            if (id.isBlank()) {
                return@OfflineWorkExecutor AppResult.Err(AppError.Unexpected("inbox_id_missing"))
            }
            val body = JSONObject().put("id", id).toString()
            when (val result = api.put("/api/v1/notifications", body)) {
                is AppResult.Ok -> {
                    logger.i("CoachOffline", "inbox.read synced ${work.idempotencyKey}")
                    AppResult.Ok(Unit)
                }
                is AppResult.Err -> result
            }
        }

    private fun bookingAction(
        api: ApiClient,
        logger: Logger,
        action: String,
        onSynced: ((work: SyncWork, action: String) -> Unit)?,
    ): OfflineWorkExecutor = OfflineWorkExecutor { work ->
        val bookingId = JSONObject(work.payloadJson).optString("bookingId")
            .ifBlank { JSONObject(work.payloadJson).optString("id") }
        if (bookingId.isBlank()) {
            return@OfflineWorkExecutor AppResult.Err(AppError.Unexpected("bookingId_missing"))
        }
        val body = JSONObject().put("bookingId", bookingId).put("action", action).toString()
        when (val result = api.post("/api/v1/coaches/bookings", body)) {
            is AppResult.Ok -> {
                logger.i("CoachOffline", "booking.$action synced ${work.idempotencyKey}")
                onSynced?.invoke(work, action)
                AppResult.Ok(Unit)
            }
            is AppResult.Err -> result
        }
    }

    private fun sessionPatch(
        api: ApiClient,
        logger: Logger,
        action: String,
    ): OfflineWorkExecutor = OfflineWorkExecutor { work ->
        val o = JSONObject(work.payloadJson)
        val sessionId = o.optString("sessionId").ifBlank { o.optString("id") }
        if (sessionId.isBlank()) {
            return@OfflineWorkExecutor AppResult.Err(AppError.Unexpected("sessionId_missing"))
        }
        val body = JSONObject().put("action", action)
        when {
            o.has("when") -> body.put("when", o.getString("when"))
            o.has("scheduledAt") -> body.put("when", o.getString("scheduledAt"))
            o.has("start") -> {
                // Local queue stores epoch ms as "start"
                val startMs = o.optLong("start", 0L)
                if (startMs > 0L) {
                    body.put("when", java.time.Instant.ofEpochMilli(startMs).toString())
                }
            }
        }
        when (val result = api.put("/api/v1/sessions/$sessionId", body.toString())) {
            is AppResult.Ok -> {
                logger.i("CoachOffline", "session.$action synced ${work.idempotencyKey}")
                AppResult.Ok(Unit)
            }
            is AppResult.Err -> result
        }
    }

    private fun programAction(
        api: ApiClient,
        logger: Logger,
        action: String,
    ): OfflineWorkExecutor = OfflineWorkExecutor { work ->
        val programId = JSONObject(work.payloadJson).optString("programId")
            .ifBlank { JSONObject(work.payloadJson).optString("id") }
        if (programId.isBlank()) {
            return@OfflineWorkExecutor AppResult.Err(AppError.Unexpected("programId_missing"))
        }
        val body = JSONObject().put("action", action).put("programId", programId).toString()
        when (val result = api.post("/api/v1/coaches/programs", body)) {
            is AppResult.Ok -> {
                logger.i("CoachOffline", "program.$action synced ${work.idempotencyKey}")
                AppResult.Ok(Unit)
            }
            is AppResult.Err -> result
        }
    }
}
