package com.fitconnect.shared.telemetry

/** Missing hardware is [UNAVAILABLE], never a fabricated zero. */
enum class MetricAvailability {
    AVAILABLE,
    NEEDS_UPDATE,
    UNAVAILABLE,
    PERMISSION_DENIED,
    PERMISSION_REQUIRED,
    UNSUPPORTED,
    SYNCING,
    FAILED,
}
