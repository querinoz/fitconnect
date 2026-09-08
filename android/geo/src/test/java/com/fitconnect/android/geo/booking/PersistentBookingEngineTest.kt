package com.fitconnect.android.geo.booking

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.foundation.offline.InMemorySyncQueue
import com.fitconnect.android.geo.availability.DefaultAvailabilityEngine
import com.fitconnect.android.geo.domain.BookingLifecycle
import com.fitconnect.android.geo.domain.BookingTargetKind
import com.fitconnect.android.geo.domain.SessionMode
import com.fitconnect.android.geo.offline.DefaultGeoOfflineStore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class DurableBookingStoreTest {
    @Test
    fun survivesBlobRoundTrip() {
        val backend = MemoryBookingBlobBackend()
        val store = DurableBookingStore(backend)
        val booking = Booking(
            id = "bk-persist",
            request = BookingRequest(
                targetKind = BookingTargetKind.COACH,
                targetId = "coach-1",
                clientId = "ath-1",
                clientName = "Athlete",
                startEpochMs = 1_700_000_000_000L,
                durationMin = 45,
                mode = SessionMode.PRIVATE,
                notes = "roundtrip",
            ),
            status = BookingLifecycle.PENDING,
            syncState = BookingSyncState.PENDING_PUSH,
        )
        store.upsert(booking)
        assertTrue(backend.snapshot()!!.contains("bk-persist"))

        val reloaded = DurableBookingStore(backend)
        assertEquals(1, reloaded.size())
        val got = reloaded.get("bk-persist")!!
        assertEquals(BookingLifecycle.PENDING, got.status)
        assertEquals(BookingSyncState.PENDING_PUSH, got.syncState)
        assertEquals("coach-1", got.request.targetId)
        assertEquals(45, got.request.durationMin)
    }

    @Test
    fun codecRoundTrip() {
        val original = Booking(
            id = "bk-codec",
            request = BookingRequest(
                targetKind = BookingTargetKind.GYM,
                targetId = "gym-1",
                clientId = "c1",
                clientName = "Client",
                startEpochMs = 42L,
                durationMin = 30,
                mode = SessionMode.GROUP,
                recurringRule = "FREQ=WEEKLY",
                notes = "n",
                autoConfirm = true,
            ),
            status = BookingLifecycle.WAITLISTED,
            waitlistPosition = 2,
            syncState = BookingSyncState.FAILED,
        )
        val decoded = BookingCodec.decode(BookingCodec.encode(original))
        assertEquals(original, decoded)
    }
}

class PersistentBookingEngineTest {
    private fun openSlot(): Long {
        val availability = DefaultAvailabilityEngine()
        val now = System.currentTimeMillis()
        var t = now + 86_400_000
        repeat(14 * 24) {
            if (availability.isOpen("p_coach_maya", t, 60, SessionMode.PRIVATE)) return t
            t += 3_600_000
        }
        return now + 2L * 86_400_000 + 10 * 3_600_000
    }

    @Test
    fun offlineCreatePersistsAndEnqueuesSyncWork() = runBlocking {
        val store = DurableBookingStore(MemoryBookingBlobBackend())
        val sync = InMemorySyncQueue()
        val connectivity = FakeConnectivity(online = false)
        val remote = RecordingBookingRemote()
        val offline = DefaultGeoOfflineStore()
        val engine = DefaultBookingEngine(
            availability = DefaultAvailabilityEngine(),
            offline = offline,
            store = store,
            remote = remote,
            syncQueue = sync,
            connectivity = connectivity,
            seedDemoBookings = false,
        )

        val result = engine.create(
            BookingRequest(
                targetKind = BookingTargetKind.COACH,
                targetId = "p_coach_maya",
                clientId = "ath-1",
                clientName = "Athlete",
                startEpochMs = openSlot(),
                durationMin = 60,
                mode = SessionMode.PRIVATE,
            ),
        )
        assertTrue(result is AppResult.Ok)
        val booking = (result as AppResult.Ok).value
        assertEquals(BookingSyncState.PENDING_PUSH, booking.syncState)
        assertEquals(1, sync.size())
        assertEquals("athlete.booking.create", sync.peek().first().type)
        assertEquals(0, remote.createCalls)
        assertTrue(engine.pendingSyncCount() >= 1)
    }

    @Test
    fun offlineCreateRoundTripsThroughDurableBackend() = runBlocking {
        val backend = MemoryBookingBlobBackend()
        val store = DurableBookingStore(backend)
        val sync = InMemorySyncQueue()
        val engine = DefaultBookingEngine(
            availability = DefaultAvailabilityEngine(),
            offline = DefaultGeoOfflineStore(),
            store = store,
            remote = RecordingBookingRemote(),
            syncQueue = sync,
            connectivity = FakeConnectivity(online = false),
            seedDemoBookings = false,
        )
        val created = (engine.create(
            BookingRequest(
                targetKind = BookingTargetKind.COACH,
                targetId = "p_coach_maya",
                clientId = "ath-1",
                clientName = "Athlete",
                startEpochMs = openSlot(),
                durationMin = 60,
                mode = SessionMode.PRIVATE,
            ),
        ) as AppResult.Ok).value

        val afterDeath = DurableBookingStore(backend)
        assertEquals(created.id, afterDeath.get(created.id)?.id)
        assertEquals(BookingSyncState.PENDING_PUSH, afterDeath.get(created.id)?.syncState)
    }

    @Test
    fun onlineCreateUsesRemoteIdAndMarksSynced() = runBlocking {
        val store = InMemoryBookingStore()
        val remote = RecordingBookingRemote(createId = "bk-server-99")
        val engine = DefaultBookingEngine(
            availability = DefaultAvailabilityEngine(),
            offline = DefaultGeoOfflineStore(),
            store = store,
            remote = remote,
            syncQueue = InMemorySyncQueue(),
            connectivity = FakeConnectivity(online = true),
            seedDemoBookings = false,
        )
        val created = (engine.create(
            BookingRequest(
                targetKind = BookingTargetKind.COACH,
                targetId = "p_coach_maya",
                clientId = "ath-1",
                clientName = "Athlete",
                startEpochMs = openSlot(),
                durationMin = 60,
                mode = SessionMode.PRIVATE,
            ),
        ) as AppResult.Ok).value
        assertEquals("bk-server-99", created.id)
        assertEquals(BookingSyncState.SYNCED, created.syncState)
        assertEquals(1, remote.createCalls)
        assertEquals(0, InMemorySyncQueue().size())
    }

    @Test
    fun hardApiFailureDoesNotFakeSuccess() = runBlocking {
        val store = InMemoryBookingStore()
        val remote = RecordingBookingRemote(
            createResult = AppResult.Err(AppError.Api(422, code = "scheduledAt_in_past")),
        )
        val sync = InMemorySyncQueue()
        val engine = DefaultBookingEngine(
            availability = DefaultAvailabilityEngine(),
            offline = DefaultGeoOfflineStore(),
            store = store,
            remote = remote,
            syncQueue = sync,
            connectivity = FakeConnectivity(online = true),
            seedDemoBookings = false,
        )
        val result = engine.create(
            BookingRequest(
                targetKind = BookingTargetKind.COACH,
                targetId = "p_coach_maya",
                clientId = "ath-1",
                clientName = "Athlete",
                startEpochMs = openSlot(),
                durationMin = 60,
                mode = SessionMode.PRIVATE,
            ),
        )
        assertTrue(result is AppResult.Err)
        assertEquals(0, sync.size())
        assertEquals(BookingSyncState.FAILED, store.all().single().syncState)
    }

    @Test
    fun flushBookingQueueDoesNotClearWithoutAck() = runBlocking {
        val offline = DefaultGeoOfflineStore()
        offline.enqueueBookingAction("create", "bk1")
        assertEquals(1, offline.flushBookingQueue())
        assertEquals(1, offline.pendingBookingActions().size)
        assertTrue(offline.acknowledgeBookingAction("create", "bk1"))
        assertEquals(0, offline.pendingBookingActions().size)
    }

    @Test
    fun confirmOfflineEnqueuesCoachApprove() = runBlocking {
        val store = InMemoryBookingStore()
        store.upsert(
            Booking(
                id = "bk1",
                request = BookingRequest(
                    targetKind = BookingTargetKind.COACH,
                    targetId = "p_coach_maya",
                    clientId = "a4",
                    clientName = "Marina",
                    startEpochMs = openSlot(),
                    durationMin = 60,
                    mode = SessionMode.PRIVATE,
                ),
                status = BookingLifecycle.PENDING,
            ),
        )
        val sync = InMemorySyncQueue()
        val engine = DefaultBookingEngine(
            availability = DefaultAvailabilityEngine(),
            offline = DefaultGeoOfflineStore(),
            store = store,
            remote = RecordingBookingRemote(),
            syncQueue = sync,
            connectivity = FakeConnectivity(online = false),
            seedDemoBookings = false,
        )
        val confirmed = (engine.confirm("bk1") as AppResult.Ok).value
        assertEquals(BookingLifecycle.CONFIRMED, confirmed.status)
        assertEquals(BookingSyncState.PENDING_PUSH, confirmed.syncState)
        assertEquals("coach.booking.approve", sync.peek().single().type)
    }

    @Test
    fun pullRemoteMergesCoachInbox() = runBlocking {
        val store = InMemoryBookingStore()
        val remote = RecordingBookingRemote(
            listRows = listOf(
                RemoteBookingRow(
                    id = "bk-remote",
                    athleteId = "ath-9",
                    athleteName = "Remote Athlete",
                    coachId = "coach-1",
                    scheduledAtEpochMs = openSlot(),
                    durationMin = 60,
                    status = BookingLifecycle.PENDING,
                    notes = "from api",
                ),
            ),
        )
        val engine = DefaultBookingEngine(
            availability = DefaultAvailabilityEngine(),
            offline = DefaultGeoOfflineStore(),
            store = store,
            remote = remote,
            seedDemoBookings = false,
        )
        val pulled = engine.pullRemote()
        assertTrue(pulled is AppResult.Ok)
        assertEquals(1, (pulled as AppResult.Ok).value)
        assertEquals("Remote Athlete", store.get("bk-remote")!!.request.clientName)
    }

    @Test
    fun syncHookMarksCreateSynced() {
        val store = InMemoryBookingStore()
        val offline = DefaultGeoOfflineStore()
        val local = Booking(
            id = "bk-local",
            request = BookingRequest(
                targetKind = BookingTargetKind.COACH,
                targetId = "coach-1",
                clientId = "ath-1",
                clientName = "Athlete",
                startEpochMs = 1_700_000_000_000L,
                durationMin = 60,
                mode = SessionMode.PRIVATE,
            ),
            status = BookingLifecycle.PENDING,
            syncState = BookingSyncState.PENDING_PUSH,
        )
        store.upsert(local)
        offline.enqueueBookingAction("create", local.id)
        val work = com.fitconnect.android.foundation.offline.SyncWork(
            type = "athlete.booking.create",
            payloadJson = """{"coachId":"coach-1","scheduledAt":"${java.time.Instant.ofEpochMilli(local.request.startEpochMs)}"}""",
            idempotencyKey = "k1",
        )
        BookingStoreSyncHooks.onAthleteCreateSynced(
            store,
            offline,
            work,
            """{"booking":{"id":"bk-server"}}""",
        )
        assertFalse(store.all().any { it.id == "bk-local" })
        assertEquals(BookingSyncState.SYNCED, store.get("bk-server")!!.syncState)
        assertEquals(0, offline.pendingBookingActions().size)
    }
}

private class FakeConnectivity(online: Boolean) : ConnectivityMonitor {
    private val _online = MutableStateFlow(online)
    override val online: StateFlow<Boolean> = _online.asStateFlow()
    override fun start() = Unit
    fun setOnline(value: Boolean) {
        _online.value = value
    }
}

private class RecordingBookingRemote(
    private val createId: String = "bk-remote-1",
    private val createResult: AppResult<RemoteBookingRow>? = null,
    private val listRows: List<RemoteBookingRow> = emptyList(),
) : BookingRemote {
    var createCalls = 0
        private set

    override suspend fun createAthleteBooking(
        coachId: String,
        scheduledAtEpochMs: Long,
        durationMin: Int,
        notes: String?,
        idempotencyKey: String?,
        mode: SessionMode,
    ): AppResult<RemoteBookingRow> {
        createCalls++
        createResult?.let { return it }
        return AppResult.Ok(
            RemoteBookingRow(
                id = createId,
                athleteId = "ath-1",
                athleteName = "Athlete",
                coachId = coachId,
                scheduledAtEpochMs = scheduledAtEpochMs,
                durationMin = durationMin,
                status = BookingLifecycle.PENDING,
                notes = notes,
                source = "memory",
            ),
        )
    }

    override suspend fun listAthleteBookings(): AppResult<List<RemoteBookingRow>> = AppResult.Ok(listRows)

    override suspend fun listCoachBookings(): AppResult<List<RemoteBookingRow>> = AppResult.Ok(listRows)

    override suspend fun coachAction(bookingId: String, action: CoachBookingAction): AppResult<Unit> =
        AppResult.Ok(Unit)

    override suspend fun sessionAction(
        sessionId: String,
        action: SessionBookingAction,
        scheduledAtEpochMs: Long?,
    ): AppResult<Unit> = AppResult.Ok(Unit)
}
