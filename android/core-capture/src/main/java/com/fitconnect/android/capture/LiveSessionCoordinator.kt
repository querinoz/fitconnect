package com.fitconnect.android.capture

import com.fitconnect.shared.geo.RoutePoint
import com.fitconnect.shared.session.OwnershipResult
import com.fitconnect.shared.session.SessionLease
import com.fitconnect.shared.session.SessionOwnership
import com.fitconnect.shared.source.DataSourceKind
import com.fitconnect.shared.telemetry.TelemetryEnvelope
import com.fitconnect.shared.workout.WorkoutSport

/**
 * Merges watch telemetry into the phone engine without duplicating sessions.
 * START is gated by [SessionOwnership] so phone and watch cannot both own ACTIVE.
 */
class LiveSessionCoordinator(
    private val engine: LiveActivityEngine,
    private val deviceId: String = "phone",
) {
    @Volatile
    var lease: SessionLease? = null
        internal set

    @Volatile
    var lastBlockCode: String? = null
        private set

    fun claimLocalStart(
        sportKey: String,
        nowEpochMs: Long = System.currentTimeMillis(),
        sessionId: String = "$deviceId-$nowEpochMs",
    ): Boolean {
        val result = SessionOwnership.claimStart(
            current = lease,
            sessionId = sessionId,
            deviceId = deviceId,
            sportKey = sportKey,
            nowEpochMs = nowEpochMs,
        )
        return applyResult(result)
    }

    fun onRemoteEnvelope(envelope: TelemetryEnvelope) {
        val currentLease = lease
        if (currentLease != null &&
            SessionOwnership.isLocked(currentLease.session.state) &&
            envelope.deviceId != currentLease.ownerDeviceId &&
            envelope.deviceId != deviceId
        ) {
            lastBlockCode = SessionOwnership.SESSION_OWNED_BY
            return
        }
        val local = engine.state.value
        if (local.sessionId.isNotBlank() &&
            envelope.sessionId.isNotBlank() &&
            local.sessionId != envelope.sessionId &&
            (local.phase == LiveActivityPhase.RUNNING || local.phase == LiveActivityPhase.PAUSED)
        ) {
            return
        }
        if (local.phase == LiveActivityPhase.IDLE || local.phase == LiveActivityPhase.ENDED) {
            val claimed = SessionOwnership.claimStart(
                current = lease,
                sessionId = envelope.sessionId,
                deviceId = envelope.deviceId,
                sportKey = WorkoutSport.RUN.wireKey,
                nowEpochMs = envelope.timestampEpochMs,
            )
            if (!applyResult(claimed)) return
            if (!engine.adoptRemote(envelope.sessionId, WorkoutSport.RUN.wireKey)) return
        }
        adoptMetrics(envelope)
    }

    private fun applyResult(result: OwnershipResult): Boolean =
        when (result) {
            is OwnershipResult.Ok -> {
                lease = result.lease
                lastBlockCode = null
                true
            }
            is OwnershipResult.Blocked -> {
                lastBlockCode = result.code
                false
            }
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
