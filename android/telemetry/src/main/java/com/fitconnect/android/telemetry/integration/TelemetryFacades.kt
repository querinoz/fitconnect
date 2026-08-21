package com.fitconnect.android.telemetry.integration

import com.fitconnect.android.telemetry.aggregate.AggregateSeries
import com.fitconnect.android.telemetry.aggregate.AggregationEngine
import com.fitconnect.android.telemetry.aggregate.Bucket
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.ProviderId
import com.fitconnect.android.telemetry.domain.TelemetrySample
import com.fitconnect.android.telemetry.domain.WorkoutSession
import com.fitconnect.android.telemetry.privacy.TelemetryPrivacyManager
import com.fitconnect.android.telemetry.store.TelemetryStore
import com.fitconnect.android.telemetry.time.TelemetryClock
import com.fitconnect.android.telemetry.time.TelemetryInstant
import com.fitconnect.android.telemetry.time.TimeRange

/** Readiness-relevant vitals consumed by Athlete OS / Sports Engine. */
data class ReadinessVitals(
    val hrvMs: Double?,
    val sleepMinutes: Double?,
    val restingHr: Double?,
    val trainingLoad: Double?,
)

data class TelemetryOverview(
    val sampleCount: Int,
    val coveredMetrics: Set<MetricType>,
    val latestHeartRate: TelemetrySample?,
    val latestHrv: TelemetrySample?,
    val latestSleep: TelemetrySample?,
    val latestRecovery: TelemetrySample?,
    val latestWeight: TelemetrySample?,
    val latestSteps: TelemetrySample?,
    val latestCalories: TelemetrySample?,
    val latestDistance: TelemetrySample?,
    val recentWorkouts: List<WorkoutSession>,
)

/**
 * Athlete OS entry point to normalized telemetry. No provider identifiers are
 * required to use anything here.
 */
class AthleteTelemetryFacade(
    private val store: TelemetryStore,
    private val aggregation: AggregationEngine,
    private val clock: TelemetryClock,
) {
    suspend fun readinessVitals(athleteId: String): ReadinessVitals = ReadinessVitals(
        hrvMs = store.latestSample(athleteId, MetricType.HRV)?.value,
        sleepMinutes = store.latestSample(athleteId, MetricType.SLEEP)?.value,
        restingHr = store.latestSample(athleteId, MetricType.RESTING_HEART_RATE)?.value,
        trainingLoad = store.latestSample(athleteId, MetricType.TRAINING_LOAD)?.value,
    )

    /** ML / coach-adjacent summaries never include STRAVA rows (AGENTS.md §1). */
    suspend fun readinessVitalsForModels(athleteId: String): ReadinessVitals {
        val banned = setOf(ProviderId.STRAVA)
        return ReadinessVitals(
            hrvMs = store.latestSampleExcluding(athleteId, MetricType.HRV, banned)?.value,
            sleepMinutes = store.latestSampleExcluding(athleteId, MetricType.SLEEP, banned)?.value,
            restingHr = store.latestSampleExcluding(athleteId, MetricType.RESTING_HEART_RATE, banned)?.value,
            trainingLoad = store.latestSampleExcluding(athleteId, MetricType.TRAINING_LOAD, banned)?.value,
        )
    }

    suspend fun overview(athleteId: String, recentDays: Int = 7): TelemetryOverview {
        val now = TelemetryInstant.now(clock)
        val recent = TimeRange(now.plusMs(-recentDays * DAY_MS), now)
        return TelemetryOverview(
            sampleCount = store.countSamples(athleteId),
            coveredMetrics = store.coveredMetrics(athleteId),
            latestHeartRate = store.latestSample(athleteId, MetricType.HEART_RATE),
            latestHrv = store.latestSample(athleteId, MetricType.HRV),
            latestSleep = store.latestSample(athleteId, MetricType.SLEEP),
            latestRecovery = store.latestSample(athleteId, MetricType.RECOVERY),
            latestWeight = store.latestSample(athleteId, MetricType.WEIGHT),
            latestSteps = store.latestSample(athleteId, MetricType.STEPS),
            latestCalories = store.latestSample(athleteId, MetricType.CALORIES),
            latestDistance = store.latestSample(athleteId, MetricType.DISTANCE),
            recentWorkouts = store.workouts(athleteId, recent, limit = 10).items,
        )
    }

    suspend fun trend(athleteId: String, metric: MetricType, days: Int, bucket: Bucket = Bucket.DAILY): AggregateSeries {
        val now = TelemetryInstant.now(clock)
        return aggregation.aggregate(athleteId, metric, TimeRange(now.plusMs(-days * DAY_MS), now), bucket)
    }

    suspend fun workouts(athleteId: String, days: Int): List<WorkoutSession> {
        val now = TelemetryInstant.now(clock)
        return store.workouts(athleteId, TimeRange(now.plusMs(-days * DAY_MS), now), limit = 100).items
    }

    private companion object {
        const val DAY_MS = 86_400_000L
    }
}

data class CoachAthleteTelemetry(
    val athleteId: String,
    val sharedMetrics: Set<MetricType>,
    val vitals: Map<MetricType, Double>,
    val trends: Map<MetricType, Double>,
)

/**
 * Coach OS entry point. Every metric passes the privacy manager's
 * authorization check — unauthorized metrics simply do not appear.
 */
class CoachTelemetryFacade(
    private val store: TelemetryStore,
    private val aggregation: AggregationEngine,
    private val privacy: TelemetryPrivacyManager,
    private val clock: TelemetryClock,
) {
    suspend fun athleteTelemetry(coachId: String, athleteId: String): CoachAthleteTelemetry {
        val shared = privacy.sharedMetricsFor(coachId, athleteId)
        val vitals = mutableMapOf<MetricType, Double>()
        val trends = mutableMapOf<MetricType, Double>()
        val now = TelemetryInstant.now(clock)
        for (metric in shared) {
            if (!privacy.coachMayRead(coachId, athleteId, metric)) continue
            store.latestSampleExcluding(
                athleteId,
                metric,
                setOf(com.fitconnect.android.telemetry.domain.ProviderId.STRAVA),
            )?.let { vitals[metric] = it.value }
            val series = aggregation.aggregate(
                athleteId, metric,
                TimeRange(now.plusMs(-14 * DAY_MS), now), Bucket.DAILY,
            )
            series.trendDelta()?.let { trends[metric] = it }
        }
        return CoachAthleteTelemetry(athleteId, shared, vitals, trends)
    }

    private companion object {
        const val DAY_MS = 86_400_000L
    }
}

/**
 * Sports Engine bridge: maps canonical telemetry onto per-sport metric keys.
 * Telemetry provides data; :sports interprets sport context.
 */
class SportsTelemetryBridge(private val store: TelemetryStore, private val clock: TelemetryClock) {

    /** Which canonical metrics matter per sport key (mirrors :sports metric schemas). */
    private val sportMetrics: Map<String, Set<MetricType>> = mapOf(
        "running" to setOf(MetricType.PACE, MetricType.CADENCE, MetricType.HEART_RATE, MetricType.POWER, MetricType.ELEVATION, MetricType.DISTANCE),
        "cycling" to setOf(MetricType.POWER, MetricType.CADENCE, MetricType.SPEED, MetricType.HEART_RATE, MetricType.ELEVATION),
        "swimming" to setOf(MetricType.CADENCE, MetricType.DISTANCE, MetricType.HEART_RATE),
        "football" to setOf(MetricType.DISTANCE, MetricType.SPEED, MetricType.HEART_RATE),
    )

    fun metricsFor(sportKey: String): Set<MetricType> =
        sportMetrics[sportKey] ?: setOf(MetricType.HEART_RATE, MetricType.CALORIES, MetricType.DISTANCE)

    /** Session-level values the Sports Engine can feed into its analyzers. */
    suspend fun sessionMetrics(athleteId: String, workout: WorkoutSession): Map<MetricType, Double> {
        val values = mutableMapOf<MetricType, Double>()
        workout.avgHeartRate?.let { values[MetricType.HEART_RATE] = it }
        workout.avgPowerWatts?.let { values[MetricType.POWER] = it }
        workout.distanceMeters?.let { values[MetricType.DISTANCE] = it }
        workout.elevationGainMeters?.let { values[MetricType.ELEVATION] = it }
        workout.calories?.let { values[MetricType.CALORIES] = it }
        if (workout.distanceMeters != null && workout.durationMs > 0) {
            val km = workout.distanceMeters / 1000.0
            if (km > 0) values[MetricType.PACE] = (workout.durationMs / 1000.0) / km
        }
        return values.filterKeys { it in metricsFor(workout.sportKey) + setOf(MetricType.CALORIES) }
    }

    suspend fun recentWorkouts(athleteId: String, days: Int): List<WorkoutSession> {
        val now = TelemetryInstant.now(clock)
        return store.workouts(athleteId, TimeRange(now.plusMs(-days * 86_400_000L), now), limit = 100).items
    }
}
