package com.fitconnect.android.foundation.offline

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.network.ApiClient
import org.json.JSONObject

/** HTTP-backed offline flush for coach calendar / booking / program mutations. */
object CoachOfflineHandlers {
    fun register(registry: RegistryOfflineExecutor, api: ApiClient, logger: Logger) {
        registry.register("coach.booking.approve", bookingAction(api, logger, "approve"))
        registry.register("coach.booking.decline", bookingAction(api, logger, "reject"))
        registry.register("coach.booking.reject", bookingAction(api, logger, "reject"))
        registry.register("coach.session.reschedule", sessionPatch(api, logger, "reschedule"))
        registry.register("coach.session.cancel", sessionPatch(api, logger, "cancel"))
        registry.register("coach.program.publish", programAction(api, logger, "publish"))
        registry.register("coach.program.draft", programAction(api, logger, "draft"))
        registry.register("coach.program.clone", programAction(api, logger, "clone"))
    }

    private fun bookingAction(
        api: ApiClient,
        logger: Logger,
        action: String,
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
