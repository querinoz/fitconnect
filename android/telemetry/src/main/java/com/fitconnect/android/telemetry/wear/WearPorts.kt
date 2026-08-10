package com.fitconnect.android.telemetry.wear

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.telemetry.domain.TelemetrySample
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow

/**
 * Wear OS preparation. These ports let a future Wear companion app stream
 * heart rate / workout control through the same normalized pipeline without
 * touching the domain layer. No Wear implementation exists yet by design.
 */
enum class WearCompanionState { NOT_PAIRED, PAIRED, CONNECTED, SYNCING }

interface WearableCompanionPort {
    suspend fun state(): WearCompanionState
    suspend fun requestSync(): AppResult<Unit>
    fun liveHeartRate(): Flow<TelemetrySample>
}

interface WearWorkoutControlPort {
    suspend fun startWorkout(sportKey: String): AppResult<Unit>
    suspend fun pauseWorkout(): AppResult<Unit>
    suspend fun endWorkout(): AppResult<Unit>
}

/** No-op adapter used until a Wear OS companion ships. */
class NoWearCompanion : WearableCompanionPort {
    override suspend fun state(): WearCompanionState = WearCompanionState.NOT_PAIRED
    override suspend fun requestSync(): AppResult<Unit> = AppResult.Ok(Unit)
    override fun liveHeartRate(): Flow<TelemetrySample> = emptyFlow()
}
