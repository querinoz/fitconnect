package com.fitconnect.android.geo.catalog

import com.fitconnect.android.geo.domain.GeoPoint
import com.fitconnect.android.geo.domain.Place
import com.fitconnect.android.geo.domain.PlaceKind
import com.fitconnect.android.sports.domain.SportId

/**
 * Configuration seed for discoverable places. Feature UI must load places
 * via Discovery/Nearby engines — never embed coordinates in screens.
 */
object PlacesCatalog {
    fun places(): List<Place> = listOf(
        place("p_coach_maya", PlaceKind.COACH, "Tomás Rivera", 38.7223, -9.1393, "Lisbon", "PT",
            setOf(SportId.RUNNING, SportId.TRIATHLON), 4.9, 3, listOf("EN", "PT"), verified = true, available = true, accessible = true),
        place("p_coach_jon", PlaceKind.COACH, "Jon Park", 38.7369, -9.1427, "Lisbon", "PT",
            setOf(SportId.CYCLING, SportId.GYM), 4.7, 2, listOf("EN", "KO"), verified = true, available = false, accessible = true),
        place("p_coach_elena", PlaceKind.COACH, "Elena Ruiz", 38.7167, -9.1500, "Lisbon", "PT",
            setOf(SportId.PADEL, SportId.TENNIS), 4.8, 2, listOf("ES", "EN"), verified = false, available = true, accessible = false),
        place("p_gym_volt", PlaceKind.GYM, "Voltline Performance Lab", 38.7250, -9.1505, "Lisbon", "PT",
            setOf(SportId.GYM, SportId.CROSSFIT), 4.6, 2, listOf("EN", "PT"), verified = true, available = true, accessible = true, tags = listOf("24h")),
        place("p_club_coast", PlaceKind.SPORTS_CLUB, "Coastal Run Club", 38.6930, -9.2060, "Cascais", "PT",
            setOf(SportId.RUNNING), 4.5, 1, listOf("PT", "EN"), verified = true, available = true, accessible = true),
        place("p_center_aqua", PlaceKind.TRAINING_CENTER, "Aqua Form Center", 38.7580, -9.1550, "Lisbon", "PT",
            setOf(SportId.SWIMMING), 4.4, 2, listOf("PT"), verified = true, available = true, accessible = true),
        place("p_field_estadio", PlaceKind.FIELD, "Neighborhood Pitch", 38.7400, -9.1300, "Lisbon", "PT",
            setOf(SportId.FOOTBALL), 4.1, 1, listOf("PT"), verified = false, available = true, accessible = true),
        place("p_facility_padel", PlaceKind.FACILITY, "Padel Hub Oriente", 38.7680, -9.0970, "Lisbon", "PT",
            setOf(SportId.PADEL), 4.7, 3, listOf("PT", "EN"), verified = true, available = true, accessible = true),
        place("p_event_10k", PlaceKind.EVENT, "City 10K Expo", 38.7130, -9.1400, "Lisbon", "PT",
            setOf(SportId.RUNNING), 4.8, 1, listOf("EN", "PT"), verified = true, available = true, accessible = true),
        place("p_comp_tri", PlaceKind.COMPETITION, "Estoril Sprint Tri", 38.7050, -9.3980, "Estoril", "PT",
            setOf(SportId.TRIATHLON), 4.9, 3, listOf("EN", "PT"), verified = true, available = true, accessible = false),
        place("p_program_vo2", PlaceKind.PROGRAM, "VO2 Build Hub", 38.7200, -9.1450, "Lisbon", "PT",
            setOf(SportId.RUNNING), 4.6, 2, listOf("EN"), verified = true, available = true, accessible = true),
        place("p_community_ride", PlaceKind.COMMUNITY, "Saturday Ride Collective", 38.7300, -9.1600, "Lisbon", "PT",
            setOf(SportId.CYCLING), 4.3, 1, listOf("PT", "EN"), verified = false, available = true, accessible = true),
        place("p_athlete_ines", PlaceKind.ATHLETE, "Inês Costa", 38.7180, -9.1370, "Lisbon", "PT",
            setOf(SportId.RUNNING, SportId.CYCLING), 0.0, 1, listOf("EN", "PT"), verified = false, available = true, accessible = true),
        place("p_athlete_marina", PlaceKind.ATHLETE, "Marina Santos", 38.7210, -9.1410, "Lisbon", "PT",
            setOf(SportId.SWIMMING, SportId.TRIATHLON, SportId.RUNNING), 0.0, 1, listOf("PT", "EN"), verified = false, available = true, accessible = true),
    )

    /** Default development mock pin — Lisbon Baixa — used only by LocationEngine mocks. */
    fun defaultDevAnchor(): GeoPoint = GeoPoint(38.7223, -9.1393)

    private fun place(
        id: String,
        kind: PlaceKind,
        name: String,
        lat: Double,
        lon: Double,
        city: String,
        country: String,
        sports: Set<SportId>,
        rating: Double,
        price: Int,
        languages: List<String>,
        verified: Boolean,
        available: Boolean,
        accessible: Boolean,
        tags: List<String> = emptyList(),
    ) = Place(
        id = id,
        kind = kind,
        name = name,
        location = GeoPoint(lat, lon),
        city = city,
        country = country,
        sportIds = sports,
        rating = rating,
        priceTier = price,
        languages = languages,
        verified = verified,
        accessible = accessible,
        availableNow = available,
        tags = tags,
    )
}
