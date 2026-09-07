package com.fitconnect.android.telemetry.store.room

import com.fitconnect.android.telemetry.domain.DataQuality
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.Provenance
import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.domain.SleepSession
import com.fitconnect.android.telemetry.domain.SleepStage
import com.fitconnect.android.telemetry.domain.SleepStageKind
import com.fitconnect.android.telemetry.domain.TelemetrySample
import com.fitconnect.android.telemetry.domain.WorkoutSession
import com.fitconnect.android.telemetry.store.Page
import com.fitconnect.android.telemetry.store.TelemetryStore
import com.fitconnect.android.telemetry.time.TelemetryInstant
import com.fitconnect.android.telemetry.time.TimeRange
import com.fitconnect.android.telemetry.units.TelemetryUnit

/**
 * Room-backed [TelemetryStore]. Upserts are keyed by deterministic record id and
 * unique (provider, sourceRecordId) — re-syncs replace, never duplicate.
 */
class RoomTelemetryStore(
    private val db: TelemetryRoomDatabase,
) : TelemetryStore {

    override suspend fun upsertSamples(samples: List<TelemetrySample>): Int {
        var written = 0
        for (sample in samples) {
            val existed = db.samples().sourceCount(
                sample.provenance.provider.name,
                sample.provenance.sourceRecordId,
            ) > 0
            db.samples().upsert(sample.toEntity())
            if (!existed) written++
        }
        return written
    }

    override suspend fun upsertWorkouts(workouts: List<WorkoutSession>): Int {
        var written = 0
        for (workout in workouts) {
            val existed = db.workouts().sourceCount(
                workout.provenance.provider.name,
                workout.provenance.sourceRecordId,
            ) > 0
            db.workouts().upsert(workout.toEntity())
            if (!existed) written++
        }
        return written
    }

    override suspend fun upsertSleep(sessions: List<SleepSession>): Int {
        var written = 0
        for (session in sessions) {
            val existed = db.sleep().sourceCount(
                session.provenance.provider.name,
                session.provenance.sourceRecordId,
            ) > 0
            db.sleep().upsert(session.toEntity())
            if (!existed) written++
        }
        return written
    }

    override suspend fun samples(
        athleteId: String,
        metric: MetricType,
        range: TimeRange,
        offset: Int,
        limit: Int,
    ): Page<TelemetrySample> {
        val rows = db.samples().samples(
            athleteId = athleteId,
            metric = metric.name,
            startMs = range.start.epochMs,
            endMs = range.end.epochMs,
            offset = offset,
            limit = limit + 1,
        )
        val page = rows.take(limit).map { it.toDomain() }
        return Page(page, if (rows.size > limit) offset + limit else null)
    }

    override suspend fun latestSample(athleteId: String, metric: MetricType): TelemetrySample? =
        db.samples().latest(athleteId, metric.name)?.toDomain()

    override suspend fun latestSampleExcluding(
        athleteId: String,
        metric: MetricType,
        excluded: Set<ProviderId>,
    ): TelemetrySample? {
        if (excluded.isEmpty()) return latestSample(athleteId, metric)
        return db.samples().latestExcluding(athleteId, metric.name, excluded.map { it.name })?.toDomain()
    }

    override suspend fun workouts(
        athleteId: String,
        range: TimeRange,
        offset: Int,
        limit: Int,
    ): Page<WorkoutSession> {
        val rows = db.workouts().workouts(
            athleteId = athleteId,
            startMs = range.start.epochMs,
            endMs = range.end.epochMs,
            offset = offset,
            limit = limit + 1,
        )
        val page = rows.take(limit).map { it.toDomain() }
        return Page(page, if (rows.size > limit) offset + limit else null)
    }

    override suspend fun sourceRecordExists(provider: ProviderId, sourceRecordId: String): Boolean {
        if (db.samples().sourceCount(provider.name, sourceRecordId) > 0) return true
        if (db.sleep().sourceCount(provider.name, sourceRecordId) > 0) return true
        return db.workouts().sourceCount(provider.name, sourceRecordId) > 0
    }

    override suspend fun deleteByProvider(athleteId: String, provider: ProviderId): Int {
        val a = db.samples().deleteByProvider(athleteId, provider.name)
        val b = db.sleep().deleteByProvider(athleteId, provider.name)
        val c = db.workouts().deleteByProvider(athleteId, provider.name)
        return a + b + c
    }

    override suspend fun countSamples(athleteId: String): Int = db.samples().count(athleteId)

    override suspend fun coveredMetrics(athleteId: String): Set<MetricType> {
        val metrics = db.samples().metrics(athleteId).mapNotNull { runCatching { MetricType.valueOf(it) }.getOrNull() }.toMutableSet()
        if (db.workouts().count(athleteId) > 0) metrics += MetricType.WORKOUT
        return metrics
    }

    override suspend fun pruneAthlete(athleteId: String, maxSamples: Int): Int {
        val ids = db.samples().orderedIds(athleteId)
        if (ids.size <= maxSamples) return 0
        val drop = ids.take(ids.size - maxSamples)
        drop.chunked(200).forEach { db.samples().deleteIds(it) }
        return drop.size
    }
}

private fun TelemetrySample.toEntity() = TelemetrySampleEntity(
    id = id,
    athleteId = athleteId,
    metric = metric.name,
    value = value,
    unit = unit.name,
    atEpochMs = at.epochMs,
    endAtEpochMs = endAt?.epochMs,
    provider = provenance.provider.name,
    sourceRecordId = provenance.sourceRecordId,
    device = provenance.device,
    deviceId = provenance.deviceId,
    originalUnit = provenance.originalUnit.name,
    syncedAtEpochMs = provenance.syncedAt.epochMs,
    createdAtEpochMs = provenance.createdAt.epochMs,
    updatedAtEpochMs = provenance.updatedAt.epochMs,
    quality = provenance.quality.name,
    attributesJson = encodeMap(attributes),
)

private fun TelemetrySampleEntity.toDomain() = TelemetrySample(
    id = id,
    athleteId = athleteId,
    metric = MetricType.valueOf(metric),
    value = value,
    unit = TelemetryUnit.valueOf(unit),
    at = TelemetryInstant.utc(atEpochMs),
    endAt = endAtEpochMs?.let { TelemetryInstant.utc(it) },
    provenance = Provenance(
        provider = ProviderId.valueOf(provider),
        device = device,
        deviceId = deviceId,
        sourceRecordId = sourceRecordId,
        originalUnit = TelemetryUnit.valueOf(originalUnit),
        syncedAt = TelemetryInstant.utc(syncedAtEpochMs),
        createdAt = TelemetryInstant.utc(createdAtEpochMs),
        updatedAt = TelemetryInstant.utc(updatedAtEpochMs),
        quality = DataQuality.valueOf(quality),
    ),
    attributes = decodeMap(attributesJson),
)

private fun SleepSession.toEntity() = TelemetrySleepEntity(
    id = id,
    athleteId = athleteId,
    startEpochMs = start.epochMs,
    endEpochMs = end.epochMs,
    stagesJson = encodeStages(stages),
    efficiencyPct = efficiencyPct,
    provider = provenance.provider.name,
    sourceRecordId = provenance.sourceRecordId,
    device = provenance.device,
    deviceId = provenance.deviceId,
    originalUnit = provenance.originalUnit.name,
    syncedAtEpochMs = provenance.syncedAt.epochMs,
    createdAtEpochMs = provenance.createdAt.epochMs,
    updatedAtEpochMs = provenance.updatedAt.epochMs,
    quality = provenance.quality.name,
)

private fun TelemetrySleepEntity.toDomain() = SleepSession(
    id = id,
    athleteId = athleteId,
    start = TelemetryInstant.utc(startEpochMs),
    end = TelemetryInstant.utc(endEpochMs),
    stages = decodeStages(stagesJson),
    efficiencyPct = efficiencyPct,
    provenance = Provenance(
        provider = ProviderId.valueOf(provider),
        device = device,
        deviceId = deviceId,
        sourceRecordId = sourceRecordId,
        originalUnit = TelemetryUnit.valueOf(originalUnit),
        syncedAt = TelemetryInstant.utc(syncedAtEpochMs),
        createdAt = TelemetryInstant.utc(createdAtEpochMs),
        updatedAt = TelemetryInstant.utc(updatedAtEpochMs),
        quality = DataQuality.valueOf(quality),
    ),
)

private fun WorkoutSession.toEntity() = TelemetryWorkoutEntity(
    id = id,
    athleteId = athleteId,
    sportKey = sportKey,
    title = title,
    startEpochMs = start.epochMs,
    endEpochMs = end.epochMs,
    distanceMeters = distanceMeters,
    calories = calories,
    avgHeartRate = avgHeartRate,
    maxHeartRate = maxHeartRate,
    avgPowerWatts = avgPowerWatts,
    elevationGainMeters = elevationGainMeters,
    provider = provenance.provider.name,
    sourceRecordId = provenance.sourceRecordId,
    device = deviceOrNull(provenance),
    deviceId = provenance.deviceId,
    originalUnit = provenance.originalUnit.name,
    syncedAtEpochMs = provenance.syncedAt.epochMs,
    createdAtEpochMs = provenance.createdAt.epochMs,
    updatedAtEpochMs = provenance.updatedAt.epochMs,
    quality = provenance.quality.name,
    mergedFromJson = "",
)

private fun TelemetryWorkoutEntity.toDomain() = WorkoutSession(
    id = id,
    athleteId = athleteId,
    sportKey = sportKey,
    title = title,
    start = TelemetryInstant.utc(startEpochMs),
    end = TelemetryInstant.utc(endEpochMs),
    distanceMeters = distanceMeters,
    calories = calories,
    avgHeartRate = avgHeartRate,
    maxHeartRate = maxHeartRate,
    avgPowerWatts = avgPowerWatts,
    elevationGainMeters = elevationGainMeters,
    provenance = Provenance(
        provider = ProviderId.valueOf(provider),
        device = device,
        deviceId = deviceId,
        sourceRecordId = sourceRecordId,
        originalUnit = TelemetryUnit.valueOf(originalUnit),
        syncedAt = TelemetryInstant.utc(syncedAtEpochMs),
        createdAt = TelemetryInstant.utc(createdAtEpochMs),
        updatedAt = TelemetryInstant.utc(updatedAtEpochMs),
        quality = DataQuality.valueOf(quality),
    ),
)

private fun deviceOrNull(p: Provenance): String? = p.device

private fun encodeMap(map: Map<String, String>): String =
    map.entries.joinToString(";") { "${it.key}=${it.value.replace(';', ',')}" }

private fun decodeMap(raw: String): Map<String, String> {
    if (raw.isBlank()) return emptyMap()
    return raw.split(';').mapNotNull { part ->
        val i = part.indexOf('=')
        if (i <= 0) null else part.substring(0, i) to part.substring(i + 1)
    }.toMap()
}

private fun encodeStages(stages: List<SleepStage>): String =
    stages.joinToString("|") { "${it.kind.name},${it.start.epochMs},${it.end.epochMs}" }

private fun decodeStages(raw: String): List<SleepStage> {
    if (raw.isBlank()) return emptyList()
    return raw.split('|').mapNotNull { part ->
        val bits = part.split(',')
        if (bits.size != 3) return@mapNotNull null
        SleepStage(
            kind = runCatching { SleepStageKind.valueOf(bits[0]) }.getOrDefault(SleepStageKind.UNKNOWN),
            start = TelemetryInstant.utc(bits[1].toLongOrNull() ?: return@mapNotNull null),
            end = TelemetryInstant.utc(bits[2].toLongOrNull() ?: return@mapNotNull null),
        )
    }
}
