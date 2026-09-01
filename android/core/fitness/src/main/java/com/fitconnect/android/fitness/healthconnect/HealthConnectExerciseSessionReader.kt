package com.fitconnect.android.fitness.healthconnect

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.changes.DeletionChange
import androidx.health.connect.client.changes.UpsertionChange
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.request.ChangesTokenRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.fitconnect.android.fitness.domain.HealthConnectSdkState
import com.fitconnect.android.fitness.mapping.ExerciseSessionDto
import java.time.Instant
import java.time.temporal.ChronoUnit

/**
 * Reads [ExerciseSessionRecord] via Changes API when a token exists,
 * otherwise performs a bounded initial import (30 days).
 */
class HealthConnectExerciseSessionReader(
    private val context: Context,
    private val userId: () -> String,
    private val sdkState: () -> HealthConnectSdkState = { HealthConnectSdkMapper.probe(context) },
    private val permissionGateway: HealthConnectPermissionGateway,
    private val historyDays: Long = 30,
) : ExerciseSessionReader {

    private val client: HealthConnectClient? by lazy {
        if (sdkState() != HealthConnectSdkState.AVAILABLE) null
        else runCatching { HealthConnectClient.getOrCreate(context) }.getOrNull()
    }

    override suspend fun read(changeToken: String?): Pair<List<ExerciseSessionDto>, String> {
        if (permissionGateway.permissionState() != HealthConnectPermissionState.GRANTED) {
            return emptyList<ExerciseSessionDto>() to (changeToken ?: "")
        }
        val hc = client ?: return emptyList<ExerciseSessionDto>() to (changeToken ?: "")
        return if (changeToken.isNullOrBlank()) {
            initialImport(hc)
        } else {
            incrementalChanges(hc, changeToken)
        }
    }

    private suspend fun initialImport(hc: HealthConnectClient): Pair<List<ExerciseSessionDto>, String> {
        val end = Instant.now()
        val start = end.minus(historyDays, ChronoUnit.DAYS)
        val response = hc.readRecords(
            ReadRecordsRequest(
                recordType = ExerciseSessionRecord::class,
                timeRangeFilter = TimeRangeFilter.between(start, end),
            ),
        )
        val token = hc.getChangesToken(
            ChangesTokenRequest(setOf(ExerciseSessionRecord::class)),
        )
        return response.records.map { it.toDto() } to token
    }

    private suspend fun incrementalChanges(
        hc: HealthConnectClient,
        token: String,
    ): Pair<List<ExerciseSessionDto>, String> {
        val changes = hc.getChanges(token)
        val sessions = changes.changes.mapNotNull { change ->
            when (change) {
                is UpsertionChange -> (change.record as? ExerciseSessionRecord)?.toDto()
                is DeletionChange -> null
                else -> null
            }
        }
        return sessions to changes.nextChangesToken
    }

    private fun ExerciseSessionRecord.toDto(): ExerciseSessionDto =
        ExerciseSessionDto(
            externalId = metadata.id,
            userId = userId(),
            exerciseType = HealthConnectExerciseTypeNames.nameFor(exerciseType),
            startEpochMs = startTime.toEpochMilli(),
            endEpochMs = endTime.toEpochMilli(),
            distanceM = null,
            elevationGainM = null,
            avgHeartRateBpm = null,
            energyKj = null,
            deviceName = metadata.device?.manufacturer,
            title = title,
        )
}
