package com.fitconnect.ascend.levels

import com.fitconnect.ascend.domain.PerformanceLevel
import com.fitconnect.ascend.domain.PerformanceRank
import com.fitconnect.ascend.domain.Unlock

object LevelTable {
    data class Band(
        val level: Int,
        val xpRequired: Int,
        val rankCode: String,
        val rankNameKey: String,
    )

    val BANDS: List<Band> = listOf(
        Band(1, 0, "01", "rank.initiate"),
        Band(2, 200, "02", "rank.activated"),
        Band(3, 500, "03", "rank.mover"),
        Band(4, 900, "04", "rank.athlete"),
        Band(5, 1_400, "05", "rank.performer"),
        Band(6, 2_000, "06", "rank.competitor"),
        Band(7, 2_800, "07", "rank.elite"),
        Band(8, 3_800, "08", "rank.advanced_elite"),
        Band(9, 5_000, "09", "rank.performance_pro"),
        Band(10, 6_500, "10", "rank.high_performance"),
        Band(11, 8_500, "11", "rank.prime"),
        Band(12, 11_000, "12", "rank.elite_prime"),
        Band(13, 14_500, "13", "rank.ascendant"),
        Band(14, 19_000, "14", "rank.apex"),
        Band(15, 25_000, "15", "rank.legacy"),
    )

    val UNLOCKS: List<Unlock> = listOf(
        Unlock("map_themes", 3, "unlock.map_themes"),
        Unlock("performance_radar", 5, "unlock.performance_radar"),
        Unlock("advanced_analytics", 7, "unlock.advanced_analytics"),
        Unlock("advanced_challenges", 9, "unlock.advanced_challenges"),
        Unlock("ai_reports", 11, "unlock.ai_reports"),
        Unlock("achievement_frames", 13, "unlock.achievement_frames"),
    )

    fun resolve(totalXp: Int): PerformanceLevel {
        val xp = totalXp.coerceAtLeast(0)
        val current = BANDS.last { xp >= it.xpRequired }
        val next = BANDS.firstOrNull { it.level == current.level + 1 }
        val floor = current.xpRequired
        val ceiling = next?.xpRequired ?: (floor + 1)
        val span = (ceiling - floor).coerceAtLeast(1)
        val into = (xp - floor).coerceAtMost(span)
        val remaining = if (next == null) 0 else (ceiling - xp).coerceAtLeast(0)
        val percent = if (next == null) 100 else ((into.toDouble() / span) * 100.0).toInt().coerceIn(0, 99)
        val nextUnlock = UNLOCKS.firstOrNull { it.atLevel > current.level }
        return PerformanceLevel(
            level = current.level,
            rank = PerformanceRank(current.level, current.rankCode, current.rankNameKey),
            xpIntoLevel = into,
            xpForLevel = span,
            xpToNext = remaining,
            progressPercent = percent,
            nextUnlock = nextUnlock,
        )
    }

    fun unlocked(level: Int): List<Unlock> = UNLOCKS.filter { it.atLevel <= level }
}
