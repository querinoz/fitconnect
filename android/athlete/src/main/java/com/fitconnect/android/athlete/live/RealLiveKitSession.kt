package com.fitconnect.android.athlete.live

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger

/**
 * Production LiveKit session path: mint JWT via `/api/v1/video/token`, then join the room.
 * Refuses to enter a connected state unless both URL and token are present.
 */
class RealLiveKitSession(
    private val tokenClient: LiveKitTokenClient,
    private val roomFactory: LiveKitRoomFactory,
    private val logger: Logger,
) : LiveSessionPort {
    @Volatile
    private var room: LiveKitConnectedRoom? = null

    override val isJoined: Boolean
        get() = room != null

    override suspend fun join(request: LiveSessionJoinRequest): AppResult<Unit> {
        leave()
        val credentials = when (val minted = tokenClient.fetch(request)) {
            is AppResult.Ok -> minted.value
            is AppResult.Err -> {
                logger.e("LiveSession", "token mint refused — ${errorMessage(minted.error)}")
                return minted
            }
        }
        return when (val connected = roomFactory.connect(credentials.url, credentials.token)) {
            is AppResult.Ok -> {
                room = connected.value
                logger.d("LiveSession", "joined room ${request.roomName}")
                AppResult.Ok(Unit)
            }
            is AppResult.Err -> {
                logger.e("LiveSession", "room connect failed — ${errorMessage(connected.error)}")
                connected
            }
        }
    }

    override suspend fun setMuted(muted: Boolean): AppResult<Unit> {
        val active = room
            ?: return AppResult.Err(AppError.Unexpected("Live session not joined"))
        return runCatching {
            active.setMicrophoneEnabled(!muted)
            AppResult.Ok(Unit)
        }.getOrElse {
            AppResult.Err(AppError.Unexpected(it.message ?: "mute failed", it))
        }
    }

    override suspend fun setCameraOff(cameraOff: Boolean): AppResult<Unit> {
        val active = room
            ?: return AppResult.Err(AppError.Unexpected("Live session not joined"))
        return runCatching {
            active.setCameraEnabled(!cameraOff)
            AppResult.Ok(Unit)
        }.getOrElse {
            AppResult.Err(AppError.Unexpected(it.message ?: "camera toggle failed", it))
        }
    }

    override suspend fun leave(): AppResult<Unit> {
        val active = room
        room = null
        active?.disconnect()
        return AppResult.Ok(Unit)
    }

    private fun errorMessage(error: AppError): String = when (error) {
        is AppError.Unexpected -> error.message
        is AppError.Api -> error.message ?: "api ${error.statusCode}"
        is AppError.Auth -> error.kind.name
        is AppError.Network -> error.kind.name
        is AppError.Storage -> error.message
    }
}
