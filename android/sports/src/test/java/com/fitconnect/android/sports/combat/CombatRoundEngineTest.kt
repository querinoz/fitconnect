package com.fitconnect.android.sports.combat

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class CombatRoundEngineTest {
    @Test
    fun countdownWorkRestComplete() {
        var snap = CombatRoundSnapshot(
            prescription = CombatRoundPrescription(roundCount = 1, workSec = 3, restSec = 0, warningSec = 1, countdownSec = 1),
        )
        snap = CombatRoundEngine.reduce(snap, CombatRoundCommand.Start)
        assertEquals(CombatRoundPhase.COUNTDOWN, snap.phase)
        snap = CombatRoundEngine.reduce(snap, CombatRoundCommand.Tick)
        assertEquals(CombatRoundPhase.WORK, snap.phase)
        snap = CombatRoundEngine.reduce(snap, CombatRoundCommand.Tick)
        snap = CombatRoundEngine.reduce(snap, CombatRoundCommand.Tick)
        snap = CombatRoundEngine.reduce(snap, CombatRoundCommand.Tick)
        assertEquals(CombatRoundPhase.COMPLETE, snap.phase)
        assertEquals("00:03", CombatRoundEngine.formatClock(3))
    }

    @Test
    fun catalogContainsRequiredDisciplines() {
        assertTrue(CombatCatalog.requiredIds.size >= 31)
        assertTrue(CombatCatalog.isKnown("capoeira"))
        assertEquals("traditional_cultural", CombatCatalog.familyOf("capoeira"))
        assertEquals("striking", CombatCatalog.familyOf("boxing"))
        assertEquals("grappling", CombatCatalog.familyOf("bjj"))
        assertEquals("mixed", CombatCatalog.familyOf("mma"))
    }
}
