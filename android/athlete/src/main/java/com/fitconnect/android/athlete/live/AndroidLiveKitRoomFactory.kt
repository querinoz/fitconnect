package com.fitconnect.android.athlete.live

import android.content.Context
import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import io.livekit.android.LiveKit
import io.livekit.android.room.Room

/**
 * LiveKit Android SDK bridge. Only used after [LiveKitCredentials] are minted —
 * never called with empty URL/token.
 */
class AndroidLiveKitRoomFactory(
    private val appContext: Context,
) : LiveKitRoomFactory {
    override suspend fun connect(url: String, token: String): AppResult<LiveKitConnectedRoom> {
        if (url.isBlank() || token.isBlank()) {
            return AppResult.Err(AppError.Unexpected(LiveKitExternalKeys.MESSAGE))
        }
        return try {
            val room = LiveKit.create(appContext.applicationContext)
            room.connect(url, token)
            AppResult.Ok(AndroidLiveKitConnectedRoom(room))
        } catch (t: Throwable) {
            AppResult.Err(AppError.Unexpected(t.message ?: "LiveKit connect failed", t))
        }
    }
}

internal class AndroidLiveKitConnectedRoom(
    private val room: Room,
) : LiveKitConnectedRoom {
    override suspend fun setMicrophoneEnabled(enabled: Boolean) {
        room.localParticipant.setMicrophoneEnabled(enabled)
    }

    override suspend fun setCameraEnabled(enabled: Boolean) {
        room.localParticipant.setCameraEnabled(enabled)
    }

    override fun disconnect() {
        room.disconnect()
    }
}
