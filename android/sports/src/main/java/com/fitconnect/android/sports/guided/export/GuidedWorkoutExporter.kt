package com.fitconnect.android.sports.guided.export

import com.fitconnect.android.sports.guided.domain.ExerciseSetRecord
import com.fitconnect.android.sports.guided.domain.GuidedSessionSnapshot
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

/**
 * Offline-first export of guided sessions (CSV / JSON / ZIP).
 * Media references are recorded as paths only — binaries are not embedded.
 */
object GuidedWorkoutExporter {
    fun toJson(snapshot: GuidedSessionSnapshot): String {
        val root = JSONObject()
            .put("schema", "fitconnect.guided.export.v1")
            .put("sessionId", snapshot.sessionId)
            .put("userId", snapshot.userId)
            .put("phase", snapshot.phase.name)
            .put("startedAtMs", snapshot.startedAtMs)
            .put("completedAtMs", snapshot.completedAtMs)
            .put("planId", snapshot.plan.workoutId)
            .put("sets", JSONArray().also { arr ->
                snapshot.sets.forEach { arr.put(setJson(it)) }
            })
        return root.toString()
    }

    fun toCsv(snapshot: GuidedSessionSnapshot): String {
        val header = "setId,exerciseId,sequence,setIndex,reps,loadKg,rpe,rir,completedAtMs,failed"
        val rows = snapshot.sets.joinToString("\n") { s ->
            listOf(
                s.setId,
                s.exerciseId,
                s.sequence,
                s.setIndex,
                s.actualReps ?: "",
                s.loadKg ?: "",
                s.rpe ?: "",
                s.rir ?: "",
                s.completedAtMs,
                s.isFailed,
            ).joinToString(",") { escapeCsv(it.toString()) }
        }
        return buildString {
            appendLine(header)
            if (rows.isNotEmpty()) append(rows)
        }
    }

    /**
     * ZIP with `session.json`, `sets.csv`, and optional `media-refs.txt`.
     * Integrity: returns byte array; caller can SHA-256 for restore checks.
     */
    fun toZip(
        snapshots: List<GuidedSessionSnapshot>,
        mediaRefs: List<String> = emptyList(),
    ): ByteArray {
        require(snapshots.isNotEmpty()) { "Export requires at least one session" }
        val out = ByteArrayOutputStream()
        ZipOutputStream(out).use { zip ->
            snapshots.forEachIndexed { index, snap ->
                val prefix = if (snapshots.size == 1) "session" else "session-$index-${snap.sessionId}"
                zip.putNextEntry(ZipEntry("$prefix.json"))
                zip.write(toJson(snap).toByteArray(Charsets.UTF_8))
                zip.closeEntry()
                zip.putNextEntry(ZipEntry("$prefix.csv"))
                zip.write(toCsv(snap).toByteArray(Charsets.UTF_8))
                zip.closeEntry()
            }
            if (mediaRefs.isNotEmpty()) {
                zip.putNextEntry(ZipEntry("media-refs.txt"))
                zip.write(mediaRefs.joinToString("\n").toByteArray(Charsets.UTF_8))
                zip.closeEntry()
            }
            zip.putNextEntry(ZipEntry("manifest.json"))
            zip.write(
                JSONObject()
                    .put("schema", "fitconnect.guided.export.zip.v1")
                    .put("sessionCount", snapshots.size)
                    .put("sessionIds", JSONArray(snapshots.map { it.sessionId }))
                    .put("mediaRefCount", mediaRefs.size)
                    .toString()
                    .toByteArray(Charsets.UTF_8),
            )
            zip.closeEntry()
        }
        return out.toByteArray()
    }

    private fun setJson(s: ExerciseSetRecord): JSONObject = JSONObject()
        .put("setId", s.setId)
        .put("exerciseId", s.exerciseId)
        .put("sequence", s.sequence)
        .put("setIndex", s.setIndex)
        .put("reps", s.actualReps)
        .put("loadKg", s.loadKg)
        .put("rpe", s.rpe)
        .put("rir", s.rir)
        .put("completedAtMs", s.completedAtMs)
        .put("failed", s.isFailed)

    private fun escapeCsv(raw: String): String {
        if (raw.contains(',') || raw.contains('"') || raw.contains('\n')) {
            return "\"" + raw.replace("\"", "\"\"") + "\""
        }
        return raw
    }
}
