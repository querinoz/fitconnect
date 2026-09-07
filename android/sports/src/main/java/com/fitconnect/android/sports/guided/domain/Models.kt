package com.fitconnect.android.sports.guided.domain

import com.fitconnect.android.sports.progression.ExerciseMode
import com.fitconnect.android.sports.progression.ProgressionRule
import com.fitconnect.android.sports.progression.ProgressionState
import com.fitconnect.android.sports.progression.SideMode

/** Wave 2 session machine — local + 018. FINISHED/CANCELLED remain 017 aliases. */
enum class WorkoutPhase {
    IDLE,
    PREP,
    ACTIVE,
    REST,
    PAUSED,
    COMPLETING,
    COMPLETED,
    FAILED,
    RECOVERING,
    SYNC_PENDING,
    SYNCED,
}

enum class SyncUiStatus {
    LOCAL,
    SYNCING,
    SYNCED,
    SYNC_ERROR,
}

enum class SetSide {
    LEFT,
    RIGHT,
    BOTH,
    NONE,
}

enum class LoggedSetType {
    WARMUP,
    WORKING,
    DROPSET,
    AMRAP,
}

/** RPE 1–10 (0.5 steps). RIR 0–5. Missing stays null. */
object EffortScales {
    const val RPE_MIN = 1.0
    const val RPE_MAX = 10.0
    const val RIR_MIN = 0
    const val RIR_MAX = 5
}

data class PlannedExercise(
    val exerciseId: String,
    val name: String,
    val mode: ExerciseMode,
    val weighted: Boolean,
    val sideMode: SideMode,
    val supersetGroupId: String?,
    val targetSets: Int,
    val targetRepsMin: Int,
    val targetRepsMax: Int,
    val targetWeightKg: Double?,
    val targetTimeSec: Int?,
    val restSec: Int,
    val progressionRule: ProgressionRule,
    val rpeRequired: Boolean = false,
    val rirRequired: Boolean = false,
)

data class WorkoutPlan(
    val workoutId: String,
    val name: String,
    val estimatedDurationMin: Int,
    val exercises: List<PlannedExercise>,
)

data class ExecutionSlot(
    val slotIndex: Int,
    val exercise: PlannedExercise,
    val setNumber: Int,
    val side: SetSide,
    val restAfterSec: Int,
)

data class RestTimerState(
    val remainingMs: Long,
    val durationMs: Long,
    val elapsedAnchorMs: Long,
    val wallAnchorMs: Long,
    val nextSlotIndex: Int,
)

data class TimedExerciseState(
    val remainingMs: Long,
    val durationMs: Long,
    val elapsedAnchorMs: Long,
    val wallAnchorMs: Long,
    val slotIndex: Int,
)

data class ExerciseSetRecord(
    val setId: String,
    val sessionId: String,
    val exerciseId: String,
    val sequence: Int,
    val setIndex: Int,
    val setType: LoggedSetType,
    val supersetGroupId: String?,
    val side: SetSide,
    val targetReps: Int?,
    val actualReps: Int?,
    val targetTimeSec: Int?,
    val actualTimeSec: Int?,
    val loadKg: Double?,
    val rpe: Double?,
    val rir: Int?,
    val completedAtMs: Long,
    val isFailed: Boolean,
)

data class WorkoutEventRecord(
    val eventId: String,
    val sessionId: String,
    val type: String,
    val payload: String,
    val createdAtMs: Long,
)

data class PendingSyncRecord(
    val id: String,
    val sessionId: String,
    val type: String,
    val payloadJson: String,
    val idempotencyKey: String,
    val attempts: Int,
    val status: String,
)

data class ActivityCompletion(
    val activityId: String,
    val userId: String,
    val sessionId: String,
    val type: String,
    val startedAtMs: Long,
    val completedAtMs: Long,
    val durationMs: Long,
    val source: String,
    val idempotencyKey: String,
    val metricsJson: String,
    val metadataJson: String,
)

data class SetLogInput(
    val actualReps: Int? = null,
    val actualTimeSec: Int? = null,
    val loadKg: Double? = null,
    val rpe: Double? = null,
    val rir: Int? = null,
    val side: SetSide? = null,
    val failed: Boolean = false,
)

data class CompletionSummary(
    val durationMs: Long,
    val totalSets: Int,
    val volumeKg: Double,
    val exercisesCompleted: Int,
    val progressionRationale: String?,
    val xpEarned: Int?,
    val syncStatus: SyncUiStatus,
)

data class GuidedSessionSnapshot(
    val userId: String,
    val sessionId: String,
    val workoutId: String,
    val plan: WorkoutPlan,
    val schedule: List<ExecutionSlot>,
    val phase: WorkoutPhase,
    val slotIndex: Int,
    val sets: List<ExerciseSetRecord>,
    val rest: RestTimerState?,
    val timed: TimedExerciseState?,
    val pausedFrom: WorkoutPhase?,
    val startedAtMs: Long?,
    val completedAtMs: Long?,
    val activityId: String?,
    val idempotencyKey: String,
    val syncStatus: SyncUiStatus,
    val lastError: String?,
    val progressionRationale: String?,
    val progressionState: ProgressionState?,
    val xpEarned: Int?,
    val xpDuplicatePrevented: Boolean,
    val events: List<WorkoutEventRecord> = emptyList(),
    val pendingSync: List<PendingSyncRecord> = emptyList(),
) {
    val currentSlot: ExecutionSlot? get() = schedule.getOrNull(slotIndex)

    val nextSlot: ExecutionSlot? get() = schedule.getOrNull(slotIndex + 1)

    fun summary(): CompletionSummary {
        val volume = sets.fold(0.0) { acc, s ->
            val reps = s.actualReps ?: 0
            val load = s.loadKg ?: 0.0
            acc + (reps * load)
        }
        val duration = when {
            completedAtMs != null && startedAtMs != null -> completedAtMs - startedAtMs
            startedAtMs != null -> 0L
            else -> 0L
        }
        return CompletionSummary(
            durationMs = duration.coerceAtLeast(0),
            totalSets = sets.size,
            volumeKg = volume,
            exercisesCompleted = sets.map { it.exerciseId }.distinct().size,
            progressionRationale = progressionRationale,
            xpEarned = xpEarned,
            syncStatus = syncStatus,
        )
    }

    companion object {
        fun idle(): GuidedSessionSnapshot = GuidedSessionSnapshot(
            userId = "",
            sessionId = "",
            workoutId = "",
            plan = WorkoutPlan("", "", 0, emptyList()),
            schedule = emptyList(),
            phase = WorkoutPhase.IDLE,
            slotIndex = 0,
            sets = emptyList(),
            rest = null,
            timed = null,
            pausedFrom = null,
            startedAtMs = null,
            completedAtMs = null,
            activityId = null,
            idempotencyKey = "",
            syncStatus = SyncUiStatus.LOCAL,
            lastError = null,
            progressionRationale = null,
            progressionState = null,
            xpEarned = null,
            xpDuplicatePrevented = false,
        )
    }
}

sealed class WorkoutCommand {
    data class LoadPlan(
        val userId: String,
        val plan: WorkoutPlan,
        val sessionId: String,
    ) : WorkoutCommand()

    data object Start : WorkoutCommand()
    data class LogSet(val input: SetLogInput) : WorkoutCommand()
    data object SkipRest : WorkoutCommand()
    data class ExtendRest(val extraSec: Int) : WorkoutCommand()
    data object Pause : WorkoutCommand()
    data object Resume : WorkoutCommand()
    data object SkipExercise : WorkoutCommand()
    data object Finish : WorkoutCommand()
    data object Tick : WorkoutCommand()
    data class Recover(val snapshot: GuidedSessionSnapshot) : WorkoutCommand()
    data class MarkSyncPending(val activityId: String) : WorkoutCommand()
    data object MarkSynced : WorkoutCommand()
    data class MarkSyncError(val message: String) : WorkoutCommand()
    data class MarkFailed(val reason: String) : WorkoutCommand()
    data class AwardXp(val xp: Int, val duplicate: Boolean) : WorkoutCommand()
}

data class ReduceResult(
    val snapshot: GuidedSessionSnapshot,
    val events: List<WorkoutEventRecord> = emptyList(),
    val rejected: String? = null,
)

interface WorkoutClock {
    fun wallClockMs(): Long
    fun elapsedRealtimeMs(): Long
}

object SystemWorkoutClock : WorkoutClock {
    override fun wallClockMs(): Long = System.currentTimeMillis()
    override fun elapsedRealtimeMs(): Long = android.os.SystemClock.elapsedRealtime()
}

class FakeWorkoutClock(
    var wallMs: Long = 1_700_000_000_000L,
    var elapsedMs: Long = 60_000L,
) : WorkoutClock {
    override fun wallClockMs(): Long = wallMs
    override fun elapsedRealtimeMs(): Long = elapsedMs
    fun advance(ms: Long) {
        wallMs += ms
        elapsedMs += ms
    }
}

object WorkoutIds {
    fun activityIdempotencyKey(userId: String, sessionId: String): String =
        "activity:$userId:$sessionId"

    fun xpEventId(userId: String, sessionId: String): String =
        "xp:$userId:$sessionId"

    fun activityProvider(): String = "MANUAL"

    fun sport(): String = "STRENGTH"
}
