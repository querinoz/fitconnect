package com.fitconnect.android.foundation.network

import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.async
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.yield
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.concurrent.CopyOnWriteArrayList

class InProcessRealtimeClientTest {
    @Test
    fun dualClientReceivesForeignPublish() = runBlocking {
        val bus = InProcessRealtimeBus()
        val a = InProcessRealtimeClient(bus = bus, clientId = "A")
        val b = InProcessRealtimeClient(bus = bus, clientId = "B")
        assertTrue(a.connect() is AppResult.Ok)
        assertTrue(b.connect() is AppResult.Ok)

        val subscribed = CompletableDeferred<Unit>()
        val received = async {
            withTimeout(3_000) {
                b.subscribe("booking")
                    .onStart { subscribed.complete(Unit) }
                    .first()
            }
        }
        subscribed.await()
        val pub = a.publish("booking", """{"id":"bk-1","status":"confirmed"}""")
        assertTrue(pub is AppResult.Ok)
        assertEquals("""{"id":"bk-1","status":"confirmed"}""", received.await())
    }

    @Test
    fun publishRequiresConnect() = runBlocking {
        val client = InProcessRealtimeClient(bus = InProcessRealtimeBus(), clientId = "X")
        val result = client.publish("t", "{}")
        assertTrue(result is AppResult.Err)
    }

    @Test
    fun disconnectThenReconnectReceivesFutureEvents() = runBlocking {
        val bus = InProcessRealtimeBus()
        val a = InProcessRealtimeClient(bus = bus, clientId = "A")
        val b = InProcessRealtimeClient(bus = bus, clientId = "B")
        assertTrue(a.connect() is AppResult.Ok)
        assertTrue(b.connect() is AppResult.Ok)
        a.disconnect()
        b.disconnect()
        assertTrue(a.connect() is AppResult.Ok)
        assertTrue(b.connect() is AppResult.Ok)

        val subscribed = CompletableDeferred<Unit>()
        val received = async {
            withTimeout(3_000) {
                b.subscribe("booking")
                    .onStart { subscribed.complete(Unit) }
                    .first()
            }
        }
        subscribed.await()
        assertTrue(a.publish("booking", """{"phase":"after-reconnect"}""") is AppResult.Ok)
        assertEquals("""{"phase":"after-reconnect"}""", received.await())
    }

    @Test
    fun unsubscribeReceivesNoFurtherEvents() = runBlocking {
        val bus = InProcessRealtimeBus()
        val a = InProcessRealtimeClient(bus = bus, clientId = "A")
        val b = InProcessRealtimeClient(bus = bus, clientId = "B")
        assertTrue(a.connect() is AppResult.Ok)
        assertTrue(b.connect() is AppResult.Ok)

        val collected = CopyOnWriteArrayList<String>()
        val subscribed = CompletableDeferred<Unit>()
        val job = launch {
            b.subscribe("t")
                .onStart { subscribed.complete(Unit) }
                .collect { collected += it }
        }
        subscribed.await()
        assertTrue(a.publish("t", "one") is AppResult.Ok)
        withTimeout(1_000) {
            while (collected.isEmpty()) yield()
        }
        job.cancelAndJoin()
        assertTrue(a.publish("t", "two") is AppResult.Ok)
        delay(100)
        assertEquals(listOf("one"), collected.toList())
    }

    @Test
    fun sameClientPublishIsNotEchoedToSelf() = runBlocking {
        val bus = InProcessRealtimeBus()
        val a = InProcessRealtimeClient(bus = bus, clientId = "A")
        assertTrue(a.connect() is AppResult.Ok)

        val collected = CopyOnWriteArrayList<String>()
        val subscribed = CompletableDeferred<Unit>()
        val job = launch {
            a.subscribe("t")
                .onStart { subscribed.complete(Unit) }
                .collect { collected += it }
        }
        subscribed.await()
        assertTrue(a.publish("t", "self") is AppResult.Ok)
        delay(150)
        job.cancelAndJoin()
        assertTrue(collected.isEmpty())
    }
}
