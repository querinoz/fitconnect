package com.fitconnect.android.telemetry.healthconnect

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.fitconnect.android.telemetry.domain.DataQuality
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.Provenance
import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.domain.SleepSession
import com.fitconnect.android.telemetry.domain.SleepStage
import com.fitconnect.android.telemetry.domain.SleepStageKind
import com.fitconnect.android.telemetry.domain.TelemetrySample
import com.fitconnect.android.telemetry.time.TelemetryInstant
import com.fitconnect.android.telemetry.units.TelemetryUnit
import com.fitconnect.shared.telemetry.MetricAvailability
import java.time.Instant
import java.time.temporal.ChronoUnit

data class StepDaySummary(
    val athleteId: String,
    val dayStartEpochMs: Long,
    val dayEndEpochMs: Long,
    val steps: Long,
    val sample: TelemetrySample,
)

data class HealthConnectReadResult<T>(
    val availability: MetricAvailability,
    val items: List<T> = emptyList(),
)

interface SleepStepsReader {
    suspend fun readSleep(
        athleteId: String,
        nowEpochMs: Long,
        lookbackDays: Long = 14,
    ): HealthConnectReadResult<SleepSession>

    suspend fun readSteps(
        athleteId: String,
        nowEpochMs: Long,
        lookbackDays: Long = 7,
    ): HealthConnectReadResult<StepDaySummary>
}

/**
 * Reads SleepSessionRecord + StepsRecord from Health Connect into canonical
 * telemetry models. Never invents values. Dedup identity = metadata.id when
 * present, else deterministic athlete+window key.
 */
class HealthConnectSleepStepsReader(
    private val context: Context,
) : SleepStepsReader {
    override suspend fun readSleep(
        athleteId: String,
        nowEpochMs: Long,
        lookbackDays: Long,
    ): HealthConnectReadResult<SleepSession> {
        val client = clientOrNull()
            ?: return HealthConnectReadResult(HealthConnectAvailability.status(context))
        val sdk = HealthConnectAvailability.status(context)
        if (sdk != MetricAvailability.AVAILABLE) {
            return HealthConnectReadResult(sdk)
        }
        val perm = HealthPermission.getReadPermission(SleepSessionRecord::class)
        val granted = runCatching { client.permissionController.getGrantedPermissions() }.getOrElse { emptySet() }
        if (!granted.contains(perm)) {
            return HealthConnectReadResult(MetricAvailability.PERMISSION_DENIED)
        }
        val end = Instant.ofEpochMilli(nowEpochMs)
        val start = end.minus(lookbackDays, ChronoUnit.DAYS)
        val page = runCatching {
            client.readRecords(
                ReadRecordsRequest(
                    recordType = SleepSessionRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(start, end),
                    ascendingOrder = false,
                ),
            )
        }.getOrNull() ?: return HealthConnectReadResult(MetricAvailability.UNAVAILABLE)

        val now = TelemetryInstant.utc(nowEpochMs)
        val sessions = page.records.map { record ->
            val sourceId = record.metadata.id?.takeIf { it.isNotBlank() }
                ?: "sleep:${record.startTime.toEpochMilli()}:${record.endTime.toEpochMilli()}"
            val stages = record.stages.map { stage ->
                SleepStage(
                    kind = mapStage(stage.stage),
                    start = TelemetryInstant.utc(stage.startTime.toEpochMilli()),
                    end = TelemetryInstant.utc(stage.endTime.toEpochMilli()),
                )
            }
            SleepSession(
                id = "hc:$sourceId",
                athleteId = athleteId,
                start = TelemetryInstant.utc(record.startTime.toEpochMilli()),
                end = TelemetryInstant.utc(record.endTime.toEpochMilli()),
                stages = stages,
                efficiencyPct = null,
                provenance = Provenance(
                    provider = ProviderId.HEALTH_CONNECT,
                    device = record.metadata.device?.model,
                    deviceId = record.metadata.dataOrigin.packageName,
                    sourceRecordId = sourceId,
                    originalUnit = TelemetryUnit.MILLISECONDS,
                    syncedAt = now,
                    createdAt = now,
                    updatedAt = now,
                    quality = DataQuality.VALID,
                ),
            )
        }
        return HealthConnectReadResult(MetricAvailability.AVAILABLE, sessions)
    }

    override suspend fun readSteps(
        athleteId: String,
        nowEpochMs: Long,
        lookbackDays: Long,
    ): HealthConnectReadResult<StepDaySummary> {
        val client = clientOrNull()
            ?: return HealthConnectReadResult(HealthConnectAvailability.status(context))
        val sdk = HealthConnectAvailability.status(context)
        if (sdk != MetricAvailability.AVAILABLE) {
            return HealthConnectReadResult(sdk)
        }
        val perm = HealthPermission.getReadPermission(StepsRecord::class)
        val granted = runCatching { client.permissionController.getGrantedPermissions() }.getOrElse { emptySet() }
        if (!granted.contains(perm)) {
            return HealthConnectReadResult(MetricAvailability.PERMISSION_DENIED)
        }
        val end = Instant.ofEpochMilli(nowEpochMs)
        val start = end.minus(lookbackDays, ChronoUnit.DAYS)
        val page = runCatching {
            client.readRecords(
                ReadRecordsRequest(
                    recordType = StepsRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(start, end),
                    ascendingOrder = true,
                ),
            )
        }.getOrNull() ?: return HealthConnectReadResult(MetricAvailability.UNAVAILABLE)

        val now = TelemetryInstant.utc(nowEpochMs)
        // Aggregate by UTC day to avoid double-counting overlapping intervals on re-read.
        val byDay = linkedMapOf<Long, MutableList<StepsRecord>>()
        for (record in page.records) {
            val day = Math.floorDiv(record.startTime.toEpochMilli(), 86_400_000L)
            byDay.getOrPut(day) { mutableListOf() }.add(record)
        }
        val summaries = byDay.map { (day, records) ->
            // Prefer longest unique source intervals; sum record counts with
            // deterministic source id per HC metadata id when present.
            val unique = records.distinctBy {
                it.metadata.id?.takeIf { id -> id.isNotBlank() }
                    ?: "${it.startTime.toEpochMilli()}:${it.endTime.toEpochMilli()}:${it.count}"
            }
            val total = unique.sumOf { it.count }
            val dayStart = day * 86_400_000L
            val dayEnd = dayStart + 86_400_000L - 1
            val sourceId = "steps:$athleteId:$day"
            val sample = TelemetrySample(
                id = "hc:$sourceId",
                athleteId = athleteId,
                metric = MetricType.STEPS,
                value = total.toDouble(),
                unit = TelemetryUnit.STEPS,
                at = TelemetryInstant.utc(dayStart),
                endAt = TelemetryInstant.utc(dayEnd),
                provenance = Provenance(
                    provider = ProviderId.HEALTH_CONNECT,
                    device = unique.firstOrNull()?.metadata?.device?.model,
                    deviceId = unique.firstOrNull()?.metadata?.dataOrigin?.packageName,
                    sourceRecordId = sourceId,
                    originalUnit = TelemetryUnit.STEPS,
                    syncedAt = now,
                    createdAt = now,
                    updatedAt = now,
                    quality = DataQuality.VALID,
                ),
            )
            StepDaySummary(
                athleteId = athleteId,
                dayStartEpochMs = dayStart,
                dayEndEpochMs = dayEnd,
                steps = total,
                sample = sample,
            )
        }
        return HealthConnectReadResult(MetricAvailability.AVAILABLE, summaries)
    }

    private fun clientOrNull(): HealthConnectClient? =
        runCatching { HealthConnectClient.getOrCreate(context) }.getOrNull()

    private fun mapStage(stage: Int): SleepStageKind = when (stage) {
        SleepSessionRecord.STAGE_TYPE_AWAKE -> SleepStageKind.AWAKE
        SleepSessionRecord.STAGE_TYPE_LIGHT -> SleepStageKind.LIGHT
        SleepSessionRecord.STAGE_TYPE_DEEP -> SleepStageKind.DEEP
        SleepSessionRecord.STAGE_TYPE_REM -> SleepStageKind.REM
        else -> SleepStageKind.UNKNOWN
    }
}
