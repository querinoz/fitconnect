package com.fitconnect.android.fitness.store

import com.fitconnect.android.fitness.domain.Sport
import com.fitconnect.android.fitness.domain.WorkoutSession
import com.fitconnect.shared.fitness.ProviderConstraints
import com.fitconnect.shared.fitness.ProviderId
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class WorkoutSessionDedupTest {
    @Test
    fun sameProviderAndExternalIdIsOneRow() = runBlocking {
        val store = InMemoryWorkoutSessionStore()
        val first = session(ProviderId.HEALTH_CONNECT, "42", start = 1_000)
        val second = first.copy(distanceM = 5_100.0)
        store.upsert(first)
        store.upsert(second)
        assertEquals(1, store.listOwn("u1").size)
        assertEquals(5_100.0, store.listOwn("u1").single().distanceM)
    }

    @Test
    fun healthConnectAndStravaSameRunMerge() = runBlocking {
        val store = InMemoryWorkoutSessionStore()
        val hc = session(ProviderId.HEALTH_CONNECT, "hc-1", start = 10_000, distance = 5_000.0)
        val strava = session(ProviderId.STRAVA, "st-9", start = 10_030, distance = 5_020.0)
        store.upsert(hc)
        store.upsert(strava)
        val own = store.listOwn("u1")
        assertEquals(1, own.size)
        assertTrue(own.single().mergedFrom.any { it.first == ProviderId.STRAVA })
    }
}

class SocialSessionQueriesTest {
    @Test
    fun everySocialQueryFiltersStrava() {
        SocialSessionQueries.ALL_SOCIAL.forEach { sql ->
            val normalized = sql.lowercase()
            assertTrue("missing shareable predicate: $sql", normalized.contains("shareable = 1"))
            assertTrue("missing STRAVA exclusion: $sql", normalized.contains("provider_id != 'strava'"))
        }
    }

    @Test
    fun socialListNeverReturnsOtherUsersStrava() = runBlocking {
        val store = InMemoryWorkoutSessionStore()
        store.upsert(session(ProviderId.HEALTH_CONNECT, "ok", user = "a"))
        store.upsert(session(ProviderId.STRAVA, "secret", user = "a", start = 86_400_000))
        val forB = store.listShareableForSocial("b")
        assertTrue(forB.none { it.providerId == ProviderId.STRAVA })
        assertEquals(1, forB.size)
        val forA = store.listShareableForSocial("a")
        assertEquals(2, forA.size)
    }
}

private fun session(
    provider: ProviderId,
    externalId: String,
    user: String = "u1",
    start: Long = 1_000,
    distance: Double = 5_000.0,
) = WorkoutSession(
    id = "${provider.name}:$externalId",
    userId = user,
    providerId = provider,
    externalId = externalId,
    sport = Sport.RUN,
    startedAtEpochMs = start,
    endedAtEpochMs = start + 1_800_000,
    distanceM = distance,
    constraints = ProviderConstraints(provider),
)
