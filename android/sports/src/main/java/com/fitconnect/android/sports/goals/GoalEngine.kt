package com.fitconnect.android.sports.goals

import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.sports.sync.EntityMeta
import com.fitconnect.android.sports.sync.SyncState
import com.fitconnect.android.sports.sync.VersionedEntity
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

enum class GoalKind {
    WEIGHT_LOSS,
    HYPERTROPHY,
    MARATHON,
    STRENGTH,
    COMPETITION,
    REHABILITATION,
    MAINTENANCE,
    HEALTH,
    CUSTOM,
}

data class GoalDefinition(
    override val meta: EntityMeta,
    val title: String,
    val kind: GoalKind,
    val sportId: SportId?,
    val targetValue: Double?,
    val unit: String?,
    val progressPercent: Int,
    val influencesLoad: Boolean = true,
) : VersionedEntity

interface GoalEngine {
    fun all(): List<GoalDefinition>
    fun forSport(sportId: SportId): List<GoalDefinition>
    fun upsert(goal: GoalDefinition): GoalDefinition
    fun create(
        title: String,
        kind: GoalKind,
        sportId: SportId? = null,
        targetValue: Double? = null,
        unit: String? = null,
    ): GoalDefinition
    fun recommendationHints(goals: List<GoalDefinition>): List<String>
}

class DefaultGoalEngine : GoalEngine {
    private val store = ConcurrentHashMap<String, GoalDefinition>()

    init {
        listOf(
            GoalDefinition(EntityMeta("g_marathon", 1, System.currentTimeMillis()), "Marathon finish", GoalKind.MARATHON, SportId.RUNNING, 42.2, "km", 40),
            GoalDefinition(EntityMeta("g_strength", 1, System.currentTimeMillis()), "Squat strength", GoalKind.STRENGTH, SportId.GYM, 140.0, "kg", 55),
            GoalDefinition(EntityMeta("g_health", 1, System.currentTimeMillis()), "General health", GoalKind.HEALTH, null, null, null, 70),
        ).forEach { store[it.meta.id] = it }
    }

    override fun all(): List<GoalDefinition> = store.values.sortedBy { it.title }

    override fun forSport(sportId: SportId): List<GoalDefinition> =
        all().filter { it.sportId == null || it.sportId == sportId }

    override fun upsert(goal: GoalDefinition): GoalDefinition {
        val next = goal.copy(
            meta = goal.meta.copy(
                version = goal.meta.version + 1,
                updatedAtEpochMs = System.currentTimeMillis(),
                syncState = SyncState.PENDING_PUSH,
            ),
        )
        store[next.meta.id] = next
        return next
    }

    override fun create(
        title: String,
        kind: GoalKind,
        sportId: SportId?,
        targetValue: Double?,
        unit: String?,
    ): GoalDefinition {
        val created = GoalDefinition(
            meta = EntityMeta("g-${UUID.randomUUID().toString().take(8)}", 1, System.currentTimeMillis(), SyncState.PENDING_PUSH),
            title = title,
            kind = kind,
            sportId = sportId,
            targetValue = targetValue,
            unit = unit,
            progressPercent = 0,
        )
        store[created.meta.id] = created
        return created
    }

    override fun recommendationHints(goals: List<GoalDefinition>): List<String> =
        goals.map { "Goal focus: ${it.kind.name.lowercase().replace('_', ' ')} · ${it.title}" }
}
