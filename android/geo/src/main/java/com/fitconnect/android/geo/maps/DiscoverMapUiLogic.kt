package com.fitconnect.android.geo.maps

import com.fitconnect.android.geo.location.LocationPermissionState

/**
 * Discover / marketplace map strip states.
 * Never invents GPS — empty and denied stay empty/error, not a fake Lisbon pin.
 */
enum class DiscoverMapUiState {
    Ready,
    PermissionDenied,
    GpsUnavailable,
    EmptyMarkers,
    Error,
}

data class DiscoverMapCopy(
    val title: String,
    val body: String,
    val sysLabel: String,
)

object DiscoverMapUiLogic {
    fun resolve(
        permission: LocationPermissionState,
        hasLocationFix: Boolean,
        markerCount: Int,
        loadFailed: Boolean = false,
    ): DiscoverMapUiState {
        if (loadFailed) return DiscoverMapUiState.Error
        when (permission) {
            LocationPermissionState.DENIED,
            LocationPermissionState.NEEDS_RECOVERY,
            -> return DiscoverMapUiState.PermissionDenied
            LocationPermissionState.UNKNOWN,
            LocationPermissionState.GRANTED,
            -> Unit
        }
        if (!hasLocationFix) return DiscoverMapUiState.GpsUnavailable
        if (markerCount <= 0) return DiscoverMapUiState.EmptyMarkers
        return DiscoverMapUiState.Ready
    }

    /** Coach / place markers only — exclude the optional self pin. */
    fun placeMarkerCount(markers: List<MapMarker>): Int =
        markers.count { it.id != "self" }

    fun copy(state: DiscoverMapUiState): DiscoverMapCopy = when (state) {
        DiscoverMapUiState.Ready -> DiscoverMapCopy(
            title = "Marketplace map",
            body = "Coach markers from discovery — not live GPS tracking.",
            sysLabel = "MAP · READY",
        )
        DiscoverMapUiState.PermissionDenied -> DiscoverMapCopy(
            title = "Location permission denied",
            body = "Allow location while using the app to place coaches near you. FitConnect never invents GPS coordinates.",
            sysLabel = "MAP · PERMISSION DENIED",
        )
        DiscoverMapUiState.GpsUnavailable -> DiscoverMapCopy(
            title = "GPS unavailable",
            body = "No location fix yet. Marketplace markers stay empty until a real fix arrives — never simulated in production.",
            sysLabel = "MAP · GPS UNAVAILABLE",
        )
        DiscoverMapUiState.EmptyMarkers -> DiscoverMapCopy(
            title = "No coaches on the map",
            body = "Widen filters or search again. Empty markers are shown as empty — not a fake route.",
            sysLabel = "MAP · EMPTY",
        )
        DiscoverMapUiState.Error -> DiscoverMapCopy(
            title = "Map unavailable",
            body = "Discovery failed to load. Retry without inventing coordinates.",
            sysLabel = "MAP · ERROR",
        )
    }
}
