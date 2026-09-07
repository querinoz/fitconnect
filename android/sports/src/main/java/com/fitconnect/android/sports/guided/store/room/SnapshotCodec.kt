package com.fitconnect.android.sports.guided.store.room

import com.fitconnect.android.sports.guided.domain.ExerciseSetRecord
import com.fitconnect.android.sports.guided.domain.ExecutionSlot
import com.fitconnect.android.sports.guided.domain.GuidedSessionSnapshot
import com.fitconnect.android.sports.guided.domain.LoggedSetType
import com.fitconnect.android.sports.guided.domain.PendingSyncRecord
import com.fitconnect.android.sports.guided.domain.PlannedExercise
import com.fitconnect.android.sports.guided.domain.RestTimerState
import com.fitconnect.android.sports.guided.domain.SetSide
import com.fitconnect.android.sports.guided.domain.SyncUiStatus
import com.fitconnect.android.sports.guided.domain.TimedExerciseState
import com.fitconnect.android.sports.guided.domain.WorkoutEventRecord
import com.fitconnect.android.sports.guided.domain.WorkoutPhase
import com.fitconnect.android.sports.guided.domain.WorkoutPlan
import com.fitconnect.android.sports.progression.ExerciseMode
import com.fitconnect.android.sports.progression.ProgressionRule
import com.fitconnect.android.sports.progression.ProgressionState
import com.fitconnect.android.sports.progression.SideMode
import org.json.JSONArray
import org.json.JSONObject

object SnapshotCodec {
    fun encode(snapshot: GuidedSessionSnapshot): String {
        val json = JSONObject()
            .put("userId", snapshot.userId)
            .put("sessionId", snapshot.sessionId)
            .put("workoutId", snapshot.workoutId)
            .put("phase", snapshot.phase.name)
            .put("slotIndex", snapshot.slotIndex)
            .put("activityId", snapshot.activityId)
            .put("idempotencyKey", snapshot.idempotencyKey)
            .put("syncStatus", snapshot.syncStatus.name)
            .put("lastError", snapshot.lastError)
            .put("progressionRationale", snapshot.progressionRationale)
            .put("progressionState", snapshot.progressionState?.name)
            .put("xpEarned", snapshot.xpEarned)
            .put("xpDuplicatePrevented", snapshot.xpDuplicatePrevented)
            .put("startedAtMs", snapshot.startedAtMs)
            .put("completedAtMs", snapshot.completedAtMs)
            .put("pausedFrom", snapshot.pausedFrom?.name)
            .put("plan", encodePlan(snapshot.plan))
            .put("schedule", JSONArray().also { arr ->
                snapshot.schedule.forEach { arr.put(encodeSlot(it)) }
            })
            .put("sets", JSONArray().also { arr ->
                snapshot.sets.forEach { arr.put(encodeSet(it)) }
            })
        snapshot.rest?.let { json.put("rest", encodeRest(it)) }
        snapshot.timed?.let { json.put("timed", encodeTimed(it)) }
        return json.toString()
    }

    fun decode(raw: String): GuidedSessionSnapshot {
        val json = JSONObject(raw)
        val plan = decodePlan(json.getJSONObject("plan"))
        val schedule = json.getJSONArray("schedule").let { arr ->
            (0 until arr.length()).map { decodeSlot(arr.getJSONObject(it)) }
        }
        val sets = json.getJSONArray("sets").let { arr ->
            (0 until arr.length()).map { decodeSet(arr.getJSONObject(it)) }
        }
        return GuidedSessionSnapshot(
            userId = json.getString("userId"),
            sessionId = json.getString("sessionId"),
            workoutId = json.getString("workoutId"),
            plan = plan,
            schedule = schedule,
            phase = WorkoutPhase.valueOf(json.getString("phase")),
            slotIndex = json.getInt("slotIndex"),
            sets = sets,
            rest = json.optJSONObject("rest")?.let { decodeRest(it) },
            timed = json.optJSONObject("timed")?.let { decodeTimed(it) },
            pausedFrom = json.optString("pausedFrom").takeIf { it.isNotBlank() && it != "null" }
                ?.let { WorkoutPhase.valueOf(it) },
            startedAtMs = json.optLong("startedAtMs").takeIf { json.has("startedAtMs") && !json.isNull("startedAtMs") },
            completedAtMs = json.optLong("completedAtMs").takeIf { json.has("completedAtMs") && !json.isNull("completedAtMs") },
            activityId = json.optString("activityId").takeIf { it.isNotBlank() && it != "null" },
            idempotencyKey = json.getString("idempotencyKey"),
            syncStatus = SyncUiStatus.valueOf(json.optString("syncStatus", SyncUiStatus.LOCAL.name)),
            lastError = json.optString("lastError").takeIf { it.isNotBlank() && it != "null" },
            progressionRationale = json.optString("progressionRationale").takeIf { it.isNotBlank() && it != "null" },
            progressionState = json.optString("progressionState").takeIf { it.isNotBlank() && it != "null" }
                ?.let { ProgressionState.valueOf(it) },
            xpEarned = if (json.has("xpEarned") && !json.isNull("xpEarned")) json.getInt("xpEarned") else null,
            xpDuplicatePrevented = json.optBoolean("xpDuplicatePrevented", false),
        )
    }

    fun encodeSet(set: ExerciseSetRecord): JSONObject = JSONObject()
        .put("setId", set.setId)
        .put("sessionId", set.sessionId)
        .put("exerciseId", set.exerciseId)
        .put("sequence", set.sequence)
        .put("setIndex", set.setIndex)
        .put("setType", set.setType.name)
        .put("supersetGroupId", set.supersetGroupId)
        .put("side", set.side.name)
        .put("targetReps", set.targetReps)
        .put("actualReps", set.actualReps)
        .put("targetTimeSec", set.targetTimeSec)
        .put("actualTimeSec", set.actualTimeSec)
        .put("loadKg", set.loadKg)
        .put("rpe", set.rpe)
        .put("rir", set.rir)
        .put("completedAtMs", set.completedAtMs)
        .put("isFailed", set.isFailed)

    fun decodeSet(json: JSONObject): ExerciseSetRecord = ExerciseSetRecord(
        setId = json.getString("setId"),
        sessionId = json.getString("sessionId"),
        exerciseId = json.getString("exerciseId"),
        sequence = json.getInt("sequence"),
        setIndex = json.getInt("setIndex"),
        setType = LoggedSetType.valueOf(json.optString("setType", LoggedSetType.WORKING.name)),
        supersetGroupId = json.optString("supersetGroupId").takeIf { it.isNotBlank() && it != "null" },
        side = SetSide.valueOf(json.optString("side", SetSide.BOTH.name)),
        targetReps = json.nullableInt("targetReps"),
        actualReps = json.nullableInt("actualReps"),
        targetTimeSec = json.nullableInt("targetTimeSec"),
        actualTimeSec = json.nullableInt("actualTimeSec"),
        loadKg = json.nullableDouble("loadKg"),
        rpe = json.nullableDouble("rpe"),
        rir = json.nullableInt("rir"),
        completedAtMs = json.getLong("completedAtMs"),
        isFailed = json.optBoolean("isFailed", false),
    )

    private fun encodePlan(plan: WorkoutPlan): JSONObject = JSONObject()
        .put("workoutId", plan.workoutId)
        .put("name", plan.name)
        .put("estimatedDurationMin", plan.estimatedDurationMin)
        .put("exercises", JSONArray().also { arr ->
            plan.exercises.forEach { arr.put(encodeExercise(it)) }
        })

    private fun decodePlan(json: JSONObject): WorkoutPlan = WorkoutPlan(
        workoutId = json.getString("workoutId"),
        name = json.getString("name"),
        estimatedDurationMin = json.getInt("estimatedDurationMin"),
        exercises = json.getJSONArray("exercises").let { arr ->
            (0 until arr.length()).map { decodeExercise(arr.getJSONObject(it)) }
        },
    )

    private fun encodeExercise(ex: PlannedExercise): JSONObject = JSONObject()
        .put("exerciseId", ex.exerciseId)
        .put("name", ex.name)
        .put("mode", ex.mode.name)
        .put("weighted", ex.weighted)
        .put("sideMode", ex.sideMode.name)
        .put("supersetGroupId", ex.supersetGroupId)
        .put("targetSets", ex.targetSets)
        .put("targetRepsMin", ex.targetRepsMin)
        .put("targetRepsMax", ex.targetRepsMax)
        .put("targetWeightKg", ex.targetWeightKg)
        .put("targetTimeSec", ex.targetTimeSec)
        .put("restSec", ex.restSec)
        .put("progressionRule", ex.progressionRule.name)
        .put("rpeRequired", ex.rpeRequired)
        .put("rirRequired", ex.rirRequired)

    private fun decodeExercise(json: JSONObject): PlannedExercise = PlannedExercise(
        exerciseId = json.getString("exerciseId"),
        name = json.getString("name"),
        mode = ExerciseMode.valueOf(json.getString("mode")),
        weighted = json.getBoolean("weighted"),
        sideMode = SideMode.valueOf(json.getString("sideMode")),
        supersetGroupId = json.optString("supersetGroupId").takeIf { it.isNotBlank() && it != "null" },
        targetSets = json.getInt("targetSets"),
        targetRepsMin = json.getInt("targetRepsMin"),
        targetRepsMax = json.getInt("targetRepsMax"),
        targetWeightKg = json.nullableDouble("targetWeightKg"),
        targetTimeSec = json.nullableInt("targetTimeSec"),
        restSec = json.getInt("restSec"),
        progressionRule = ProgressionRule.valueOf(json.getString("progressionRule")),
        rpeRequired = json.optBoolean("rpeRequired", false),
        rirRequired = json.optBoolean("rirRequired", false),
    )

    private fun encodeSlot(slot: ExecutionSlot): JSONObject = JSONObject()
        .put("slotIndex", slot.slotIndex)
        .put("setNumber", slot.setNumber)
        .put("side", slot.side.name)
        .put("restAfterSec", slot.restAfterSec)
        .put("exercise", encodeExercise(slot.exercise))

    private fun decodeSlot(json: JSONObject): ExecutionSlot = ExecutionSlot(
        slotIndex = json.getInt("slotIndex"),
        exercise = decodeExercise(json.getJSONObject("exercise")),
        setNumber = json.getInt("setNumber"),
        side = SetSide.valueOf(json.getString("side")),
        restAfterSec = json.getInt("restAfterSec"),
    )

    private fun encodeRest(rest: RestTimerState): JSONObject = JSONObject()
        .put("remainingMs", rest.remainingMs)
        .put("durationMs", rest.durationMs)
        .put("elapsedAnchorMs", rest.elapsedAnchorMs)
        .put("wallAnchorMs", rest.wallAnchorMs)
        .put("nextSlotIndex", rest.nextSlotIndex)

    private fun decodeRest(json: JSONObject): RestTimerState = RestTimerState(
        remainingMs = json.getLong("remainingMs"),
        durationMs = json.getLong("durationMs"),
        elapsedAnchorMs = json.getLong("elapsedAnchorMs"),
        wallAnchorMs = json.getLong("wallAnchorMs"),
        nextSlotIndex = json.getInt("nextSlotIndex"),
    )

    private fun encodeTimed(timed: TimedExerciseState): JSONObject = JSONObject()
        .put("remainingMs", timed.remainingMs)
        .put("durationMs", timed.durationMs)
        .put("elapsedAnchorMs", timed.elapsedAnchorMs)
        .put("wallAnchorMs", timed.wallAnchorMs)
        .put("slotIndex", timed.slotIndex)

    private fun decodeTimed(json: JSONObject): TimedExerciseState = TimedExerciseState(
        remainingMs = json.getLong("remainingMs"),
        durationMs = json.getLong("durationMs"),
        elapsedAnchorMs = json.getLong("elapsedAnchorMs"),
        wallAnchorMs = json.getLong("wallAnchorMs"),
        slotIndex = json.getInt("slotIndex"),
    )

    private fun JSONObject.nullableInt(key: String): Int? =
        if (has(key) && !isNull(key)) getInt(key) else null

    private fun JSONObject.nullableDouble(key: String): Double? =
        if (has(key) && !isNull(key)) getDouble(key) else null
}

fun WorkoutEventRecord.toEntity(): WorkoutEventEntity = WorkoutEventEntity(
    eventId = eventId,
    sessionId = sessionId,
    type = type,
    payload = payload,
    createdAtMs = createdAtMs,
)

fun WorkoutEventEntity.toRecord(): WorkoutEventRecord = WorkoutEventRecord(
    eventId = eventId,
    sessionId = sessionId,
    type = type,
    payload = payload,
    createdAtMs = createdAtMs,
)

fun PendingSyncRecord.toEntity(): PendingSyncEntity = PendingSyncEntity(
    id = id,
    sessionId = sessionId,
    type = type,
    payloadJson = payloadJson,
    idempotencyKey = idempotencyKey,
    attempts = attempts,
    status = status,
)

fun PendingSyncEntity.toRecord(): PendingSyncRecord = PendingSyncRecord(
    id = id,
    sessionId = sessionId,
    type = type,
    payloadJson = payloadJson,
    idempotencyKey = idempotencyKey,
    attempts = attempts,
    status = status,
)
