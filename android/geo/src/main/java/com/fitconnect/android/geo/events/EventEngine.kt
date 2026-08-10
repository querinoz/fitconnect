package com.fitconnect.android.geo.events

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.geo.catalog.PlacesCatalog
import com.fitconnect.android.geo.domain.EventFormat
import com.fitconnect.android.geo.domain.GeoPoint
import com.fitconnect.android.sports.domain.SportId
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

data class GeoEvent(
    val id: String,
    val title: String,
    val sportId: SportId,
    val format: EventFormat,
    val location: GeoPoint?,
    val startEpochMs: Long,
    val capacity: Int,
    val rsvpCount: Int,
    val checkedIn: Set<String> = emptySet(),
)

interface EventEngine {
    fun all(): List<GeoEvent>
    fun upcoming(now: Long = System.currentTimeMillis()): List<GeoEvent>
    suspend fun rsvp(eventId: String, userId: String): AppResult<GeoEvent>
    suspend fun checkIn(eventId: String, userId: String): AppResult<GeoEvent>
}

class DefaultEventEngine : EventEngine {
    private val events = ConcurrentHashMap<String, GeoEvent>()

    init {
        val now = System.currentTimeMillis()
        val anchor = PlacesCatalog.defaultDevAnchor()
        listOf(
            GeoEvent("ev_10k", "City 10K", SportId.RUNNING, EventFormat.IN_PERSON, anchor, now + 30L * 86_400_000, 500, 120),
            GeoEvent("ev_camp", "Training Camp Weekend", SportId.TRIATHLON, EventFormat.HYBRID, GeoPoint(38.7050, -9.3980), now + 45L * 86_400_000, 40, 18),
            GeoEvent("ev_meetup", "Community Meetup", SportId.CYCLING, EventFormat.IN_PERSON, GeoPoint(38.7300, -9.1600), now + 5L * 86_400_000, 80, 33),
            GeoEvent("ev_online", "Online Strength Clinic", SportId.GYM, EventFormat.ONLINE, null, now + 2L * 86_400_000, 200, 90),
        ).forEach { events[it.id] = it }
    }

    override fun all(): List<GeoEvent> = events.values.sortedBy { it.startEpochMs }

    override fun upcoming(now: Long): List<GeoEvent> = all().filter { it.startEpochMs >= now }

    override suspend fun rsvp(eventId: String, userId: String): AppResult<GeoEvent> {
        val event = events[eventId] ?: return AppResult.Err(AppError.Unexpected("Event missing"))
        if (event.rsvpCount >= event.capacity) {
            return AppResult.Err(AppError.Unexpected("Event at capacity"))
        }
        val next = event.copy(rsvpCount = event.rsvpCount + 1)
        events[eventId] = next
        return AppResult.Ok(next)
    }

    override suspend fun checkIn(eventId: String, userId: String): AppResult<GeoEvent> {
        val event = events[eventId] ?: return AppResult.Err(AppError.Unexpected("Event missing"))
        val next = event.copy(checkedIn = event.checkedIn + userId)
        events[eventId] = next
        return AppResult.Ok(next)
    }
}
