package com.fitconnect.android.sports.competition

import com.fitconnect.android.sports.domain.CompetitionType
import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.sports.sync.EntityMeta
import com.fitconnect.android.sports.sync.SyncState
import com.fitconnect.android.sports.sync.VersionedEntity
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

data class CompetitionEvent(
    override val meta: EntityMeta,
    val title: String,
    val sportId: SportId,
    val type: CompetitionType,
    val startEpochMs: Long,
    val endEpochMs: Long,
    val seasonLabel: String?,
    val league: String?,
    val ranking: Int?,
    val virtual: Boolean,
) : VersionedEntity

interface CompetitionEngine {
    fun all(): List<CompetitionEvent>
    fun forSport(sportId: SportId): List<CompetitionEvent>
    fun upcoming(nowEpochMs: Long = System.currentTimeMillis()): List<CompetitionEvent>
    fun create(
        title: String,
        sportId: SportId,
        type: CompetitionType,
        startEpochMs: Long,
        endEpochMs: Long,
        seasonLabel: String? = null,
        league: String? = null,
        virtual: Boolean = false,
    ): CompetitionEvent
    fun setRanking(id: String, ranking: Int): CompetitionEvent?
}

class DefaultCompetitionEngine : CompetitionEngine {
    private val store = ConcurrentHashMap<String, CompetitionEvent>()

    init {
        val now = System.currentTimeMillis()
        listOf(
            CompetitionEvent(
                EntityMeta("c_10k", 1, now), "City 10K", SportId.RUNNING, CompetitionType.RACE,
                now + 30L * 86_400_000, now + 30L * 86_400_000 + 3_600_000, "2026 Spring", null, null, false,
            ),
            CompetitionEvent(
                EntityMeta("c_league", 1, now), "Padel Club League", SportId.PADEL, CompetitionType.LEAGUE,
                now - 7L * 86_400_000, now + 60L * 86_400_000, "2026 Season", "Club A", 4, false,
            ),
            CompetitionEvent(
                EntityMeta("c_virtual", 1, now), "Virtual FTP Challenge", SportId.CYCLING, CompetitionType.VIRTUAL_CHALLENGE,
                now + 3L * 86_400_000, now + 10L * 86_400_000, null, null, null, true,
            ),
        ).forEach { store[it.meta.id] = it }
    }

    override fun all(): List<CompetitionEvent> = store.values.sortedBy { it.startEpochMs }

    override fun forSport(sportId: SportId): List<CompetitionEvent> =
        all().filter { it.sportId == sportId }

    override fun upcoming(nowEpochMs: Long): List<CompetitionEvent> =
        all().filter { it.endEpochMs >= nowEpochMs }

    override fun create(
        title: String,
        sportId: SportId,
        type: CompetitionType,
        startEpochMs: Long,
        endEpochMs: Long,
        seasonLabel: String?,
        league: String?,
        virtual: Boolean,
    ): CompetitionEvent {
        val created = CompetitionEvent(
            meta = EntityMeta("c-${UUID.randomUUID().toString().take(8)}", 1, System.currentTimeMillis(), SyncState.PENDING_PUSH),
            title = title,
            sportId = sportId,
            type = type,
            startEpochMs = startEpochMs,
            endEpochMs = endEpochMs,
            seasonLabel = seasonLabel,
            league = league,
            ranking = null,
            virtual = virtual,
        )
        store[created.meta.id] = created
        return created
    }

    override fun setRanking(id: String, ranking: Int): CompetitionEvent? {
        val current = store[id] ?: return null
        val next = current.copy(
            ranking = ranking,
            meta = current.meta.copy(version = current.meta.version + 1, syncState = SyncState.PENDING_PUSH),
        )
        store[id] = next
        return next
    }
}
