package com.fitconnect.android.community.graph

import com.fitconnect.android.community.domain.Block
import com.fitconnect.android.community.domain.Mute
import com.fitconnect.android.community.domain.Relationship
import com.fitconnect.android.community.domain.RelationshipKind
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * Social graph — follows, connections, coach relationships, team membership,
 * blocks, mutes. All mutations are idempotent; blocks sever follows/connections
 * both ways.
 */
interface SocialGraph {
    suspend fun follow(actorId: String, targetId: String): Boolean
    suspend fun unfollow(actorId: String, targetId: String): Boolean
    suspend fun connect(aId: String, bId: String): Boolean
    suspend fun removeConnection(aId: String, bId: String): Boolean
    suspend fun linkCoachAthlete(coachId: String, athleteId: String): Boolean
    suspend fun addTeamMember(teamId: String, userId: String): Boolean
    suspend fun block(actorId: String, targetId: String)
    suspend fun unblock(actorId: String, targetId: String)
    suspend fun mute(actorId: String, targetId: String)
    suspend fun unmute(actorId: String, targetId: String)

    suspend fun following(userId: String): Set<String>
    suspend fun followers(userId: String): Set<String>
    suspend fun connections(userId: String): Set<String>
    suspend fun coachOf(athleteId: String): Set<String>
    suspend fun athletesOf(coachId: String): Set<String>
    suspend fun isBlocked(actorId: String, targetId: String): Boolean
    suspend fun isMuted(actorId: String, targetId: String): Boolean
}

class InMemorySocialGraph : SocialGraph {
    private val mutex = Mutex()
    private val relationships = mutableSetOf<Relationship>()
    private val blocks = mutableSetOf<Block>()
    private val mutes = mutableSetOf<Mute>()

    private fun now() = System.currentTimeMillis()

    override suspend fun follow(actorId: String, targetId: String): Boolean = mutex.withLock {
        if (actorId == targetId) return@withLock false
        if (blockedEitherWay(actorId, targetId)) return@withLock false
        relationships.add(Relationship(actorId, targetId, RelationshipKind.FOLLOW, now()))
    }

    override suspend fun unfollow(actorId: String, targetId: String): Boolean = mutex.withLock {
        relationships.removeAll { it.fromId == actorId && it.toId == targetId && it.kind == RelationshipKind.FOLLOW }
    }

    override suspend fun connect(aId: String, bId: String): Boolean = mutex.withLock {
        if (aId == bId || blockedEitherWay(aId, bId)) return@withLock false
        val added1 = relationships.add(Relationship(aId, bId, RelationshipKind.CONNECTION, now()))
        val added2 = relationships.add(Relationship(bId, aId, RelationshipKind.CONNECTION, now()))
        added1 || added2
    }

    override suspend fun removeConnection(aId: String, bId: String): Boolean = mutex.withLock {
        relationships.removeAll {
            it.kind == RelationshipKind.CONNECTION &&
                ((it.fromId == aId && it.toId == bId) || (it.fromId == bId && it.toId == aId))
        }
    }

    override suspend fun linkCoachAthlete(coachId: String, athleteId: String): Boolean = mutex.withLock {
        relationships.add(Relationship(coachId, athleteId, RelationshipKind.COACH_ATHLETE, now()))
    }

    override suspend fun addTeamMember(teamId: String, userId: String): Boolean = mutex.withLock {
        relationships.add(Relationship(teamId, userId, RelationshipKind.TEAM_MEMBER, now()))
    }

    override suspend fun block(actorId: String, targetId: String): Unit = mutex.withLock {
        blocks.add(Block(actorId, targetId, now()))
        relationships.removeAll {
            (it.fromId == actorId && it.toId == targetId || it.fromId == targetId && it.toId == actorId) &&
                it.kind in setOf(RelationshipKind.FOLLOW, RelationshipKind.CONNECTION)
        }
    }

    override suspend fun unblock(actorId: String, targetId: String): Unit = mutex.withLock {
        blocks.removeAll { it.actorId == actorId && it.blockedId == targetId }
    }

    override suspend fun mute(actorId: String, targetId: String): Unit = mutex.withLock {
        mutes.add(Mute(actorId, targetId, now()))
    }

    override suspend fun unmute(actorId: String, targetId: String): Unit = mutex.withLock {
        mutes.removeAll { it.actorId == actorId && it.mutedId == targetId }
    }

    override suspend fun following(userId: String): Set<String> = mutex.withLock {
        relationships.filter { it.fromId == userId && it.kind == RelationshipKind.FOLLOW }.map { it.toId }.toSet()
    }

    override suspend fun followers(userId: String): Set<String> = mutex.withLock {
        relationships.filter { it.toId == userId && it.kind == RelationshipKind.FOLLOW }.map { it.fromId }.toSet()
    }

    override suspend fun connections(userId: String): Set<String> = mutex.withLock {
        relationships.filter { it.fromId == userId && it.kind == RelationshipKind.CONNECTION }.map { it.toId }.toSet()
    }

    override suspend fun coachOf(athleteId: String): Set<String> = mutex.withLock {
        relationships.filter { it.toId == athleteId && it.kind == RelationshipKind.COACH_ATHLETE }.map { it.fromId }.toSet()
    }

    override suspend fun athletesOf(coachId: String): Set<String> = mutex.withLock {
        relationships.filter { it.fromId == coachId && it.kind == RelationshipKind.COACH_ATHLETE }.map { it.toId }.toSet()
    }

    override suspend fun isBlocked(actorId: String, targetId: String): Boolean = mutex.withLock {
        blockedEitherWay(actorId, targetId)
    }

    override suspend fun isMuted(actorId: String, targetId: String): Boolean = mutex.withLock {
        mutes.any { it.actorId == actorId && it.mutedId == targetId }
    }

    private fun blockedEitherWay(a: String, b: String): Boolean =
        blocks.any { (it.actorId == a && it.blockedId == b) || (it.actorId == b && it.blockedId == a) }
}
