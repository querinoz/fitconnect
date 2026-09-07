package com.fitconnect.android.sports.guided.completion

import com.fitconnect.android.sports.guided.domain.ActivityCompletion
import com.fitconnect.android.sports.guided.domain.GuidedSessionSnapshot
import com.fitconnect.android.sports.guided.domain.WorkoutIds

object ActivityCompletionFactory {
    fun from(snapshot: GuidedSessionSnapshot): ActivityCompletion {
        val started = snapshot.startedAtMs ?: snapshot.completedAtMs ?: 0L
        val ended = snapshot.completedAtMs ?: started
        val duration = (ended - started).coerceAtLeast(0)
        val summary = snapshot.summary()
        val metrics = buildString {
            append('{')
            append("\"sets\":").append(summary.totalSets).append(',')
            append("\"volumeKg\":").append(summary.volumeKg).append(',')
            append("\"exercises\":").append(summary.exercisesCompleted).append(',')
            append("\"durationMs\":").append(duration)
            append('}')
        }
        val metadata = buildString {
            append('{')
            append("\"workoutId\":\"").append(escape(snapshot.workoutId)).append("\",")
            append("\"sessionId\":\"").append(escape(snapshot.sessionId)).append("\",")
            append("\"sets\":[")
            snapshot.sets.forEachIndexed { index, set ->
                if (index > 0) append(',')
                append('{')
                append("\"setId\":\"").append(escape(set.setId)).append("\",")
                append("\"exerciseId\":\"").append(escape(set.exerciseId)).append("\",")
                append("\"sequence\":").append(set.sequence).append(',')
                append("\"setIndex\":").append(set.setIndex).append(',')
                append("\"side\":\"").append(set.side.name).append("\",")
                append("\"actualReps\":").append(set.actualReps?.toString() ?: "null").append(',')
                append("\"actualTimeSec\":").append(set.actualTimeSec?.toString() ?: "null").append(',')
                append("\"loadKg\":").append(set.loadKg?.toString() ?: "null").append(',')
                append("\"rpe\":").append(set.rpe?.toString() ?: "null").append(',')
                append("\"rir\":").append(set.rir?.toString() ?: "null").append(',')
                append("\"completedAtMs\":").append(set.completedAtMs)
                append('}')
            }
            append(']')
            append('}')
        }
        val activityId = snapshot.activityId ?: snapshot.sessionId
        return ActivityCompletion(
            activityId = activityId,
            userId = snapshot.userId,
            sessionId = snapshot.sessionId,
            type = WorkoutIds.sport(),
            startedAtMs = started,
            completedAtMs = ended,
            durationMs = duration,
            source = WorkoutIds.activityProvider(),
            idempotencyKey = snapshot.idempotencyKey.ifBlank {
                WorkoutIds.activityIdempotencyKey(snapshot.userId, snapshot.sessionId)
            },
            metricsJson = metrics,
            metadataJson = metadata,
        )
    }

    fun activityPayload(completion: ActivityCompletion): String = buildString {
        append('{')
        append("\"activityId\":\"").append(escape(completion.activityId)).append("\",")
        append("\"userId\":\"").append(escape(completion.userId)).append("\",")
        append("\"sessionId\":\"").append(escape(completion.sessionId)).append("\",")
        append("\"idempotencyKey\":\"").append(escape(completion.idempotencyKey)).append("\",")
        append("\"provider\":\"").append(escape(completion.source)).append("\",")
        append("\"sport\":\"").append(escape(completion.type)).append("\",")
        append("\"startedAtMs\":").append(completion.startedAtMs).append(',')
        append("\"completedAtMs\":").append(completion.completedAtMs).append(',')
        append("\"durationMs\":").append(completion.durationMs).append(',')
        append("\"metrics\":").append(completion.metricsJson).append(',')
        append("\"metadata\":").append(completion.metadataJson)
        append('}')
    }

    fun xpPayload(userId: String, sessionId: String, activityId: String, durationMs: Long): String = buildString {
        append('{')
        append("\"eventId\":\"").append(escape(WorkoutIds.xpEventId(userId, sessionId))).append("\",")
        append("\"type\":\"WORKOUT_COMPLETED\",")
        append("\"payload\":{")
        append("\"sessionId\":\"").append(escape(activityId)).append("\",")
        append("\"durationMs\":").append(durationMs).append(',')
        append("\"distanceM\":0,")
        append("\"sport\":\"").append(WorkoutIds.sport()).append('"')
        append('}')
        append('}')
    }

    private fun escape(value: String): String =
        value.replace("\\", "\\\\").replace("\"", "\\\"")
}
