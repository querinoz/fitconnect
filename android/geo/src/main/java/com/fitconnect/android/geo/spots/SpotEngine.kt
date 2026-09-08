package com.fitconnect.android.geo.spots

/**
 * Training Spots + Secret Spots.
 * Exact coordinates are privacy-sensitive — never expose publicly by default.
 */

enum class SpotVisibility {
    PUBLIC,
    APPROXIMATE,
    FOLLOWERS_ONLY,
    PRIVATE,
    INVITE_ONLY,
}

enum class SpotAccess {
    PUBLIC,
    PRIVATE,
    PERMISSION_REQUIRED,
    UNKNOWN,
    RESTRICTED,
}

enum class SpotRisk {
    LOW,
    MODERATE,
    HIGH,
    VERY_HIGH,
    EXTREME,
}

enum class SpotDifficulty {
    BEGINNER,
    EASY,
    INTERMEDIATE,
    ADVANCED,
    EXPERT,
}

enum class SpotModerationState {
    PENDING_REVIEW,
    COMMUNITY_VERIFIED,
    VERIFIED,
    DISPUTED,
    ARCHIVED,
}

data class SpotCoordinates(
    val lat: Double,
    val lng: Double,
)

data class Spot(
    val id: String,
    val name: String,
    val sportKey: String,
    val description: String,
    /** Exact coordinates — only returned when viewer is authorized. */
    val exact: SpotCoordinates? = null,
    /** Privacy-preserving approximate point or map center. */
    val approximate: SpotCoordinates,
    val blurRadiusMeters: Double = 400.0,
    val visibility: SpotVisibility,
    val access: SpotAccess,
    val difficulty: SpotDifficulty,
    val risk: SpotRisk,
    val riskConfidence: Double,
    val reportsCount: Int = 0,
    val lastVerifiedEpochMs: Long? = null,
    val creatorId: String,
    val secret: Boolean = false,
    val moderation: SpotModerationState = SpotModerationState.PENDING_REVIEW,
    val createdAtEpochMs: Long,
    val updatedAtEpochMs: Long,
)

enum class SpotReportReason {
    HAZARD,
    CLOSED,
    PRIVATE_PROPERTY,
    UNSAFE,
    WRONG_DIFFICULTY,
    WRONG_COORDINATES,
    WEATHER_DAMAGE,
    NEW_OBSTACLE,
    INJURY_RISK,
    OTHER,
}

data class SpotReport(
    val id: String,
    val spotId: String,
    val reporterId: String,
    val reason: SpotReportReason,
    val note: String?,
    val atEpochMs: Long,
)

data class SpotDraft(
    val name: String,
    val sportKey: String,
    val description: String,
    val exact: SpotCoordinates,
    val visibility: SpotVisibility,
    val access: SpotAccess,
    val difficulty: SpotDifficulty,
    val risk: SpotRisk,
    val secret: Boolean,
    val creatorId: String,
)

interface SpotEngine {
    suspend fun submit(draft: SpotDraft): Spot
    suspend fun get(id: String, viewerId: String?): Spot?
    suspend fun nearby(lat: Double, lng: Double, radiusKm: Double, viewerId: String?): List<Spot>
    suspend fun report(spotId: String, reporterId: String, reason: SpotReportReason, note: String?): SpotReport
    suspend fun reports(spotId: String): List<SpotReport>
}

class InMemorySpotEngine(
    private val nowProvider: () -> Long = System::currentTimeMillis,
) : SpotEngine {
    private val spots = linkedMapOf<String, Spot>()
    private val reports = mutableListOf<SpotReport>()
    private var seq = 0L

    override suspend fun submit(draft: SpotDraft): Spot {
        val now = nowProvider()
        val approx = approximate(draft.exact, if (draft.secret) 0.008 else 0.002)
        val spot = Spot(
            id = "spot-${++seq}",
            name = draft.name.trim(),
            sportKey = draft.sportKey,
            description = draft.description.trim(),
            exact = if (draft.visibility == SpotVisibility.PUBLIC && !draft.secret) draft.exact else null,
            approximate = approx,
            blurRadiusMeters = if (draft.secret) 800.0 else 400.0,
            visibility = draft.visibility,
            access = draft.access,
            difficulty = draft.difficulty,
            risk = draft.risk,
            riskConfidence = 0.35,
            creatorId = draft.creatorId,
            secret = draft.secret,
            moderation = SpotModerationState.PENDING_REVIEW,
            createdAtEpochMs = now,
            updatedAtEpochMs = now,
        )
        spots[spot.id] = spot
        return spot
    }

    override suspend fun get(id: String, viewerId: String?): Spot? {
        val spot = spots[id] ?: return null
        return redact(spot, viewerId)
    }

    override suspend fun nearby(lat: Double, lng: Double, radiusKm: Double, viewerId: String?): List<Spot> =
        spots.values
            .mapNotNull { redact(it, viewerId) }
            .filter { distanceKm(lat, lng, it.approximate.lat, it.approximate.lng) <= radiusKm }

    override suspend fun report(
        spotId: String,
        reporterId: String,
        reason: SpotReportReason,
        note: String?,
    ): SpotReport {
        val report = SpotReport(
            id = "srep-${reports.size + 1}",
            spotId = spotId,
            reporterId = reporterId,
            reason = reason,
            note = note,
            atEpochMs = nowProvider(),
        )
        reports += report
        spots[spotId]?.let { s ->
            spots[spotId] = s.copy(
                reportsCount = s.reportsCount + 1,
                updatedAtEpochMs = nowProvider(),
            )
        }
        return report
    }

    override suspend fun reports(spotId: String): List<SpotReport> =
        reports.filter { it.spotId == spotId }

    private fun redact(spot: Spot, viewerId: String?): Spot {
        val canSeeExact = when (spot.visibility) {
            SpotVisibility.PUBLIC -> !spot.secret
            SpotVisibility.APPROXIMATE -> false
            SpotVisibility.PRIVATE, SpotVisibility.INVITE_ONLY -> viewerId == spot.creatorId
            SpotVisibility.FOLLOWERS_ONLY -> viewerId == spot.creatorId
        }
        return if (canSeeExact) {
            spot.copy(exact = spot.exact ?: spot.approximate)
        } else {
            spot.copy(exact = null)
        }
    }

    companion object {
        fun approximate(exact: SpotCoordinates, jitterDeg: Double): SpotCoordinates {
            val h = exact.lat.hashCode() xor exact.lng.hashCode()
            val jLat = ((h % 1000) / 1000.0 - 0.5) * 2 * jitterDeg
            val jLng = (((h / 1000) % 1000) / 1000.0 - 0.5) * 2 * jitterDeg
            return SpotCoordinates(exact.lat + jLat, exact.lng + jLng)
        }

        fun distanceKm(lat1: Double, lng1: Double, lat2: Double, lng2: Double): Double {
            val r = 6371.0
            val dLat = Math.toRadians(lat2 - lat1)
            val dLng = Math.toRadians(lng2 - lng1)
            val a = kotlin.math.sin(dLat / 2) * kotlin.math.sin(dLat / 2) +
                kotlin.math.cos(Math.toRadians(lat1)) * kotlin.math.cos(Math.toRadians(lat2)) *
                kotlin.math.sin(dLng / 2) * kotlin.math.sin(dLng / 2)
            return 2 * r * kotlin.math.asin(kotlin.math.sqrt(a))
        }
    }
}
