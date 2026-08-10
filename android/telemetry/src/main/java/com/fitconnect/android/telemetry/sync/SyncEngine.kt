package com.fitconnect.android.telemetry.sync

import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.telemetry.domain.DataQuality
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.observability.TelemetryObservability
import com.fitconnect.android.telemetry.provider.ProviderException
import com.fitconnect.android.telemetry.provider.ProviderFailure
import com.fitconnect.android.telemetry.provider.TelemetryProvider
import com.fitconnect.android.telemetry.quality.DataQualityEngine
import com.fitconnect.android.telemetry.store.TelemetryStore
import com.fitconnect.android.telemetry.time.TelemetryClock
import com.fitconnect.android.telemetry.time.TelemetryInstant
import com.fitconnect.android.telemetry.time.TimeRange
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

enum class SyncStatus { IDLE, RUNNING, SUCCESS, PARTIAL, FAILED, PENDING_NETWORK, CANCELLED }

data class SyncCheckpoint(
    val provider: ProviderId,
    val athleteId: String,
    val lastSyncedEpochMs: Long,
    val cursor: String?,
)

data class SyncReport(
    val provider: ProviderId,
    val status: SyncStatus,
    val recordsImported: Int,
    val recordsRejected: Int,
    val duplicatesMerged: Int,
    val pagesFetched: Int,
    val durationMs: Long,
    val failure: ProviderFailure? = null,
)

data class SyncState(
    val provider: ProviderId,
    val status: SyncStatus,
    val lastReport: SyncReport? = null,
    val lastSyncAt: TelemetryInstant? = null,
)

/**
 * Provider-agnostic sync engine: paginated, checkpointed, retry with
 * exponential backoff, offline-resilient (pending queue drains on network
 * recovery) and idempotent — re-running a window never duplicates records.
 */
class TelemetrySyncEngine(
    private val store: TelemetryStore,
    private val quality: DataQualityEngine,
    private val dedup: DeduplicationEngine,
    private val connectivity: ConnectivityMonitor,
    private val observability: TelemetryObservability,
    private val clock: TelemetryClock,
    private val retryDelaysMs: List<Long> = listOf(1_000, 4_000, 16_000),
) {
    private val mutex = Mutex()
    private val checkpoints = mutableMapOf<String, SyncCheckpoint>()
    private val pendingQueue = mutableListOf<PendingSync>()

    private val _states = MutableStateFlow<Map<ProviderId, SyncState>>(emptyMap())
    val states: StateFlow<Map<ProviderId, SyncState>> = _states.asStateFlow()

    private data class PendingSync(
        val provider: TelemetryProvider,
        val athleteId: String,
        val metrics: Set<MetricType>,
        val range: TimeRange,
    )

    private fun checkpointKey(provider: ProviderId, athleteId: String) = "${provider.name}:$athleteId"

    suspend fun checkpoint(provider: ProviderId, athleteId: String): SyncCheckpoint? =
        mutex.withLock { checkpoints[checkpointKey(provider, athleteId)] }

    /**
     * Full sync of a window. Incremental syncs pass a range starting at the
     * previous checkpoint; historical imports pass an older range.
     */
    suspend fun sync(
        provider: TelemetryProvider,
        athleteId: String,
        metrics: Set<MetricType>,
        range: TimeRange,
        pageSize: Int = 200,
    ): SyncReport {
        val startedAt = clock.nowEpochMs()
        if (!connectivity.online.value) {
            mutex.withLock { pendingQueue += PendingSync(provider, athleteId, metrics, range) }
            observability.recordSyncQueued(provider.id)
            val report = SyncReport(provider.id, SyncStatus.PENDING_NETWORK, 0, 0, 0, 0, 0)
            publish(provider.id, SyncStatus.PENDING_NETWORK, report)
            return report
        }

        publish(provider.id, SyncStatus.RUNNING, null)
        var imported = 0
        var rejected = 0
        var duplicates = 0
        var pages = 0
        var cursor: String? = mutex.withLock { checkpoints[checkpointKey(provider.id, athleteId)]?.cursor }

        while (true) {
            val page = try {
                readWithRetry(provider, athleteId, metrics, range, cursor, pageSize)
            } catch (e: ProviderException) {
                observability.recordProviderError(provider.id, e.failure)
                val status = if (imported > 0) SyncStatus.PARTIAL else SyncStatus.FAILED
                val report = SyncReport(
                    provider.id, status, imported, rejected, duplicates, pages,
                    clock.nowEpochMs() - startedAt, e.failure,
                )
                publish(provider.id, status, report)
                return report
            }
            pages++

            // Quality gate: assess, stamp, reject invalid — never silently fix.
            val assessed = page.samples.map { sample ->
                val assessment = quality.assess(sample)
                sample.copy(
                    provenance = sample.provenance.copy(
                        quality = assessment.quality,
                        qualityFlags = assessment.flags,
                    ),
                )
            }
            val (rejectedSamples, accepted) = assessed.partition { it.provenance.quality == DataQuality.INVALID }
            rejected += rejectedSamples.size
            observability.recordRejected(provider.id, rejectedSamples.size)

            imported += store.upsertSamples(accepted)

            if (page.workouts.isNotEmpty()) {
                val existing = store.workouts(
                    athleteId,
                    TimeRange(range.start.plusMs(-DEDUP_LOOKBACK_MS), range.end.plusMs(DEDUP_LOOKBACK_MS)),
                    limit = 500,
                ).items
                val result = dedup.dedupe(page.workouts, existing)
                duplicates += result.duplicatesDetected
                imported += store.upsertWorkouts(result.merged)
            }

            // Checkpoint after every page so partial syncs resume, not restart.
            mutex.withLock {
                checkpoints[checkpointKey(provider.id, athleteId)] = SyncCheckpoint(
                    provider = provider.id,
                    athleteId = athleteId,
                    lastSyncedEpochMs = clock.nowEpochMs(),
                    cursor = page.nextCursor,
                )
            }
            cursor = page.nextCursor ?: break
        }

        val report = SyncReport(
            provider.id, SyncStatus.SUCCESS, imported, rejected, duplicates, pages,
            clock.nowEpochMs() - startedAt,
        )
        observability.recordSyncSuccess(provider.id, report.recordsImported, report.durationMs)
        publish(provider.id, SyncStatus.SUCCESS, report)
        return report
    }

    /** Drains syncs queued while offline. Call on network recovery. */
    suspend fun drainPending(): List<SyncReport> {
        if (!connectivity.online.value) return emptyList()
        val pending = mutex.withLock {
            val copy = pendingQueue.toList()
            pendingQueue.clear()
            copy
        }
        return pending.map { sync(it.provider, it.athleteId, it.metrics, it.range) }
    }

    suspend fun pendingCount(): Int = mutex.withLock { pendingQueue.size }

    private suspend fun readWithRetry(
        provider: TelemetryProvider,
        athleteId: String,
        metrics: Set<MetricType>,
        range: TimeRange,
        cursor: String?,
        pageSize: Int,
    ) = run {
        var lastError: ProviderException? = null
        for ((attempt, delayMs) in (listOf(0L) + retryDelaysMs).withIndex()) {
            if (delayMs > 0) delay(delayMs)
            try {
                return@run provider.read(athleteId, metrics, range, cursor, pageSize)
            } catch (e: ProviderException) {
                lastError = e
                observability.recordRetry(provider.id, attempt)
                // Auth/permission failures are not transient — do not retry.
                if (e.failure in NON_RETRYABLE) throw e
            }
        }
        throw lastError ?: ProviderException(ProviderFailure.OUTAGE, "retries exhausted")
    }

    private fun publish(provider: ProviderId, status: SyncStatus, report: SyncReport?) {
        _states.value = _states.value + (
            provider to SyncState(
                provider = provider,
                status = status,
                lastReport = report ?: _states.value[provider]?.lastReport,
                lastSyncAt = if (status == SyncStatus.SUCCESS) TelemetryInstant.now(clock) else _states.value[provider]?.lastSyncAt,
            )
            )
    }

    private companion object {
        val NON_RETRYABLE = setOf(
            ProviderFailure.EXPIRED_TOKEN,
            ProviderFailure.PERMISSION_REVOKED,
            ProviderFailure.UNSUPPORTED_METRIC,
        )
        const val DEDUP_LOOKBACK_MS = 6 * 3_600_000L
    }
}

/**
 * Background sync policy — WorkManager-shaped constraints. The scheduler
 * itself lives in :app when WorkManager is wired; the policy is domain-owned
 * so it is testable and battery limits are explicit, not scattered.
 */
data class BackgroundSyncPolicy(
    val minIntervalMinutes: Int = 60,
    val requiresUnmeteredNetwork: Boolean = false,
    val requiresCharging: Boolean = false,
    val requiresBatteryNotLow: Boolean = true,
    val respectDoze: Boolean = true,
) {
    fun shouldRun(lastRunEpochMs: Long?, nowEpochMs: Long, batteryLow: Boolean, online: Boolean): Boolean {
        if (!online) return false
        if (requiresBatteryNotLow && batteryLow) return false
        if (lastRunEpochMs == null) return true
        return nowEpochMs - lastRunEpochMs >= minIntervalMinutes * 60_000L
    }
}
