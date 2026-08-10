package com.fitconnect.android.geo.offline

import com.fitconnect.android.geo.domain.GeoBounds
import com.fitconnect.android.geo.domain.GeoPoint
import com.fitconnect.android.geo.domain.Place
import com.fitconnect.android.geo.routes.RouteDefinition
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList

data class OfflineRegion(
    val id: String,
    val name: String,
    val bounds: GeoBounds,
    val cachedAtEpochMs: Long = System.currentTimeMillis(),
)

data class PendingBookingAction(
    val action: String,
    val bookingId: String,
    val enqueuedAtEpochMs: Long = System.currentTimeMillis(),
)

/**
 * Offline maps/discovery/booking cache — regions, search cache, booking queue,
 * favorites, routes.
 */
interface GeoOfflineStore {
    fun setOfflineMode(enabled: Boolean)
    fun isOfflineMode(): Boolean
    fun cachePlaces(places: List<Place>)
    fun cachedPlaces(): List<Place>
    fun cacheRegion(region: OfflineRegion)
    fun regions(): List<OfflineRegion>
    fun favorite(placeId: String)
    fun unfavorite(placeId: String)
    fun favorites(): Set<String>
    fun storeRoute(route: RouteDefinition)
    fun routes(): List<RouteDefinition>
    fun enqueueBookingAction(action: String, bookingId: String)
    fun pendingBookingActions(): List<PendingBookingAction>
    fun flushBookingQueue(): Int
    fun offlineSearch(text: String): List<Place>
}

class DefaultGeoOfflineStore : GeoOfflineStore {
    private var offline = false
    private val places = ConcurrentHashMap<String, Place>()
    private val regions = ConcurrentHashMap<String, OfflineRegion>()
    private val favs = ConcurrentHashMap.newKeySet<String>()
    private val routeStore = ConcurrentHashMap<String, RouteDefinition>()
    private val bookingQueue = CopyOnWriteArrayList<PendingBookingAction>()

    override fun setOfflineMode(enabled: Boolean) {
        offline = enabled
    }

    override fun isOfflineMode(): Boolean = offline

    override fun cachePlaces(places: List<Place>) {
        places.forEach { this.places[it.id] = it }
    }

    override fun cachedPlaces(): List<Place> = places.values.toList()

    override fun cacheRegion(region: OfflineRegion) {
        regions[region.id] = region
    }

    override fun regions(): List<OfflineRegion> = regions.values.toList()

    override fun favorite(placeId: String) {
        favs.add(placeId)
    }

    override fun unfavorite(placeId: String) {
        favs.remove(placeId)
    }

    override fun favorites(): Set<String> = favs.toSet()

    override fun storeRoute(route: RouteDefinition) {
        routeStore[route.id] = route
    }

    override fun routes(): List<RouteDefinition> = routeStore.values.toList()

    override fun enqueueBookingAction(action: String, bookingId: String) {
        bookingQueue.add(PendingBookingAction(action, bookingId))
    }

    override fun pendingBookingActions(): List<PendingBookingAction> = bookingQueue.toList()

    override fun flushBookingQueue(): Int {
        val n = bookingQueue.size
        bookingQueue.clear()
        return n
    }

    override fun offlineSearch(text: String): List<Place> {
        val q = text.trim()
        if (q.isEmpty()) return cachedPlaces()
        return cachedPlaces().filter { it.name.contains(q, ignoreCase = true) }
    }
}

fun OfflineRegion.contains(point: GeoPoint): Boolean =
    point.latitude in bounds.southWest.latitude..bounds.northEast.latitude &&
        point.longitude in bounds.southWest.longitude..bounds.northEast.longitude
