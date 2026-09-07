package com.fitconnect.android.designui.maps

/**
 * Production-safe test hooks for map rendering.
 * E2E sets [forceCanvasFallback] so MapLibre never mounts under instrumentation
 * (MapView blocks Compose idle + can crash SlotWriter on Activity destroy).
 * GPS/Room capture is independent of this flag.
 */
object MapRenderHooks {
    @Volatile
    var forceCanvasFallback: Boolean = false
}
