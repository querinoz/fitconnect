package com.fitconnect.android.foundation.offline

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.network.ApiClient
import org.json.JSONObject

/**
 * HTTP-backed offline flush for athlete mutations previously local-ack only.
 * Handlers are idempotent via SyncWork.idempotencyKey + server natural keys.
 */
object AthleteOfflineHandlers {
    /** Canonical mutation types — keep OfflineKillMatrixTest in sync. */
    val MUTATION_TYPES: List<String> = listOf(
        "athlete.task.toggle",
        "athlete.program.enroll",
        "athlete.message.send",
        "athlete.booking.create",
    )

    fun register(
        registry: RegistryOfflineExecutor,
        api: ApiClient,
        logger: Logger,
        onBookingCreateSynced: ((work: SyncWork, responseJson: String) -> Unit)? = null,
    ) {
        registry.register("athlete.task.toggle", taskToggle(api, logger))
        registry.register("athlete.program.enroll", programEnroll(api, logger))
        registry.register("athlete.message.send", messageSend(api, logger))
        registry.register("athlete.booking.create", bookingCreate(api, logger, onBookingCreateSynced))
    }

    private fun bookingCreate(
        api: ApiClient,
        logger: Logger,
        onSynced: ((work: SyncWork, responseJson: String) -> Unit)?,
    ): OfflineWorkExecutor =
        OfflineWorkExecutor { work ->
            when (val result = api.post("/api/v1/bookings", work.payloadJson)) {
                is AppResult.Ok -> {
                    logger.i("AthleteOffline", "booking.create synced ${work.idempotencyKey}")
                    onSynced?.invoke(work, result.value)
                    AppResult.Ok(Unit)
                }
                is AppResult.Err -> {
                    val apiErr = result.error as? AppError.Api
                    if (apiErr?.statusCode == 409) {
                        onSynced?.invoke(work, """{"idempotent":true}""")
                        AppResult.Ok(Unit)
                    } else {
                        result
                    }
                }
            }
        }

    private fun taskToggle(api: ApiClient, logger: Logger): OfflineWorkExecutor =
        OfflineWorkExecutor { work ->
            val taskId = JSONObject(work.payloadJson).optString("id").ifBlank {
                JSONObject(work.payloadJson).optString("taskId")
            }
            if (taskId.isBlank()) {
                return@OfflineWorkExecutor AppResult.Err(AppError.Unexpected("taskId_missing"))
            }
            val body = JSONObject().put("taskId", taskId).toString()
            when (val result = api.post("/api/v1/athletes/tasks/toggle", body)) {
                is AppResult.Ok -> {
                    logger.i("AthleteOffline", "task.toggle synced ${work.idempotencyKey}")
                    AppResult.Ok(Unit)
                }
                is AppResult.Err -> result
            }
        }

    private fun programEnroll(api: ApiClient, logger: Logger): OfflineWorkExecutor =
        OfflineWorkExecutor { work ->
            val programId = JSONObject(work.payloadJson).optString("programId")
                .ifBlank { JSONObject(work.payloadJson).optString("id") }
            if (programId.isBlank()) {
                return@OfflineWorkExecutor AppResult.Err(AppError.Unexpected("programId_missing"))
            }
            val body = JSONObject().put("programId", programId).toString()
            when (val result = api.post("/api/v1/athletes/programs", body)) {
                is AppResult.Ok -> {
                    logger.i("AthleteOffline", "program.enroll synced ${work.idempotencyKey}")
                    AppResult.Ok(Unit)
                }
                is AppResult.Err -> {
                    val apiErr = result.error as? AppError.Api
                    // Idempotent re-enroll may surface as 200 already handled; 409 = keep Ok.
                    if (apiErr?.statusCode == 409) AppResult.Ok(Unit) else result
                }
            }
        }

    private fun messageSend(api: ApiClient, logger: Logger): OfflineWorkExecutor =
        OfflineWorkExecutor { work ->
            when (val result = api.post("/api/v1/messages", work.payloadJson)) {
                is AppResult.Ok -> {
                    logger.i("AthleteOffline", "message.send synced ${work.idempotencyKey}")
                    AppResult.Ok(Unit)
                }
                is AppResult.Err -> result
            }
        }
}
