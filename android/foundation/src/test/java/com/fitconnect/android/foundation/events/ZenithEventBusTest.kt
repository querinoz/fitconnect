package com.fitconnect.android.foundation.events

import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ZenithEventBusTest {
    @Test
    fun publishAndAutomationMatch() = runBlocking {
        val bus = InMemoryZenithEventBus()
        val automation = InMemoryAutomationEngine()
        automation.upsert(
            AutomationRule(
                id = "r1",
                userId = "u1",
                whenEvent = ZenithEventType.TRAINING_COMPLETED,
                createFitConnectPost = true,
                distributePlatforms = listOf("INSTAGRAM"),
                enabled = true,
            ),
        )
        bus.publish(
            ZenithEvent(
                id = "",
                type = ZenithEventType.TRAINING_COMPLETED,
                actorId = "u1",
                entityId = "session-1",
                atEpochMs = 0L,
            ),
        )
        val recent = bus.recent(5)
        assertEquals(ZenithEventType.TRAINING_COMPLETED, recent.first().type)
        val matched = automation.onEvent(recent.first())
        assertTrue(matched.single().createFitConnectPost)
    }
}
