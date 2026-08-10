package com.fitconnect.android.community.groups

import com.fitconnect.android.community.domain.Audit
import com.fitconnect.android.community.domain.CommunityGroup
import com.fitconnect.android.community.domain.GroupInvite
import com.fitconnect.android.community.domain.GroupKind
import com.fitconnect.android.community.domain.GroupMembership
import com.fitconnect.android.community.domain.GroupRole
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * Community groups: kinds, membership, roles, invites, rules. Joining is
 * idempotent; invite-only and private groups require an invite.
 */
interface GroupEngine {
    suspend fun create(group: CommunityGroup): CommunityGroup
    suspend fun all(): List<CommunityGroup>
    suspend fun get(groupId: String): CommunityGroup?
    suspend fun join(groupId: String, userId: String): Boolean
    suspend fun leave(groupId: String, userId: String): Boolean
    suspend fun invite(groupId: String, invitedUserId: String, invitedById: String): Boolean
    suspend fun members(groupId: String): List<GroupMembership>
    suspend fun isMember(groupId: String, userId: String): Boolean
    suspend fun isModerator(groupId: String, userId: String): Boolean
    suspend fun promoteModerator(groupId: String, actorId: String, userId: String): Boolean
    suspend fun groupsOf(userId: String): List<CommunityGroup>
}

class InMemoryGroupEngine : GroupEngine {
    private val mutex = Mutex()
    private val groups = linkedMapOf<String, CommunityGroup>()
    private val memberships = mutableSetOf<GroupMembership>()
    private val invites = mutableSetOf<GroupInvite>()

    private fun now() = System.currentTimeMillis()

    override suspend fun create(group: CommunityGroup): CommunityGroup = mutex.withLock {
        groups[group.id] = group
        memberships.add(GroupMembership(group.id, group.ownerId, GroupRole.OWNER, now()))
        group
    }

    override suspend fun all(): List<CommunityGroup> = mutex.withLock { groups.values.filter { !it.audit.deleted } }

    override suspend fun get(groupId: String): CommunityGroup? = mutex.withLock { groups[groupId] }

    override suspend fun join(groupId: String, userId: String): Boolean = mutex.withLock {
        val group = groups[groupId] ?: return@withLock false
        if (memberships.any { it.groupId == groupId && it.userId == userId }) return@withLock true // idempotent
        val requiresInvite = group.kind in setOf(GroupKind.PRIVATE, GroupKind.INVITE_ONLY)
        if (requiresInvite && invites.none { it.groupId == groupId && it.invitedUserId == userId }) {
            return@withLock false
        }
        invites.removeAll { it.groupId == groupId && it.invitedUserId == userId }
        memberships.add(GroupMembership(groupId, userId, GroupRole.MEMBER, now()))
        true
    }

    override suspend fun leave(groupId: String, userId: String): Boolean = mutex.withLock {
        memberships.removeAll { it.groupId == groupId && it.userId == userId && it.role != GroupRole.OWNER }
    }

    override suspend fun invite(groupId: String, invitedUserId: String, invitedById: String): Boolean = mutex.withLock {
        val inviterIsMember = memberships.any { it.groupId == groupId && it.userId == invitedById }
        if (!inviterIsMember) return@withLock false
        invites.add(GroupInvite(groupId, invitedUserId, invitedById, now()))
        true
    }

    override suspend fun members(groupId: String): List<GroupMembership> = mutex.withLock {
        memberships.filter { it.groupId == groupId }.sortedBy { it.atEpochMs }
    }

    override suspend fun isMember(groupId: String, userId: String): Boolean = mutex.withLock {
        memberships.any { it.groupId == groupId && it.userId == userId }
    }

    override suspend fun isModerator(groupId: String, userId: String): Boolean = mutex.withLock {
        memberships.any {
            it.groupId == groupId && it.userId == userId && it.role in setOf(GroupRole.OWNER, GroupRole.MODERATOR)
        }
    }

    override suspend fun promoteModerator(groupId: String, actorId: String, userId: String): Boolean = mutex.withLock {
        val actorRole = memberships.firstOrNull { it.groupId == groupId && it.userId == actorId }?.role
        if (actorRole != GroupRole.OWNER) return@withLock false
        val member = memberships.firstOrNull { it.groupId == groupId && it.userId == userId }
            ?: return@withLock false
        memberships.remove(member)
        memberships.add(member.copy(role = GroupRole.MODERATOR))
        true
    }

    override suspend fun groupsOf(userId: String): List<CommunityGroup> = mutex.withLock {
        val ids = memberships.filter { it.userId == userId }.map { it.groupId }.toSet()
        groups.values.filter { it.id in ids && !it.audit.deleted }
    }
}

object GroupFactory {
    fun new(
        id: String,
        name: String,
        description: String,
        kind: GroupKind,
        ownerId: String,
        sportKey: String? = null,
        rules: List<String> = emptyList(),
        nowEpochMs: Long = System.currentTimeMillis(),
    ) = CommunityGroup(
        id = id,
        name = name,
        description = description,
        kind = kind,
        sportKey = sportKey,
        rules = rules,
        ownerId = ownerId,
        audit = Audit(nowEpochMs, nowEpochMs),
    )
}
