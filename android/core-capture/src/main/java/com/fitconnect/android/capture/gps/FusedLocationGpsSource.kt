package com.fitconnect.android.capture.gps

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.os.Looper
import com.fitconnect.android.capture.GpsFeedStatus
import com.fitconnect.shared.geo.RoutePoint
import com.fitconnect.shared.source.DataSourceKind
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

data class GpsFix(
    val point: RoutePoint,
    val feed: GpsFeedStatus,
    val isMock: Boolean,
)

/**
 * Real [FusedLocationProviderClient] binder.
 *
 * Sampling (documented, not premature-optimized):
 * - interval: 2000 ms
 * - minUpdateInterval: 1000 ms
 * - priority: PRIORITY_HIGH_ACCURACY
 * - minDisplacement: 0 m (filter jumps in GpsAccuracyFilter)
 */
class FusedLocationGpsSource(
    context: Context,
) {
    private val client = LocationServices.getFusedLocationProviderClient(context.applicationContext)

    @SuppressLint("MissingPermission")
    fun fixes(): Flow<GpsFix> = callbackFlow {
        val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, INTERVAL_MS)
            .setMinUpdateIntervalMillis(FASTEST_MS)
            .setMinUpdateDistanceMeters(0f)
            .setWaitForAccurateLocation(false)
            .build()

        val callback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                val loc = result.lastLocation ?: return
                trySend(loc.toGpsFix())
            }
        }
        client.requestLocationUpdates(request, callback, Looper.getMainLooper())
        awaitClose { client.removeLocationUpdates(callback) }
    }

    @SuppressLint("MissingPermission")
    fun stop() {
        // Updates removed via Flow awaitClose; retained for explicit stop hooks.
    }

    companion object {
        const val INTERVAL_MS = 2_000L
        const val FASTEST_MS = 1_000L
    }
}

fun Location.toGpsFix(): GpsFix {
    val mock = isFromMockProviderCompat()
    val feed = if (mock) GpsFeedStatus.EMULATOR_INJECTED else GpsFeedStatus.LIVE
    val source = if (mock) DataSourceKind.EMULATED_SENSOR else DataSourceKind.REAL_SENSOR
    val speed = if (hasSpeed() && speed >= 0f) speed.toDouble() else null
    val alt = if (hasAltitude()) altitude else null
    val acc = if (hasAccuracy()) accuracy.toDouble() else null
    return GpsFix(
        point = RoutePoint(
            latitude = latitude,
            longitude = longitude,
            timestampEpochMs = time,
            altitudeM = alt,
            accuracyM = acc,
            speedMps = speed,
            bearingDeg = if (hasBearing()) bearing.toDouble() else null,
            source = source,
        ),
        feed = feed,
        isMock = mock,
    )
}

private fun Location.isFromMockProviderCompat(): Boolean =
    runCatching { isFromMockProvider }.getOrDefault(false)
