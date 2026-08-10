package com.fitconnect.android.sports.metrics

import com.fitconnect.android.sports.domain.MetricDefinition
import com.fitconnect.android.sports.domain.MetricKind
import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.sports.registry.SportsRegistry
import java.util.concurrent.ConcurrentHashMap

data class MetricSample(
    val sportId: SportId,
    val key: String,
    val value: Double,
    val recordedAtEpochMs: Long = System.currentTimeMillis(),
    val source: String = "local",
)

/**
 * Sport metrics engine — schema from registry, unlimited custom metrics,
 * sample storage. Formula computation for NP/TSS/GAP stays in elite-core.
 */
interface MetricsEngine {
    fun schema(sportId: SportId): List<MetricDefinition>
    fun registerCustomMetric(sportId: SportId, metric: MetricDefinition)
    fun record(sample: MetricSample)
    fun latest(sportId: SportId, key: String): MetricSample?
    fun history(sportId: SportId, key: String): List<MetricSample>
    fun keys(sportId: SportId): Set<String>
}

class DefaultMetricsEngine(
    private val registry: SportsRegistry,
) : MetricsEngine {
    private val custom = ConcurrentHashMap<String, MutableList<MetricDefinition>>()
    private val samples = ConcurrentHashMap<String, MutableList<MetricSample>>()

    override fun schema(sportId: SportId): List<MetricDefinition> {
        val base = registry.require(sportId).allMetrics()
        val extras = custom[sportId.value].orEmpty()
        return (base + extras).distinctBy { it.key }
    }

    override fun registerCustomMetric(sportId: SportId, metric: MetricDefinition) {
        require(metric.key.isNotBlank())
        custom.getOrPut(sportId.value) { mutableListOf() }.removeAll { it.key == metric.key }
        custom.getOrPut(sportId.value) { mutableListOf() }.add(
            metric.copy(kind = metric.kind.takeIf { it != MetricKind.REQUIRED } ?: MetricKind.OPTIONAL),
        )
    }

    override fun record(sample: MetricSample) {
        samples.getOrPut(sampleKey(sample.sportId, sample.key)) { mutableListOf() }.add(sample)
    }

    override fun latest(sportId: SportId, key: String): MetricSample? =
        history(sportId, key).maxByOrNull { it.recordedAtEpochMs }

    override fun history(sportId: SportId, key: String): List<MetricSample> =
        samples[sampleKey(sportId, key)].orEmpty().sortedBy { it.recordedAtEpochMs }

    override fun keys(sportId: SportId): Set<String> =
        schema(sportId).map { it.key }.toSet() +
            samples.keys.filter { it.startsWith("${sportId.value}::") }.map { it.substringAfter("::") }.toSet()

    private fun sampleKey(sportId: SportId, key: String) = "${sportId.value}::$key"
}
