package com.fitconnect.android.telemetry.observability

import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.provider.ProviderFailure
import java.util.concurrent.atomic.AtomicInteger

/**
 * Telemetry about the telemetry pipeline itself. Only operational counters —
 * never metric values, athlete identifiers beyond opaque ids, or health data.
 */
interface TelemetryObservability {
    fun recordSyncSuccess(provider: ProviderId, recordsImported: Int, durationMs: Long)
    fun recordSyncQueued(provider: ProviderId)
    fun recordProviderError(provider: ProviderId, failure: ProviderFailure)
    fun recordRetry(provider: ProviderId, attempt: Int)
    fun recordRejected(provider: ProviderId, count: Int)
    fun snapshot(): ObservabilitySnapshot
}

data class ObservabilitySnapshot(
    val syncSuccesses: Map<ProviderId, Int>,
    val syncQueued: Map<ProviderId, Int>,
    val providerErrors: Map<ProviderId, Map<ProviderFailure, Int>>,
    val retries: Map<ProviderId, Int>,
    val rejectedRecords: Map<ProviderId, Int>,
)

class InMemoryTelemetryObservability : TelemetryObservability {
    private val successes = mutableMapOf<ProviderId, AtomicInteger>()
    private val queued = mutableMapOf<ProviderId, AtomicInteger>()
    private val errors = mutableMapOf<ProviderId, MutableMap<ProviderFailure, AtomicInteger>>()
    private val retryCounts = mutableMapOf<ProviderId, AtomicInteger>()
    private val rejected = mutableMapOf<ProviderId, AtomicInteger>()

    @Synchronized
    override fun recordSyncSuccess(provider: ProviderId, recordsImported: Int, durationMs: Long) {
        successes.getOrPut(provider) { AtomicInteger() }.incrementAndGet()
    }

    @Synchronized
    override fun recordSyncQueued(provider: ProviderId) {
        queued.getOrPut(provider) { AtomicInteger() }.incrementAndGet()
    }

    @Synchronized
    override fun recordProviderError(provider: ProviderId, failure: ProviderFailure) {
        errors.getOrPut(provider) { mutableMapOf() }
            .getOrPut(failure) { AtomicInteger() }
            .incrementAndGet()
    }

    @Synchronized
    override fun recordRetry(provider: ProviderId, attempt: Int) {
        retryCounts.getOrPut(provider) { AtomicInteger() }.incrementAndGet()
    }

    @Synchronized
    override fun recordRejected(provider: ProviderId, count: Int) {
        if (count > 0) rejected.getOrPut(provider) { AtomicInteger() }.addAndGet(count)
    }

    @Synchronized
    override fun snapshot(): ObservabilitySnapshot = ObservabilitySnapshot(
        syncSuccesses = successes.mapValues { it.value.get() },
        syncQueued = queued.mapValues { it.value.get() },
        providerErrors = errors.mapValues { (_, m) -> m.mapValues { it.value.get() } },
        retries = retryCounts.mapValues { it.value.get() },
        rejectedRecords = rejected.mapValues { it.value.get() },
    )
}
