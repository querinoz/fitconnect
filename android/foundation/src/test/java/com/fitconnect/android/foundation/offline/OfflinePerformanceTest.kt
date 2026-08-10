package com.fitconnect.android.foundation.offline

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.flags.FeatureFlag
import com.fitconnect.android.foundation.flags.FeatureFlagStore
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class OfflinePerformanceTest {
    private val online = MutableStateFlow(true)
    private val connectivity = object : ConnectivityMonitor {
        override val online: StateFlow<Boolean> = this@OfflinePerformanceTest.online
        override fun start() = Unit
    }
    private val logger = object : Logger {
        override fun d(tag: String, message: String) = Unit
        override fun i(tag: String, message: String) = Unit
        override fun w(tag: String, message: String, throwable: Throwable?) = Unit
        override fun e(tag: String, message: String, throwable: Throwable?) = Unit
    }
    private val flags = object : FeatureFlagStore {
        override fun isEnabled(flag: FeatureFlag): Boolean = true
        override fun observe(flag: FeatureFlag): Flow<Boolean> = flowOf(true)
        override suspend fun setLocal(flag: FeatureFlag, enabled: Boolean) = Unit
        override suspend fun applyRemote(overrides: Map<String, Boolean>) = Unit
    }

    @Test
    fun duplicateIdempotencyKeyDoesNotEnqueueTwice() = runBlocking {
        val queue = InMemorySyncQueue()
        val a = SyncWork(type = "t", payloadJson = "{}", idempotencyKey = "same")
        val b = SyncWork(type = "t", payloadJson = "{}", idempotencyKey = "same")
        assertTrue(queue.enqueue(a) is AppResult.Ok)
        assertTrue(queue.enqueue(b) is AppResult.Ok)
        assertEquals(1, queue.size())
    }

    @Test
    fun failClosedFlushDoesNotDiscardWork() = runBlocking {
        val queue = InMemorySyncQueue()
        val offline = DefaultOfflineCoordinator(
            queue, connectivity, flags, logger, FailClosedOfflineExecutor(logger),
        )
        offline.enqueue(SyncWork(type = "unknown.op", payloadJson = "{}"))
        assertEquals(0, offline.flush())
        assertEquals(1, offline.pendingCount())
    }

    @Test
    fun registeredHandlerAcksWork() = runBlocking {
        val queue = InMemorySyncQueue()
        val registry = RegistryOfflineExecutor(logger)
        registry.register("ok") { AppResult.Ok(Unit) }
        val offline = DefaultOfflineCoordinator(queue, connectivity, flags, logger, registry)
        offline.enqueue(SyncWork(type = "ok", payloadJson = "{}"))
        assertEquals(1, offline.flush())
        assertEquals(0, offline.pendingCount())
    }
}
