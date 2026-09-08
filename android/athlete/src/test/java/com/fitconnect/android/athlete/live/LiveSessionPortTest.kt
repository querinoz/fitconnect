package com.fitconnect.android.athlete.live

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class UnavailableLiveSessionTest {
    private val session = UnavailableLiveSession()
    private val request = LiveSessionJoinRequest(
        roomName = "session-1",
        participantName = "athlete",
        participantId = "user-a",
    )

    @Test
    fun joinFailsClosedWithExternalKeysMessage() = runBlocking {
        assertFalse(session.isJoined)
        val result = session.join(request)
        assertTrue(result is AppResult.Err)
        val err = (result as AppResult.Err).error as AppError.Unexpected
        assertEquals(LiveKitExternalKeys.MESSAGE, err.message)
        assertFalse(session.isJoined)
    }

    @Test
    fun muteAndCameraFailClosed() = runBlocking {
        assertTrue(session.setMuted(true) is AppResult.Err)
        assertTrue(session.setCameraOff(true) is AppResult.Err)
    }

    @Test
    fun leaveIsNoOpOk() = runBlocking {
        assertTrue(session.leave() is AppResult.Ok)
    }
}

class LiveKitTokenResponseTest {
    @Test
    fun demoPayloadIsExternalFailClosed() {
        val result = LiveKitTokenResponse.parse(
            """{"demo":true,"roomName":"session-1","message":"LiveKit not configured"}""",
        )
        assertTrue(result is AppResult.Err)
        val err = (result as AppResult.Err).error as AppError.Unexpected
        assertEquals(LiveKitExternalKeys.MESSAGE, err.message)
    }

    @Test
    fun missingTokenOrUrlIsExternalFailClosed() {
        val result = LiveKitTokenResponse.parse("""{"token":"","url":""}""")
        assertTrue(result is AppResult.Err)
    }

    @Test
    fun realCredentialsParsed() {
        val result = LiveKitTokenResponse.parse(
            """{"token":"jwt-abc","url":"wss://livekit.example"}""",
        )
        assertTrue(result is AppResult.Ok)
        val creds = (result as AppResult.Ok).value
        assertEquals("jwt-abc", creds.token)
        assertEquals("wss://livekit.example", creds.url)
    }
}

class RealLiveKitSessionTest {
    private val logger = object : Logger {
        override fun d(tag: String, message: String) = Unit
        override fun i(tag: String, message: String) = Unit
        override fun w(tag: String, message: String, throwable: Throwable?) = Unit
        override fun e(tag: String, message: String, throwable: Throwable?) = Unit
    }

    private val request = LiveSessionJoinRequest(
        roomName = "session-1",
        participantName = "athlete",
        participantId = "user-a",
    )

    @Test
    fun joinFailsWhenTokenClientReturnsDemo() = runBlocking {
        val session = RealLiveKitSession(
            tokenClient = object : LiveKitTokenClient {
                override suspend fun fetch(request: LiveSessionJoinRequest) =
                    AppResult.Err(AppError.Unexpected(LiveKitExternalKeys.MESSAGE))
            },
            roomFactory = object : LiveKitRoomFactory {
                override suspend fun connect(url: String, token: String): AppResult<LiveKitConnectedRoom> {
                    error("must not connect without credentials")
                }
            },
            logger = logger,
        )
        val result = session.join(request)
        assertTrue(result is AppResult.Err)
        assertFalse(session.isJoined)
    }

    @Test
    fun joinSucceedsOnlyAfterTokenAndRoomConnect() = runBlocking {
        var micEnabled: Boolean? = null
        var cameraEnabled: Boolean? = null
        var disconnected = false
        val room = object : LiveKitConnectedRoom {
            override suspend fun setMicrophoneEnabled(enabled: Boolean) {
                micEnabled = enabled
            }

            override suspend fun setCameraEnabled(enabled: Boolean) {
                cameraEnabled = enabled
            }

            override fun disconnect() {
                disconnected = true
            }
        }
        val session = RealLiveKitSession(
            tokenClient = object : LiveKitTokenClient {
                override suspend fun fetch(request: LiveSessionJoinRequest) =
                    AppResult.Ok(LiveKitCredentials(url = "wss://lk.test", token = "tok"))
            },
            roomFactory = object : LiveKitRoomFactory {
                override suspend fun connect(url: String, token: String): AppResult<LiveKitConnectedRoom> {
                    assertEquals("wss://lk.test", url)
                    assertEquals("tok", token)
                    return AppResult.Ok(room)
                }
            },
            logger = logger,
        )
        assertTrue(session.join(request) is AppResult.Ok)
        assertTrue(session.isJoined)
        assertTrue(session.setMuted(true) is AppResult.Ok)
        assertEquals(false, micEnabled)
        assertTrue(session.setCameraOff(true) is AppResult.Ok)
        assertEquals(false, cameraEnabled)
        assertTrue(session.leave() is AppResult.Ok)
        assertTrue(disconnected)
        assertFalse(session.isJoined)
    }

    @Test
    fun blankCredentialsNeverReachRoomFactory() = runBlocking {
        var connectCalled = false
        val session = RealLiveKitSession(
            tokenClient = object : LiveKitTokenClient {
                override suspend fun fetch(request: LiveSessionJoinRequest) =
                    LiveKitTokenResponse.parse("""{"demo":true}""")
            },
            roomFactory = object : LiveKitRoomFactory {
                override suspend fun connect(url: String, token: String): AppResult<LiveKitConnectedRoom> {
                    connectCalled = true
                    error("unreachable")
                }
            },
            logger = logger,
        )
        assertTrue(session.join(request) is AppResult.Err)
        assertFalse(connectCalled)
        assertFalse(session.isJoined)
    }
}
