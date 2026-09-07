package com.fitconnect.android.capture.sync

import com.fitconnect.android.capture.runtime.OutdoorCaptureRuntime
import com.fitconnect.android.foundation.ascend.HttpAscendRemote
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.foundation.offline.OfflineWorkExecutor
import com.fitconnect.android.foundation.offline.RegistryOfflineExecutor

object OutdoorSyncHandlers {
    fun register(
        registry: RegistryOfflineExecutor,
        api: ApiClient,
        ascend: HttpAscendRemote,
        logger: Logger,
    ) {
        registry.register(OutdoorCaptureRuntime.OUTDOOR_ACTIVITY_TYPE, activityHandler(api, logger))
        registry.register(OutdoorCaptureRuntime.OUTDOOR_XP_TYPE, xpHandler(ascend, logger))
    }

    private fun activityHandler(api: ApiClient, logger: Logger): OfflineWorkExecutor =
        OfflineWorkExecutor { work ->
            when (val result = api.post("/api/v1/workout-sessions", work.payloadJson)) {
                is AppResult.Ok -> {
                    logger.d("OutdoorSync", "activity_sync_succeeded")
                    AppResult.Ok(Unit)
                }
                is AppResult.Err -> {
                    val apiErr = result.error as? AppError.Api
                    if (apiErr?.statusCode == 409) {
                        logger.d("OutdoorSync", "activity_sync_duplicate_ok")
                        AppResult.Ok(Unit)
                    } else {
                        logger.d("OutdoorSync", "activity_sync_failed")
                        result
                    }
                }
            }
        }

    private fun xpHandler(ascend: HttpAscendRemote, logger: Logger): OfflineWorkExecutor =
        OfflineWorkExecutor { work ->
            val eventId = extract(work.payloadJson, "eventId")
                ?: return@OfflineWorkExecutor AppResult.Err(AppError.Unexpected("Invalid XP payload"))
            val durationMs = extractLong(work.payloadJson, "durationMs") ?: 0L
            val sessionId = extract(work.payloadJson, "sessionId")
            val distanceM = extractDouble(work.payloadJson, "distanceM") ?: 0.0
            when (
                val result = ascend.postWorkoutEvent(
                    eventId = eventId,
                    distanceM = distanceM,
                    durationMs = durationMs,
                    sessionId = sessionId,
                )
            ) {
                is AppResult.Ok -> {
                    logger.d("OutdoorSync", "xp_awarded")
                    AppResult.Ok(Unit)
                }
                is AppResult.Err -> {
                    logger.d("OutdoorSync", "xp_failed")
                    result
                }
            }
        }

    private fun extract(raw: String, key: String): String? =
        Regex("\"$key\"\\s*:\\s*\"([^\"]*)\"").find(raw)?.groupValues?.getOrNull(1)

    private fun extractLong(raw: String, key: String): Long? =
        Regex("\"$key\"\\s*:\\s*(-?\\d+)").find(raw)?.groupValues?.getOrNull(1)?.toLongOrNull()

    private fun extractDouble(raw: String, key: String): Double? =
        Regex("\"$key\"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)").find(raw)?.groupValues?.getOrNull(1)?.toDoubleOrNull()
}
