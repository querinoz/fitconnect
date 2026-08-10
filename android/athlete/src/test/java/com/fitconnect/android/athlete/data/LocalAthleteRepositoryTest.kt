package com.fitconnect.android.athlete.data

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.flags.FeatureFlag
import com.fitconnect.android.foundation.flags.FeatureFlagStore
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.foundation.offline.DefaultOfflineCoordinator
import com.fitconnect.android.foundation.offline.InMemorySyncQueue
import com.fitconnect.android.geo.di.DefaultGeoContainer
import com.fitconnect.android.sports.di.DefaultSportsContainer
import com.fitconnect.android.telemetry.di.DefaultTelemetryContainer
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class LocalAthleteRepositoryTest {
    private val online = MutableStateFlow(true)
    private val connectivity = object : ConnectivityMonitor {
        override val online: StateFlow<Boolean> = this@LocalAthleteRepositoryTest.online
        override fun start() = Unit
    }
    private val logger = object : Logger {
        override fun d(tag: String, message: String) = Unit
        override fun i(tag: String, message: String) = Unit
        override fun w(tag: String, message: String, throwable: Throwable?) = Unit
        override fun e(tag: String, message: String, throwable: Throwable?) = Unit
    }
    private val flags = object : FeatureFlagStore {
        override fun isEnabled(flag: FeatureFlag): Boolean = flag.defaultEnabled
        override fun observe(flag: FeatureFlag): Flow<Boolean> = flowOf(flag.defaultEnabled)
        override suspend fun setLocal(flag: FeatureFlag, enabled: Boolean) = Unit
        override suspend fun applyRemote(overrides: Map<String, Boolean>) = Unit
    }
    private val offline = DefaultOfflineCoordinator(
        queue = InMemorySyncQueue(),
        connectivity = connectivity,
        featureFlags = flags,
        logger = logger,
    )
    private val sports = DefaultSportsContainer()
    private val geo = DefaultGeoContainer()
    private val telemetry = DefaultTelemetryContainer(connectivity)
    private val repo = LocalAthleteRepository(connectivity, offline, sports, geo, telemetry.athleteFacade)

    @Test
    fun homeAndRecoveryLoad() = runBlocking {
        val home = repo.home()
        assertTrue(home is AppResult.Ok)
        assertTrue((home as AppResult.Ok).value.readiness.score in 1..100)
        val recovery = repo.recovery()
        assertTrue(recovery is AppResult.Ok)
    }

    @Test
    fun discoverFiltersVerified() = runBlocking {
        val all = (repo.discoverCoaches() as AppResult.Ok).value
        val verified = (repo.discoverCoaches(verifiedOnly = true) as AppResult.Ok).value
        assertTrue(verified.all { it.verified })
        assertTrue(verified.size <= all.size)
        assertTrue(all.isNotEmpty())
    }

    @Test
    fun offlineTaskToggleQueuesSync() = runBlocking {
        online.value = false
        val before = offline.pendingCount()
        val home = (repo.home() as AppResult.Ok).value
        val taskId = home.tasks.first().id
        repo.toggleTask(taskId)
        assertEquals(before + 1, offline.pendingCount())
    }
}
