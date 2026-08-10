package com.fitconnect.android.telemetry.capability

import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.ProviderId

/**
 * What a provider can actually do. Nothing in the system assumes a provider
 * supports a metric — capability is always queried at runtime.
 */
data class ProviderCapabilities(
    val provider: ProviderId,
    val readableMetrics: Set<MetricType>,
    val writableMetrics: Set<MetricType> = emptySet(),
    val supportsHistoricalData: Boolean = false,
    val supportsRealtime: Boolean = false,
    val supportsBackgroundSync: Boolean = false,
    val supportsWorkoutImport: Boolean = false,
    val supportsGps: Boolean = false,
    val supportsDeletion: Boolean = false,
    val maxHistoryDays: Int? = null,
    val rateLimitPerHour: Int? = null,
) {
    fun canRead(metric: MetricType): Boolean = metric in readableMetrics
    fun canWrite(metric: MetricType): Boolean = metric in writableMetrics
}

/** Runtime registry of provider capabilities keyed by provider. */
interface CapabilityRegistry {
    fun register(capabilities: ProviderCapabilities)
    fun of(provider: ProviderId): ProviderCapabilities?
    fun all(): List<ProviderCapabilities>
    fun providersFor(metric: MetricType): List<ProviderId>
}

class DefaultCapabilityRegistry : CapabilityRegistry {
    private val entries = linkedMapOf<ProviderId, ProviderCapabilities>()

    override fun register(capabilities: ProviderCapabilities) {
        entries[capabilities.provider] = capabilities
    }

    override fun of(provider: ProviderId): ProviderCapabilities? = entries[provider]

    override fun all(): List<ProviderCapabilities> = entries.values.toList()

    override fun providersFor(metric: MetricType): List<ProviderId> =
        entries.values.filter { it.canRead(metric) }.map { it.provider }
}
