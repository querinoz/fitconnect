package com.fitconnect.android.sports.guided.sync

import com.fitconnect.android.foundation.ascend.HttpAscendRemote
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.foundation.offline.OfflineWorkExecutor
import com.fitconnect.android.foundation.offline.RegistryOfflineExecutor
import com.fitconnect.android.foundation.offline.SyncWork
import com.fitconnect.android.sports.guided.observability.WorkoutLog
import com.fitconnect.android.sports.guided.runtime.GuidedWorkoutRuntime

object WorkoutSyncHandlers {
    fun register(
        registry: RegistryOfflineExecutor,
        api: ApiClient,
        ascend: HttpAscendRemote,
        logger: Logger,
    ) {
        registry.register(GuidedWorkoutRuntime.WORKOUT_ACTIVITY_TYPE, activityHandler(api, logger))
        registry.register(GuidedWorkoutRuntime.WORKOUT_XP_TYPE, xpHandler(ascend, logger))
    }

    private fun activityHandler(api: ApiClient, logger: Logger): OfflineWorkExecutor =
        OfflineWorkExecutor { work ->
            when (val result = api.post("/api/v1/workout-sessions", work.payloadJson)) {
                is AppResult.Ok -> {
                    WorkoutLog.event(logger, "activity_sync_succeeded", work.idempotencyKey)
                    AppResult.Ok(Unit)
                }
                is AppResult.Err -> {
                    val apiErr = result.error as? AppError.Api
                    if (apiErr?.statusCode == 409) {
                        WorkoutLog.event(logger, "activity_sync_succeeded", work.idempotencyKey)
                        AppResult.Ok(Unit)
                    } else {
                        WorkoutLog.event(logger, "activity_sync_failed", work.idempotencyKey)
                        result
                    }
                }
            }
        }

    private fun xpHandler(ascend: HttpAscendRemote, logger: Logger): OfflineWorkExecutor =
        OfflineWorkExecutor { work ->
            val eventId = extractJsonString(work.payloadJson, "eventId")
                ?: return@OfflineWorkExecutor AppResult.Err(AppError.Unexpected("Invalid XP payload"))
            val durationMs = extractJsonLong(work.payloadJson, "durationMs") ?: 0L
            val sessionId = extractJsonString(work.payloadJson, "sessionId")
            val distanceM = extractJsonDouble(work.payloadJson, "distanceM") ?: 0.0
            when (
                val result = ascend.postWorkoutEvent(
                    eventId = eventId,
                    distanceM = distanceM,
                    durationMs = durationMs,
                    sessionId = sessionId,
                )
            ) {
                is AppResult.Ok -> {
                    WorkoutLog.event(logger, "xp_awarded", work.idempotencyKey)
                    AppResult.Ok(Unit)
                }
                is AppResult.Err -> {
                    WorkoutLog.event(logger, "activity_sync_failed", work.idempotencyKey)
                    result
                }
            }
        }

    private fun extractJsonString(raw: String, key: String): String? {
        val regex = Regex("\"$key\"\\s*:\\s*\"([^\"]*)\"")
        return regex.find(raw)?.groupValues?.getOrNull(1)
    }

    private fun extractJsonLong(raw: String, key: String): Long? {
        val regex = Regex("\"$key\"\\s*:\\s*(-?\\d+)")
        return regex.find(raw)?.groupValues?.getOrNull(1)?.toLongOrNull()
    }

    private fun extractJsonDouble(raw: String, key: String): Double? {
        val regex = Regex("\"$key\"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)")
        return regex.find(raw)?.groupValues?.getOrNull(1)?.toDoubleOrNull()
    }
}
