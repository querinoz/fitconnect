package com.fitconnect.android.sports.workout

import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.sports.sync.EntityMeta
import com.fitconnect.android.sports.sync.SyncState
import com.fitconnect.android.sports.sync.VersionedEntity
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

enum class WorkoutStructure {
    TEMPLATE,
    INTERVALS,
    CIRCUIT,
    SUPERSET,
    ROUNDS,
    EMOM,
    AMRAP,
    TABATA,
    TIME_BASED,
    DISTANCE_BASED,
    CUSTOM,
}

data class ZoneTarget(
    val kind: String,
    val min: Double,
    val max: Double,
    val unit: String,
)

data class WorkoutStep(
    val name: String,
    val exerciseId: String?,
    val detail: String,
    val durationSec: Int? = null,
    val distanceM: Double? = null,
    val reps: Int? = null,
    val restSec: Int = 0,
    val isSuperset: Boolean = false,
    val hrZone: ZoneTarget? = null,
    val powerZone: ZoneTarget? = null,
    val cadenceTarget: ZoneTarget? = null,
    val paceTarget: ZoneTarget? = null,
    val customMetrics: Map<String, Double> = emptyMap(),
)

data class WorkoutDefinition(
    override val meta: EntityMeta,
    val title: String,
    val sportId: SportId,
    val structure: WorkoutStructure,
    val steps: List<WorkoutStep>,
    val rounds: Int = 1,
    val notes: String? = null,
    val template: Boolean = false,
) : VersionedEntity

interface WorkoutEngine {
    fun templates(sportId: SportId? = null): List<WorkoutDefinition>
    fun get(id: String): WorkoutDefinition?
    fun save(workout: WorkoutDefinition): WorkoutDefinition
    fun build(
        title: String,
        sportId: SportId,
        structure: WorkoutStructure,
        steps: List<WorkoutStep>,
        rounds: Int = 1,
        notes: String? = null,
        template: Boolean = false,
    ): WorkoutDefinition
}

class DefaultWorkoutEngine : WorkoutEngine {
    private val store = ConcurrentHashMap<String, WorkoutDefinition>()

    init {
        seed().forEach { store[it.meta.id] = it }
    }

    override fun templates(sportId: SportId?): List<WorkoutDefinition> =
        store.values.filter { it.template && (sportId == null || it.sportId == sportId) }
            .sortedBy { it.title }

    override fun get(id: String): WorkoutDefinition? = store[id]

    override fun save(workout: WorkoutDefinition): WorkoutDefinition {
        val next = workout.copy(
            meta = workout.meta.copy(
                version = workout.meta.version + 1,
                updatedAtEpochMs = System.currentTimeMillis(),
                syncState = SyncState.PENDING_PUSH,
            ),
        )
        store[next.meta.id] = next
        return next
    }

    override fun build(
        title: String,
        sportId: SportId,
        structure: WorkoutStructure,
        steps: List<WorkoutStep>,
        rounds: Int,
        notes: String?,
        template: Boolean,
    ): WorkoutDefinition {
        val created = WorkoutDefinition(
            meta = EntityMeta(
                id = "w-${UUID.randomUUID().toString().take(8)}",
                version = 1,
                updatedAtEpochMs = System.currentTimeMillis(),
                syncState = SyncState.PENDING_PUSH,
            ),
            title = title,
            sportId = sportId,
            structure = structure,
            steps = steps,
            rounds = rounds,
            notes = notes,
            template = template,
        )
        store[created.meta.id] = created
        return created
    }

    private fun seed(): List<WorkoutDefinition> = listOf(
        WorkoutDefinition(
            meta = EntityMeta("wt_threshold", 1, System.currentTimeMillis()),
            title = "Threshold intervals",
            sportId = SportId.RUNNING,
            structure = WorkoutStructure.INTERVALS,
            template = true,
            steps = listOf(
                WorkoutStep("Warm-up", "ex_wu_jog", "12 min easy", durationSec = 720),
                WorkoutStep("Work", null, "5×4 min @ threshold", durationSec = 240, restSec = 120, hrZone = ZoneTarget("hr", 4.0, 4.0, "zone")),
                WorkoutStep("Cool-down", "ex_breath", "10 min easy", durationSec = 600),
            ),
        ),
        WorkoutDefinition(
            meta = EntityMeta("wt_emom", 1, System.currentTimeMillis()),
            title = "Strength EMOM",
            sportId = SportId.GYM,
            structure = WorkoutStructure.EMOM,
            template = true,
            rounds = 10,
            steps = listOf(
                WorkoutStep("Squat", "ex_squat", "5 reps", reps = 5),
                WorkoutStep("Rest", null, "remainder of minute", restSec = 40),
            ),
        ),
        WorkoutDefinition(
            meta = EntityMeta("wt_amrap", 1, System.currentTimeMillis()),
            title = "12-min AMRAP",
            sportId = SportId.CROSSFIT,
            structure = WorkoutStructure.AMRAP,
            template = true,
            steps = listOf(
                WorkoutStep("Box jump", "ex_box_jump", "8 reps", reps = 8),
                WorkoutStep("Row", "ex_row", "250m", distanceM = 250.0),
            ),
            notes = "Score = rounds + reps",
        ),
        WorkoutDefinition(
            meta = EntityMeta("wt_tabata", 1, System.currentTimeMillis()),
            title = "Tabata bike",
            sportId = SportId.CYCLING,
            structure = WorkoutStructure.TABATA,
            template = true,
            rounds = 8,
            steps = listOf(
                WorkoutStep("On", null, "20s max", durationSec = 20, powerZone = ZoneTarget("power", 120.0, 150.0, "%ftp")),
                WorkoutStep("Off", null, "10s easy", durationSec = 10),
            ),
        ),
    )
}
