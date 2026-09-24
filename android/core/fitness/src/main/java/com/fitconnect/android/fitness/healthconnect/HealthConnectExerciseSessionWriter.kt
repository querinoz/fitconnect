package com.fitconnect.android.fitness.healthconnect

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.metadata.Metadata
import com.fitconnect.android.fitness.domain.HealthConnectSdkState
import com.fitconnect.android.fitness.domain.Sport
import com.fitconnect.android.fitness.domain.WorkoutSession
import java.time.Instant
import java.time.ZoneOffset

/**
 * Outcomes for an explicit Health Connect WRITE. Never write silently —
 * callers must pass [userOptIn] = true after a confirmed UI consent.
 */
enum class HealthConnectWriteOutcome {
    SUCCESS,
    GRANTED,
    DENIED,
    NOT_AVAILABLE,
    NOT_OPTED_IN,
    ERROR,
}

data class HealthConnectWriteResult(
    val outcome: HealthConnectWriteOutcome,
    val recordId: String? = null,
    val message: String? = null,
)

/**
 * Pure mapping used by the writer and unit tests (no HC SDK side effects).
 */
object HealthConnectWriteMapper {
    const val CLIENT_RECORD_PREFIX = "fitconnect:"

    fun clientRecordId(sessionId: String): String = "$CLIENT_RECORD_PREFIX$sessionId"

    fun isFitConnectOrigin(clientRecordId: String?): Boolean =
        clientRecordId?.startsWith(CLIENT_RECORD_PREFIX) == true

    fun exerciseTypeFor(sport: Sport): Int = when (sport) {
        Sport.RUN, Sport.TRAIL_RUN -> ExerciseSessionRecord.EXERCISE_TYPE_RUNNING
        Sport.WALK -> ExerciseSessionRecord.EXERCISE_TYPE_WALKING
        Sport.HIKE -> ExerciseSessionRecord.EXERCISE_TYPE_HIKING
        Sport.RIDE, Sport.MOUNTAIN_BIKE, Sport.GRAVEL, Sport.E_BIKE ->
            ExerciseSessionRecord.EXERCISE_TYPE_BIKING
        Sport.INDOOR_RIDE -> ExerciseSessionRecord.EXERCISE_TYPE_BIKING_STATIONARY
        Sport.SWIM_POOL -> ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_POOL
        Sport.SWIM_OPEN -> ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_OPEN_WATER
        Sport.STRENGTH -> ExerciseSessionRecord.EXERCISE_TYPE_STRENGTH_TRAINING
        Sport.HIIT -> ExerciseSessionRecord.EXERCISE_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING
        Sport.YOGA -> ExerciseSessionRecord.EXERCISE_TYPE_YOGA
        Sport.PILATES -> ExerciseSessionRecord.EXERCISE_TYPE_PILATES
        Sport.ROW -> ExerciseSessionRecord.EXERCISE_TYPE_ROWING
        Sport.SKI -> ExerciseSessionRecord.EXERCISE_TYPE_SKIING
        Sport.SNOWBOARD -> ExerciseSessionRecord.EXERCISE_TYPE_SNOWBOARDING
        else -> ExerciseSessionRecord.EXERCISE_TYPE_OTHER_WORKOUT
    }
}

fun interface ExerciseSessionWriter {
    /**
     * Writes a completed [WorkoutSession] to Health Connect when the user opted in
     * and write permission is granted. Never reads back into FitConnect.
     */
    suspend fun writeCompleted(
        session: WorkoutSession,
        userOptIn: Boolean,
    ): HealthConnectWriteResult
}

class HealthConnectExerciseSessionWriter(
    private val context: Context,
    private val permissionGateway: HealthConnectPermissionGateway,
    private val sdkState: () -> HealthConnectSdkState = { HealthConnectSdkMapper.probe(context) },
) : ExerciseSessionWriter {

    private val client: HealthConnectClient? by lazy {
        if (sdkState() != HealthConnectSdkState.AVAILABLE) null
        else runCatching { HealthConnectClient.getOrCreate(context) }.getOrNull()
    }

    override suspend fun writeCompleted(
        session: WorkoutSession,
        userOptIn: Boolean,
    ): HealthConnectWriteResult {
        if (!userOptIn) {
            return HealthConnectWriteResult(HealthConnectWriteOutcome.NOT_OPTED_IN)
        }
        if (sdkState() != HealthConnectSdkState.AVAILABLE) {
            return HealthConnectWriteResult(HealthConnectWriteOutcome.NOT_AVAILABLE)
        }
        val hc = client ?: return HealthConnectWriteResult(HealthConnectWriteOutcome.NOT_AVAILABLE)
        val writePerms = HealthConnectPermissionMapper.writePermissionsForExerciseSession()
        val granted = runCatching { hc.permissionController.getGrantedPermissions() }
            .getOrElse { emptySet() }
        if (!granted.containsAll(writePerms)) {
            return HealthConnectWriteResult(HealthConnectWriteOutcome.DENIED)
        }
        if (session.endedAtEpochMs <= session.startedAtEpochMs) {
            return HealthConnectWriteResult(
                HealthConnectWriteOutcome.ERROR,
                message = "Session end must be after start.",
            )
        }
        val clientId = HealthConnectWriteMapper.clientRecordId(session.id)
        val record = ExerciseSessionRecord(
            startTime = Instant.ofEpochMilli(session.startedAtEpochMs),
            startZoneOffset = ZoneOffset.UTC,
            endTime = Instant.ofEpochMilli(session.endedAtEpochMs),
            endZoneOffset = ZoneOffset.UTC,
            exerciseType = HealthConnectWriteMapper.exerciseTypeFor(session.sport),
            title = "FitConnect · ${session.sport.name}",
            metadata = Metadata.manualEntry(clientRecordId = clientId),
        )
        return runCatching {
            hc.insertRecords(listOf(record))
            HealthConnectWriteResult(
                outcome = HealthConnectWriteOutcome.SUCCESS,
                recordId = clientId,
            )
        }.getOrElse { err ->
            HealthConnectWriteResult(
                outcome = HealthConnectWriteOutcome.ERROR,
                message = err.message ?: "Health Connect write failed",
            )
        }
    }

    /** Permission probe without writing — surfaces GRANTED vs DENIED vs NOT_AVAILABLE. */
    suspend fun permissionProbe(): HealthConnectWriteOutcome {
        if (sdkState() != HealthConnectSdkState.AVAILABLE) {
            return HealthConnectWriteOutcome.NOT_AVAILABLE
        }
        val hc = client ?: return HealthConnectWriteOutcome.NOT_AVAILABLE
        val writePerms = HealthConnectPermissionMapper.writePermissionsForExerciseSession()
        val granted = runCatching { hc.permissionController.getGrantedPermissions() }
            .getOrElse { emptySet() }
        return if (granted.containsAll(writePerms)) {
            HealthConnectWriteOutcome.GRANTED
        } else {
            HealthConnectWriteOutcome.DENIED
        }
    }
}

/**
 * Test double — records write attempts without HC SDK.
 */
class RecordingExerciseSessionWriter : ExerciseSessionWriter {
    data class Attempt(val sessionId: String, val userOptIn: Boolean)

    private val _attempts = mutableListOf<Attempt>()
    var nextResult: HealthConnectWriteResult =
        HealthConnectWriteResult(HealthConnectWriteOutcome.SUCCESS, recordId = "fitconnect:test")

    val attempts: List<Attempt> get() = _attempts.toList()

    override suspend fun writeCompleted(
        session: WorkoutSession,
        userOptIn: Boolean,
    ): HealthConnectWriteResult {
        _attempts += Attempt(session.id, userOptIn)
        if (!userOptIn) {
            return HealthConnectWriteResult(HealthConnectWriteOutcome.NOT_OPTED_IN)
        }
        return nextResult
    }
}
