package com.fitconnect.shared.geo

import com.fitconnect.shared.source.DataSourceKind
import kotlin.math.asin
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

data class RoutePoint(
    val latitude: Double,
    val longitude: Double,
    val timestampEpochMs: Long,
    val altitudeM: Double? = null,
    val accuracyM: Double? = null,
    val speedMps: Double? = null,
    val bearingDeg: Double? = null,
    val heartRateBpm: Int? = null,
    val source: DataSourceKind = DataSourceKind.LOCAL_DEMO,
) {
    init {
        require(latitude in -90.0..90.0) { "latitude out of range" }
        require(longitude in -180.0..180.0) { "longitude out of range" }
    }
}

data class RouteSummary(
    val distanceM: Double,
    val elevationGainM: Double,
    val elevationLossM: Double,
    val movingMs: Long,
    val elapsedMs: Long,
    val averagePaceSecPerKm: Double?,
    val bestPaceSecPerKm: Double?,
    val averageSpeedMps: Double?,
)

data class WorkoutLap(
    val index: Int,
    val startedAtEpochMs: Long,
    val endedAtEpochMs: Long,
    val distanceM: Double,
)

object RouteMath {
    private const val EARTH_RADIUS_M = 6_371_000.0

    fun haversineM(a: RoutePoint, b: RoutePoint): Double =
        haversineM(a.latitude, a.longitude, b.latitude, b.longitude)

    fun haversineM(
        lat1: Double,
        lon1: Double,
        lat2: Double,
        lon2: Double,
    ): Double {
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val rLat1 = Math.toRadians(lat1)
        val rLat2 = Math.toRadians(lat2)
        val h = sin(dLat / 2).let { it * it } +
            cos(rLat1) * cos(rLat2) * sin(dLon / 2).let { it * it }
        return 2 * EARTH_RADIUS_M * asin(sqrt(h.coerceIn(0.0, 1.0)))
    }

    fun bearingDeg(from: RoutePoint, to: RoutePoint): Double {
        val lat1 = Math.toRadians(from.latitude)
        val lat2 = Math.toRadians(to.latitude)
        val dLon = Math.toRadians(to.longitude - from.longitude)
        val y = sin(dLon) * cos(lat2)
        val x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dLon)
        val deg = Math.toDegrees(atan2(y, x))
        return (deg + 360.0) % 360.0
    }

    fun interpolate(a: RoutePoint, b: RoutePoint, fraction: Double, timestampEpochMs: Long): RoutePoint {
        val t = fraction.coerceIn(0.0, 1.0)
        return RoutePoint(
            latitude = a.latitude + (b.latitude - a.latitude) * t,
            longitude = a.longitude + (b.longitude - a.longitude) * t,
            timestampEpochMs = timestampEpochMs,
            altitudeM = lerpNullable(a.altitudeM, b.altitudeM, t),
            accuracyM = a.accuracyM,
            speedMps = lerpNullable(a.speedMps, b.speedMps, t),
            bearingDeg = bearingDeg(a, b),
            heartRateBpm = b.heartRateBpm ?: a.heartRateBpm,
            source = a.source,
        )
    }

    fun pointAlong(path: List<RoutePoint>, distanceM: Double, timestampEpochMs: Long): RoutePoint? {
        if (path.isEmpty()) return null
        if (path.size == 1 || distanceM <= 0.0) return path.first().copy(timestampEpochMs = timestampEpochMs)
        var remaining = distanceM
        for (i in 0 until path.lastIndex) {
            val a = path[i]
            val b = path[i + 1]
            val seg = haversineM(a, b)
            if (remaining <= seg || i == path.lastIndex - 1) {
                val frac = if (seg <= 0.0) 1.0 else (remaining / seg).coerceIn(0.0, 1.0)
                return interpolate(a, b, frac, timestampEpochMs)
            }
            remaining -= seg
        }
        return path.last().copy(timestampEpochMs = timestampEpochMs)
    }

    fun polylineDistanceM(path: List<RoutePoint>): Double {
        if (path.size < 2) return 0.0
        var total = 0.0
        for (i in 1 until path.size) total += haversineM(path[i - 1], path[i])
        return total
    }

    fun elevation(path: List<RoutePoint>): Pair<Double, Double> {
        var gain = 0.0
        var loss = 0.0
        for (i in 1 until path.size) {
            val prev = path[i - 1].altitudeM ?: continue
            val next = path[i].altitudeM ?: continue
            val delta = next - prev
            if (delta > 0) gain += delta else loss += -delta
        }
        return gain to loss
    }

    fun summary(
        path: List<RoutePoint>,
        movingMs: Long,
        elapsedMs: Long,
    ): RouteSummary {
        val distance = polylineDistanceM(path)
        val (gain, loss) = elevation(path)
        val movingSec = movingMs / 1000.0
        val avgSpeed = if (movingSec > 0) distance / movingSec else null
        val avgPace = if (distance > 1.0 && movingSec > 0) movingSec / (distance / 1000.0) else null
        var bestPace: Double? = null
        for (i in 1 until path.size) {
            val dt = (path[i].timestampEpochMs - path[i - 1].timestampEpochMs).coerceAtLeast(1L) / 1000.0
            val d = haversineM(path[i - 1], path[i])
            if (d < 8.0) continue
            val pace = dt / (d / 1000.0)
            bestPace = bestPace?.let { minOf(it, pace) } ?: pace
        }
        return RouteSummary(
            distanceM = distance,
            elevationGainM = gain,
            elevationLossM = loss,
            movingMs = movingMs,
            elapsedMs = elapsedMs,
            averagePaceSecPerKm = avgPace,
            bestPaceSecPerKm = bestPace,
            averageSpeedMps = avgSpeed,
        )
    }

    fun replayPoint(path: List<RoutePoint>, fraction: Float): RoutePoint? {
        if (path.isEmpty()) return null
        if (path.size == 1) return path.first()
        val t = fraction.coerceIn(0f, 1f)
        val total = polylineDistanceM(path)
        return pointAlong(path, total * t, path.last().timestampEpochMs)
    }

    private fun lerpNullable(a: Double?, b: Double?, t: Double): Double? {
        if (a == null && b == null) return null
        return (a ?: b!!) + ((b ?: a!!) - (a ?: b!!)) * t
    }
}

/**
 * Deterministic 5-point QA route: START → 500 m → 1 km → 1.5 km → FINISH (~2 km).
 * LOCAL_DEMO / emulator fixture only — never labeled REAL_SENSOR.
 */
object QaGpsRoute {
    /** Lisbon river-north corridor — public coordinates, not a vendor asset. */
    val POINTS: List<RoutePoint> = listOf(
        RoutePoint(38.722300, -9.139300, 0L, altitudeM = 80.0, accuracyM = 8.0, source = DataSourceKind.TEST_FIXTURE),
        RoutePoint(38.726800, -9.139300, 0L, altitudeM = 86.0, accuracyM = 8.0, source = DataSourceKind.TEST_FIXTURE),
        RoutePoint(38.731300, -9.139300, 0L, altitudeM = 97.0, accuracyM = 8.0, source = DataSourceKind.TEST_FIXTURE),
        RoutePoint(38.735800, -9.139300, 0L, altitudeM = 91.0, accuracyM = 8.0, source = DataSourceKind.TEST_FIXTURE),
        RoutePoint(38.740300, -9.139300, 0L, altitudeM = 94.0, accuracyM = 8.0, source = DataSourceKind.TEST_FIXTURE),
    )

    /** Fixture HR curve used only in tests — never a Health Services reading. */
    val HR_FIXTURE_BPM: IntArray = intArrayOf(120, 135, 148, 165, 178)

    val lengthM: Double get() = RouteMath.polylineDistanceM(POINTS)
}
