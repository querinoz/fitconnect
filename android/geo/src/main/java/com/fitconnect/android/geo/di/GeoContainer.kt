package com.fitconnect.android.geo.di

import com.fitconnect.android.geo.availability.AvailabilityEngine
import com.fitconnect.android.geo.availability.DefaultAvailabilityEngine
import com.fitconnect.android.geo.booking.BookingEngine
import com.fitconnect.android.geo.booking.DefaultBookingEngine
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
}

class DefaultGeoContainer(
    allowMockLocation: Boolean = true,
) : GeoContainer {
    override val offline: GeoOfflineStore = DefaultGeoOfflineStore()
    override val location: LocationEngine = DefaultLocationEngine(allowMock = allowMockLocation).also { engine ->
        engine.reportPermission(LocationPermissionState.GRANTED)
        engine.setMockLocation(PlacesCatalog.defaultDevAnchor())
    }
    override val maps: MapsEngine = DefaultMapsEngine()
    override val discovery: DiscoveryEngine = DefaultDiscoveryEngine(offline)
    override val availability: AvailabilityEngine = DefaultAvailabilityEngine()
    override val booking: BookingEngine = DefaultBookingEngine(availability, offline)
    override val routes: RouteEngine = DefaultRouteEngine(offline)
    override val nearby: NearbyEngine = DefaultNearbyEngine(discovery)
    override val events: EventEngine = DefaultEventEngine()
    override val reviews: ReviewsEngine = DefaultReviewsEngine()
}
