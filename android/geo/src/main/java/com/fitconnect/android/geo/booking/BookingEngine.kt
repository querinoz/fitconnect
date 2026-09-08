package com.fitconnect.android.geo.booking

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.foundation.offline.ConflictStrategy
import com.fitconnect.android.foundation.offline.SyncQueue
import com.fitconnect.android.foundation.offline.SyncWork
import com.fitconnect.android.geo.availability.AvailabilityEngine
import com.fitconnect.android.geo.domain.BookingLifecycle
import com.fitconnect.android.geo.domain.BookingTargetKind
import com.fitconnect.android.geo.domain.SessionMode
import com.fitconnect.android.geo.offline.GeoOfflineStore
import java.util.UUID
import java.util.concurrent.atomic.AtomicLong
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONObject

data class CancellationPolicy(
    val hoursNotice: Int,
    val refundPercent: Int,
    val reminderHoursBefore: List<Int>,
)

data class BookingRequest(
    val targetKind: BookingTargetKind,
    val targetId: String,
    val clientId: String,
    val clientName: String,
    val startEpochMs: Long,
    val durationMin: Int,
    val mode: SessionMode,
    val recurringRule: String? = null,
    val notes: String? = null,
    val autoConfirm: Boolean = false,
)

enum class BookingSyncState {
    /** Confirmed with remote or local-only mode without remote. */
    SYNCED,
    /** Durable local write awaiting SyncQueue / HTTP flush. */
    PENDING_PUSH,
    /** Last remote attempt failed with a hard (non-network) error. */
    FAILED,
}

data class Booking(
    val id: String,
    val request: BookingRequest,
    val status: BookingLifecycle,
    val waitlistPosition: Int? = null,
    val createdAtEpochMs: Long = System.currentTimeMillis(),
    val updatedAtEpochMs: Long = System.currentTimeMillis(),
    val syncState: BookingSyncState = BookingSyncState.SYNCED,
)

/**
 * Production booking architecture — UI-agnostic. Coach/Athlete screens call this only.
 * Persistence: [BookingStore] (durable). Remote: optional [BookingRemote] + [SyncQueue].
 */
interface BookingEngine {
    fun list(status: BookingLifecycle? = null): List<Booking>
    fun get(id: String): Booking?
    fun revisions(): Flow<Long>
    suspend fun create(request: BookingRequest): AppResult<Booking>
    suspend fun confirm(id: String): AppResult<Booking>
    suspend fun reject(id: String): AppResult<Booking>
    suspend fun cancel(id: String): AppResult<Booking>
    suspend fun reschedule(id: String, newStartEpochMs: Long): AppResult<Booking>
    fun policy(): CancellationPolicy
    fun conflicts(targetId: String, startEpochMs: Long, durationMin: Int, excludeId: String? = null): Boolean
    /** Pull coach inbox from remote into durable store. No-op when remote absent. */
    suspend fun pullRemote(): AppResult<Int>
    fun pendingSyncCount(): Int
}

class DefaultBookingEngine(
    private val availability: AvailabilityEngine,
    private val offline: GeoOfflineStore,
    private val store: BookingStore = InMemoryBookingStore(),
    private val remote: BookingRemote? = null,
    private val syncQueue: SyncQueue? = null,
    private val connectivity: ConnectivityMonitor? = null,
    private val policy: CancellationPolicy = CancellationPolicy(24, 50, listOf(24, 2)),
    seedDemoBookings: Boolean = true,
) : BookingEngine {
    private val revisionCounter = AtomicLong(0)
    private val revisionFlow = MutableStateFlow(0L)

    init {
        if (seedDemoBookings && store.size() == 0) {
            seedDemo()
        }
        bump()
    }

    override fun list(status: BookingLifecycle?): List<Booking> =
        store.all().filter { status == null || it.status == status }.sortedBy { it.request.startEpochMs }

    override fun get(id: String): Booking? = store.get(id)

    override fun revisions(): Flow<Long> = revisionFlow.asStateFlow()

    override fun pendingSyncCount(): Int =
        store.all().count { it.syncState == BookingSyncState.PENDING_PUSH } +
            offline.pendingBookingActions().size

    override suspend fun create(request: BookingRequest): AppResult<Booking> {
        if (!availability.isOpen(request.targetId, request.startEpochMs, request.durationMin, request.mode)) {
            return AppResult.Err(AppError.Unexpected("Outside availability window"))
        }
        if (conflicts(request.targetId, request.startEpochMs, request.durationMin)) {
            val waitlisted = Booking(
                id = localId(),
                request = request,
                status = BookingLifecycle.WAITLISTED,
                waitlistPosition = list(BookingLifecycle.WAITLISTED).size + 1,
                syncState = BookingSyncState.SYNCED,
            )
            store.upsert(waitlisted)
            offline.enqueueBookingAction("create_waitlist", waitlisted.id)
            bump()
            return AppResult.Ok(waitlisted)
        }

        val localStatus = if (request.autoConfirm) BookingLifecycle.CONFIRMED else BookingLifecycle.PENDING
        val localId = localId()
        val idempotencyKey = "athlete.booking.create:${request.targetId}:${request.startEpochMs / 60_000}"
        val draft = Booking(
            id = localId,
            request = request,
            status = localStatus,
            syncState = if (remote == null) BookingSyncState.SYNCED else BookingSyncState.PENDING_PUSH,
        )
        store.upsert(draft)
        offline.enqueueBookingAction("create", draft.id)
        bump()

        if (remote == null) {
            return AppResult.Ok(draft.copy(syncState = BookingSyncState.SYNCED))
        }

        return pushCreate(draft, idempotencyKey)
    }

    override suspend fun confirm(id: String): AppResult<Booking> =
        transitionCoach(id, BookingLifecycle.CONFIRMED, CoachBookingAction.APPROVE, "confirm")

    override suspend fun reject(id: String): AppResult<Booking> =
        transitionCoach(id, BookingLifecycle.CANCELLED, CoachBookingAction.REJECT, "reject")

    override suspend fun cancel(id: String): AppResult<Booking> {
        val current = store.get(id) ?: return AppResult.Err(AppError.Unexpected("Booking missing"))
        val next = current.copy(
            status = BookingLifecycle.CANCELLED,
            updatedAtEpochMs = System.currentTimeMillis(),
            syncState = if (remote == null) BookingSyncState.SYNCED else BookingSyncState.PENDING_PUSH,
        )
        store.upsert(next)
        offline.enqueueBookingAction("cancel", id)
        bump()
        if (remote == null) return AppResult.Ok(next)

        return when (val result = tryRemoteSession(id, SessionBookingAction.CANCEL)) {
            is PushOutcome.Synced -> {
                val synced = next.copy(syncState = BookingSyncState.SYNCED)
                store.upsert(synced)
                offline.acknowledgeBookingAction("cancel", id)
                bump()
                AppResult.Ok(synced)
            }
            is PushOutcome.Queued -> AppResult.Ok(next)
            is PushOutcome.Failed -> {
                val failed = next.copy(syncState = BookingSyncState.FAILED)
                store.upsert(failed)
                bump()
                AppResult.Err(result.error)
            }
        }
    }

    override suspend fun reschedule(id: String, newStartEpochMs: Long): AppResult<Booking> {
        val current = store.get(id) ?: return AppResult.Err(AppError.Unexpected("Booking missing"))
        if (conflicts(current.request.targetId, newStartEpochMs, current.request.durationMin, excludeId = id)) {
            return AppResult.Err(AppError.Unexpected("Conflict on new slot"))
        }
        val next = current.copy(
            request = current.request.copy(startEpochMs = newStartEpochMs),
            status = BookingLifecycle.RESCHEDULED,
            updatedAtEpochMs = System.currentTimeMillis(),
            syncState = if (remote == null) BookingSyncState.SYNCED else BookingSyncState.PENDING_PUSH,
        )
        store.upsert(next)
        offline.enqueueBookingAction("reschedule", id)
        bump()
        if (remote == null) return AppResult.Ok(next)

        return when (val result = tryRemoteSession(id, SessionBookingAction.RESCHEDULE, newStartEpochMs)) {
            is PushOutcome.Synced -> {
                val synced = next.copy(syncState = BookingSyncState.SYNCED)
                store.upsert(synced)
                offline.acknowledgeBookingAction("reschedule", id)
                bump()
                AppResult.Ok(synced)
            }
            is PushOutcome.Queued -> AppResult.Ok(next)
            is PushOutcome.Failed -> {
                val failed = next.copy(syncState = BookingSyncState.FAILED)
                store.upsert(failed)
                bump()
                AppResult.Err(result.error)
            }
        }
    }

    override fun policy(): CancellationPolicy = policy

    override fun conflicts(targetId: String, startEpochMs: Long, durationMin: Int, excludeId: String?): Boolean {
        val end = startEpochMs + durationMin * 60_000L
        return store.all().any { booking ->
            booking.id != excludeId &&
                booking.request.targetId == targetId &&
                booking.status in setOf(
                    BookingLifecycle.PENDING,
                    BookingLifecycle.CONFIRMED,
                    BookingLifecycle.RESCHEDULED,
                ) &&
                rangesOverlap(
                    startEpochMs,
                    end,
                    booking.request.startEpochMs,
                    booking.request.startEpochMs + booking.request.durationMin * 60_000L,
                )
        }
    }

    override suspend fun pullRemote(): AppResult<Int> {
        val client = remote ?: return AppResult.Ok(0)
        return when (val result = client.listCoachBookings()) {
            is AppResult.Err -> result
            is AppResult.Ok -> {
                val mapped = result.value.map { row ->
                    val existing = store.get(row.id)
                    row.toLocalBooking(
                        targetId = existing?.request?.targetId ?: row.coachId.ifBlank { "coach" },
                        clientId = row.athleteId.ifBlank { existing?.request?.clientId ?: "athlete" },
                        clientName = row.athleteName,
                        mode = existing?.request?.mode ?: SessionMode.PRIVATE,
                        syncState = BookingSyncState.SYNCED,
                    )
                }
                // Merge: remote pending wins for listed ids; keep local PENDING_PUSH / waitlist.
                val keepLocal = store.all().filter { local ->
                    local.syncState == BookingSyncState.PENDING_PUSH ||
                        local.status == BookingLifecycle.WAITLISTED ||
                        mapped.none { it.id == local.id }
                }
                store.replaceAll(mapped + keepLocal)
                bump()
                AppResult.Ok(mapped.size)
            }
        }
    }

    private suspend fun pushCreate(draft: Booking, idempotencyKey: String): AppResult<Booking> {
        val online = connectivity?.online?.value != false
        if (!online) {
            enqueueCreateWork(draft, idempotencyKey)
            return AppResult.Ok(draft)
        }
        return when (
            val remoteResult = remote!!.createAthleteBooking(
                coachId = draft.request.targetId,
                scheduledAtEpochMs = draft.request.startEpochMs,
                durationMin = draft.request.durationMin,
                notes = draft.request.notes,
                idempotencyKey = idempotencyKey,
                mode = draft.request.mode,
            )
        ) {
            is AppResult.Ok -> {
                store.remove(draft.id)
                val synced = remoteResult.value.toLocalBooking(
                    targetId = draft.request.targetId,
                    clientId = draft.request.clientId,
                    clientName = draft.request.clientName,
                    mode = draft.request.mode,
                    syncState = BookingSyncState.SYNCED,
                ).copy(
                    status = if (draft.request.autoConfirm) {
                        BookingLifecycle.CONFIRMED
                    } else {
                        remoteResult.value.status
                    },
                    createdAtEpochMs = draft.createdAtEpochMs,
                )
                store.upsert(synced)
                offline.acknowledgeBookingAction("create", draft.id)
                bump()
                AppResult.Ok(synced)
            }
            is AppResult.Err -> {
                val network = remoteResult.error as? AppError.Network
                if (network != null) {
                    enqueueCreateWork(draft, idempotencyKey)
                    AppResult.Ok(draft)
                } else {
                    store.upsert(draft.copy(syncState = BookingSyncState.FAILED))
                    bump()
                    remoteResult
                }
            }
        }
    }

    private suspend fun transitionCoach(
        id: String,
        status: BookingLifecycle,
        action: CoachBookingAction,
        offlineAction: String,
    ): AppResult<Booking> {
        val current = store.get(id) ?: return AppResult.Err(AppError.Unexpected("Booking missing"))
        val next = current.copy(
            status = status,
            updatedAtEpochMs = System.currentTimeMillis(),
            syncState = if (remote == null) BookingSyncState.SYNCED else BookingSyncState.PENDING_PUSH,
        )
        store.upsert(next)
        offline.enqueueBookingAction(offlineAction, id)
        bump()
        if (remote == null) return AppResult.Ok(next)

        val online = connectivity?.online?.value != false
        if (!online) {
            enqueueCoachWork(id, action)
            return AppResult.Ok(next)
        }
        return when (val result = remote.coachAction(id, action)) {
            is AppResult.Ok -> {
                val synced = next.copy(syncState = BookingSyncState.SYNCED)
                store.upsert(synced)
                offline.acknowledgeBookingAction(offlineAction, id)
                bump()
                AppResult.Ok(synced)
            }
            is AppResult.Err -> {
                val network = result.error as? AppError.Network
                if (network != null) {
                    enqueueCoachWork(id, action)
                    AppResult.Ok(next)
                } else {
                    val failed = next.copy(syncState = BookingSyncState.FAILED)
                    store.upsert(failed)
                    bump()
                    result
                }
            }
        }
    }

    private suspend fun tryRemoteSession(
        id: String,
        action: SessionBookingAction,
        scheduledAtEpochMs: Long? = null,
    ): PushOutcome {
        val online = connectivity?.online?.value != false
        if (!online) {
            enqueueSessionWork(id, action, scheduledAtEpochMs)
            return PushOutcome.Queued
        }
        return when (val result = remote!!.sessionAction(id, action, scheduledAtEpochMs)) {
            is AppResult.Ok -> PushOutcome.Synced
            is AppResult.Err -> {
                val network = result.error as? AppError.Network
                if (network != null) {
                    enqueueSessionWork(id, action, scheduledAtEpochMs)
                    PushOutcome.Queued
                } else {
                    PushOutcome.Failed(result.error)
                }
            }
        }
    }

    private suspend fun enqueueCreateWork(draft: Booking, idempotencyKey: String) {
        val body = JSONObject()
            .put("coachId", draft.request.targetId)
            .put("scheduledAt", java.time.Instant.ofEpochMilli(draft.request.startEpochMs).toString())
            .put("durationMin", draft.request.durationMin)
            .put("type", "Intro session")
            .put("mode", if (draft.request.mode == SessionMode.PRIVATE) "In-person" else "Online")
            .put("idempotencyKey", idempotencyKey)
        if (!draft.request.notes.isNullOrBlank()) body.put("notes", draft.request.notes)
        syncQueue?.enqueue(
            SyncWork(
                type = "athlete.booking.create",
                payloadJson = body.toString(),
                idempotencyKey = idempotencyKey,
                conflictStrategy = ConflictStrategy.MANUAL,
            ),
        )
    }

    private suspend fun enqueueCoachWork(id: String, action: CoachBookingAction) {
        val type = when (action) {
            CoachBookingAction.APPROVE -> "coach.booking.approve"
            CoachBookingAction.REJECT -> "coach.booking.decline"
        }
        syncQueue?.enqueue(
            SyncWork(
                type = type,
                payloadJson = JSONObject().put("bookingId", id).put("id", id).toString(),
                idempotencyKey = "$type:$id",
                conflictStrategy = ConflictStrategy.MANUAL,
            ),
        )
    }

    private suspend fun enqueueSessionWork(
        id: String,
        action: SessionBookingAction,
        scheduledAtEpochMs: Long?,
    ) {
        val type = when (action) {
            SessionBookingAction.CANCEL -> "coach.session.cancel"
            SessionBookingAction.RESCHEDULE -> "coach.session.reschedule"
        }
        val payload = JSONObject().put("sessionId", id).put("id", id)
        if (scheduledAtEpochMs != null) payload.put("start", scheduledAtEpochMs)
        syncQueue?.enqueue(
            SyncWork(
                type = type,
                payloadJson = payload.toString(),
                idempotencyKey = "$type:$id:${scheduledAtEpochMs ?: 0}",
                conflictStrategy = ConflictStrategy.MANUAL,
            ),
        )
    }

    private fun seedDemo() {
        val seed = Booking(
            id = "bk1",
            request = BookingRequest(
                targetKind = BookingTargetKind.COACH,
                targetId = "p_coach_maya",
                clientId = "a4",
                clientName = "Marina Santos",
                startEpochMs = System.currentTimeMillis() + 172_800_000,
                durationMin = 60,
                mode = SessionMode.PRIVATE,
                notes = "LOCAL_DEMO first consult",
            ),
            status = BookingLifecycle.PENDING,
        )
        store.upsert(seed)
        val paid = Booking(
            id = "bk2",
            request = BookingRequest(
                targetKind = BookingTargetKind.COACH,
                targetId = "p_coach_maya",
                clientId = "ath-1",
                clientName = "Inês Costa",
                startEpochMs = System.currentTimeMillis() + 259_200_000,
                durationMin = 45,
                mode = SessionMode.PRIVATE,
                notes = "LOCAL_DEMO confirmed",
            ),
            status = BookingLifecycle.CONFIRMED,
        )
        store.upsert(paid)
    }

    private fun bump() {
        revisionFlow.value = revisionCounter.incrementAndGet()
    }

    private fun localId(): String = "bk-${UUID.randomUUID().toString().take(8)}"

    private fun rangesOverlap(aStart: Long, aEnd: Long, bStart: Long, bEnd: Long): Boolean =
        aStart < bEnd && bStart < aEnd

    private sealed class PushOutcome {
        data object Synced : PushOutcome()
        data object Queued : PushOutcome()
        data class Failed(val error: AppError) : PushOutcome()
    }
}
