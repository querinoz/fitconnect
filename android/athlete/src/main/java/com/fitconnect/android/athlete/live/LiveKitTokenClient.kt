package com.fitconnect.android.athlete.live

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ApiClient
import org.json.JSONObject

interface LiveKitTokenClient {
    suspend fun fetch(request: LiveSessionJoinRequest): AppResult<LiveKitCredentials>
}

/**
 * Mints a participant JWT via the existing web route `POST /api/v1/video/token`.
 * Demo / unconfigured server responses are treated as EXTERNAL fail-closed — never as joinable credentials.
 */
class HttpLiveKitTokenClient(
    private val api: () -> ApiClient,
) : LiveKitTokenClient {
    override suspend fun fetch(request: LiveSessionJoinRequest): AppResult<LiveKitCredentials> {
        val body = JSONObject()
            .put("roomName", request.roomName)
            .put("participantName", request.participantName)
            .put("participantId", request.participantId)
            .toString()
        return when (val raw = api().post("/api/v1/video/token", body)) {
            is AppResult.Ok -> LiveKitTokenResponse.parse(raw.value)
            is AppResult.Err -> raw
        }
    }
}

object LiveKitTokenResponse {
    fun parse(body: String): AppResult<LiveKitCredentials> {
        val o = runCatching { JSONObject(body) }.getOrElse {
            return AppResult.Err(AppError.Unexpected("Invalid LiveKit token response", it))
        }
        if (o.optBoolean("demo", false)) {
            return AppResult.Err(AppError.Unexpected(LiveKitExternalKeys.MESSAGE))
        }
        val token = o.optString("token").takeIf { it.isNotBlank() }
        val url = o.optString("url").takeIf { it.isNotBlank() }
        if (token == null || url == null) {
            return AppResult.Err(AppError.Unexpected(LiveKitExternalKeys.MESSAGE))
        }
        return AppResult.Ok(LiveKitCredentials(url = url, token = token))
    }
}
