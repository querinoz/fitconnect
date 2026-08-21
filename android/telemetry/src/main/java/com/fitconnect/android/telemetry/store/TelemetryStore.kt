package com.fitconnect.android.telemetry.store

import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.domain.SleepSession
import com.fitconnect.android.telemetry.domain.TelemetrySample
import com.fitconnect.android.telemetry.domain.WorkoutSession
import com.fitconnect.android.telemetry.time.TimeRange
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

data class Page<T>(val items: List<T>, val nextOffset: Int?)

/**
 * Telemetry persistence port. The in-memory implementation is index-shaped the
 * same way a Room/SQLite schema would be (athlete+metric+time), so swapping in
 * a database changes no callers. Queries are always paginated — there is no
 * "load everything" API.
 */
interface TelemetryStore {
    suspend fun upsertSamples(samples: List<TelemetrySample>): Int
    suspend fun upsertWorkouts(workouts: List<WorkoutSession>): Int
    suspend fun upsertSleep(sessions: List<SleepSession>): Int

    suspend fun samples(
        athleteId: String,
        metric: MetricType,
        range: TimeRange,
        offset: Int = 0,
        limit: Int = 500,
    ): Page<TelemetrySample>

    suspend fun latestSample(athleteId: String, metric: MetricType): TelemetrySample?
    suspend fun latestSampleExcluding(
        athleteId: String,
        metric: MetricType,
        excluded: Set<ProviderId>,
    ): TelemetrySample?

    suspend fun workouts(athleteId: String, range: TimeRange, offset: Int = 0, limit: Int = 100): Page<WorkoutSession>

    suspend fun sourceRecordExists(provider: ProviderId, sourceRecordId: String): Boolean

    suspend fun deleteByProvider(athleteId: String, provider: ProviderId): Int

    suspend fun countSamples(athleteId: String): Int

    suspend fun coveredMetrics(athleteId: String): Set<MetricType>

    /** Soft retention: drop oldest samples beyond [maxSamples] for the athlete. */
    suspend fun pruneAthlete(athleteId: String, maxSamples: Int): Int
}

class InMemoryTelemetryStore : TelemetryStore {
    private val mutex = Mutex()

    // Primary "tables" keyed by record id.
    private val sampleTable = linkedMapOf<String, TelemetrySample>()
    private val workoutTable = linkedMapOf<String, WorkoutSession>()
    private val sleepTable = linkedMapOf<String, SleepSession>()

    // Index: athleteId -> metric -> ids sorted lazily on query.
    private val sampleIndex = mutableMapOf<String, MutableMap<MetricType, MutableSet<String>>>()
    private val workoutIndex = mutableMapOf<String, MutableSet<String>>()
    private val sourceIndex = mutableSetOf<String>()

    private fun sourceKey(provider: ProviderId, sourceRecordId: String) = "${provider.name}:$sourceRecordId"

    override suspend fun upsertSamples(samples: List<TelemetrySample>): Int = mutex.withLock {
        var written = 0
        for (sample in samples) {
            val isNew = !sampleTable.containsKey(sample.id)
            sampleTable[sample.id] = sample
            sampleIndex.getOrPut(sample.athleteId) { mutableMapOf() }
                .getOrPut(sample.metric) { mutableSetOf() }
                .add(sample.id)
            sourceIndex += sourceKey(sample.provenance.provider, sample.provenance.sourceRecordId)
            if (isNew) written++
        }
        written
    }

    override suspend fun upsertWorkouts(workouts: List<WorkoutSession>): Int = mutex.withLock {
        var written = 0
        for (workout in workouts) {
            val isNew = !workoutTable.containsKey(workout.id)
            workoutTable[workout.id] = workout
            workoutIndex.getOrPut(workout.athleteId) { mutableSetOf() }.add(workout.id)
            sourceIndex += sourceKey(workout.provenance.provider, workout.provenance.sourceRecordId)
            workout.mergedFrom.forEach { sourceIndex += sourceKey(it.provider, it.sourceRecordId) }
            if (isNew) written++
        }
        written
    }

    override suspend fun upsertSleep(sessions: List<SleepSession>): Int = mutex.withLock {
        var written = 0
        for (session in sessions) {
            val isNew = !sleepTable.containsKey(session.id)
            sleepTable[session.id] = session
            sourceIndex += sourceKey(session.provenance.provider, session.provenance.sourceRecordId)
            if (isNew) written++
        }
        written
    }

    override suspend fun samples(
        athleteId: String,
        metric: MetricType,
        range: TimeRange,
        offset: Int,
        limit: Int,
    ): Page<TelemetrySample> = mutex.withLock {
        val ids = sampleIndex[athleteId]?.get(metric).orEmpty()
        val matching = ids.mapNotNull { sampleTable[it] }
            .filter { it.at in range }
            .sortedBy { it.at.epochMs }
        val slice = matching.drop(offset).take(limit)
        Page(slice, if (offset + limit < matching.size) offset + limit else null)
    }

    override suspend fun latestSample(athleteId: String, metric: MetricType): TelemetrySample? = mutex.withLock {
        sampleIndex[athleteId]?.get(metric).orEmpty()
            .mapNotNull { sampleTable[it] }
            .maxByOrNull { it.at.epochMs }
    }

    override suspend fun latestSampleExcluding(
        athleteId: String,
        metric: MetricType,
        excluded: Set<ProviderId>,
    ): TelemetrySample? = mutex.withLock {
        sampleIndex[athleteId]?.get(metric).orEmpty()
            .mapNotNull { sampleTable[it] }
            .filter { it.provenance.provider !in excluded }
            .maxByOrNull { it.at.epochMs }
    }

    override suspend fun workouts(
        athleteId: String,
        range: TimeRange,
        offset: Int,
        limit: Int,
    ): Page<WorkoutSession> = mutex.withLock {
        val matching = workoutIndex[athleteId].orEmpty()
            .mapNotNull { workoutTable[it] }
            .filter { TimeRange(it.start, it.end).overlaps(range) }
            .sortedByDescending { it.start.epochMs }
        val slice = matching.drop(offset).take(limit)
        Page(slice, if (offset + limit < matching.size) offset + limit else null)
    }

    override suspend fun sourceRecordExists(provider: ProviderId, sourceRecordId: String): Boolean =
        mutex.withLock { sourceKey(provider, sourceRecordId) in sourceIndex }

    override suspend fun deleteByProvider(athleteId: String, provider: ProviderId): Int = mutex.withLock {
        val sampleIds = sampleTable.values
            .filter { it.athleteId == athleteId && it.provenance.provider == provider }
            .map { it.id }
        sampleIds.forEach { id ->
            val sample = sampleTable.remove(id) ?: return@forEach
            sampleIndex[athleteId]?.get(sample.metric)?.remove(id)
            sourceIndex -= sourceKey(provider, sample.provenance.sourceRecordId)
        }
        val workoutIds = workoutTable.values
            .filter { it.athleteId == athleteId && it.provenance.provider == provider }
            .map { it.id }
        workoutIds.forEach { id ->
            val workout = workoutTable.remove(id) ?: return@forEach
            workoutIndex[athleteId]?.remove(id)
            sourceIndex -= sourceKey(provider, workout.provenance.sourceRecordId)
        }
        sampleIds.size + workoutIds.size
    }

    override suspend fun countSamples(athleteId: String): Int = mutex.withLock {
        sampleIndex[athleteId]?.values?.sumOf { it.size } ?: 0
    }

    override suspend fun coveredMetrics(athleteId: String): Set<MetricType> = mutex.withLock {
        sampleIndex[athleteId]?.filterValues { it.isNotEmpty() }?.keys.orEmpty().toSet() +
            if (workoutIndex[athleteId].orEmpty().isNotEmpty()) setOf(MetricType.WORKOUT) else emptySet()
    }

    override suspend fun pruneAthlete(athleteId: String, maxSamples: Int): Int = mutex.withLock {
        val ids = sampleIndex[athleteId]?.values?.flatten().orEmpty()
        if (ids.size <= maxSamples) return@withLock 0
        val ordered = ids.mapNotNull { sampleTable[it] }.sortedBy { it.at.epochMs }
        val drop = ordered.take(ordered.size - maxSamples)
        drop.forEach { sample ->
            sampleTable.remove(sample.id)
            sampleIndex[athleteId]?.get(sample.metric)?.remove(sample.id)
            sourceIndex -= sourceKey(sample.provenance.provider, sample.provenance.sourceRecordId)
        }
        drop.size
    }
}
