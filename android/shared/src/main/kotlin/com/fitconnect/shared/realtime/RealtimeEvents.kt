package com.fitconnect.shared.realtime

import com.fitconnect.shared.source.DataSourceKind
import com.fitconnect.shared.telemetry.TelemetryEnvelope

sealed class FitConnectRealtimeEvent {
    abstract val atEpochMs: Long
    abstract val userId: String

    data class TelemetryUpdated(
        override val atEpochMs: Long,
        override val userId: String,
        val envelope: TelemetryEnvelope,
    ) : FitConnectRealtimeEvent()

    data class SessionStarted(
        override val atEpochMs: Long,
        override val userId: String,
        val sessionId: String,
        val sportKey: String,
    ) : FitConnectRealtimeEvent()

    data class SessionPaused(
        override val atEpochMs: Long,
        override val userId: String,
        val sessionId: String,
    ) : FitConnectRealtimeEvent()

    data class SessionResumed(
        override val atEpochMs: Long,
        override val userId: String,
        val sessionId: String,
    ) : FitConnectRealtimeEvent()

    data class SessionEnded(
        override val atEpochMs: Long,
        override val userId: String,
        val sessionId: String,
    ) : FitConnectRealtimeEvent()

    data class WatchConnected(
        override val atEpochMs: Long,
        override val userId: String,
        val deviceId: String,
        val source: DataSourceKind,
    ) : FitConnectRealtimeEvent()

    data class WatchDisconnected(
        override val atEpochMs: Long,
        override val userId: String,
        val deviceId: String,
    ) : FitConnectRealtimeEvent()
}
