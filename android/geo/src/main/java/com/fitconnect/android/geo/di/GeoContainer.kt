package com.fitconnect.android.geo.di

import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.foundation.offline.SyncQueue
import com.fitconnect.android.geo.availability.AvailabilityEngine
import com.fitconnect.android.geo.availability.DefaultAvailabilityEngine
import com.fitconnect.android.geo.booking.BookingEngine
import com.fitconnect.android.geo.booking.BookingRemote
import com.fitconnect.android.geo.booking.BookingStore
import com.fitconnect.android.geo.booking.DefaultBookingEngine
import com.fitconnect.android.geo.booking.HttpBookingRemote
import com.fitconnect.android.geo.booking.InMemoryBookingStore
import com.fitconnect.android.geo.catalog.PlacesCatalog
import com.fitconnect.android.geo.discovery.DefaultDiscoveryEngine
import com.fitconnect.android.geo.discovery.DiscoveryEngine
import com.fitconnect.android.geo.events.DefaultEventEngine
import com.fitconnect.android.geo.events.EventEngine
import com.fitconnect.android.geo.location.DefaultLocationEngine
import com.fitconnect.android.geo.location.LocationEngine
import com.fitconnect.android.geo.location.LocationPermissionState
import com.fitconnect.android.geo.maps.DefaultMapsEngine
import com.fitconnect.android.geo.maps.MapsEngine
import com.fitconnect.android.geo.nearby.DefaultNearbyEngine
import com.fitconnect.android.geo.nearby.NearbyEngine
import com.fitconnect.android.geo.offline.DefaultGeoOfflineStore
import com.fitconnect.android.geo.offline.GeoOfflineStore
import com.fitconnect.android.geo.reviews.DefaultReviewsEngine
import com.fitconnect.android.geo.reviews.ReviewsEngine
import com.fitconnect.android.geo.routes.DefaultRouteEngine
import com.fitconnect.android.geo.routes.RouteEngine

interface GeoContainer {
    val location: LocationEngine
    val maps: MapsEngine
    val discovery: DiscoveryEngine
    val booking: BookingEngine
    val availability: AvailabilityEngine
    val routes: RouteEngine
    val nearby: NearbyEngine
    val events: EventEngine
    val reviews: ReviewsEngine
    val offline: GeoOfflineStore
    val bookingStore: BookingStore
}

class DefaultGeoContainer(
    allowMockLocation: Boolean = true,
    bookingStore: BookingStore = InMemoryBookingStore(),
    bookingRemote: BookingRemote? = null,
    syncQueue: SyncQueue? = null,
    connectivity: ConnectivityMonitor? = null,
    seedDemoBookings: Boolean = true,
    api: (() -> ApiClient)? = null,
) : GeoContainer {
    override val offline: GeoOfflineStore = DefaultGeoOfflineStore()
    override val bookingStore: BookingStore = bookingStore
    override val location: LocationEngine = DefaultLocationEngine(allowMock = allowMockLocation).also { engine ->
        // Debug/local only: seed a labeled mock fix. Release never claims fake GPS.
        if (allowMockLocation) {
            engine.reportPermission(LocationPermissionState.GRANTED)
            engine.setMockLocation(PlacesCatalog.defaultDevAnchor())
        } else {
            engine.reportPermission(LocationPermissionState.UNKNOWN)
        }
    }
    override val maps: MapsEngine = DefaultMapsEngine()
    override val discovery: DiscoveryEngine = DefaultDiscoveryEngine(offline)
    override val availability: AvailabilityEngine = DefaultAvailabilityEngine()
    private val resolvedRemote: BookingRemote? = bookingRemote
        ?: api?.let { HttpBookingRemote(it) }
    override val booking: BookingEngine = DefaultBookingEngine(
        availability = availability,
        offline = offline,
        store = bookingStore,
        remote = resolvedRemote,
        syncQueue = syncQueue,
        connectivity = connectivity,
        seedDemoBookings = seedDemoBookings,
    )
    override val routes: RouteEngine = DefaultRouteEngine(offline)
    override val nearby: NearbyEngine = DefaultNearbyEngine(discovery)
    override val events: EventEngine = DefaultEventEngine()
    override val reviews: ReviewsEngine = DefaultReviewsEngine()
}
