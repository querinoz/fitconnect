package com.fitconnect.android.wear

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class ReadinessSourceSelectionTest {

    @Before
    fun resetInbox() {
        WearReadinessInbox.clear()
        WearRuntime.healthServicesReadiness = null
        WearRuntime.allowLocalDemoReadiness = false
    }

    @Test
    fun default_isUnavailable_notSilent88() {
        val source = WearReadinessSelector.select(
            phoneSynced = null,
            healthServices = null,
            allowLocalDemo = false,
        )
        assertEquals(ReadinessSource.Unavailable, source)
        assertEquals("—", source.toPresentation().value)
        assertFalse(source.toPresentation().footnote.contains("LOCAL_DEMO"))
    }

    @Test
    fun phoneSync_winsOverHealthServicesAndLocalDemo() {
        val phone = ReadinessSource.SyncedFromPhone(score = 72, syncedAtEpochMs = 1_700_000_000_000L)
        val hs = ReadinessSource.HealthServices(score = 90, measuredAtEpochMs = 1_700_000_000_100L)
        val source = WearReadinessSelector.select(
            phoneSynced = phone,
            healthServices = hs,
            allowLocalDemo = true,
            localDemoScore = 88,
        )
        assertEquals(phone, source)
        assertEquals("72", source.toPresentation().value)
        assertTrue(source.toPresentation().footnote.contains("PHONE"))
    }

    @Test
    fun healthServices_selectedOnlyWhenScorePresent() {
        val pending = ReadinessSource.HealthServices(score = null, measuredAtEpochMs = null)
        assertEquals(
            ReadinessSource.Unavailable,
            WearReadinessSelector.select(
                phoneSynced = null,
                healthServices = pending,
                allowLocalDemo = false,
            ),
        )

        val measured = ReadinessSource.HealthServices(score = 65, measuredAtEpochMs = 42L)
        assertEquals(
            measured,
            WearReadinessSelector.select(
                phoneSynced = null,
                healthServices = measured,
                allowLocalDemo = false,
            ),
        )
    }

    @Test
    fun localDemo_requiresExplicitAllowFlag() {
        assertEquals(
            ReadinessSource.Unavailable,
            WearReadinessSelector.select(
                phoneSynced = null,
                healthServices = null,
                allowLocalDemo = false,
            ),
        )
        assertEquals(
            ReadinessSource.LocalDemo(88),
            WearReadinessSelector.select(
                phoneSynced = null,
                healthServices = null,
                allowLocalDemo = true,
            ),
        )
    }

    @Test
    fun allowLocalDemo_requiresDebugAndExplicitFlag() {
        assertFalse(WearReadinessSelector.allowLocalDemo(debugBuild = false, explicitFlag = true))
        assertFalse(WearReadinessSelector.allowLocalDemo(debugBuild = true, explicitFlag = false))
        assertFalse(WearReadinessSelector.allowLocalDemo(debugBuild = false, explicitFlag = false))
        assertTrue(WearReadinessSelector.allowLocalDemo(debugBuild = true, explicitFlag = true))
    }

    @Test
    fun inbox_parseAndIngest_rejectsMalformed_acceptsHealthWire() {
        assertNull(WearReadinessInbox.parse(""))
        assertNull(WearReadinessInbox.parse("v=wrong;readiness=72;ts=1"))
        assertNull(WearReadinessInbox.parse("v=health.v1;readiness=nope;ts=1"))
        assertFalse(WearReadinessInbox.ingest("garbage"))

        val wire = WearReadinessInbox.toWire(score = 81, syncedAtEpochMs = 99L)
        assertTrue(WearReadinessInbox.ingest(wire))
        assertEquals(81, WearReadinessInbox.lastSynced?.score)
        assertEquals(99L, WearReadinessInbox.lastSynced?.syncedAtEpochMs)

        WearRuntime.allowLocalDemoReadiness = false
        val resolved = WearRuntime.resolveReadiness()
        assertTrue(resolved is ReadinessSource.SyncedFromPhone)
        assertEquals(81, (resolved as ReadinessSource.SyncedFromPhone).score)
    }

    @Test
    fun resolveReadiness_defaultsUnavailableWithoutInbox() {
        assertEquals(ReadinessSource.Unavailable, WearRuntime.resolveReadiness())
    }
}
