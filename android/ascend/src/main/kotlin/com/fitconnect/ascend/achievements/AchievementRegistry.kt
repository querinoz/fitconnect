package com.fitconnect.ascend.achievements

import com.fitconnect.ascend.domain.AchievementCategory
import com.fitconnect.ascend.domain.AchievementCriterion
import com.fitconnect.ascend.domain.AchievementDefinition
import com.fitconnect.ascend.domain.AchievementRarity
import com.fitconnect.ascend.domain.CriterionKind

object AchievementRegistry {
    val ALL: List<AchievementDefinition> = listOf(
        def("first_km", "ach.first_km", "ach.first_km.d", AchievementCategory.DISTANCE, AchievementRarity.COMMON, 20, "distance", CriterionKind.DISTANCE_KM, 1.0),
        def("club_10", "ach.club_10", "ach.club_10.d", AchievementCategory.DISTANCE, AchievementRarity.COMMON, 40, "distance", CriterionKind.DISTANCE_KM, 10.0),
        def("club_50", "ach.club_50", "ach.club_50.d", AchievementCategory.DISTANCE, AchievementRarity.UNCOMMON, 80, "distance", CriterionKind.DISTANCE_KM, 50.0),
        def("club_100", "ach.club_100", "ach.club_100.d", AchievementCategory.DISTANCE, AchievementRarity.RARE, 120, "distance", CriterionKind.DISTANCE_KM, 100.0),
        def("club_500", "ach.club_500", "ach.club_500.d", AchievementCategory.DISTANCE, AchievementRarity.EPIC, 200, "distance", CriterionKind.DISTANCE_KM, 500.0),
        def("club_1000", "ach.club_1000", "ach.club_1000.d", AchievementCategory.DISTANCE, AchievementRarity.LEGENDARY, 320, "distance", CriterionKind.DISTANCE_KM, 1_000.0),
        def("club_5000", "ach.club_5000", "ach.club_5000.d", AchievementCategory.DISTANCE, AchievementRarity.MYTHIC, 500, "distance", CriterionKind.DISTANCE_KM, 5_000.0),
        def("daily_runner", "ach.daily_runner", "ach.daily_runner.d", AchievementCategory.CONSISTENCY, AchievementRarity.COMMON, 30, "streak", CriterionKind.TRAINING_STREAK_DAYS, 3.0),
        def("consistency_engine", "ach.consistency_engine", "ach.consistency_engine.d", AchievementCategory.CONSISTENCY, AchievementRarity.UNCOMMON, 60, "streak", CriterionKind.PERFORMANCE_STREAK_DAYS, 7.0),
        def("unbreakable", "ach.unbreakable", "ach.unbreakable.d", AchievementCategory.CONSISTENCY, AchievementRarity.RARE, 100, "streak", CriterionKind.PERFORMANCE_STREAK_DAYS, 14.0),
        def("iron_routine", "ach.iron_routine", "ach.iron_routine.d", AchievementCategory.CONSISTENCY, AchievementRarity.EPIC, 160, "streak", CriterionKind.PERFORMANCE_STREAK_DAYS, 30.0),
        def("legacy_athlete", "ach.legacy_athlete", "ach.legacy_athlete.d", AchievementCategory.LEGACY, AchievementRarity.LEGENDARY, 250, "streak", CriterionKind.PERFORMANCE_STREAK_DAYS, 100.0),
        def("cardio_initiate", "ach.cardio_initiate", "ach.cardio_initiate.d", AchievementCategory.CARDIO, AchievementRarity.COMMON, 25, "cardio", CriterionKind.CARDIO_SESSIONS, 1.0),
        def("aerobic_engine", "ach.aerobic_engine", "ach.aerobic_engine.d", AchievementCategory.CARDIO, AchievementRarity.UNCOMMON, 70, "cardio", CriterionKind.CARDIO_SESSIONS, 12.0),
        def("first_pr", "ach.first_pr", "ach.first_pr.d", AchievementCategory.PERSONAL_RECORD, AchievementRarity.COMMON, 40, "speed", CriterionKind.PR_COUNT, 1.0),
        def("pace_breaker", "ach.pace_breaker", "ach.pace_breaker.d", AchievementCategory.SPEED, AchievementRarity.RARE, 90, "speed", CriterionKind.PR_COUNT, 3.0),
        def("endurance_10k", "ach.endurance_10k", "ach.endurance_10k.d", AchievementCategory.ENDURANCE, AchievementRarity.UNCOMMON, 80, "endurance", CriterionKind.LONGEST_KM, 10.0),
        def("half_distance", "ach.half_distance", "ach.half_distance.d", AchievementCategory.ENDURANCE, AchievementRarity.RARE, 140, "endurance", CriterionKind.LONGEST_KM, 21.0),
        def("recovery_discipline", "ach.recovery_discipline", "ach.recovery_discipline.d", AchievementCategory.RECOVERY, AchievementRarity.UNCOMMON, 50, "recovery", CriterionKind.RECOVERY_STREAK_DAYS, 3.0),
        def("sleep_architect", "ach.sleep_architect", "ach.sleep_architect.d", AchievementCategory.SLEEP, AchievementRarity.UNCOMMON, 50, "sleep", CriterionKind.SLEEP_STREAK_DAYS, 5.0),
        def("prime_recovery", "ach.prime_recovery", "ach.prime_recovery.d", AchievementCategory.RECOVERY, AchievementRarity.RARE, 90, "recovery", CriterionKind.RECOVERY_STREAK_DAYS, 7.0),
        def("first_session", "ach.first_session", "ach.first_session.d", AchievementCategory.MILESTONE, AchievementRarity.COMMON, 20, "milestone", CriterionKind.WORKOUTS, 1.0),
        def("multi_sport", "ach.multi_sport", "ach.multi_sport.d", AchievementCategory.SPORT, AchievementRarity.UNCOMMON, 60, "sport", CriterionKind.SPORT_COUNT, 3.0),
        def("new_territory", "ach.new_territory", "ach.new_territory.d", AchievementCategory.EXPLORATION, AchievementRarity.UNCOMMON, 40, "map", CriterionKind.ROUTE_COUNT, 2.0),
        def("elevation_core", "ach.elevation_core", "ach.elevation_core.d", AchievementCategory.PERFORMANCE, AchievementRarity.RARE, 80, "climb", CriterionKind.ELEVATION_M, 500.0),
    )

    fun byId(id: String): AchievementDefinition? = ALL.firstOrNull { it.id == id }

    private fun def(
        id: String,
        name: String,
        desc: String,
        category: AchievementCategory,
        rarity: AchievementRarity,
        xp: Int,
        icon: String,
        kind: CriterionKind,
        threshold: Double,
    ) = AchievementDefinition(
        id = id,
        nameKey = name,
        descriptionKey = desc,
        category = category,
        rarity = rarity,
        xpReward = xp,
        icon = icon,
        criterion = AchievementCriterion(kind, threshold),
    )
}
