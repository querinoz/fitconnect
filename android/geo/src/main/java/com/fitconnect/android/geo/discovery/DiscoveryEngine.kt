package com.fitconnect.android.geo.discovery

import com.fitconnect.android.geo.catalog.PlacesCatalog
import com.fitconnect.android.geo.domain.DiscoveryHit
import com.fitconnect.android.geo.domain.DiscoveryQuery
import com.fitconnect.android.geo.domain.Place
import com.fitconnect.android.geo.domain.PlaceKind
import com.fitconnect.android.geo.domain.haversineKm
import com.fitconnect.android.geo.offline.GeoOfflineStore

interface DiscoveryEngine {
    fun search(query: DiscoveryQuery): List<DiscoveryHit>
    fun get(placeId: String): Place?
    fun allKinds(): Set<PlaceKind>
}

class DefaultDiscoveryEngine(
    private val offline: GeoOfflineStore,
    seed: List<Place> = PlacesCatalog.places(),
) : DiscoveryEngine {
    private val places = seed.associateBy { it.id }.toMutableMap()

    init {
        offline.cachePlaces(places.values.toList())
    }

    override fun search(query: DiscoveryQuery): List<DiscoveryHit> {
        val source = if (offline.isOfflineMode()) offline.cachedPlaces() else places.values
        return source.asSequence()
            .filter { place ->
                (query.text == null || place.name.contains(query.text, ignoreCase = true) ||
                    place.tags.any { it.contains(query.text, ignoreCase = true) }) &&
                    (query.kinds.isEmpty() || place.kind in query.kinds) &&
                    (query.city == null || place.city.equals(query.city, ignoreCase = true)) &&
                    (query.country == null || place.country.equals(query.country, ignoreCase = true)) &&
                    (query.sportId == null || query.sportId in place.sportIds) &&
                    (!query.availableOnly || place.availableNow) &&
                    (query.minRating == null || place.rating >= query.minRating) &&
                    (query.maxPriceTier == null || place.priceTier <= query.maxPriceTier) &&
                    (query.language == null || place.languages.any { it.equals(query.language, ignoreCase = true) }) &&
                    (!query.verifiedOnly || place.verified) &&
                    (!query.accessibleOnly || place.accessible)
            }
            .map { place ->
                val distance = query.center?.let { haversineKm(it, place.location) }
                DiscoveryHit(place, distance, rank(place, distance))
            }
            .filter { hit -> query.radiusKm == null || hit.distanceKm == null || hit.distanceKm <= query.radiusKm }
            .sortedByDescending { it.rankScore }
            .toList()
    }

    override fun get(placeId: String): Place? =
        places[placeId] ?: offline.cachedPlaces().find { it.id == placeId }

    override fun allKinds(): Set<PlaceKind> = PlaceKind.entries.toSet()

    private fun rank(place: Place, distanceKm: Double?): Double {
        val distanceScore = when {
            distanceKm == null -> 0.0
            else -> (25.0 - distanceKm).coerceAtLeast(0.0)
        }
        val verifiedBoost = if (place.verified) 5.0 else 0.0
        val availabilityBoost = if (place.availableNow) 3.0 else 0.0
        return place.rating * 10 + distanceScore + verifiedBoost + availabilityBoost
    }
}
