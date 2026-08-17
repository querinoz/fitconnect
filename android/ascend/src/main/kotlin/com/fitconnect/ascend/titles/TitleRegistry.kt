package com.fitconnect.ascend.titles

import com.fitconnect.ascend.domain.ProgressionSnapshot

/**
 * Unlockable performance titles. Never cosmetic-free: each title requires
 * an ASCEND achievement and/or a minimum level.
 */
data class PerformanceTitle(
    val id: String,
    val nameKey: String,
    val sourceAchievementId: String? = null,
    val minLevel: Int = 1,
)

object TitleRegistry {
    val ALL: List<PerformanceTitle> = listOf(
        PerformanceTitle("daily_runner", "title.daily_runner", "daily_runner"),
        PerformanceTitle("consistency_beast", "title.consistency_beast", "consistency_engine"),
        PerformanceTitle("unbreakable", "title.unbreakable", "unbreakable"),
        PerformanceTitle("iron_mind", "title.iron_mind", "iron_routine"),
        PerformanceTitle("road_warrior", "title.road_warrior", "endurance_10k"),
        PerformanceTitle("marathoner", "title.marathoner", "half_distance"),
        PerformanceTitle("recovery_master", "title.recovery_master", "recovery_discipline"),
        PerformanceTitle("pace_machine", "title.pace_machine", "pace_breaker"),
        PerformanceTitle("ultra_runner", "title.ultra_runner", "club_1000"),
        PerformanceTitle("clutch", "title.clutch", "first_pr"),
        PerformanceTitle("elite_athlete", "title.elite_athlete", minLevel = 7),
    )

    fun unlocked(achievementIds: Set<String>, level: Int): List<PerformanceTitle> =
        ALL.filter { title ->
            val achievementOk = title.sourceAchievementId == null ||
                title.sourceAchievementId in achievementIds
            achievementOk && level >= title.minLevel
        }

    fun unlocked(snapshot: ProgressionSnapshot): List<PerformanceTitle> = unlocked(
        achievementIds = snapshot.achievements.filter { it.unlocked }.map { it.definition.id }.toSet(),
        level = snapshot.level.level,
    )

    /** Prefer [preferredId] when unlocked; otherwise the highest-index unlocked title. */
    fun equipped(unlocked: List<PerformanceTitle>, preferredId: String? = null): PerformanceTitle? {
        if (unlocked.isEmpty()) return null
        return unlocked.firstOrNull { it.id == preferredId } ?: unlocked.last()
    }
}
