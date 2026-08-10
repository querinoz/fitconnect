package com.fitconnect.android.community.achievements

import com.fitconnect.android.community.domain.AchievementDefinition
import com.fitconnect.android.community.domain.AwardedAchievement
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * Facts snapshot used by achievement rules. All numbers are aggregated from
 * the authoritative engines (Telemetry, Programs, Challenges) — the rules only
 * read them.
 */
data class AchievementFacts(
    val userId: String,
    val totalWorkouts: Int = 0,
    val streakDays: Int = 0,
    val competitionsEntered: Int = 0,
    val personalRecords: Int = 0,
    val programsCompleted: Int = 0,
    val challengesCompleted: Int = 0,
    val postsPublished: Int = 0,
    val coachAthletes: Int = 0,
    val sportSessionCounts: Map<String, Int> = emptyMap(),
)

/** Rule = definition + predicate. New achievements are added as data, not code paths. */
data class AchievementRule(
    val definition: AchievementDefinition,
    val predicate: (AchievementFacts) -> Boolean,
)

/**
 * Rule-driven, idempotent achievement engine: evaluating the same facts twice
 * never duplicates an award.
 */
class AchievementEngine(
    rules: List<AchievementRule> = defaultRules(),
    private val nowProvider: () -> Long = System::currentTimeMillis,
) {
    private val mutex = Mutex()
    private val rules = rules.toMutableList()
    private val awards = mutableSetOf<AwardedAchievement>()

    suspend fun registerRule(rule: AchievementRule): Unit = mutex.withLock {
        if (rules.none { it.definition.id == rule.definition.id }) rules.add(rule)
    }

    suspend fun definitions(): List<AchievementDefinition> = mutex.withLock { rules.map { it.definition } }

    /** Evaluates all rules; returns only newly earned achievements. */
    suspend fun evaluate(facts: AchievementFacts): List<AwardedAchievement> = mutex.withLock {
        val already = awards.filter { it.userId == facts.userId }.map { it.achievementId }.toSet()
        rules
            .filter { it.definition.id !in already && it.predicate(facts) }
            .map { rule ->
                AwardedAchievement(rule.definition.id, facts.userId, nowProvider())
            }
            .onEach { awards.add(it) }
    }

    suspend fun awarded(userId: String): List<AwardedAchievement> = mutex.withLock {
        awards.filter { it.userId == userId }.sortedByDescending { it.atEpochMs }
    }

    companion object {
        fun defaultRules(): List<AchievementRule> = listOf(
            rule("first-workout", "First Workout", "Completed the first tracked workout", "training") { it.totalWorkouts >= 1 },
            rule("streak-7", "7 Day Streak", "Trained 7 days in a row", "consistency") { it.streakDays >= 7 },
            rule("streak-30", "30 Day Streak", "Trained 30 days in a row", "consistency") { it.streakDays >= 30 },
            rule("first-competition", "First Competition", "Entered a first competition", "competition") { it.competitionsEntered >= 1 },
            rule("personal-record", "Personal Record", "Set a new personal record", "performance") { it.personalRecords >= 1 },
            rule("program-complete", "Program Completed", "Finished a full training program", "programs") { it.programsCompleted >= 1 },
            rule("challenge-complete", "Challenge Completed", "Completed a community challenge", "challenges") { it.challengesCompleted >= 1 },
            rule("community-10-posts", "Community Voice", "Published 10 community posts", "community") { it.postsPublished >= 10 },
            rule("coach-5-athletes", "Coach Milestone", "Coaching 5 or more athletes", "coaching") { it.coachAthletes >= 5 },
            rule("sport-50-sessions", "Sport Milestone", "50 sessions in a single sport", "sport") { facts ->
                facts.sportSessionCounts.values.any { it >= 50 }
            },
        )

        private fun rule(
            id: String,
            title: String,
            description: String,
            category: String,
            predicate: (AchievementFacts) -> Boolean,
        ) = AchievementRule(AchievementDefinition(id, title, description, category), predicate)
    }
}
