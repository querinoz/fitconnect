package com.fitconnect.android.sports.guided

import com.fitconnect.android.sports.guided.catalog.DefaultGuidedPlan
import com.fitconnect.android.sports.guided.domain.FakeWorkoutClock
import com.fitconnect.android.sports.guided.domain.SetLogInput
import com.fitconnect.android.sports.guided.domain.WorkoutCommand
import com.fitconnect.android.sports.guided.domain.WorkoutPhase
import com.fitconnect.android.sports.guided.export.GuidedWorkoutExporter
import com.fitconnect.android.sports.guided.machine.WorkoutSessionMachine
import com.fitconnect.android.sports.guided.share.SharePrivacy
import com.fitconnect.android.sports.guided.share.WorkoutShareCardFactory
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.zip.ZipInputStream
import java.io.ByteArrayInputStream

class GuidedExportAndShareTest {
    private val clock = FakeWorkoutClock()

    @Test
    fun shareCardDefaultsPrivateUntilConfirm() {
        val card = WorkoutShareCardFactory.fromGuided(
            sessionId = "s1",
            durationMs = 3_600_000L,
            setsCompleted = 12,
            volumeKg = 4_800.0,
            completedAtEpochMs = 1_700_000_000_000L,
            readinessScore = 78,
        )
        assertEquals(SharePrivacy.PRIVATE, card.privacy)
        assertFalse(card.isShareable)
        val shared = WorkoutShareCardFactory.confirmShare(card)
        assertTrue(shared.isShareable)
        assertEquals(SharePrivacy.PRIVATE, WorkoutShareCardFactory.revokeShare(shared).privacy)
    }

    @Test
    fun exportJsonCsvZipForCompletedSession() {
        var state = WorkoutSessionMachine.reduce(
            com.fitconnect.android.sports.guided.domain.GuidedSessionSnapshot.idle(),
            WorkoutCommand.LoadPlan("uid-1", DefaultGuidedPlan.plan(), "sess-export"),
            clock,
        ).snapshot
        state = WorkoutSessionMachine.reduce(state, WorkoutCommand.Start, clock).snapshot
        state = WorkoutSessionMachine.reduce(
            state,
            WorkoutCommand.LogSet(SetLogInput(actualReps = 8, loadKg = 60.0, rpe = 7.0, rir = 2)),
            clock,
        ).snapshot
        assertTrue(state.sets.isNotEmpty())

        val json = GuidedWorkoutExporter.toJson(state)
        val parsed = JSONObject(json)
        assertEquals("fitconnect.guided.export.v1", parsed.getString("schema"))
        assertEquals("sess-export", parsed.getString("sessionId"))
        assertTrue(parsed.getJSONArray("sets").length() >= 1)

        val csv = GuidedWorkoutExporter.toCsv(state)
        assertTrue(csv.startsWith("setId,exerciseId"))
        assertTrue(csv.contains("ex_"))

        val zip = GuidedWorkoutExporter.toZip(listOf(state), mediaRefs = listOf("local://photo1.jpg"))
        assertTrue(zip.size > 32)
        val names = mutableListOf<String>()
        ZipInputStream(ByteArrayInputStream(zip)).use { zin ->
            var entry = zin.nextEntry
            while (entry != null) {
                names += entry.name
                entry = zin.nextEntry
            }
        }
        assertTrue(names.any { it.endsWith(".json") })
        assertTrue(names.any { it.endsWith(".csv") })
        assertTrue(names.contains("manifest.json"))
        assertTrue(names.contains("media-refs.txt"))
    }

    @Test
    fun multiSessionZipIncludesManifestCount() {
        val a = seeded("a")
        val b = seeded("b")
        val zip = GuidedWorkoutExporter.toZip(listOf(a, b))
        var manifest: String? = null
        ZipInputStream(ByteArrayInputStream(zip)).use { zin ->
            var entry = zin.nextEntry
            while (entry != null) {
                if (entry.name == "manifest.json") {
                    manifest = zin.readBytes().toString(Charsets.UTF_8)
                }
                entry = zin.nextEntry
            }
        }
        val obj = JSONObject(manifest!!)
        assertEquals(2, obj.getInt("sessionCount"))
    }

    private fun seeded(id: String) = WorkoutSessionMachine.reduce(
        com.fitconnect.android.sports.guided.domain.GuidedSessionSnapshot.idle(),
        WorkoutCommand.LoadPlan("uid-1", DefaultGuidedPlan.plan(), "sess-$id"),
        clock,
    ).snapshot.let {
        WorkoutSessionMachine.reduce(it, WorkoutCommand.Start, clock).snapshot
    }.also {
        // touch phase for export shape only
        assertTrue(it.phase == WorkoutPhase.ACTIVE || it.phase == WorkoutPhase.WARMUP)
    }
}
