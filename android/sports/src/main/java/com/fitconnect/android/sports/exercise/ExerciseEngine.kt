package com.fitconnect.android.sports.exercise

import com.fitconnect.android.sports.domain.SportId
import com.fitconnect.android.sports.sync.EntityMeta
import com.fitconnect.android.sports.sync.SyncState
import com.fitconnect.android.sports.sync.VersionedEntity
import java.util.concurrent.ConcurrentHashMap

enum class ExerciseCategory {
    STRENGTH,
    CARDIO,
    MOBILITY,
    STRETCHING,
    TECHNIQUE,
    RECOVERY,
    WARM_UP,
    COOLDOWN,
    PLYOMETRICS,
    INTERVALS,
    AGILITY,
    BALANCE,
    CUSTOM,
}

data class ExerciseDefinition(
    override val meta: EntityMeta,
    val name: String,
    val category: ExerciseCategory,
    val instructions: String,
    val muscles: List<String>,
    val equipment: List<String>,
    val intensity: String,
    val difficulty: Int,
    val mediaUrls: List<String>,
    val tags: List<String>,
    val safetyNotes: String,
    val sportIds: Set<SportId>,
) : VersionedEntity

interface ExerciseEngine {
    fun register(exercise: ExerciseDefinition)
    fun all(includeCustom: Boolean = true): List<ExerciseDefinition>
    fun byCategory(category: ExerciseCategory): List<ExerciseDefinition>
    fun bySport(sportId: SportId): List<ExerciseDefinition>
    fun search(query: String): List<ExerciseDefinition>
    fun get(id: String): ExerciseDefinition?
}

class DefaultExerciseEngine : ExerciseEngine {
    private val store = ConcurrentHashMap<String, ExerciseDefinition>()

    init {
        seed().forEach { register(it) }
    }

    override fun register(exercise: ExerciseDefinition) {
        store[exercise.meta.id] = exercise
    }

    override fun all(includeCustom: Boolean): List<ExerciseDefinition> =
        store.values.filter { includeCustom || it.category != ExerciseCategory.CUSTOM }
            .sortedBy { it.name }

    override fun byCategory(category: ExerciseCategory): List<ExerciseDefinition> =
        all().filter { it.category == category }

    override fun bySport(sportId: SportId): List<ExerciseDefinition> =
        all().filter { it.sportIds.isEmpty() || sportId in it.sportIds }

    override fun search(query: String): List<ExerciseDefinition> {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return all()
        return all().filter {
            it.name.lowercase().contains(q) ||
                it.tags.any { t -> t.lowercase().contains(q) } ||
                it.muscles.any { m -> m.lowercase().contains(q) }
        }
    }

    override fun get(id: String): ExerciseDefinition? = store[id]

    private fun seed(): List<ExerciseDefinition> {
        fun ex(
            id: String,
            name: String,
            category: ExerciseCategory,
            instructions: String,
            muscles: List<String>,
            equipment: List<String>,
            intensity: String,
            difficulty: Int,
            tags: List<String>,
            safety: String,
            sports: Set<SportId> = emptySet(),
        ) = ExerciseDefinition(
            meta = EntityMeta(id, 1, System.currentTimeMillis(), SyncState.CLEAN),
            name = name,
            category = category,
            instructions = instructions,
            muscles = muscles,
            equipment = equipment,
            intensity = intensity,
            difficulty = difficulty,
            mediaUrls = emptyList(),
            tags = tags,
            safetyNotes = safety,
            sportIds = sports,
        )
        return listOf(
            ex("ex_wu_jog", "Easy jog", ExerciseCategory.WARM_UP, "10 min conversational pace", listOf("legs"), listOf("Shoes"), "low", 1, listOf("warmup"), "Stop if sharp pain", setOf(SportId.RUNNING)),
            ex("ex_stride", "Strides", ExerciseCategory.INTERVALS, "4×20s smooth accelerations", listOf("legs"), listOf("Shoes"), "moderate", 2, listOf("speed"), "Keep relaxed", setOf(SportId.RUNNING)),
            ex("ex_squat", "Back squat", ExerciseCategory.STRENGTH, "Brace, sit between hips, drive up", listOf("quads", "glutes", "core"), listOf("Barbell"), "high", 4, listOf("strength"), "Neutral spine", setOf(SportId.GYM, SportId.CROSSFIT)),
            ex("ex_deadlift", "Deadlift", ExerciseCategory.STRENGTH, "Hinge, bar close, lock hips", listOf("hamstrings", "glutes", "back"), listOf("Barbell"), "high", 5, listOf("strength"), "Do not round lumbar", setOf(SportId.GYM)),
            ex("ex_row", "Erg row", ExerciseCategory.CARDIO, "Drive with legs, then body, then arms", listOf("legs", "back", "arms"), listOf("Rower"), "moderate", 2, listOf("cardio"), "Control recovery", setOf(SportId.of("rowing"), SportId.CROSSFIT)),
            ex("ex_swim_drill", "Catch-up drill", ExerciseCategory.TECHNIQUE, "One arm waits until other finishes", listOf("shoulders", "lats"), listOf("Pool"), "low", 2, listOf("technique"), "Relax neck", setOf(SportId.SWIMMING)),
            ex("ex_hip_mob", "90/90 hip mobility", ExerciseCategory.MOBILITY, "Rotate through hips slowly", listOf("hips"), emptyList(), "low", 1, listOf("mobility"), "No forcing range", setOf(SportId.GYM, SportId.FOOTBALL)),
            ex("ex_stretch_calf", "Calf stretch", ExerciseCategory.STRETCHING, "Hold 45s each side", listOf("calves"), emptyList(), "low", 1, listOf("stretch"), "Soft knee ok", setOf(SportId.RUNNING)),
            ex("ex_box_jump", "Box jump", ExerciseCategory.PLYOMETRICS, "Soft landings, step down", listOf("legs"), listOf("Box"), "high", 3, listOf("power"), "Choose safe box height", setOf(SportId.CROSSFIT, SportId.BASKETBALL)),
            ex("ex_ladder", "Agility ladder", ExerciseCategory.AGILITY, "Quick feet patterns", listOf("legs"), listOf("Ladder"), "moderate", 2, listOf("agility"), "Eyes up", setOf(SportId.FOOTBALL, SportId.TENNIS)),
            ex("ex_balance", "Single-leg balance", ExerciseCategory.BALANCE, "30s each leg", listOf("ankles", "core"), emptyList(), "low", 1, listOf("balance"), "Near support", setOf(SportId.RUNNING)),
            ex("ex_breath", "Nasal breathing cool-down", ExerciseCategory.COOLDOWN, "5 min nasal breathing", listOf("diaphragm"), emptyList(), "low", 1, listOf("recovery"), "Sit upright", emptySet()),
            ex("ex_foam", "Foam roll quads", ExerciseCategory.RECOVERY, "Slow passes 60–90s", listOf("quads"), listOf("Foam roller"), "low", 1, listOf("recovery"), "Avoid joints", emptySet()),
        )
    }
}
