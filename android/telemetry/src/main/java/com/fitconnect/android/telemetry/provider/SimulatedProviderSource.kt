package com.fitconnect.android.telemetry.provider

import com.fitconnect.android.telemetry.domain.DataQuality
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.Provenance
import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.domain.TelemetrySample
import com.fitconnect.android.telemetry.domain.WorkoutSession
import com.fitconnect.android.telemetry.time.TelemetryClock
import com.fitconnect.android.telemetry.time.TelemetryInstant
import com.fitconnect.android.telemetry.time.TimeRange
import com.fitconnect.android.telemetry.units.CanonicalUnits
import kotlin.math.abs
import kotlin.math.sin

/**
 * Deterministic sample generator: same provider + athlete + day always yields
 * the same records (stable source ids), so re-sync is naturally idempotent and
 * dedup paths are testable without vendor SDKs.
 */
class SimulatedProviderSource(private val clock: TelemetryClock) {

    fun page(
        provider: ProviderId,
        athleteId: String,
        metrics: Set<MetricType>,
        range: TimeRange,
        cursor: String?,
        pageSize: Int,
    ): ProviderPage {
        val startDay = Math.floorDiv(range.start.epochMs, DAY_MS)
        val endDay = Math.floorDiv(range.end.epochMs, DAY_MS)
        val cursorDay = cursor?.toLongOrNull() ?: startDay

        val samples = mutableListOf<TelemetrySample>()
        val workouts = mutableListOf<WorkoutSession>()
        var day = cursorDay
        while (day <= endDay && samples.size + workouts.size < pageSize) {
            for (metric in metrics) {
                when (metric) {
                    MetricType.WORKOUT -> dailyWorkout(provider, athleteId, day)?.let { workouts += it }
                    MetricType.LOCATION -> Unit // GPS traces attach to workouts, not daily buckets
                    else -> samples += dailySample(provider, athleteId, metric, day)
                }
            }
            day++
        }
        val nextCursor = if (day <= endDay) day.toString() else null
        return ProviderPage(samples = samples, workouts = workouts, nextCursor = nextCursor)
    }

    private fun dailySample(
        provider: ProviderId,
        athleteId: String,
        metric: MetricType,
        day: Long,
    ): TelemetrySample {
        val seed = abs((provider.name + athleteId + metric.name + day).hashCode())
        val phase = (seed % 100) / 100.0
        val value = when (metric) {
            MetricType.HEART_RATE -> 58.0 + 10.0 * sin(day * 0.4 + phase)
            MetricType.RESTING_HEART_RATE -> 46.0 + 4.0 * sin(day * 0.2 + phase)
            MetricType.HRV -> 62.0 + 12.0 * sin(day * 0.3 + phase)
            MetricType.SLEEP -> 420.0 + 45.0 * sin(day * 0.5 + phase)
            MetricType.STEPS -> 8_000.0 + 3_000.0 * sin(day * 0.7 + phase)
            MetricType.CALORIES -> 2_300.0 + 400.0 * sin(day * 0.6 + phase)
            MetricType.DISTANCE -> 9_500.0 + 2_500.0 * sin(day * 0.45 + phase)
            MetricType.RESPIRATORY_RATE -> 14.0 + 2.0 * sin(day * 0.35 + phase)
            MetricType.SPO2 -> 96.5 + 1.5 * sin(day * 0.25 + phase)
            MetricType.BODY_TEMPERATURE -> 36.5 + 0.3 * sin(day * 0.3 + phase)
            MetricType.WEIGHT -> 72.0 + 0.8 * sin(day * 0.1 + phase)
            MetricType.STRESS -> 40.0 + 20.0 * sin(day * 0.55 + phase)
            MetricType.RECOVERY -> 70.0 + 18.0 * sin(day * 0.5 + phase)
            MetricType.TRAINING_LOAD -> 320.0 + 120.0 * sin(day * 0.4 + phase)
            MetricType.VO2_MAX -> 52.0 + 1.5 * sin(day * 0.05 + phase)
            else -> 50.0 + 10.0 * sin(day * 0.5 + phase)
        }
        val at = TelemetryInstant.utc(day * DAY_MS + 7 * HOUR_MS)
        val now = TelemetryInstant.now(clock)
        val sourceId = "${provider.name.lowercase()}-${metric.name.lowercase()}-$day"
        return TelemetrySample(
            id = "$athleteId-$sourceId",
            athleteId = athleteId,
            metric = metric,
            value = (value * 10).toLong() / 10.0,
            unit = CanonicalUnits.of(metric),
            at = at,
            provenance = Provenance(
                provider = provider,
                device = simulatedDeviceName(provider),
                deviceId = null,
                sourceRecordId = sourceId,
                originalUnit = CanonicalUnits.of(metric),
                syncedAt = now,
                createdAt = at,
                updatedAt = at,
                quality = DataQuality.UNKNOWN,
            ),
        )
    }

    private fun dailyWorkout(provider: ProviderId, athleteId: String, day: Long): WorkoutSession? {
        // Workouts on ~4 of 7 days, deterministic per day.
        if (day % 7L in setOf(2L, 5L, 6L)) return null
        val seed = abs((provider.name + athleteId + day).hashCode())
        val sportKey = listOf("running", "cycling", "swimming", "gym")[(seed % 4)]
        val start = TelemetryInstant.utc(day * DAY_MS + 17 * HOUR_MS)
        val durationMs = (45 + seed % 40) * 60_000L
        val end = start.plusMs(durationMs)
        val now = TelemetryInstant.now(clock)
        val sourceId = "${provider.name.lowercase()}-workout-$day"
        return WorkoutSession(
            id = "$athleteId-$sourceId",
            athleteId = athleteId,
            sportKey = sportKey,
            title = sportKey.replaceFirstChar { it.uppercase() } + " session",
            start = start,
            end = end,
            distanceMeters = if (sportKey == "gym") null else 5_000.0 + (seed % 8_000),
            calories = 350.0 + (seed % 400),
            avgHeartRate = 132.0 + (seed % 25),
            maxHeartRate = 165.0 + (seed % 20),
            avgPowerWatts = if (sportKey == "cycling") 210.0 + (seed % 60) else null,
            elevationGainMeters = if (sportKey == "running" || sportKey == "cycling") 80.0 + (seed % 300) else null,
            provenance = Provenance(
                provider = provider,
                device = simulatedDeviceName(provider),
                deviceId = null,
                sourceRecordId = sourceId,
                originalUnit = com.fitconnect.android.telemetry.units.TelemetryUnit.COUNT,
                syncedAt = now,
                createdAt = start,
                updatedAt = end,
            ),
        )
    }

    private fun simulatedDeviceName(provider: ProviderId): String = when (provider) {
        ProviderId.HEALTH_CONNECT -> "Pixel Watch (Health Connect)"
        ProviderId.GARMIN -> "Garmin Forerunner"
        ProviderId.WHOOP -> "WHOOP 4.0"
        ProviderId.OURA -> "Oura Ring Gen3"
        ProviderId.FITBIT -> "Fitbit Charge"
        ProviderId.POLAR -> "Polar Vantage"
        ProviderId.SAMSUNG_HEALTH -> "Galaxy Watch"
        ProviderId.STRAVA -> "Strava App"
        ProviderId.MANUAL -> "Manual entry"
    }

    private companion object {
        const val DAY_MS = 86_400_000L
        const val HOUR_MS = 3_600_000L
    }
}
