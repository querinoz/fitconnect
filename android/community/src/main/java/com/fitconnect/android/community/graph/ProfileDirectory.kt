package com.fitconnect.android.community.graph

import com.fitconnect.android.community.domain.UserProfile
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/** Directory of community profiles (athletes, coaches, official account). */
interface ProfileDirectory {
    suspend fun upsert(profile: UserProfile): UserProfile
    suspend fun get(userId: String): UserProfile?
    suspend fun search(query: String, limit: Int = 20): List<UserProfile>
    suspend fun verifiedCoaches(): List<UserProfile>
}

class InMemoryProfileDirectory : ProfileDirectory {
    private val mutex = Mutex()
    private val profiles = linkedMapOf<String, UserProfile>()

    override suspend fun upsert(profile: UserProfile): UserProfile = mutex.withLock {
        profiles[profile.id] = profile
        profile
    }

    override suspend fun get(userId: String): UserProfile? = mutex.withLock { profiles[userId] }

    override suspend fun search(query: String, limit: Int): List<UserProfile> = mutex.withLock {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return@withLock emptyList()
        profiles.values.filter { it.displayName.lowercase().contains(q) }.take(limit)
    }

    override suspend fun verifiedCoaches(): List<UserProfile> = mutex.withLock {
        profiles.values.filter { it.verifiedCoach }
    }
}
