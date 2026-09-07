package com.fitconnect.android.sports.guided

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.flags.FeatureFlag
import com.fitconnect.android.foundation.flags.FeatureFlagStore
import com.fitconnect.android.foundation.offline.DefaultOfflineCoordinator
import com.fitconnect.android.foundation.offline.InMemorySyncQueue
import com.fitconnect.android.foundation.offline.OfflineWorkExecutor
import com.fitconnect.android.foundation.offline.RegistryOfflineExecutor
import com.fitconnect.android.foundation.offline.SyncWork
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.sports.guided.catalog.DefaultGuidedPlan
import com.fitconnect.android.sports.guided.domain.FakeWorkoutClock
import com.fitconnect.android.sports.guided.domain.SetLogInput
import com.fitconnect.android.sports.guided.domain.SetSide
import com.fitconnect.android.sports.guided.domain.WorkoutCommand
import com.fitconnect.android.sports.guided.domain.WorkoutIds
import com.fitconnect.android.sports.guided.domain.WorkoutPhase
import com.fitconnect.android.sports.guided.logging.SetValidation
import com.fitconnect.android.sports.guided.logging.SetValidator
import com.fitconnect.android.sports.guided.machine.WorkoutSessionMachine
import com.fitconnect.android.sports.guided.runtime.GuidedWorkoutRuntime
import com.fitconnect.android.sports.guided.schedule.ExecutionSchedule
import com.fitconnect.android.sports.guided.store.InMemoryGuidedWorkoutStore
import com.fitconnect.android.sports.progression.ProgressionEngine
import com.fitconnect.android.sports.progression.ProgressionInput
import com.fitconnect.android.sports.progression.ProgressionRule
import com.fitconnect.android.sports.progression.ExerciseMode
import com.fitconnect.android.sports.progression.PreviousSetPerformance
import com.fitconnect.android.sports.progression.SetType
import com.fitconnect.android.sports.progression.SideMode
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class GuidedWorkoutWave2Test {
    private val clock = FakeWorkoutClock()
    private val logger = object : Logger {
        override fun d(tag: String, message: String) = Unit
        override fun i(tag: String, message: String) = Unit
        override fun w(tag: String, message: String, throwable: Throwable?) = Unit
        override fun e(tag: String, message: String, throwable: Throwable?) = Unit
    }

    @Test
    fun workout001_sessionStateMachineTransitions() {
        val loaded = WorkoutSessionMachine.reduce(
            com.fitconnect.android.sports.guided.domain.GuidedSessionSnapshot.idle(),
            WorkoutCommand.LoadPlan("uid-1", DefaultGuidedPlan.plan(), "sess-1"),
            clock,
        )
        assertEquals(WorkoutPhase.PREP, loaded.snapshot.phase)
        val started = WorkoutSessionMachine.reduce(loaded.snapshot, WorkoutCommand.Start, clock)
        assertEquals(WorkoutPhase.ACTIVE, started.snapshot.phase)
        val paused = WorkoutSessionMachine.reduce(started.snapshot, WorkoutCommand.Pause, clock)
        assertEquals(WorkoutPhase.PAUSED, paused.snapshot.phase)
        val resumed = WorkoutSessionMachine.reduce(paused.snapshot, WorkoutCommand.Resume, clock)
        assertEquals(WorkoutPhase.ACTIVE, resumed.snapshot.phase)
        val illegal = WorkoutSessionMachine.reduce(resumed.snapshot, WorkoutCommand.Start, clock)
        assertEquals("Start is only valid from PREP.", illegal.rejected)
        assertEquals(WorkoutPhase.ACTIVE, illegal.snapshot.phase)
    }

    @Test
    fun workout002_setLoggingRejectsInvalidAndPersistsValid() = runBlocking {
        val slot = ExecutionSchedule.build(DefaultGuidedPlan.plan()).first()
        assertTrue(SetValidator.validate(slot, SetLogInput(actualReps = -1, loadKg = 60.0)) is SetValidation.Err)
        assertTrue(SetValidator.validate(slot, SetLogInput(actualReps = 8, loadKg = 60.0)) is SetValidation.Ok)
        val runtime = runtime()
        runtime.prepare("uid-1")
        runtime.start()
        val logged = runtime.logSet(SetLogInput(actualReps = 8, loadKg = 60.0, rpe = 7.0, rir = 2))
        assertTrue(logged is AppResult.Ok)
        val snap = runtime.snapshot.value
        assertEquals(1, snap.sets.size)
        assertEquals(8, snap.sets.first().actualReps)
        assertEquals(60.0, snap.sets.first().loadKg!!, 0.01)
        assertEquals(7.0, snap.sets.first().rpe!!, 0.01)
        assertEquals(2, snap.sets.first().rir)
        assertEquals(WorkoutPhase.REST, snap.phase)
    }

    @Test
    fun workout003_timedExerciseUsesMonotonicClock() {
        val plan = DefaultGuidedPlan.plan()
        val plankIndex = ExecutionSchedule.build(plan).indexOfFirst { it.exercise.exerciseId == "ex_plank" }
        var state = WorkoutSessionMachine.reduce(
            com.fitconnect.android.sports.guided.domain.GuidedSessionSnapshot.idle(),
            WorkoutCommand.LoadPlan("uid-1", plan, "sess-timed"),
            clock,
        ).snapshot
        state = WorkoutSessionMachine.reduce(state, WorkoutCommand.Start, clock).snapshot
        state = state.copy(
            slotIndex = plankIndex,
            timed = com.fitconnect.android.sports.guided.timer.MonotonicTimer.startTimed(
                20_000,
                plankIndex,
                clock,
            ),
            phase = WorkoutPhase.ACTIVE,
        )
        clock.advance(10_000)
        state = WorkoutSessionMachine.reduce(state, WorkoutCommand.Tick, clock).snapshot
        assertEquals(WorkoutPhase.ACTIVE, state.phase)
        clock.advance(10_000)
        state = WorkoutSessionMachine.reduce(state, WorkoutCommand.Tick, clock).snapshot
        assertTrue(state.sets.any { it.exerciseId == "ex_plank" && it.actualTimeSec == 20 })
    }

    @Test
    fun workout004_restTimerSkipAndExtend() {
        var state = WorkoutSessionMachine.reduce(
            com.fitconnect.android.sports.guided.domain.GuidedSessionSnapshot.idle(),
            WorkoutCommand.LoadPlan("uid-1", DefaultGuidedPlan.plan(), "sess-rest"),
            clock,
        ).snapshot
        state = WorkoutSessionMachine.reduce(state, WorkoutCommand.Start, clock).snapshot
        state = WorkoutSessionMachine.reduce(
            state,
            WorkoutCommand.LogSet(SetLogInput(actualReps = 8, loadKg = 60.0)),
            clock,
        ).snapshot
        assertEquals(WorkoutPhase.REST, state.phase)
        assertNotNull(state.rest)
        clock.advance(5_000)
        state = WorkoutSessionMachine.reduce(state, WorkoutCommand.ExtendRest(15), clock).snapshot
        val remaining = com.fitconnect.android.sports.guided.timer.MonotonicTimer.restRemaining(state.rest!!, clock)
        assertTrue(remaining > 90_000)
        state = WorkoutSessionMachine.reduce(state, WorkoutCommand.SkipRest, clock).snapshot
        assertEquals(WorkoutPhase.ACTIVE, state.phase)
    }

    @Test
    fun workout005_supersetCyclesA1A2ThenRest() {
        val schedule = ExecutionSchedule.build(DefaultGuidedPlan.plan())
        val row = schedule.first { it.exercise.exerciseId == "ex_dumbbell_row" }
        val push = schedule.first { it.exercise.exerciseId == "ex_push_up" }
        assertEquals("A", row.exercise.supersetGroupId)
        assertEquals("A", push.exercise.supersetGroupId)
        assertEquals(0, row.restAfterSec)
        assertTrue(push.restAfterSec > 0)
        assertEquals(row.slotIndex + 1, push.slotIndex)
    }

    @Test
    fun workout006_progressionEngineRemainsCanonical() {
        val target = ProgressionEngine.compute(
            ProgressionInput(
                rule = ProgressionRule.DOUBLE_PROGRESSION,
                exerciseMode = ExerciseMode.REPS,
                sideMode = SideMode.NONE,
                previousSets = listOf(
                    PreviousSetPerformance(
                        setType = SetType.WORKING,
                        actualReps = 8,
                        actualWeightKg = 60.0,
                        actualTimeSec = null,
                        targetReps = 8,
                        targetWeightKg = 60.0,
                        isFailed = false,
                    ),
                ),
                repMin = 6,
                repMax = 8,
            ),
        )
        assertTrue(target.rationale.contains("Double progression"))
        assertNotNull(target.targetWeightKg)
    }

    @Test
    fun workout007_persistenceRoundTrip() = runBlocking {
        val store = InMemoryGuidedWorkoutStore()
        val runtime = GuidedWorkoutRuntime(store = store, logger = logger, clock = clock)
        runtime.prepare("uid-1")
        runtime.start()
        runtime.logSet(SetLogInput(actualReps = 8, loadKg = 60.0))
        val saved = store.load(runtime.snapshot.value.sessionId)
        assertNotNull(saved)
        assertEquals(1, saved!!.sets.size)
        assertEquals(WorkoutPhase.REST, saved.phase)
    }

    @Test
    fun workout008_processRecoveryRestoresExactSession() = runBlocking {
        val store = InMemoryGuidedWorkoutStore()
        val first = GuidedWorkoutRuntime(store = store, logger = logger, clock = clock)
        first.prepare("uid-1")
        first.start()
        first.logSet(SetLogInput(actualReps = 8, loadKg = 60.0))
        val before = first.snapshot.value
        val second = GuidedWorkoutRuntime(store = store, logger = logger, clock = clock)
        second.prepare("uid-1")
        val after = second.snapshot.value
        assertEquals(before.sessionId, after.sessionId)
        assertEquals(before.phase, after.phase)
        assertEquals(before.sets.size, after.sets.size)
        assertEquals(before.sets.first().actualReps, after.sets.first().actualReps)
        assertEquals(before.slotIndex, after.slotIndex)
    }

    @Test
    fun workout009_idempotentActivityAndXpKeys() = runBlocking {
        val env = syncEnv(succeed = false, online = false)
        env.runtime.prepare("uid-1")
        env.runtime.start()
        env.runtime.finish()
        env.runtime.finish()
        val pending = env.store.pendingFor(env.runtime.snapshot.value.sessionId)
        val keys = pending.map { it.idempotencyKey } + env.queue.peek(20).map { it.idempotencyKey }
        val activityKeys = keys.filter { it.startsWith("activity:") }.distinct()
        val xpKeys = keys.filter { it.startsWith("xp:") }.distinct()
        assertEquals(1, activityKeys.size)
        assertEquals(1, xpKeys.size)
        assertEquals(WorkoutIds.activityIdempotencyKey("uid-1", env.runtime.snapshot.value.sessionId), activityKeys.first())
        assertEquals(WorkoutIds.xpEventId("uid-1", env.runtime.snapshot.value.sessionId), xpKeys.first())
    }

    @Test
    fun workout010_offlineQueueDoesNotFakeSuccess() = runBlocking {
        val env = syncEnv(succeed = false, online = false)
        env.runtime.prepare("uid-1")
        env.runtime.start()
        env.runtime.finish()
        val snap = env.runtime.snapshot.value
        assertEquals(WorkoutPhase.SYNC_PENDING, snap.phase)
        assertTrue(snap.syncStatus == com.fitconnect.android.sports.guided.domain.SyncUiStatus.SYNCING ||
            snap.syncStatus == com.fitconnect.android.sports.guided.domain.SyncUiStatus.SYNC_ERROR)
        assertFalse(snap.phase == WorkoutPhase.SYNCED)
        assertTrue(env.store.pendingFor(snap.sessionId).isNotEmpty())
    }

    @Test
    fun workout011_syncRetryThenSucceed() = runBlocking {
        val env = syncEnv(succeed = false, online = true)
        env.runtime.prepare("uid-1")
        env.runtime.start()
        env.runtime.finish()
        assertEquals(WorkoutPhase.SYNC_PENDING, env.runtime.snapshot.value.phase)
        env.handler.succeed = true
        env.online.value = true
        env.runtime.trySync()
        assertEquals(WorkoutPhase.SYNCED, env.runtime.snapshot.value.phase)
    }

    @Test
    fun workout012_duplicateCompletionAndXpPrevented() = runBlocking {
        val env = syncEnv(succeed = true, online = true)
        env.runtime.prepare("uid-1")
        env.runtime.start()
        env.runtime.finish()
        env.runtime.trySync()
        val sessionId = env.runtime.snapshot.value.sessionId
        env.runtime.finish()
        env.runtime.trySync()
        val activityCalls = env.handler.activityCalls
        val xpCalls = env.handler.xpCalls
        assertEquals(1, activityCalls)
        assertEquals(1, xpCalls)
        env.handler.succeed = true
        repeat(20) { env.runtime.trySync() }
        assertEquals(1, env.handler.activityCalls)
        assertEquals(1, env.handler.xpCalls)
        assertEquals(sessionId, env.runtime.snapshot.value.sessionId)
    }

    private fun runtime(): GuidedWorkoutRuntime =
        GuidedWorkoutRuntime(store = InMemoryGuidedWorkoutStore(), logger = logger, clock = clock)

    private fun syncEnv(succeed: Boolean, online: Boolean = true): SyncEnv {
        val store = InMemoryGuidedWorkoutStore()
        val queue = InMemorySyncQueue()
        val onlineFlow = MutableStateFlow(online)
        val connectivity = object : ConnectivityMonitor {
            override val online: StateFlow<Boolean> = onlineFlow
            override fun start() = Unit
        }
        val flags = object : FeatureFlagStore {
            override fun isEnabled(flag: FeatureFlag): Boolean = true
            override fun observe(flag: FeatureFlag): Flow<Boolean> = flowOf(true)
            override suspend fun setLocal(flag: FeatureFlag, enabled: Boolean) = Unit
            override suspend fun applyRemote(overrides: Map<String, Boolean>) = Unit
        }
        val handler = CountingHandler(succeed)
        val registry = RegistryOfflineExecutor(logger).also {
            it.register(GuidedWorkoutRuntime.WORKOUT_ACTIVITY_TYPE, handler)
            it.register(GuidedWorkoutRuntime.WORKOUT_XP_TYPE, handler)
        }
        val coordinator = DefaultOfflineCoordinator(
            queue = queue,
            connectivity = connectivity,
            featureFlags = flags,
            logger = logger,
            executor = registry,
        )
        val runtime = GuidedWorkoutRuntime(
            store = store,
            logger = logger,
            clock = clock,
            offline = coordinator,
            syncQueue = queue,
        )
        return SyncEnv(runtime, store, queue, handler, onlineFlow)
    }

    private class CountingHandler(var succeed: Boolean) : OfflineWorkExecutor {
        var activityCalls = 0
        var xpCalls = 0
        private val seen = java.util.concurrent.ConcurrentHashMap.newKeySet<String>()
        override suspend fun execute(work: SyncWork): AppResult<Unit> {
            if (!succeed) {
                return AppResult.Err(com.fitconnect.android.foundation.common.AppError.Network(
                    com.fitconnect.android.foundation.common.AppError.NetworkKind.OFFLINE,
                ))
            }
            if (!seen.add(work.idempotencyKey)) {
                return AppResult.Ok(Unit)
            }
            if (work.type == GuidedWorkoutRuntime.WORKOUT_ACTIVITY_TYPE) activityCalls++
            if (work.type == GuidedWorkoutRuntime.WORKOUT_XP_TYPE) xpCalls++
            return AppResult.Ok(Unit)
        }
    }

    private data class SyncEnv(
        val runtime: GuidedWorkoutRuntime,
        val store: InMemoryGuidedWorkoutStore,
        val queue: InMemorySyncQueue,
        val handler: CountingHandler,
        val online: MutableStateFlow<Boolean>,
    )
}
