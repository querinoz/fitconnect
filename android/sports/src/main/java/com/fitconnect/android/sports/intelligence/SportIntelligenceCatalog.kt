package com.fitconnect.android.sports.intelligence

import com.fitconnect.android.sports.domain.SportId

/**
 * Extensible Zenith V8.5 sport profile registry.
 * Lookup is by [SportId]; new sports = append profiles — do not hardcode UI branches.
 */
object SportIntelligenceCatalog {

    private val profiles: Map<String, SportProfile> = listOf(
        SportProfile(
            sportId = SportId.STRENGTH,
            displayName = "Strength",
            sessionTypes = listOf("hypertrophy", "strength", "power", "deload"),
            primaryMetrics = listOf("volume", "sets", "reps", "rpe"),
            nutritionProfileKeys = listOf("protein_target_key", "hydration_key"),
        ),
        SportProfile(
            sportId = SportId.RUNNING,
            displayName = "Running",
            sessionTypes = listOf("easy", "intervals", "tempo", "long", "recovery"),
            primaryMetrics = listOf("pace", "distance", "hr_avg"),
            nutritionProfileKeys = listOf("carb_timing_key", "hydration_key"),
        ),
        SportProfile(
            sportId = SportId.CYCLING,
            displayName = "Cycling",
            sessionTypes = listOf("endurance", "intervals", "sweet_spot", "recovery"),
            primaryMetrics = listOf("power", "speed", "cadence"),
            nutritionProfileKeys = listOf("carb_timing_key", "hydration_key"),
        ),
        SportProfile(
            sportId = SportId.SWIMMING,
            displayName = "Swimming",
            sessionTypes = listOf("technique", "endurance", "speed", "recovery"),
            primaryMetrics = listOf("pace_100", "distance", "swolf"),
            nutritionProfileKeys = listOf("hydration_key"),
        ),
        SportProfile(
            sportId = SportId.FOOTBALL,
            displayName = "Football",
            sessionTypes = listOf("skills", "conditioning", "match_sim", "recovery"),
            primaryMetrics = listOf("distance", "sprints", "player_load"),
            nutritionProfileKeys = listOf("match_day_fuel_key", "hydration_key"),
        ),
        SportProfile(
            sportId = SportId.BASKETBALL,
            displayName = "Basketball",
            sessionTypes = listOf("skills", "conditioning", "scrimmage", "recovery"),
            primaryMetrics = listOf("jumps", "load", "distance"),
            nutritionProfileKeys = listOf("hydration_key"),
        ),
        SportProfile(
            sportId = SportId.TENNIS,
            displayName = "Tennis",
            sessionTypes = listOf("drills", "match_play", "conditioning", "recovery"),
            primaryMetrics = listOf("rally", "load", "hr_avg"),
            nutritionProfileKeys = listOf("hydration_key"),
        ),
        SportProfile(
            sportId = SportId.PADEL,
            displayName = "Padel",
            sessionTypes = listOf("drills", "match_play", "conditioning"),
            primaryMetrics = listOf("load", "hr_avg", "distance"),
            nutritionProfileKeys = listOf("hydration_key"),
        ),
        SportProfile(
            sportId = SportId.MARTIAL_ARTS,
            displayName = "Martial Arts",
            sessionTypes = listOf("technique", "pads", "sparring", "conditioning", "recovery"),
            primaryMetrics = listOf("rounds", "duration", "rpe"),
            nutritionProfileKeys = listOf("weight_cut_config_key", "hydration_key"),
        ),
        SportProfile(
            sportId = SportId.CROSSFIT,
            displayName = "CrossFit",
            sessionTypes = listOf("wod", "strength", "skill", "recovery"),
            primaryMetrics = listOf("wod_time", "volume", "rounds"),
            nutritionProfileKeys = listOf("protein_target_key", "hydration_key"),
        ),
        SportProfile(
            sportId = SportId.HYROX,
            displayName = "HYROX",
            sessionTypes = listOf("station_practice", "full_sim", "running_focus", "recovery"),
            primaryMetrics = listOf("station_time", "run_split", "total_time"),
            nutritionProfileKeys = listOf("race_fuel_key", "hydration_key"),
        ),
        SportProfile(
            sportId = SportId.GENERAL_FITNESS,
            displayName = "General Fitness",
            sessionTypes = listOf("mixed", "mobility", "cardio", "recovery"),
            primaryMetrics = listOf("duration", "rpe"),
            nutritionProfileKeys = listOf("hydration_key", "protein_target_key"),
        ),
    ).associateBy { it.sportId.value }

    fun all(): List<SportProfile> = profiles.values.toList()

    fun get(id: SportId): SportProfile? {
        val key = SportWireIds.catalogKey(id)
        return profiles[key]
            ?: profiles[id.value]
            ?: profiles[normalizeAlias(id)]
    }

    fun require(id: SportId): SportProfile =
        get(id) ?: error("No SportProfile for ${id.value}")

    fun contains(id: SportId): Boolean = get(id) != null

    fun trainCoreCovered(): Boolean =
        SportId.TRAIN_CORE.all { contains(it) }

    /** Recommend a default today session without inventing biometrics. */
    fun recommendToday(
        sportId: SportId,
        honesty: SessionHonestyBundle = SessionHonestyBundle(),
        preferredSessionType: String? = null,
        priorSessionType: String? = null,
    ): TodaySessionRecommendation {
        val profile = require(sportId)
        val sessionType = preferredSessionType
            ?.takeIf { it in profile.sessionTypes }
            ?: defaultSessionType(profile, honesty.readiness)
        val intent = intentFor(sessionType, honesty.readiness)
        val duration = durationFor(sportId, sessionType)
        val adaptation = SessionAdaptation.explain(
            sportId = sportId,
            sessionType = sessionType,
            readiness = honesty.readiness,
            priorSessionType = priorSessionType,
        )
        val reasons = buildList {
            add("Sport profile ${profile.displayName} selects $sessionType as today's primary block")
            add(adaptation)
            when (honesty.readiness.status) {
                HonestyStatus.AVAILABLE ->
                    add("Readiness ${honesty.readiness.value} provided by connected source")
                else ->
                    add("Readiness ${honesty.readiness.label()} — no fabricated score")
            }
        }
        return TodaySessionRecommendation(
            sportId = sportId,
            sessionType = sessionType,
            intent = intent,
            estimatedDurationMin = duration,
            reasons = reasons,
            honesty = honesty,
            adaptationNote = adaptation,
        )
    }

    private fun defaultSessionType(profile: SportProfile, readiness: HonestMetric<Int>): String {
        if (readiness.status != HonestyStatus.AVAILABLE) {
            return profile.sessionTypes.firstOrNull { it.contains("easy") || it == "recovery" || it == "mobility" || it == "technique" }
                ?: profile.sessionTypes.first()
        }
        val score = readiness.value!!
        return when {
            score < 45 -> profile.sessionTypes.firstOrNull { it == "recovery" || it == "deload" || it == "mobility" || it == "easy" }
                ?: profile.sessionTypes.first()
            score >= 70 -> profile.sessionTypes.firstOrNull {
                it in setOf("intervals", "strength", "power", "wod", "full_sim", "match_sim", "match_play", "sparring")
            } ?: profile.sessionTypes.first()
            else -> profile.sessionTypes.firstOrNull {
                it in setOf("hypertrophy", "tempo", "endurance", "conditioning", "drills", "station_practice", "mixed")
            } ?: profile.sessionTypes.first()
        }
    }

    private fun intentFor(sessionType: String, readiness: HonestMetric<Int>): String {
        val intensity = when (readiness.status) {
            HonestyStatus.AVAILABLE -> {
                val score = readiness.value ?: return "$sessionType · intensity unset (no readiness)"
                when {
                    score >= 70 -> "quality intensity"
                    score >= 45 -> "controlled effort"
                    else -> "recovery bias"
                }
            }
            else -> "intensity unset (no readiness)"
        }
        return "$sessionType · $intensity"
    }

    private fun durationFor(sportId: SportId, sessionType: String): Int {
        val recovery = sessionType.contains("recovery") || sessionType == "deload" || sessionType == "mobility"
        return when {
            recovery -> 25
            sportId == SportId.STRENGTH || sportId == SportId.CROSSFIT -> 45
            sportId == SportId.HYROX -> 55
            sportId == SportId.RUNNING || sportId == SportId.CYCLING -> 40
            sportId == SportId.SWIMMING -> 35
            else -> 40
        }
    }

    private fun normalizeAlias(id: SportId): String? = when (id.value) {
        SportId.GYM.value, "weight_training" -> SportId.STRENGTH.value
        "workout" -> SportId.GENERAL_FITNESS.value
        else -> null
    }
}
