package com.fitconnect.android.geo.booking

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.geo.availability.AvailabilityEngine
import com.fitconnect.android.geo.domain.BookingLifecycle
import com.fitconnect.android.geo.domain.BookingTargetKind
import com.fitconnect.android.geo.domain.SessionMode
import com.fitconnect.android.geo.offline.GeoOfflineStore
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicLong
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

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

data class Booking(
    val id: String,
    val request: BookingRequest,
    val status: BookingLifecycle,
    val waitlistPosition: Int? = null,
    val createdAtEpochMs: Long = System.currentTimeMillis(),
    val updatedAtEpochMs: Long = System.currentTimeMillis(),
)

/**
 * Production booking architecture — UI-agnostic. Coach/Athlete screens call this only.
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
}

class DefaultBookingEngine(
    private val availability: AvailabilityEngine,
    private val offline: GeoOfflineStore,
    private val policy: CancellationPolicy = CancellationPolicy(24, 50, listOf(24, 2)),
) : BookingEngine {
    private val bookings = ConcurrentHashMap<String, Booking>()
    private val revisionCounter = AtomicLong(0)
    private val revisionFlow = MutableStateFlow(0L)

    init {
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
        bookings[seed.id] = seed
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
        bookings[paid.id] = paid
        bump()
    }

    override fun list(status: BookingLifecycle?): List<Booking> =
        bookings.values.filter { status == null || it.status == status }.sortedBy { it.request.startEpochMs }

    override fun get(id: String): Booking? = bookings[id]

    override fun revisions(): Flow<Long> = revisionFlow.asStateFlow()

    override suspend fun create(request: BookingRequest): AppResult<Booking> {
        if (!availability.isOpen(request.targetId, request.startEpochMs, request.durationMin, request.mode)) {
            return AppResult.Err(AppError.Unexpected("Outside availability window"))
        }
        if (conflicts(request.targetId, request.startEpochMs, request.durationMin)) {
            val waitlisted = Booking(
                id = "bk-${UUID.randomUUID().toString().take(8)}",
                request = request,
                status = BookingLifecycle.WAITLISTED,
                waitlistPosition = list(BookingLifecycle.WAITLISTED).size + 1,
            )
            bookings[waitlisted.id] = waitlisted
            offline.enqueueBookingAction("create_waitlist", waitlisted.id)
            bump()
            return AppResult.Ok(waitlisted)
        }
        val status = if (request.autoConfirm) BookingLifecycle.CONFIRMED else BookingLifecycle.PENDING
        val created = Booking(
            id = "bk-${UUID.randomUUID().toString().take(8)}",
            request = request,
            status = status,
        )
        bookings[created.id] = created
        offline.enqueueBookingAction("create", created.id)
        bump()
        return AppResult.Ok(created)
    }

    override suspend fun confirm(id: String): AppResult<Booking> = transition(id, BookingLifecycle.CONFIRMED, "confirm")

    override suspend fun reject(id: String): AppResult<Booking> = transition(id, BookingLifecycle.CANCELLED, "reject")

    override suspend fun cancel(id: String): AppResult<Booking> = transition(id, BookingLifecycle.CANCELLED, "cancel")

    override suspend fun reschedule(id: String, newStartEpochMs: Long): AppResult<Booking> {
        val current = bookings[id] ?: return AppResult.Err(AppError.Unexpected("Booking missing"))
        if (conflicts(current.request.targetId, newStartEpochMs, current.request.durationMin, excludeId = id)) {
            return AppResult.Err(AppError.Unexpected("Conflict on new slot"))
        }
        val next = current.copy(
            request = current.request.copy(startEpochMs = newStartEpochMs),
            status = BookingLifecycle.RESCHEDULED,
            updatedAtEpochMs = System.currentTimeMillis(),
        )
        bookings[id] = next
        offline.enqueueBookingAction("reschedule", id)
        bump()
        return AppResult.Ok(next)
    }

    override fun policy(): CancellationPolicy = policy

    override fun conflicts(targetId: String, startEpochMs: Long, durationMin: Int, excludeId: String?): Boolean {
        val end = startEpochMs + durationMin * 60_000L
        return bookings.values.any { booking ->
            booking.id != excludeId &&
                booking.request.targetId == targetId &&
                booking.status in setOf(BookingLifecycle.PENDING, BookingLifecycle.CONFIRMED, BookingLifecycle.RESCHEDULED) &&
                rangesOverlap(startEpochMs, end, booking.request.startEpochMs, booking.request.startEpochMs + booking.request.durationMin * 60_000L)
        }
    }

    private suspend fun transition(id: String, status: BookingLifecycle, action: String): AppResult<Booking> {
        val current = bookings[id] ?: return AppResult.Err(AppError.Unexpected("Booking missing"))
        val next = current.copy(status = status, updatedAtEpochMs = System.currentTimeMillis())
        bookings[id] = next
        offline.enqueueBookingAction(action, id)
        bump()
        return AppResult.Ok(next)
    }

    private fun bump() {
        revisionFlow.value = revisionCounter.incrementAndGet()
    }

    private fun rangesOverlap(aStart: Long, aEnd: Long, bStart: Long, bEnd: Long): Boolean =
        aStart < bEnd && bStart < aEnd
}
