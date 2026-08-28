package com.fitconnect.android.foundation.ascend

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.network.ApiClient
import org.json.JSONObject

data class RemoteProgressionSnapshot(
    val userId: String,
    val totalXp: Int,
    val level: Int,
    val progressPercent: Int,
)

/**
 * Syncs ASCEND progression with FitConnect web API (/api/v1/ascend/progression).
 */
class HttpAscendRemote(
    private val api: () -> ApiClient,
    private val logger: Logger,
) {
    suspend fun fetchProgression(): AppResult<RemoteProgressionSnapshot> = when (val result = api().get("/api/v1/ascend/progression")) {
        is AppResult.Err -> result
        is AppResult.Ok -> runCatching {
            val json = JSONObject(result.value)
            val progression = json.getJSONObject("progression")
            val level = progression.getJSONObject("level")
            AppResult.Ok(
                RemoteProgressionSnapshot(
                    userId = progression.getString("userId"),
                    totalXp = progression.getInt("totalXp"),
                    level = level.getInt("level"),
                    progressPercent = level.getInt("progressPercent"),
                ),
            )
        }.getOrElse {
            logger.w("AscendRemote", "parse progression failed")
            AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
        }
    }

    suspend fun postWorkoutEvent(
        eventId: String,
        distanceM: Double,
        durationMs: Long = 0,
    ): AppResult<RemoteProgressionSnapshot> {
        val body = JSONObject().apply {
            put("eventId", eventId)
            put("type", "WORKOUT_COMPLETED")
            put("payload", JSONObject().apply {
                put("distanceM", distanceM)
                if (durationMs > 0) put("durationMs", durationMs)
            })
        }
        return when (val result = api().post("/api/v1/ascend/progression", body.toString())) {
            is AppResult.Err -> result
            is AppResult.Ok -> runCatching {
                val json = JSONObject(result.value)
                val progression = json.getJSONObject("snapshot")
                val level = progression.getJSONObject("level")
                AppResult.Ok(
                    RemoteProgressionSnapshot(
                        userId = progression.getString("userId"),
                        totalXp = progression.getInt("totalXp"),
                        level = level.getInt("level"),
                        progressPercent = level.getInt("progressPercent"),
                    ),
                )
            }.getOrElse {
                logger.w("AscendRemote", "parse event response failed")
                AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
            }
        }
    }
}
