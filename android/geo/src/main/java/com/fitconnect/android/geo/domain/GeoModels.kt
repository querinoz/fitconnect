package com.fitconnect.android.geo.domain

import com.fitconnect.android.sports.domain.SportId

/** WGS84 coordinate — never construct ad-hoc in UI; load from catalog/services. */
data class GeoPoint(
    val latitude: Double,
    val longitude: Double,
    val altitudeM: Double? = null,
    val accuracyM: Float? = null,
) {
    init {
        require(latitude in -90.0..90.0) { "latitude out of range" }
        require(longitude in -180.0..180.0) { "longitude out of range" }
    }
}

data class GeoBounds(
    val southWest: GeoPoint,
    val northEast: GeoPoint,
)

enum class PlaceKind {
    COACH,
    ATHLETE,
    GYM,
    SPORTS_CLUB,
    TRAINING_CENTER,
    EVENT,
    PROGRAM,
    COMPETITION,
    COMMUNITY,
    FACILITY,
    FIELD,
}

enum class LocationAccuracy { HIGH, BALANCED, LOW, PASSIVE }

enum class EnvironmentContext { INDOOR, OUTDOOR, UNKNOWN }

enum class MapProviderKind { MAPLIBRE, GOOGLE }

enum class MapStyleKind { DARK, LIGHT, SATELLITE, TERRAIN }

enum class BookingTargetKind { COACH, GYM, FACILITY, EVENT }

enum class BookingLifecycle {
    DRAFT,
    PENDING,
    CONFIRMED,
    WAITLISTED,
    RESCHEDULED,
    CANCELLED,
    COMPLETED,
    NO_SHOW,
}

enum class SessionMode { PRIVATE, GROUP }

enum class EventFormat { IN_PERSON, ONLINE, HYBRID }

enum class RouteKind { RUNNING, CYCLING, WALKING, SWIMMING, TRAIL }

data class Place(
    val id: String,
    val kind: PlaceKind,
    val name: String,
    val location: GeoPoint,
    val city: String,
    val country: String,
    val sportIds: Set<SportId>,
    val rating: Double,
    val priceTier: Int,
    val languages: List<String>,
    val verified: Boolean,
    val accessible: Boolean,
    val availableNow: Boolean,
    val tags: List<String> = emptyList(),
)

data class DiscoveryQuery(
    val text: String? = null,
    val kinds: Set<PlaceKind> = emptySet(),
    val center: GeoPoint? = null,
    val radiusKm: Double? = null,
    val city: String? = null,
    val country: String? = null,
    val sportId: SportId? = null,
    val availableOnly: Boolean = false,
    val minRating: Double? = null,
    val maxPriceTier: Int? = null,
    val language: String? = null,
    val verifiedOnly: Boolean = false,
    val accessibleOnly: Boolean = false,
)

data class DiscoveryHit(
    val place: Place,
    val distanceKm: Double?,
    val rankScore: Double,
)

fun haversineKm(a: GeoPoint, b: GeoPoint): Double {
    val r = 6371.0
    val dLat = Math.toRadians(b.latitude - a.latitude)
    val dLon = Math.toRadians(b.longitude - a.longitude)
    val lat1 = Math.toRadians(a.latitude)
    val lat2 = Math.toRadians(b.latitude)
    val h = Math.sin(dLat / 2).let { it * it } +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2).let { it * it }
    return 2 * r * Math.asin(Math.sqrt(h))
}
