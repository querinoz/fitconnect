package com.fitconnect.android.telemetry.wear

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.telemetry.domain.TelemetrySample
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow

/**
 * Wear OS companion ports.
 * [GmsWearCompanion] queries Play Services capability `fitconnect_telemetry`.
 * Empty reachable set is [WearCompanionState.NOT_PAIRED] — never a fake connection.
 * [NoWearCompanion] is for unit tests without Context.
 */
enum class WearCompanionState {
    NOT_PAIRED,
    PAIRED,
    CONNECTING,
    CONNECTED,
    SYNCING,
    OFFLINE,
    DISCONNECTED,
    RECONNECTING,
    ERROR,
}

interface WearableCompanionPort {
    suspend fun state(): WearCompanionState
    suspend fun requestSync(): AppResult<Unit>
    fun liveHeartRate(): Flow<TelemetrySample>
}

interface WearWorkoutControlPort {
    suspend fun startWorkout(sportKey: String): AppResult<Unit>
    suspend fun pauseWorkout(): AppResult<Unit>
    suspend fun resumeWorkout(): AppResult<Unit>
    suspend fun endWorkout(): AppResult<Unit>
}

/** No-op adapter used until a Wear OS companion is paired. */
class NoWearCompanion : WearableCompanionPort {
    override suspend fun state(): WearCompanionState = WearCompanionState.NOT_PAIRED
    override suspend fun requestSync(): AppResult<Unit> =
        AppResult.Err(com.fitconnect.android.foundation.common.AppError.Unexpected("NOT_PAIRED"))
    override fun liveHeartRate(): Flow<TelemetrySample> = emptyFlow()
}

/** No-op workout control until a reachable FitConnect Wear node exists. */
class NoWearWorkoutControl : WearWorkoutControlPort {
    override suspend fun startWorkout(sportKey: String): AppResult<Unit> =
        AppResult.Err(com.fitconnect.android.foundation.common.AppError.Unexpected("NOT_PAIRED"))
    override suspend fun pauseWorkout(): AppResult<Unit> =
        AppResult.Err(com.fitconnect.android.foundation.common.AppError.Unexpected("NOT_PAIRED"))
    override suspend fun resumeWorkout(): AppResult<Unit> =
        AppResult.Err(com.fitconnect.android.foundation.common.AppError.Unexpected("NOT_PAIRED"))
    override suspend fun endWorkout(): AppResult<Unit> =
        AppResult.Err(com.fitconnect.android.foundation.common.AppError.Unexpected("NOT_PAIRED"))
}
