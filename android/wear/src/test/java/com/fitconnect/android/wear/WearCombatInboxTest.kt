package com.fitconnect.android.wear

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class WearCombatInboxTest {
    @Before
    fun reset() {
        WearCombatInbox.clear()
    }

    @Test
    fun acceptsRoundClockAndKeepsLastGlanceOffline() {
        val ok = WearCombatInbox.ingest("v=combat.v1;phase=rest;round=2;remaining=45;discipline=boxing;ts=9;connected=1")
        assertTrue(ok)
        assertEquals(1, WearCombatInbox.acceptedCount)
        assertEquals("rest", WearCombatInbox.glance?.phase)
        assertEquals(45, WearCombatInbox.glance?.remainingSec)
        assertFalse(WearCombatInbox.ingest("v=combat.v1;phase=work;round=1;remaining=10;discipline=boxing;ts=1;force=12"))
        assertEquals(1, WearCombatInbox.rejectedCount)
        assertEquals("rest", WearCombatInbox.glance?.phase)
    }
}
