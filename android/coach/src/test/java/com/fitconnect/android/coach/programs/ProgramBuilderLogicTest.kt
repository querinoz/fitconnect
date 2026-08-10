package com.fitconnect.android.coach.programs

import com.fitconnect.android.coach.data.LocalCoachRepository
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.flags.FeatureFlag
import com.fitconnect.android.foundation.flags.FeatureFlagStore
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.foundation.offline.DefaultOfflineCoordinator
import com.fitconnect.android.foundation.offline.InMemorySyncQueue
import com.fitconnect.android.geo.di.DefaultGeoContainer
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertTrue
import org.junit.Test

class ProgramBuilderLogicTest {
    private val online = MutableStateFlow(true)
    private val connectivity = object : ConnectivityMonitor {
        override val online: StateFlow<Boolean> = this@ProgramBuilderLogicTest.online
        override fun start() = Unit
    }
    private val flags = object : FeatureFlagStore {
        override fun isEnabled(flag: FeatureFlag): Boolean = true
        override fun observe(flag: FeatureFlag): Flow<Boolean> = flowOf(true)
        override suspend fun setLocal(flag: FeatureFlag, enabled: Boolean) = Unit
        override suspend fun applyRemote(overrides: Map<String, Boolean>) = Unit
    }
    private val logger = object : Logger {
        override fun d(tag: String, message: String) = Unit
        override fun i(tag: String, message: String) = Unit
        override fun w(tag: String, message: String, throwable: Throwable?) = Unit
        override fun e(tag: String, message: String, throwable: Throwable?) = Unit
    }
    private val geo = DefaultGeoContainer()
    private val repo = LocalCoachRepository(
        connectivity,
        DefaultOfflineCoordinator(InMemorySyncQueue(), connectivity, flags, logger),
        geo.booking,
        geo.availability,
    )

    @Test
    fun blocksIncludeWarmupExercisesCooldown() = runBlocking {
        val program = (repo.programs() as AppResult.Ok).value.first { !it.template }
        val block = program.blocks.first()
        assertTrue(block.warmup.isNotEmpty())
        assertTrue(block.exercises.isNotEmpty())
        assertTrue(block.cooldown.isNotEmpty())
        assertTrue(block.exercises.any { it.restSec >= 0 })
    }
}
