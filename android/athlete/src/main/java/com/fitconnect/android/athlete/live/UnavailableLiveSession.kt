package com.fitconnect.android.athlete.live

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult

/**
 * Hard fail-closed LiveKit port — never joins, never fabricates a connected room.
 * Used in unit tests and any composition that must refuse video without EXTERNAL keys.
 */
class UnavailableLiveSession : LiveSessionPort {
    override val isJoined: Boolean = false

    override suspend fun join(request: LiveSessionJoinRequest): AppResult<Unit> =
        AppResult.Err(AppError.Unexpected(LiveKitExternalKeys.MESSAGE))

    override suspend fun setMuted(muted: Boolean): AppResult<Unit> =
        AppResult.Err(AppError.Unexpected(LiveKitExternalKeys.MESSAGE))

    override suspend fun setCameraOff(cameraOff: Boolean): AppResult<Unit> =
        AppResult.Err(AppError.Unexpected(LiveKitExternalKeys.MESSAGE))

    override suspend fun leave(): AppResult<Unit> = AppResult.Ok(Unit)
}
