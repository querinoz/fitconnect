package com.fitconnect.shared.wear

/** Versioned Wear Data Layer paths. Not a backend. */
object WearPaths {
    const val CAPABILITY = "fitconnect_telemetry"
    const val TELEMETRY_LIVE = "/telemetry/live"
    const val TELEMETRY_BATCH = "/telemetry/batch"
    const val SESSION_STATE = "/session/state"
    const val SESSION_CONTROL = "/session/control"
    const val WATCH_STATUS = "/watch/status"
    const val SYNC_STATUS = "/sync/status"
    const val SYNC_METRICS = "/sync/metrics"
    const val SYNC_ROUTE = "/sync/route"
    const val SYNC_HEALTH = "/sync/health"
    const val SYNC_PROFILE = "/sync/profile"
    const val SCHEMA = "telemetry.v1"
    const val ASCEND_SNAPSHOT = "/ascend/snapshot"
}
