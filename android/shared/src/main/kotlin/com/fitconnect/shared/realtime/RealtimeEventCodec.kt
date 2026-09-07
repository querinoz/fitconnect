package com.fitconnect.shared.realtime

import org.json.JSONObject

/**
 * Canonical mobile realtime payload codec (JSON string over RealtimeClient).
 * Native Android must not use BroadcastChannel.
 */
object RealtimeEventCodec {
    fun encode(event: FitConnectRealtimeEvent): String {
        val o = JSONObject()
            .put("atEpochMs", event.atEpochMs)
            .put("userId", event.userId)
        when (event) {
            is FitConnectRealtimeEvent.SessionStarted -> {
                o.put("type", "session.started")
                    .put("sessionId", event.sessionId)
                    .put("sportKey", event.sportKey)
            }
            is FitConnectRealtimeEvent.SessionPaused -> {
                o.put("type", "session.paused").put("sessionId", event.sessionId)
            }
            is FitConnectRealtimeEvent.SessionResumed -> {
                o.put("type", "session.resumed").put("sessionId", event.sessionId)
            }
            is FitConnectRealtimeEvent.SessionEnded -> {
                o.put("type", "session.ended").put("sessionId", event.sessionId)
            }
            is FitConnectRealtimeEvent.WatchConnected -> {
                o.put("type", "watch.connected")
                    .put("deviceId", event.deviceId)
                    .put("source", event.source.name)
            }
            is FitConnectRealtimeEvent.WatchDisconnected -> {
                o.put("type", "watch.disconnected").put("deviceId", event.deviceId)
            }
            is FitConnectRealtimeEvent.TelemetryUpdated -> {
                // Envelope is domain-specific; encode a thin signal only.
                o.put("type", "telemetry.updated")
                    .put("hasEnvelope", true)
            }
        }
        return o.toString()
    }

    fun decode(payload: String): FitConnectRealtimeEvent? {
        return runCatching {
            val o = JSONObject(payload)
            val at = o.getLong("atEpochMs")
            val userId = o.getString("userId")
            when (o.getString("type")) {
                "session.started" -> FitConnectRealtimeEvent.SessionStarted(
                    atEpochMs = at,
                    userId = userId,
                    sessionId = o.getString("sessionId"),
                    sportKey = o.optString("sportKey", "unknown"),
                )
                "session.paused" -> FitConnectRealtimeEvent.SessionPaused(
                    atEpochMs = at,
                    userId = userId,
                    sessionId = o.getString("sessionId"),
                )
                "session.resumed" -> FitConnectRealtimeEvent.SessionResumed(
                    atEpochMs = at,
                    userId = userId,
                    sessionId = o.getString("sessionId"),
                )
                "session.ended" -> FitConnectRealtimeEvent.SessionEnded(
                    atEpochMs = at,
                    userId = userId,
                    sessionId = o.getString("sessionId"),
                )
                "watch.connected" -> FitConnectRealtimeEvent.WatchConnected(
                    atEpochMs = at,
                    userId = userId,
                    deviceId = o.getString("deviceId"),
                    source = com.fitconnect.shared.source.DataSourceKind.valueOf(
                        o.optString("source", "HEALTH_CONNECT"),
                    ),
                )
                "watch.disconnected" -> FitConnectRealtimeEvent.WatchDisconnected(
                    atEpochMs = at,
                    userId = userId,
                    deviceId = o.getString("deviceId"),
                )
                else -> null
            }
        }.getOrNull()
    }
}
