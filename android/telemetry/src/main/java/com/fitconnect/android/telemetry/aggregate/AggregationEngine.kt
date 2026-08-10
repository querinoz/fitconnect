package com.fitconnect.android.telemetry.aggregate

import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.TelemetrySample
import com.fitconnect.android.telemetry.store.TelemetryStore
import com.fitconnect.android.telemetry.time.TimeRange
import com.fitconnect.android.foundation.perf.PerformanceBudget

enum class Bucket { HOURLY, DAILY, WEEKLY, MONTHLY }

data class AggregatePoint(
    val bucketStartEpochMs: Long,
    val count: Int,
    val min: Double,
    val max: Double,
    val avg: Double,
    val median: Double,
)

data class AggregateSeries(
    val metric: MetricType,
    val bucket: Bucket,
    val points: List<AggregatePoint>,
) {
    fun trendDelta(): Double? {
        if (points.size < 2) return null
        return points.last().avg - points.first().avg
    }
}

/**
 * Chart-facing aggregation. Charts never see raw samples — the engine streams
 * pages from the store and folds them into bounded bucket series, so memory
 * stays flat regardless of history size.
 */
class AggregationEngine(private val store: TelemetryStore) {

    suspend fun aggregate(
        athleteId: String,
        metric: MetricType,
        range: TimeRange,
        bucket: Bucket,
    ): AggregateSeries {
        // Running stats + bounded reservoir for median — never retain unbounded lists.
        data class Acc(
            var count: Int = 0,
            var min: Double = Double.POSITIVE_INFINITY,
            var max: Double = Double.NEGATIVE_INFINITY,
            var sum: Double = 0.0,
            val reservoir: MutableList<Double> = ArrayList(PerformanceBudget.AGG_BUCKET_RESERVOIR),
        )
        val buckets = sortedMapOf<Long, Acc>()
        var offset: Int? = 0
        while (offset != null) {
            val page = store.samples(athleteId, metric, range, offset, PAGE_SIZE)
            for (sample in page.items) {
                val acc = buckets.getOrPut(bucketStart(sample, bucket)) { Acc() }
                acc.count++
                acc.min = minOf(acc.min, sample.value)
                acc.max = maxOf(acc.max, sample.value)
                acc.sum += sample.value
                if (acc.reservoir.size < PerformanceBudget.AGG_BUCKET_RESERVOIR) {
                    acc.reservoir += sample.value
                } else {
                    // Reservoir sampling keeps median estimate bounded.
                    val j = kotlin.random.Random.nextInt(acc.count)
                    if (j < PerformanceBudget.AGG_BUCKET_RESERVOIR) {
                        acc.reservoir[j] = sample.value
                    }
                }
            }
            offset = page.nextOffset
        }
        val points = buckets.map { (start, acc) ->
            val sorted = acc.reservoir.sorted()
            AggregatePoint(
                bucketStartEpochMs = start,
                count = acc.count,
                min = if (acc.count == 0) 0.0 else acc.min,
                max = if (acc.count == 0) 0.0 else acc.max,
                avg = if (acc.count == 0) 0.0 else acc.sum / acc.count,
                median = if (sorted.isEmpty()) 0.0 else sorted[sorted.size / 2],
            )
        }
        return AggregateSeries(metric, bucket, points)
    }

    /** Rolling average over the aggregated daily points (e.g. 7-day HRV baseline). */
    fun rollingAverage(series: AggregateSeries, window: Int): List<Double> {
        if (window <= 0 || series.points.isEmpty()) return emptyList()
        return series.points.indices.map { i ->
            val slice = series.points.subList((i - window + 1).coerceAtLeast(0), i + 1)
            slice.map { it.avg }.average()
        }
    }

    fun percentile(values: List<Double>, p: Double): Double? {
        if (values.isEmpty()) return null
        val sorted = values.sorted()
        val index = ((p.coerceIn(0.0, 100.0) / 100.0) * (sorted.size - 1)).toInt()
        return sorted[index]
    }

    private fun bucketStart(sample: TelemetrySample, bucket: Bucket): Long = when (bucket) {
        Bucket.HOURLY -> sample.at.localHourIndex() * 3_600_000L
        Bucket.DAILY -> sample.at.localDayIndex() * 86_400_000L
        Bucket.WEEKLY -> (sample.at.localDayIndex() / 7) * 7 * 86_400_000L
        Bucket.MONTHLY -> (sample.at.localDayIndex() / 30) * 30 * 86_400_000L
    }

    private companion object {
        const val PAGE_SIZE = 500
    }
}
