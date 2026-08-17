package com.fitconnect.android.capture

import com.fitconnect.shared.geo.RoutePoint
import com.fitconnect.shared.source.DataSourceKind
import com.fitconnect.shared.telemetry.TelemetryEnvelope
import com.fitconnect.shared.workout.WorkoutSport

/**
 * Merges watch telemetry into the phone engine without duplicating sessions.
 */
class LiveSessionCoordinator(
    private val engine: LiveActivityEngine,
) {
    fun onRemoteEnvelope(envelope: TelemetryEnvelope) {
        val local = engine.state.value
        if (local.sessionId.isNotBlank() &&
            envelope.sessionId.isNotBlank() &&
            local.sessionId != envelope.sessionId &&
            (local.phase == LiveActivityPhase.RUNNING || local.phase == LiveActivityPhase.PAUSED)
        ) {
            return
        }
        if (local.phase == LiveActivityPhase.IDLE || local.phase == LiveActivityPhase.ENDED) {
            if (!engine.adoptRemote(envelope.sessionId, WorkoutSport.RUN.wireKey)) return
        }
        adoptMetrics(envelope)
    }

    private fun adoptMetrics(envelope: TelemetryEnvelope) {
        val lat = envelope.samples.firstOrNull { it.metric == "LATITUDE" }?.value
        val lon = envelope.samples.firstOrNull { it.metric == "LONGITUDE" }?.value
        val ts = envelope.timestampEpochMs
        if (lat != null && lon != null) {
            engine.ingestFix(
                RoutePoint(
                    latitude = lat,
                    longitude = lon,
                    timestampEpochMs = ts,
                    source = envelope.source,
                ),
                feed = when (envelope.source) {
                    DataSourceKind.REAL_SENSOR -> GpsFeedStatus.LIVE
                    DataSourceKind.EMULATED_SENSOR -> GpsFeedStatus.EMULATOR_INJECTED
                    else -> GpsFeedStatus.SIMULATED
                },
            )
        }
    }
}
