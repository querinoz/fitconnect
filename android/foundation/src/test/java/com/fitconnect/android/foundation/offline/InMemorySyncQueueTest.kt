package com.fitconnect.android.foundation.offline

import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test

class InMemorySyncQueueTest {
    @Test
    fun enqueuePeekAcknowledge() = runBlocking {
        val queue = InMemorySyncQueue()
        val work = SyncWork(type = "activity.upload", payloadJson = """{"id":"1"}""")
        queue.enqueue(work)
        assertEquals(1, queue.size())
        assertEquals(listOf(work), queue.peek())
        queue.acknowledge(work.id)
        assertEquals(0, queue.size())
    }
}
