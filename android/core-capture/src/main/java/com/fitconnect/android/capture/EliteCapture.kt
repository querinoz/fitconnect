package com.fitconnect.android.capture

/**
 * Elite Capture — module entry point placeholder.
 *
 * F4 replaces this with the recording engine: a Foreground Service
 * (`location` + `health` types), FusedLocationProvider + barometer streams,
 * and append-only persistence per point so an activity survives process
 * death and reboot. All metric computation is delegated to elite-core
 * (Rust, via JNI) — zero calculations live in Kotlin (ADR-006).
 */
object EliteCapture {
    const val MODULE: String = "core-capture"
}
