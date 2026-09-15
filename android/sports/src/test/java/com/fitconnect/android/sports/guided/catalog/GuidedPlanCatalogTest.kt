package com.fitconnect.android.sports.guided.catalog

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class GuidedPlanCatalogTest {
    @Test
    fun catalogHasMultipleSportsAndNoCalorieClaims() {
        val cards = GuidedPlanCatalog.cards()
        assertTrue(cards.size >= 4)
        assertTrue(cards.any { it.sport == "strength" })
        assertTrue(cards.any { it.sport == "hiit" })
        assertTrue(cards.any { it.sport == "mobility" })
        cards.forEach { card ->
            assertTrue(card.purpose.isNotBlank())
            assertTrue(card.plan.exercises.isNotEmpty())
            assertTrue(!Regex("""\d+\s*kcal""", RegexOption.IGNORE_CASE).containsMatchIn(card.outcome))
        }
        assertEquals(DefaultGuidedPlan.WORKOUT_ID, GuidedPlanCatalog.plan(GuidedPlanCatalog.featuredId).workoutId)
    }
}
