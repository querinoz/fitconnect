package com.fitconnect.android.geo.nearby

import com.fitconnect.android.geo.discovery.DiscoveryEngine
import com.fitconnect.android.geo.domain.DiscoveryHit
import com.fitconnect.android.geo.domain.DiscoveryQuery
import com.fitconnect.android.geo.domain.GeoPoint
import com.fitconnect.android.geo.domain.PlaceKind

data class NearbyQuery(
    val center: GeoPoint,
    val radiusKm: Double = 5.0,
    val kinds: Set<PlaceKind> = emptySet(),
)

interface NearbyEngine {
    fun nearby(query: NearbyQuery): List<DiscoveryHit>
}

class DefaultNearbyEngine(
    private val discovery: DiscoveryEngine,
) : NearbyEngine {
    override fun nearby(query: NearbyQuery): List<DiscoveryHit> =
        discovery.search(
            DiscoveryQuery(
                center = query.center,
                radiusKm = query.radiusKm,
                kinds = query.kinds,
            ),
        )
}
