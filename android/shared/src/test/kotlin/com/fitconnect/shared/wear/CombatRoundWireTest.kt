package com.fitconnect.shared.wear

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class CombatRoundWireTest {
    @Test
    fun roundTripWithoutBiometrics() {
        val wire = CombatRoundWire.encode("warning", 3, 9, "muay_thai", 1_700_000_000_000L, true)
        val parsed = CombatRoundWire.decode(wire)!!
        assertEquals("warning", parsed.phase)
        assertEquals(3, parsed.round)
        assertEquals(9, parsed.remainingSec)
        assertEquals("muay_thai", parsed.disciplineId)
        assertEquals(true, parsed.connected)
    }

    @Test
    fun rejectsForceOrHrFields() {
        assertNull(CombatRoundWire.decode("v=combat.v1;phase=work;round=1;remaining=10;discipline=boxing;ts=1;force=900"))
        assertNull(CombatRoundWire.decode("v=combat.v1;phase=work;round=1;remaining=10;discipline=boxing;ts=1;hr=140"))
        assertNull(CombatRoundWire.decode("v=wrong;phase=work;round=1;remaining=10;discipline=boxing;ts=1"))
    }
}
