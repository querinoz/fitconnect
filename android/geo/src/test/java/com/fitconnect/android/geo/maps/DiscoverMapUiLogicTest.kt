package com.fitconnect.android.geo.maps

import com.fitconnect.android.geo.domain.GeoPoint
import com.fitconnect.android.geo.location.LocationPermissionState
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class DiscoverMapUiLogicTest {
    @Test
    fun permissionDeniedBeatsEmptyAndGps() {
        assertEquals(
            DiscoverMapUiState.PermissionDenied,
            DiscoverMapUiLogic.resolve(
                permission = LocationPermissionState.DENIED,
                hasLocationFix = false,
                markerCount = 0,
            ),
        )
        assertEquals(
            DiscoverMapUiState.PermissionDenied,
            DiscoverMapUiLogic.resolve(
                permission = LocationPermissionState.NEEDS_RECOVERY,
                hasLocationFix = true,
                markerCount = 3,
            ),
        )
    }

    @Test
    fun gpsUnavailableWhenGrantedWithoutFix() {
        assertEquals(
            DiscoverMapUiState.GpsUnavailable,
            DiscoverMapUiLogic.resolve(
                permission = LocationPermissionState.GRANTED,
                hasLocationFix = false,
                markerCount = 0,
            ),
        )
        assertEquals(
            DiscoverMapUiState.GpsUnavailable,
            DiscoverMapUiLogic.resolve(
                permission = LocationPermissionState.UNKNOWN,
                hasLocationFix = false,
                markerCount = 2,
            ),
        )
    }

    @Test
    fun emptyMarkersWhenFixExistsButNoPlaces() {
        assertEquals(
            DiscoverMapUiState.EmptyMarkers,
            DiscoverMapUiLogic.resolve(
                permission = LocationPermissionState.GRANTED,
                hasLocationFix = true,
                markerCount = 0,
            ),
        )
    }

    @Test
    fun readyWhenMarkersPresent() {
        assertEquals(
            DiscoverMapUiState.Ready,
            DiscoverMapUiLogic.resolve(
                permission = LocationPermissionState.GRANTED,
                hasLocationFix = true,
                markerCount = 2,
            ),
        )
    }

    @Test
    fun loadFailedIsError() {
        assertEquals(
            DiscoverMapUiState.Error,
            DiscoverMapUiLogic.resolve(
                permission = LocationPermissionState.GRANTED,
                hasLocationFix = true,
                markerCount = 4,
                loadFailed = true,
            ),
        )
    }

    @Test
    fun placeMarkerCountExcludesSelf() {
        val markers = listOf(
            MapMarker("self", GeoPoint(38.72, -9.14), "You"),
            MapMarker("c1", GeoPoint(38.73, -9.13), "Coach"),
        )
        assertEquals(1, DiscoverMapUiLogic.placeMarkerCount(markers))
        assertEquals(0, DiscoverMapUiLogic.placeMarkerCount(listOf(markers.first())))
    }

    @Test
    fun copyNeverClaimsFakeGps() {
        val denied = DiscoverMapUiLogic.copy(DiscoverMapUiState.PermissionDenied)
        assertTrue(denied.body.contains("never invents", ignoreCase = true))
        val gps = DiscoverMapUiLogic.copy(DiscoverMapUiState.GpsUnavailable)
        assertTrue(gps.body.contains("never simulated", ignoreCase = true))
        val empty = DiscoverMapUiLogic.copy(DiscoverMapUiState.EmptyMarkers)
        assertTrue(empty.body.contains("Empty markers", ignoreCase = true))
    }
}
