package com.fitconnect.android.foundation.offline

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.flags.FeatureFlag
import com.fitconnect.android.foundation.flags.FeatureFlagStore
import com.fitconnect.android.foundation.network.ApiClient
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * Kill/reopen matrix (in-process): enqueue while offline → new coordinator sharing queue → flush online.
 * Covers every Athlete/Coach OfflineHandlers mutation type.
 * No localAck without executor / HTTP success.
 */
class OfflineKillMatrixTest {
    private val online = MutableStateFlow(false)
    private val connectivity = object : ConnectivityMonitor {
        override val online: StateFlow<Boolean> = this@OfflineKillMatrixTest.online
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

    private val allMutationTypes: List<String> =
        AthleteOfflineHandlers.MUTATION_TYPES + CoachOfflineHandlers.MUTATION_TYPES

    private fun samplePayload(type: String): String = when {
        type.startsWith("athlete.task") -> """{"id":"task-1"}"""
        type.startsWith("athlete.program") -> """{"programId":"prog-1"}"""
        type.startsWith("athlete.message") -> """{"coachId":"c1","body":"hi"}"""
        type.startsWith("athlete.booking") ->
            """{"coachId":"c1","scheduledAt":"2026-01-01T10:00:00Z","durationMin":60}"""
        type.startsWith("coach.booking") -> """{"bookingId":"bk-1"}"""
        type.startsWith("coach.session") -> """{"sessionId":"sess-1","when":"2026-01-02T10:00:00Z"}"""
        type.startsWith("coach.program") -> """{"programId":"prog-1"}"""
        type.startsWith("coach.athlete") -> """{"athleteId":"ath-1"}"""
        type.startsWith("coach.inbox") -> """{"id":"notif-1"}"""
        else -> "{}"
    }

    @Test
    fun mutationTypeCatalog_coversAthleteAndCoachHandlers() {
        assertEquals(
            listOf(
                "athlete.task.toggle",
                "athlete.program.enroll",
                "athlete.message.send",
                "athlete.booking.create",
            ),
            AthleteOfflineHandlers.MUTATION_TYPES,
        )
        assertEquals(
            listOf(
                "coach.booking.approve",
                "coach.booking.decline",
                "coach.booking.reject",
                "coach.session.reschedule",
                "coach.session.cancel",
                "coach.program.publish",
                "coach.program.draft",
                "coach.program.clone",
                "coach.athlete.favorite",
                "coach.inbox.read",
            ),
            CoachOfflineHandlers.MUTATION_TYPES,
        )
        assertEquals(14, allMutationTypes.size)
        assertEquals(allMutationTypes.size, allMutationTypes.toSet().size)
    }

    @Test
    fun offlineEnqueue_survivesCoordinatorRestart_thenFlushes() = runBlocking {
        val queue = InMemorySyncQueue()
        var flushed = 0
        val exec = OfflineWorkExecutor {
            flushed++
            AppResult.Ok(Unit)
        }

        val first = DefaultOfflineCoordinator(queue, connectivity, flags, logger, exec)
        first.enqueue(SyncWork(type = "athlete.message.send", payloadJson = """{"id":"1"}"""))
        first.enqueue(SyncWork(type = "athlete.task.toggle", payloadJson = """{"id":"2"}"""))
        assertEquals(2, first.pendingCount())
        assertEquals(0, first.flush()) // offline

        val second = DefaultOfflineCoordinator(queue, connectivity, flags, logger, exec)
        assertEquals(2, second.pendingCount())

        online.value = true
        assertEquals(2, second.flush())
        assertEquals(0, second.pendingCount())
        assertEquals(2, flushed)
    }

    @Test
    fun allRegisteredTypes_surviveKillAndFlush_whenExecutorSucceeds() = runBlocking {
        val queue = InMemorySyncQueue()
        val seen = mutableSetOf<String>()
        val exec = OfflineWorkExecutor { work ->
            seen += work.type
            AppResult.Ok(Unit)
        }
        val first = DefaultOfflineCoordinator(queue, connectivity, flags, logger, exec)
        allMutationTypes.forEach { type ->
            first.enqueue(
                SyncWork(
                    type = type,
                    payloadJson = samplePayload(type),
                    idempotencyKey = "kill:$type",
                ),
            )
        }
        assertEquals(allMutationTypes.size, first.pendingCount())
        assertEquals(0, first.flush())

        val second = DefaultOfflineCoordinator(queue, connectivity, flags, logger, exec)
        assertEquals(allMutationTypes.size, second.pendingCount())
        online.value = true
        assertEquals(allMutationTypes.size, second.flush())
        assertEquals(0, second.pendingCount())
        assertEquals(allMutationTypes.toSet(), seen)
    }

    @Test
    fun failClosed_neverFakeAcksUnknownType() = runBlocking {
        online.value = true
        val queue = InMemorySyncQueue()
        val offline = DefaultOfflineCoordinator(
            queue, connectivity, flags, logger, FailClosedOfflineExecutor(logger),
        )
        offline.enqueue(SyncWork(type = "unknown.op", payloadJson = "{}"))
        assertEquals(0, offline.flush())
        assertEquals(1, offline.pendingCount())
    }

    @Test
    fun failClosed_neverFakeAcksRegisteredTypesWithoutHandlers() = runBlocking {
        online.value = true
        val queue = InMemorySyncQueue()
        val offline = DefaultOfflineCoordinator(
            queue, connectivity, flags, logger, FailClosedOfflineExecutor(logger),
        )
        allMutationTypes.forEach { type ->
            offline.enqueue(SyncWork(type = type, payloadJson = samplePayload(type)))
        }
        assertEquals(0, offline.flush())
        assertEquals(allMutationTypes.size, offline.pendingCount())
    }

    @Test
    fun httpHandlers_doNotAckWhenApiFails() = runBlocking {
        online.value = true
        val queue = InMemorySyncQueue()
        val registry = RegistryOfflineExecutor(logger)
        val failingApi = RecordingApiClient(succeed = false)
        AthleteOfflineHandlers.register(registry, failingApi, logger)
        CoachOfflineHandlers.register(registry, failingApi, logger)
        val offline = DefaultOfflineCoordinator(queue, connectivity, flags, logger, registry)

        allMutationTypes.forEach { type ->
            offline.enqueue(
                SyncWork(
                    type = type,
                    payloadJson = samplePayload(type),
                    idempotencyKey = "fail:$type",
                ),
            )
        }
        assertEquals(0, offline.flush())
        assertEquals(allMutationTypes.size, offline.pendingCount())
        assertTrue("expected HTTP attempts for registered handlers", failingApi.calls.isNotEmpty())
    }

    @Test
    fun httpHandlers_ackOnlyAfterApiSuccess() = runBlocking {
        online.value = true
        val queue = InMemorySyncQueue()
        val registry = RegistryOfflineExecutor(logger)
        val okApi = RecordingApiClient(succeed = true)
        AthleteOfflineHandlers.register(registry, okApi, logger)
        CoachOfflineHandlers.register(registry, okApi, logger)
        val offline = DefaultOfflineCoordinator(queue, connectivity, flags, logger, registry)

        allMutationTypes.forEach { type ->
            offline.enqueue(
                SyncWork(
                    type = type,
                    payloadJson = samplePayload(type),
                    idempotencyKey = "ok:$type",
                ),
            )
        }
        assertEquals(allMutationTypes.size, offline.flush())
        assertEquals(0, offline.pendingCount())
        assertEquals(allMutationTypes.size, okApi.calls.size)
    }

    @Test
    fun distinctIdempotencyKeys_bothFlush() = runBlocking {
        online.value = true
        val queue = InMemorySyncQueue()
        var n = 0
        val exec = OfflineWorkExecutor {
            n++
            AppResult.Ok(Unit)
        }
        val offline = DefaultOfflineCoordinator(queue, connectivity, flags, logger, exec)
        offline.enqueue(SyncWork(type = "athlete.booking.create", payloadJson = """{"a":1}""", idempotencyKey = "k1"))
        offline.enqueue(SyncWork(type = "athlete.booking.create", payloadJson = """{"a":2}""", idempotencyKey = "k2"))
        assertEquals(2, offline.flush())
        assertEquals(0, offline.pendingCount())
        assertEquals(2, n)
        assertTrue(n == 2)
    }

    @Test
    fun noAcknowledgingOfflineExecutor_inMainSources() {
        val androidRoot = File("..").canonicalFile
        assertTrue("expected android/ module root, got $androidRoot", androidRoot.name == "android" || File(androidRoot, "app").isDirectory)
        val root = if (androidRoot.name == "android") androidRoot else File(androidRoot, "android")
        val hits = root.walkTopDown()
            .filter { it.isFile && it.extension == "kt" && !it.path.contains("${File.separator}test${File.separator}") }
            .flatMap { f ->
                f.readLines().mapIndexedNotNull { i, line ->
                    if (line.contains("AcknowledgingOfflineExecutor")) "${f.path}:${i + 1}" else null
                }
            }
            .toList()
        assertTrue("localAck executor must not exist in main: $hits", hits.isEmpty())
    }

    @Test
    fun registryUnknownType_neverAcks() = runBlocking {
        online.value = true
        val queue = InMemorySyncQueue()
        val registry = RegistryOfflineExecutor(logger)
        AthleteOfflineHandlers.register(registry, RecordingApiClient(succeed = true), logger)
        val offline = DefaultOfflineCoordinator(queue, connectivity, flags, logger, registry)
        offline.enqueue(SyncWork(type = "coach.booking.approve", payloadJson = """{"bookingId":"x"}"""))
        // Coach types not registered on this registry → fail closed
        assertEquals(0, offline.flush())
        assertEquals(1, offline.pendingCount())
    }

    private class RecordingApiClient(
        private val succeed: Boolean,
    ) : ApiClient {
        val calls = mutableListOf<Pair<String, String>>()

        private fun result(method: String, path: String): AppResult<String> {
            calls += method to path
            return if (succeed) {
                AppResult.Ok("""{"ok":true}""")
            } else {
                AppResult.Err(AppError.Network(AppError.NetworkKind.OFFLINE))
            }
        }

        override suspend fun get(path: String, headers: Map<String, String>): AppResult<String> =
            result("GET", path)

        override suspend fun post(
            path: String,
            body: String,
            headers: Map<String, String>,
            mediaType: String,
        ): AppResult<String> = result("POST", path)

        override suspend fun put(
            path: String,
            body: String,
            headers: Map<String, String>,
            mediaType: String,
        ): AppResult<String> = result("PUT", path)

        override suspend fun delete(path: String, headers: Map<String, String>): AppResult<String> =
            result("DELETE", path)

        override fun cancelAll() = Unit
    }
}
