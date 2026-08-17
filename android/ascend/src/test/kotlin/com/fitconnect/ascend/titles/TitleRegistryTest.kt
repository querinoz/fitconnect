package com.fitconnect.ascend.titles

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class TitleRegistryTest {
    @Test
    fun noTitlesWhenNothingUnlocked() {
        assertTrue(TitleRegistry.unlocked(emptySet(), level = 1).isEmpty())
        assertNull(TitleRegistry.equipped(emptyList()))
    }

    @Test
    fun achievementTitleRequiresUnlock() {
        val titles = TitleRegistry.unlocked(setOf("daily_runner"), level = 1)
        assertEquals(listOf("daily_runner"), titles.map { it.id })
    }

    @Test
    fun eliteAthleteRequiresLevelSeven() {
        assertTrue(TitleRegistry.unlocked(emptySet(), level = 6).none { it.id == "elite_athlete" })
        assertTrue(TitleRegistry.unlocked(emptySet(), level = 7).any { it.id == "elite_athlete" })
    }

    @Test
    fun equippedPrefersChosenUnlockedTitle() {
        val unlocked = TitleRegistry.unlocked(setOf("daily_runner", "consistency_engine"), level = 3)
        val equipped = TitleRegistry.equipped(unlocked, preferredId = "daily_runner")
        assertEquals("daily_runner", equipped?.id)
    }
}
