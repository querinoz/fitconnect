package com.fitconnect.android.community.integration

import com.fitconnect.android.community.domain.ChallengeMetric
import com.fitconnect.android.community.domain.WorkoutFacts

/**
 * Outbound ports. Community consumes authoritative domain services through
 * these interfaces only — it never imports :sports, :telemetry or :geo types.
 * Adapters live in :app wiring; local defaults keep the module testable.
 */

data class SportRef(val key: String, val displayName: String)

/** Sports Intelligence registry view — no hardcoded sport lists in Community. */
interface SportCatalogPort {
    suspend fun sports(): List<SportRef>
    suspend fun displayName(sportKey: String): String
}

/**
 * Normalized activity facts from the Telemetry/Sports engines. Community only
 * aggregates and presents; it never calculates telemetry or training load.
 */
interface ActivityFactsPort {
    suspend fun latestWorkoutFacts(userId: String): WorkoutFacts?

    /** Total for a challenge metric within a window — computed by Telemetry. */
    suspend fun metricTotal(userId: String, metric: ChallengeMetric, customKey: String?, fromEpochMs: Long, toEpochMs: Long): Double

    /** Current consecutive-active-day streak — computed by Telemetry. */
    suspend fun activeDayStreak(userId: String): Int
}

data class NearbyCommunityRef(val id: String, val name: String, val kind: String, val distanceKm: Double)

/** Phase 07 Discovery view — Community does not recreate discovery logic. */
interface CommunityDiscoveryPort {
    suspend fun nearby(kinds: Set<String>, maxKm: Double): List<NearbyCommunityRef>
}

/** Local defaults for tests and offline demo mode. */
class StaticSportCatalogPort(private val refs: List<SportRef>) : SportCatalogPort {
    override suspend fun sports(): List<SportRef> = refs
    override suspend fun displayName(sportKey: String): String =
        refs.firstOrNull { it.key == sportKey }?.displayName ?: sportKey
}

class NoActivityFactsPort : ActivityFactsPort {
    override suspend fun latestWorkoutFacts(userId: String): WorkoutFacts? = null
    override suspend fun metricTotal(userId: String, metric: ChallengeMetric, customKey: String?, fromEpochMs: Long, toEpochMs: Long): Double = 0.0
    override suspend fun activeDayStreak(userId: String): Int = 0
}

class NoDiscoveryPort : CommunityDiscoveryPort {
    override suspend fun nearby(kinds: Set<String>, maxKm: Double): List<NearbyCommunityRef> = emptyList()
}
