package com.fitconnect.android.sports.guided.runtime

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.offline.ConflictStrategy
import com.fitconnect.android.foundation.offline.OfflineCoordinator
import com.fitconnect.android.foundation.offline.SyncQueue
import com.fitconnect.android.foundation.offline.SyncWork
import com.fitconnect.android.foundation.session.SessionStore
import com.fitconnect.android.sports.guided.catalog.DefaultGuidedPlan
import com.fitconnect.android.sports.guided.completion.ActivityCompletionFactory
import com.fitconnect.android.sports.guided.domain.FakeWorkoutClock
import com.fitconnect.android.sports.guided.domain.GuidedSessionSnapshot
import com.fitconnect.android.sports.guided.domain.PendingSyncRecord
import com.fitconnect.android.sports.guided.domain.SetLogInput
import com.fitconnect.android.sports.guided.domain.SyncUiStatus
import com.fitconnect.android.sports.guided.domain.SystemWorkoutClock
import com.fitconnect.android.sports.guided.domain.WorkoutClock
import com.fitconnect.android.sports.guided.domain.WorkoutCommand
import com.fitconnect.android.sports.guided.domain.WorkoutIds
import com.fitconnect.android.sports.guided.domain.WorkoutPhase
import com.fitconnect.android.sports.guided.machine.WorkoutSessionMachine
import com.fitconnect.android.sports.guided.notifications.NoOpWorkoutNotificationPort
import com.fitconnect.android.sports.guided.notifications.WorkoutNotificationPort
import com.fitconnect.android.sports.guided.observability.WorkoutLog
import com.fitconnect.android.sports.guided.store.GuidedWorkoutStore
import com.fitconnect.android.sports.progression.PreviousSetPerformance
import com.fitconnect.android.sports.progression.ProgressionEngine
import com.fitconnect.android.sports.progression.ProgressionInput
import com.fitconnect.android.sports.progression.SetType
import java.util.UUID
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class GuidedWorkoutRuntime(
    private val store: GuidedWorkoutStore,
    private val logger: Logger,
    private val sessionStore: SessionStore? = null,
    private val offline: OfflineCoordinator? = null,
    private val syncQueue: SyncQueue? = null,
    private val clock: WorkoutClock = SystemWorkoutClock,
    private val notifications: WorkoutNotificationPort = NoOpWorkoutNotificationPort,
    private val idFactory: () -> String = { UUID.randomUUID().toString() },
) {
    private val mutex = Mutex()
    private val _snapshot = MutableStateFlow(GuidedSessionSnapshot.idle())
    val snapshot: StateFlow<GuidedSessionSnapshot> = _snapshot

    suspend fun prepare(userIdOverride: String? = null): AppResult<GuidedSessionSnapshot> = mutex.withLock {
        val userId = userIdOverride ?: sessionStore?.snapshot()?.userId
        if (userId.isNullOrBlank()) {
            return AppResult.Err(
                com.fitconnect.android.foundation.common.AppError.Auth(
                    com.fitconnect.android.foundation.common.AppError.AuthKind.UNAUTHENTICATED,
                ),
            )
        }
        store.loadActive(userId)?.let { active ->
            return persist(WorkoutSessionMachine.reduce(active, WorkoutCommand.Recover(active), clock))
        }
        store.loadUnsynced(userId)?.let { unsynced ->
            applyProgression(unsynced)
            return persist(WorkoutSessionMachine.reduce(unsynced, WorkoutCommand.Recover(unsynced), clock))
        }
        val sessionId = idFactory()
        persist(
            WorkoutSessionMachine.reduce(
                GuidedSessionSnapshot.idle(),
                WorkoutCommand.LoadPlan(userId, DefaultGuidedPlan.plan(), sessionId),
                clock,
                eventId = idFactory,
            ),
        )
    }

    suspend fun start(): AppResult<GuidedSessionSnapshot> = dispatch(WorkoutCommand.Start)

    suspend fun logSet(input: SetLogInput): AppResult<GuidedSessionSnapshot> = dispatch(WorkoutCommand.LogSet(input))

    suspend fun skipRest(): AppResult<GuidedSessionSnapshot> = dispatch(WorkoutCommand.SkipRest)

    suspend fun extendRest(extraSec: Int): AppResult<GuidedSessionSnapshot> =
        dispatch(WorkoutCommand.ExtendRest(extraSec))

    suspend fun pause(): AppResult<GuidedSessionSnapshot> = dispatch(WorkoutCommand.Pause)

    suspend fun resume(): AppResult<GuidedSessionSnapshot> = dispatch(WorkoutCommand.Resume)

    suspend fun skipExercise(): AppResult<GuidedSessionSnapshot> = dispatch(WorkoutCommand.SkipExercise)

    suspend fun tick(): AppResult<GuidedSessionSnapshot> = dispatch(WorkoutCommand.Tick)

    suspend fun finish(): AppResult<GuidedSessionSnapshot> = dispatch(WorkoutCommand.Finish)

    suspend fun startNew(): AppResult<GuidedSessionSnapshot> = mutex.withLock {
        val userId = _snapshot.value.userId.ifBlank { sessionStore?.snapshot()?.userId }
        if (userId.isNullOrBlank()) {
            return AppResult.Err(
                com.fitconnect.android.foundation.common.AppError.Auth(
                    com.fitconnect.android.foundation.common.AppError.AuthKind.UNAUTHENTICATED,
                ),
            )
        }
        val sessionId = idFactory()
        persistUnlocked(
            WorkoutSessionMachine.reduce(
                GuidedSessionSnapshot.idle(),
                WorkoutCommand.LoadPlan(userId, DefaultGuidedPlan.plan(), sessionId),
                clock,
                eventId = idFactory,
            ),
        )
    }

    suspend fun trySync(): AppResult<GuidedSessionSnapshot> = mutex.withLock {
        val current = _snapshot.value
        if (current.phase != WorkoutPhase.SYNC_PENDING && current.phase != WorkoutPhase.COMPLETED) {
            return AppResult.Ok(current)
        }
        val before = syncQueue?.peek(50)?.map { it.idempotencyKey }?.toSet().orEmpty()
        offline?.flush()
        val after = syncQueue?.peek(50)?.map { it.idempotencyKey }?.toSet().orEmpty()
        (before - after).forEach { key -> store.acknowledgePending(key) }
        val pending = store.pendingFor(current.sessionId)
        val result = when {
            pending.isEmpty() && (before.isNotEmpty() || current.syncStatus == SyncUiStatus.SYNCING) ->
                WorkoutSessionMachine.reduce(current, WorkoutCommand.MarkSynced, clock, eventId = idFactory)
            pending.isEmpty() && current.phase == WorkoutPhase.COMPLETED -> {
                enqueueCompletionUnlocked(current)
                WorkoutSessionMachine.reduce(
                    _snapshot.value,
                    WorkoutCommand.MarkSyncPending(current.activityId ?: current.sessionId),
                    clock,
                    eventId = idFactory,
                )
            }
            else -> WorkoutSessionMachine.reduce(
                current,
                WorkoutCommand.MarkSyncError("Waiting for network or server."),
                clock,
                eventId = idFactory,
            )
        }
        persistUnlocked(result)
        notifications.syncState(result.snapshot.syncStatus, result.snapshot.sessionId)
        AppResult.Ok(result.snapshot)
    }

    private suspend fun dispatch(command: WorkoutCommand): AppResult<GuidedSessionSnapshot> = mutex.withLock {
        val persisted = persistUnlocked(
            WorkoutSessionMachine.reduce(_snapshot.value, command, clock, eventId = idFactory),
        )
        val snap = (persisted as? AppResult.Ok)?.value ?: return persisted
        if (snap.phase == WorkoutPhase.COMPLETED && snap.activityId == null) {
            return enqueueCompletionUnlocked(snap)
        }
        persisted
    }

    private suspend fun persist(
        result: com.fitconnect.android.sports.guided.domain.ReduceResult,
    ): AppResult<GuidedSessionSnapshot> = persistUnlocked(result)

    private suspend fun persistUnlocked(
        result: com.fitconnect.android.sports.guided.domain.ReduceResult,
    ): AppResult<GuidedSessionSnapshot> {
        var snapshot = result.snapshot
        if (snapshot.phase == WorkoutPhase.COMPLETED && snapshot.progressionRationale == null) {
            snapshot = applyProgression(snapshot)
        }
        store.save(snapshot)
        store.appendEvents(result.events)
        result.events.forEach { WorkoutLog.event(logger, it.type, snapshot.sessionId) }
        _snapshot.value = snapshot.copy(lastError = result.rejected ?: snapshot.lastError)
        if (result.rejected != null) {
            return AppResult.Err(com.fitconnect.android.foundation.common.AppError.Unexpected(result.rejected))
        }
        return AppResult.Ok(snapshot)
    }

    private fun applyProgression(snapshot: GuidedSessionSnapshot): GuidedSessionSnapshot {
        val lastExercise = snapshot.sets.lastOrNull()?.exerciseId ?: return snapshot
        val planned = snapshot.plan.exercises.find { it.exerciseId == lastExercise } ?: return snapshot
        val previous = snapshot.sets.filter { it.exerciseId == lastExercise }.map {
            PreviousSetPerformance(
                setType = SetType.WORKING,
                actualReps = it.actualReps,
                actualWeightKg = it.loadKg,
                actualTimeSec = it.actualTimeSec,
                targetReps = it.targetReps,
                targetWeightKg = planned.targetWeightKg,
                isFailed = it.isFailed,
            )
        }
        val target = ProgressionEngine.compute(
            ProgressionInput(
                rule = planned.progressionRule,
                exerciseMode = planned.mode,
                sideMode = planned.sideMode,
                previousSets = previous,
                repMin = planned.targetRepsMin,
                repMax = planned.targetRepsMax,
            ),
        )
        return snapshot.copy(
            progressionRationale = target.rationale,
            progressionState = target.progressionState,
        )
    }

    private suspend fun enqueueCompletion(snapshot: GuidedSessionSnapshot): AppResult<GuidedSessionSnapshot> =
        enqueueCompletionUnlocked(snapshot)

    private suspend fun enqueueCompletionUnlocked(
        snapshot: GuidedSessionSnapshot,
    ): AppResult<GuidedSessionSnapshot> {
        val completion = ActivityCompletionFactory.from(snapshot)
        val activityWork = PendingSyncRecord(
            id = "act-${snapshot.sessionId}",
            sessionId = snapshot.sessionId,
            type = WORKOUT_ACTIVITY_TYPE,
            payloadJson = ActivityCompletionFactory.activityPayload(completion),
            idempotencyKey = completion.idempotencyKey,
            attempts = 0,
            status = "PENDING",
        )
        val xpWork = PendingSyncRecord(
            id = "xp-${snapshot.sessionId}",
            sessionId = snapshot.sessionId,
            type = WORKOUT_XP_TYPE,
            payloadJson = ActivityCompletionFactory.xpPayload(
                snapshot.userId,
                snapshot.sessionId,
                completion.activityId,
                completion.durationMs,
            ),
            idempotencyKey = WorkoutIds.xpEventId(snapshot.userId, snapshot.sessionId),
            attempts = 0,
            status = "PENDING",
        )
        store.upsertPending(listOf(activityWork, xpWork))
        offline?.enqueue(
            SyncWork(
                id = activityWork.id,
                type = activityWork.type,
                payloadJson = activityWork.payloadJson,
                idempotencyKey = activityWork.idempotencyKey,
                conflictStrategy = ConflictStrategy.SERVER_AUTHORITATIVE,
            ),
        )
        offline?.enqueue(
            SyncWork(
                id = xpWork.id,
                type = xpWork.type,
                payloadJson = xpWork.payloadJson,
                idempotencyKey = xpWork.idempotencyKey,
                conflictStrategy = ConflictStrategy.SERVER_AUTHORITATIVE,
            ),
        )
        WorkoutLog.event(logger, "activity_sync_started", snapshot.sessionId)
        val pending = WorkoutSessionMachine.reduce(
            snapshot,
            WorkoutCommand.MarkSyncPending(completion.activityId),
            clock,
            eventId = idFactory,
        )
        persistUnlocked(pending)
        return AppResult.Ok(_snapshot.value)
    }

    companion object {
        const val WORKOUT_ACTIVITY_TYPE = "workout.activity.complete"
        const val WORKOUT_XP_TYPE = "workout.xp.award"
    }
}

/** Exposed for tests that need a deterministic clock without Android SystemClock. */
fun guidedTestClock(): FakeWorkoutClock = FakeWorkoutClock()
