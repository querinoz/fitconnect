package com.fitconnect.android.athlete.live

import com.fitconnect.android.foundation.common.AppResult

/**
 * Native LiveKit live-session boundary.
 *
 * Never reports a connected room without a real server URL + participant JWT.
 * When LiveKit cloud/self-host keys are missing, implementations fail closed
 * with an EXTERNAL credentials error — no LOCAL_DEMO fake join.
 */
interface LiveSessionPort {
    /** True only after a successful [join] with real credentials. */
    val isJoined: Boolean

    suspend fun join(request: LiveSessionJoinRequest): AppResult<Unit>
    suspend fun setMuted(muted: Boolean): AppResult<Unit>
    suspend fun setCameraOff(cameraOff: Boolean): AppResult<Unit>
    suspend fun leave(): AppResult<Unit>
}

data class LiveSessionJoinRequest(
    val roomName: String,
    val participantName: String,
    val participantId: String,
)

data class LiveKitCredentials(
    val url: String,
    val token: String,
)

/** Bridge so JVM unit tests never need the LiveKit native SDK. */
interface LiveKitRoomFactory {
    suspend fun connect(url: String, token: String): AppResult<LiveKitConnectedRoom>
}

interface LiveKitConnectedRoom {
    suspend fun setMicrophoneEnabled(enabled: Boolean)
    suspend fun setCameraEnabled(enabled: Boolean)
    fun disconnect()
}

/** Canonical EXTERNAL blocker copy when LiveKit server keys are absent. */
object LiveKitExternalKeys {
    const val MESSAGE =
        "EXTERNAL: LiveKit keys required — LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL (or NEXT_PUBLIC_LIVEKIT_URL)"
}
