package com.fitconnect.android.telemetry.wear

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.telemetry.domain.TelemetrySample
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow

/**
 * Wear OS companion ports. The `:wear` module hosts a LOCAL_DEMO operational
 * shell (start/pause/resume/end). Phone ↔ watch DataLayer pairing is not
 * executed in this build — [NoWearCompanion] stays NOT_PAIRED until a
 * physical watch is bound (PENDING_HUMAN).
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
    suspend fun resumeWorkout(): AppResult<Unit>
    suspend fun endWorkout(): AppResult<Unit>
}

/** No-op adapter used until a Wear OS companion is paired. */
class NoWearCompanion : WearableCompanionPort {
    override suspend fun state(): WearCompanionState = WearCompanionState.NOT_PAIRED
    override suspend fun requestSync(): AppResult<Unit> = AppResult.Ok(Unit)
    override fun liveHeartRate(): Flow<TelemetrySample> = emptyFlow()
}

/** No-op workout control until DataLayer messaging is bound on a real watch. */
class NoWearWorkoutControl : WearWorkoutControlPort {
    override suspend fun startWorkout(sportKey: String): AppResult<Unit> = AppResult.Ok(Unit)
    override suspend fun pauseWorkout(): AppResult<Unit> = AppResult.Ok(Unit)
    override suspend fun resumeWorkout(): AppResult<Unit> = AppResult.Ok(Unit)
    override suspend fun endWorkout(): AppResult<Unit> = AppResult.Ok(Unit)
}
