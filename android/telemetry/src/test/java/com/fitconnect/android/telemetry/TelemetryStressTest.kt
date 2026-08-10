package com.fitconnect.android.telemetry

import com.fitconnect.android.foundation.perf.PerformanceBudget
import com.fitconnect.android.telemetry.aggregate.AggregationEngine
import com.fitconnect.android.telemetry.aggregate.Bucket
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.Provenance
import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.domain.TelemetrySample
import com.fitconnect.android.telemetry.store.InMemoryTelemetryStore
import com.fitconnect.android.telemetry.time.TelemetryInstant
import com.fitconnect.android.telemetry.time.TimeRange
import com.fitconnect.android.telemetry.units.CanonicalUnits
import com.fitconnect.android.telemetry.units.TelemetryUnit
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class TelemetryStressTest {
    @Test
    fun stress_100kPointsAggregateAndPrune() = runBlocking {
        val store = InMemoryTelemetryStore()
        val athlete = "stress-1"
        val base = 1_700_000_000_000L
        val batch = ArrayList<TelemetrySample>(5_000)
        // 100k samples — production-scale stress for in-memory store + aggregation.
        repeat(20) { batchIdx ->
            batch.clear()
            repeat(5_000) { i ->
                val n = batchIdx * 5_000 + i
                val at = TelemetryInstant.utc(base + n * 60_000L)
                batch += TelemetrySample(
                    id = "s-$n",
                    athleteId = athlete,
                    metric = MetricType.HRV,
                    value = 50.0 + (n % 20),
                    unit = CanonicalUnits.of(MetricType.HRV),
                    at = at,
                    provenance = Provenance(
                        provider = ProviderId.HEALTH_CONNECT,
                        device = null,
                        deviceId = null,
                        sourceRecordId = "src-$n",
                        originalUnit = TelemetryUnit.MILLISECONDS,
                        syncedAt = at,
                        createdAt = at,
                        updatedAt = at,
                    ),
                )
            }
            store.upsertSamples(batch)
        }
        assertEquals(100_000, store.countSamples(athlete))
        val engine = AggregationEngine(store)
        val series = engine.aggregate(
            athlete,
            MetricType.HRV,
            TimeRange(TelemetryInstant.utc(base), TelemetryInstant.utc(base + 100_000L * 60_000L)),
            Bucket.DAILY,
        )
        assertTrue(series.points.isNotEmpty())
        assertTrue(series.points.all { it.count >= 1 })
        val pruned = store.pruneAthlete(athlete, maxSamples = PerformanceBudget.TELEMETRY_SAMPLES_PER_ATHLETE)
        assertEquals(50_000, pruned)
        assertEquals(50_000, store.countSamples(athlete))
    }
}
