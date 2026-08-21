package com.fitconnect.android.fitness.mapping

import com.fitconnect.android.fitness.domain.Sport
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.Parameterized

@RunWith(Parameterized::class)
class ExerciseSessionMapperTableTest(
    private val exerciseType: String,
    private val expected: Sport,
) {
    @Test
    fun mapsExerciseTypeToSport() {
        val session = ExerciseSessionMapper.toDomain(
            ExerciseSessionDto(
                externalId = "ext-$exerciseType",
                userId = "u1",
                exerciseType = exerciseType,
                startEpochMs = 1_000,
                endEpochMs = 2_000,
                distanceM = 5_000.0,
            ),
        )
        assertEquals(expected, session.sport)
        assertEquals("HEALTH_CONNECT:ext-$exerciseType", session.id)
        assertEquals(5_000.0, session.distanceM)
    }

    companion object {
        @JvmStatic
        @Parameterized.Parameters(name = "{0} → {1}")
        fun data(): List<Array<Any>> = SportCatalog.ALL_EXERCISE_TYPES.map { type ->
            arrayOf(type, SportCatalog.fromExerciseType(type))
        }
    }
}

class SportCatalogCoverageTest {
    @Test
    fun everySportHasAtLeastOneExerciseType() {
        val covered = SportCatalog.ALL_EXERCISE_TYPES.map { SportCatalog.fromExerciseType(it) }.toSet()
        assertTrue(covered.containsAll(Sport.entries))
        Sport.entries.forEach { sport ->
            assertEquals(sport, SportCatalog.fromExerciseType(SportCatalog.representativeType(sport)))
        }
    }
}
