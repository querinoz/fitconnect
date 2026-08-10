package com.fitconnect.android.telemetry.units

import com.fitconnect.android.telemetry.domain.MetricType

/**
 * Centralized unit system. Conversions are explicit — there is no implicit
 * coercion anywhere else in the codebase.
 */
enum class TelemetryUnit(val symbol: String) {
    BPM("bpm"),
    MILLISECONDS("ms"),
    SECONDS("s"),
    MINUTES("min"),
    HOURS("h"),
    METERS("m"),
    KILOMETERS("km"),
    MILES("mi"),
    FEET("ft"),
    METERS_PER_SECOND("m/s"),
    KM_PER_HOUR("km/h"),
    MILES_PER_HOUR("mph"),
    SECONDS_PER_KM("s/km"),
    CALORIES("cal"),
    KILOCALORIES("kcal"),
    KILOGRAMS("kg"),
    POUNDS("lb"),
    CELSIUS("°C"),
    FAHRENHEIT("°F"),
    PERCENT("%"),
    WATTS("W"),
    RPM("rpm"),
    STEPS("steps"),
    MMHG("mmHg"),
    ML_PER_KG_MIN("ml/kg/min"),
    SCORE("score"),
    COUNT("count"),
}

enum class UnitSystem { METRIC, IMPERIAL }

class UnitConversionException(message: String) : IllegalArgumentException(message)

/**
 * Explicit conversion table. Unsupported pairs throw [UnitConversionException]
 * instead of silently passing values through.
 */
object UnitConverter {

    private data class Pair(val from: TelemetryUnit, val to: TelemetryUnit)

    private val linear: Map<Pair, Double> = buildMap {
        // duration
        put(Pair(TelemetryUnit.MILLISECONDS, TelemetryUnit.SECONDS), 1.0 / 1000.0)
        put(Pair(TelemetryUnit.SECONDS, TelemetryUnit.MINUTES), 1.0 / 60.0)
        put(Pair(TelemetryUnit.MINUTES, TelemetryUnit.HOURS), 1.0 / 60.0)
        put(Pair(TelemetryUnit.SECONDS, TelemetryUnit.MILLISECONDS), 1000.0)
        put(Pair(TelemetryUnit.MINUTES, TelemetryUnit.SECONDS), 60.0)
        put(Pair(TelemetryUnit.HOURS, TelemetryUnit.MINUTES), 60.0)
        put(Pair(TelemetryUnit.MILLISECONDS, TelemetryUnit.MINUTES), 1.0 / 60_000.0)
        put(Pair(TelemetryUnit.MINUTES, TelemetryUnit.MILLISECONDS), 60_000.0)
        // distance
        put(Pair(TelemetryUnit.METERS, TelemetryUnit.KILOMETERS), 0.001)
        put(Pair(TelemetryUnit.KILOMETERS, TelemetryUnit.METERS), 1000.0)
        put(Pair(TelemetryUnit.METERS, TelemetryUnit.MILES), 1.0 / 1609.344)
        put(Pair(TelemetryUnit.MILES, TelemetryUnit.METERS), 1609.344)
        put(Pair(TelemetryUnit.KILOMETERS, TelemetryUnit.MILES), 1.0 / 1.609344)
        put(Pair(TelemetryUnit.MILES, TelemetryUnit.KILOMETERS), 1.609344)
        put(Pair(TelemetryUnit.METERS, TelemetryUnit.FEET), 3.280839895)
        put(Pair(TelemetryUnit.FEET, TelemetryUnit.METERS), 1.0 / 3.280839895)
        // speed
        put(Pair(TelemetryUnit.METERS_PER_SECOND, TelemetryUnit.KM_PER_HOUR), 3.6)
        put(Pair(TelemetryUnit.KM_PER_HOUR, TelemetryUnit.METERS_PER_SECOND), 1.0 / 3.6)
        put(Pair(TelemetryUnit.METERS_PER_SECOND, TelemetryUnit.MILES_PER_HOUR), 2.236936292)
        put(Pair(TelemetryUnit.MILES_PER_HOUR, TelemetryUnit.METERS_PER_SECOND), 1.0 / 2.236936292)
        // energy
        put(Pair(TelemetryUnit.CALORIES, TelemetryUnit.KILOCALORIES), 0.001)
        put(Pair(TelemetryUnit.KILOCALORIES, TelemetryUnit.CALORIES), 1000.0)
        // mass
        put(Pair(TelemetryUnit.KILOGRAMS, TelemetryUnit.POUNDS), 2.2046226218)
        put(Pair(TelemetryUnit.POUNDS, TelemetryUnit.KILOGRAMS), 1.0 / 2.2046226218)
    }

    fun convert(value: Double, from: TelemetryUnit, to: TelemetryUnit): Double {
        if (from == to) return value
        linear[Pair(from, to)]?.let { return value * it }
        // temperature (affine, not linear)
        if (from == TelemetryUnit.CELSIUS && to == TelemetryUnit.FAHRENHEIT) return value * 9.0 / 5.0 + 32.0
        if (from == TelemetryUnit.FAHRENHEIT && to == TelemetryUnit.CELSIUS) return (value - 32.0) * 5.0 / 9.0
        throw UnitConversionException("No conversion from ${from.symbol} to ${to.symbol}")
    }

    fun canConvert(from: TelemetryUnit, to: TelemetryUnit): Boolean =
        from == to ||
            linear.containsKey(Pair(from, to)) ||
            (from == TelemetryUnit.CELSIUS && to == TelemetryUnit.FAHRENHEIT) ||
            (from == TelemetryUnit.FAHRENHEIT && to == TelemetryUnit.CELSIUS)
}

/** Canonical storage unit per metric — the single unit persisted in the store. */
object CanonicalUnits {
    fun of(metric: MetricType): TelemetryUnit =
        when (metric) {
            MetricType.HEART_RATE, MetricType.RESTING_HEART_RATE -> TelemetryUnit.BPM
            MetricType.HRV -> TelemetryUnit.MILLISECONDS
            MetricType.SLEEP -> TelemetryUnit.MINUTES
            MetricType.STEPS -> TelemetryUnit.STEPS
            MetricType.CALORIES -> TelemetryUnit.KILOCALORIES
            MetricType.DISTANCE, MetricType.ELEVATION -> TelemetryUnit.METERS
            MetricType.LOCATION -> TelemetryUnit.COUNT
            MetricType.POWER -> TelemetryUnit.WATTS
            MetricType.CADENCE -> TelemetryUnit.RPM
            MetricType.PACE -> TelemetryUnit.SECONDS_PER_KM
            MetricType.SPEED -> TelemetryUnit.METERS_PER_SECOND
            MetricType.RESPIRATORY_RATE -> TelemetryUnit.COUNT
            MetricType.SPO2, MetricType.BODY_COMPOSITION -> TelemetryUnit.PERCENT
            MetricType.BODY_TEMPERATURE -> TelemetryUnit.CELSIUS
            MetricType.WEIGHT -> TelemetryUnit.KILOGRAMS
            MetricType.BLOOD_PRESSURE -> TelemetryUnit.MMHG
            MetricType.STRESS, MetricType.RECOVERY, MetricType.READINESS, MetricType.TRAINING_LOAD -> TelemetryUnit.SCORE
            MetricType.VO2_MAX -> TelemetryUnit.ML_PER_KG_MIN
            MetricType.WORKOUT -> TelemetryUnit.COUNT
        }
}
