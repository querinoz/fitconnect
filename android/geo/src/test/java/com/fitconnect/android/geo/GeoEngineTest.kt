package com.fitconnect.android.geo

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.geo.booking.BookingRequest
import com.fitconnect.android.geo.catalog.PlacesCatalog
import com.fitconnect.android.geo.di.DefaultGeoContainer
import com.fitconnect.android.geo.domain.BookingLifecycle
import com.fitconnect.android.geo.domain.BookingTargetKind
import com.fitconnect.android.geo.domain.DiscoveryQuery
import com.fitconnect.android.geo.domain.GeoPoint
import com.fitconnect.android.geo.domain.MapStyleKind
import com.fitconnect.android.geo.domain.PlaceKind
import com.fitconnect.android.geo.domain.RouteKind
import com.fitconnect.android.geo.domain.SessionMode
import com.fitconnect.android.geo.maps.MapCamera
import com.fitconnect.android.geo.maps.MapMarker
import com.fitconnect.android.geo.maps.MapScene
import com.fitconnect.android.geo.nearby.NearbyQuery
import com.fitconnect.android.geo.offline.OfflineRegion
import com.fitconnect.android.geo.domain.GeoBounds
import com.fitconnect.android.geo.reviews.ModerationState
import com.fitconnect.android.geo.reviews.Review
import com.fitconnect.android.geo.reviews.ReviewTargetKind
import com.fitconnect.android.sports.domain.SportId
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class GeoEngineTest {
    private val geo = DefaultGeoContainer()

    @Test
    fun discoveryFiltersVerifiedCoachesByRadius() {
        val center = PlacesCatalog.defaultDevAnchor()
        val hits = geo.discovery.search(
            DiscoveryQuery(
                kinds = setOf(PlaceKind.COACH),
                center = center,
                radiusKm = 25.0,
                verifiedOnly = true,
            ),
        )
        assertTrue(hits.isNotEmpty())
        assertTrue(hits.all { it.place.verified && it.place.kind == PlaceKind.COACH })
        assertTrue(hits.all { it.distanceKm != null && it.distanceKm!! <= 25.0 })
    }

    @Test
    fun mapsClustersAndStyles() {
        val provider = geo.maps.preferredProvider()
        assertEquals(com.fitconnect.android.geo.domain.MapProviderKind.MAPLIBRE, provider.kind)
        val controller = provider.createController()
        controller.setStyle(MapStyleKind.DARK)
        val markers = listOf(
            MapMarker("1", GeoPoint(38.72, -9.14), "A"),
            MapMarker("2", GeoPoint(38.721, -9.141), "B"),
            MapMarker("3", GeoPoint(39.0, -9.0), "C"),
        )
        val clusters = geo.maps.cluster(markers, cellDegrees = 0.05)
        assertTrue(clusters.isNotEmpty())
        controller.render(
            MapScene(
                style = MapStyleKind.DARK,
                camera = MapCamera(center, 12.0),
                markers = markers,
                clusters = clusters,
                livePosition = center,
            ),
        )
        assertEquals(MapStyleKind.DARK, controller.currentScene().style)
    }

    private val center get() = PlacesCatalog.defaultDevAnchor()

    @Test
    fun bookingConflictGoesToWaitlistOrRejectsReschedule() = runBlocking {
        val start = System.currentTimeMillis() + 3L * 86_400_000
        // Align to Tuesday 10:00 Lisbon-ish by using midday UTC+offset approximation via availability open check
        val openStart = nextOpenSlot()
        val first = geo.booking.create(
            BookingRequest(
                targetKind = BookingTargetKind.COACH,
                targetId = "p_coach_maya",
                clientId = "u1",
                clientName = "Test",
                startEpochMs = openStart,
                durationMin = 60,
                mode = SessionMode.PRIVATE,
                autoConfirm = true,
            ),
        )
        assertTrue(first is AppResult.Ok)
        val second = geo.booking.create(
            BookingRequest(
                targetKind = BookingTargetKind.COACH,
                targetId = "p_coach_maya",
                clientId = "u2",
                clientName = "Other",
                startEpochMs = openStart,
                durationMin = 60,
                mode = SessionMode.PRIVATE,
            ),
        )
        assertTrue(second is AppResult.Ok)
        assertEquals(BookingLifecycle.WAITLISTED, (second as AppResult.Ok).value.status)
    }

    @Test
    fun nearbyAndOfflineQueue() = runBlocking {
        val hits = geo.nearby.nearby(NearbyQuery(center, radiusKm = 15.0, kinds = setOf(PlaceKind.GYM, PlaceKind.COACH)))
        assertTrue(hits.isNotEmpty())
        geo.offline.setOfflineMode(true)
        geo.offline.cacheRegion(
            OfflineRegion(
                id = "lisbon",
                name = "Lisbon",
                bounds = GeoBounds(GeoPoint(38.6, -9.3), GeoPoint(38.9, -9.0)),
            ),
        )
        assertTrue(geo.offline.regions().isNotEmpty())
        assertTrue(geo.offline.offlineSearch("Tomás").isNotEmpty())
        val before = geo.offline.pendingBookingActions().size
        geo.booking.confirm("bk1")
        assertTrue(geo.offline.pendingBookingActions().size > before)
    }

    @Test
    fun bookingRevisionsBumpOnCreate() = runBlocking {
        val before = geo.booking.list().size
        val created = geo.booking.create(
            BookingRequest(
                targetKind = BookingTargetKind.COACH,
                targetId = "p_coach_elena",
                clientId = "ath-1",
                clientName = "Inês Costa",
                startEpochMs = nextOpenSlot(),
                durationMin = 30,
                mode = SessionMode.PRIVATE,
                notes = "revision test",
                autoConfirm = true,
            ),
        )
        assertTrue(created is AppResult.Ok)
        assertTrue(geo.booking.list().size > before)
    }

    @Test
    fun routesGpxExportImport() {
        val route = geo.routes.all().first()
        val gpx = geo.routes.exportGpxArchitecture(route.id)
        assertTrue(gpx!!.contains("<gpx"))
        val imported = geo.routes.importGpxArchitecture(gpx, "Imported", RouteKind.RUNNING)
        assertTrue(imported.points.isNotEmpty())
        assertTrue(imported.gpxReady)
    }

    @Test
    fun eventsRsvpAndReviews() = runBlocking {
        val event = geo.events.upcoming().first()
        val rsvp = geo.events.rsvp(event.id, "user-1")
        assertTrue(rsvp is AppResult.Ok)
        val review = geo.reviews.submit(
            Review("", ReviewTargetKind.COACH, "p_coach_maya", "user-1", 5, "Great", moderation = ModerationState.PENDING),
        )
        assertTrue(review is AppResult.Ok)
        geo.reviews.moderate((review as AppResult.Ok).value.id, ModerationState.APPROVED)
        assertTrue(geo.reviews.average(ReviewTargetKind.COACH, "p_coach_maya") >= 4.0)
    }

    @Test
    fun discoverySportFilter() {
        val hits = geo.discovery.search(DiscoveryQuery(sportId = SportId.PADEL))
        assertTrue(hits.all { SportId.PADEL in it.place.sportIds })
        assertFalse(hits.isEmpty())
    }

    private fun nextOpenSlot(): Long {
        // Find a timestamp within the next 14 days that availability accepts for Maya.
        val now = System.currentTimeMillis()
        var t = now + 86_400_000
        repeat(14 * 24) {
            if (geo.availability.isOpen("p_coach_maya", t, 60, SessionMode.PRIVATE)) return t
            t += 3_600_000
        }
        return now + 2L * 86_400_000 + 10 * 3_600_000
    }
}
