package com.fitconnect.android.telemetry.wear

import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class WearSessionLinkTest {
    @Test
    fun inMemoryDeliversAndQueuesOffline() = runTest {
        val link = InMemoryWearSessionLink()
        val received = async {
            link.events().take(2).toList()
        }
        assertTrue(link.send(WearLinkEvent(WearLinkEventKind.START_SESSION, 1L)) is AppResult.Ok)
        link.setOffline(true)
        assertTrue(link.send(WearLinkEvent(WearLinkEventKind.PAUSE_SESSION, 2L)) is AppResult.Ok)
        assertEquals(1, link.pendingCount())
        link.setOffline(false)
        val kinds = received.await().map { it.kind }
        assertEquals(
            listOf(WearLinkEventKind.START_SESSION, WearLinkEventKind.PAUSE_SESSION),
            kinds,
        )
        assertEquals("IN_MEMORY", link.transport)
        assertEquals(0, link.pendingCount())
    }

    @Test
    fun unboundDataLayerFailsClosed() = runTest {
        val link = UnboundDataLayerWearSessionLink()
        val result = link.send(WearLinkEvent(WearLinkEventKind.START_SESSION, 1L))
        assertTrue(result is AppResult.Err)
        assertEquals("DATALAYER_UNBOUND", link.transport)
    }
}
