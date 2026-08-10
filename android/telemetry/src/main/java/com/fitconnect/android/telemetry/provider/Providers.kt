package com.fitconnect.android.telemetry.provider

import com.fitconnect.android.telemetry.capability.ProviderCapabilities
import com.fitconnect.android.telemetry.domain.MetricType
import com.fitconnect.android.telemetry.domain.ProviderId

/**
 * Health Connect — first-class Android integration. Runs in simulated mode
 * until the androidx.health.connect client dependency + device support is
 * wired; the contract, capability surface and permission states are final.
 */
class HealthConnectProvider(source: SimulatedProviderSource) :
    BaseSimulatedProvider(ProviderId.HEALTH_CONNECT, "Health Connect", source) {

    override fun capabilities(): ProviderCapabilities = ProviderCapabilities(
        provider = ProviderId.HEALTH_CONNECT,
        readableMetrics = setOf(
            MetricType.HEART_RATE, MetricType.RESTING_HEART_RATE, MetricType.HRV,
            MetricType.SLEEP, MetricType.STEPS, MetricType.CALORIES, MetricType.DISTANCE,
            MetricType.ELEVATION, MetricType.RESPIRATORY_RATE, MetricType.SPO2,
            MetricType.BODY_TEMPERATURE, MetricType.WEIGHT, MetricType.BODY_COMPOSITION,
            MetricType.VO2_MAX, MetricType.POWER, MetricType.CADENCE, MetricType.SPEED,
            MetricType.BLOOD_PRESSURE, MetricType.WORKOUT,
        ),
        writableMetrics = setOf(MetricType.WORKOUT, MetricType.WEIGHT),
        supportsHistoricalData = true,
        supportsBackgroundSync = true,
        supportsWorkoutImport = true,
        supportsGps = true,
        supportsDeletion = true,
        maxHistoryDays = 30,
    )
}

class GarminProvider(source: SimulatedProviderSource) :
    BaseSimulatedProvider(ProviderId.GARMIN, "Garmin", source) {

    override fun capabilities(): ProviderCapabilities = ProviderCapabilities(
        provider = ProviderId.GARMIN,
        readableMetrics = setOf(
            MetricType.HEART_RATE, MetricType.RESTING_HEART_RATE, MetricType.HRV,
            MetricType.SLEEP, MetricType.STEPS, MetricType.CALORIES, MetricType.DISTANCE,
            MetricType.ELEVATION, MetricType.POWER, MetricType.CADENCE, MetricType.SPEED,
            MetricType.STRESS, MetricType.TRAINING_LOAD, MetricType.VO2_MAX,
            MetricType.RESPIRATORY_RATE, MetricType.SPO2, MetricType.WORKOUT,
        ),
        supportsHistoricalData = true,
        supportsBackgroundSync = true,
        supportsWorkoutImport = true,
        supportsGps = true,
        rateLimitPerHour = 100,
    )
}

class WhoopProvider(source: SimulatedProviderSource) :
    BaseSimulatedProvider(ProviderId.WHOOP, "WHOOP", source) {

    override fun capabilities(): ProviderCapabilities = ProviderCapabilities(
        provider = ProviderId.WHOOP,
        readableMetrics = setOf(
            MetricType.HEART_RATE, MetricType.RESTING_HEART_RATE, MetricType.HRV,
            MetricType.SLEEP, MetricType.RECOVERY, MetricType.STRESS,
            MetricType.RESPIRATORY_RATE, MetricType.SPO2, MetricType.BODY_TEMPERATURE,
            MetricType.CALORIES, MetricType.TRAINING_LOAD, MetricType.WORKOUT,
        ),
        supportsHistoricalData = true,
        supportsWorkoutImport = true,
        rateLimitPerHour = 60,
    )
}

class OuraProvider(source: SimulatedProviderSource) :
    BaseSimulatedProvider(ProviderId.OURA, "Oura", source) {

    override fun capabilities(): ProviderCapabilities = ProviderCapabilities(
        provider = ProviderId.OURA,
        readableMetrics = setOf(
            MetricType.HEART_RATE, MetricType.RESTING_HEART_RATE, MetricType.HRV,
            MetricType.SLEEP, MetricType.READINESS, MetricType.RECOVERY,
            MetricType.BODY_TEMPERATURE, MetricType.RESPIRATORY_RATE,
            MetricType.STEPS, MetricType.CALORIES,
        ),
        supportsHistoricalData = true,
        rateLimitPerHour = 60,
    )
}

class FitbitProvider(source: SimulatedProviderSource) :
    BaseSimulatedProvider(ProviderId.FITBIT, "Fitbit", source) {

    override fun capabilities(): ProviderCapabilities = ProviderCapabilities(
        provider = ProviderId.FITBIT,
        readableMetrics = setOf(
            MetricType.HEART_RATE, MetricType.RESTING_HEART_RATE, MetricType.HRV,
            MetricType.SLEEP, MetricType.STEPS, MetricType.CALORIES,
            MetricType.DISTANCE, MetricType.SPO2, MetricType.WEIGHT, MetricType.WORKOUT,
        ),
        supportsHistoricalData = true,
        supportsWorkoutImport = true,
        rateLimitPerHour = 150,
    )
}

class PolarProvider(source: SimulatedProviderSource) :
    BaseSimulatedProvider(ProviderId.POLAR, "Polar", source) {

    override fun capabilities(): ProviderCapabilities = ProviderCapabilities(
        provider = ProviderId.POLAR,
        readableMetrics = setOf(
            MetricType.HEART_RATE, MetricType.HRV, MetricType.SLEEP,
            MetricType.RECOVERY, MetricType.TRAINING_LOAD, MetricType.CALORIES,
            MetricType.DISTANCE, MetricType.CADENCE, MetricType.SPEED, MetricType.WORKOUT,
        ),
        supportsHistoricalData = true,
        supportsWorkoutImport = true,
        supportsGps = true,
    )
}

class SamsungHealthProvider(source: SimulatedProviderSource) :
    BaseSimulatedProvider(ProviderId.SAMSUNG_HEALTH, "Samsung Health", source) {

    override fun capabilities(): ProviderCapabilities = ProviderCapabilities(
        provider = ProviderId.SAMSUNG_HEALTH,
        readableMetrics = setOf(
            MetricType.HEART_RATE, MetricType.SLEEP, MetricType.STEPS,
            MetricType.CALORIES, MetricType.DISTANCE, MetricType.SPO2,
            MetricType.STRESS, MetricType.WEIGHT, MetricType.BODY_COMPOSITION,
            MetricType.WORKOUT,
        ),
        supportsHistoricalData = true,
        supportsBackgroundSync = true,
        supportsWorkoutImport = true,
    )
}

class StravaProvider(source: SimulatedProviderSource) :
    BaseSimulatedProvider(ProviderId.STRAVA, "Strava", source) {

    override fun capabilities(): ProviderCapabilities = ProviderCapabilities(
        provider = ProviderId.STRAVA,
        readableMetrics = setOf(
            MetricType.WORKOUT, MetricType.DISTANCE, MetricType.ELEVATION,
            MetricType.HEART_RATE, MetricType.POWER, MetricType.CADENCE, MetricType.SPEED,
        ),
        supportsHistoricalData = true,
        supportsWorkoutImport = true,
        supportsGps = true,
        rateLimitPerHour = 100,
    )
}
