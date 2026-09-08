package com.fitconnect.android.geo.booking

import com.fitconnect.android.foundation.offline.SyncWork
import com.fitconnect.android.geo.domain.BookingLifecycle
import com.fitconnect.android.geo.offline.GeoOfflineStore
import org.json.JSONObject

/**
 * Marks durable booking rows SYNCED after SyncQueue HTTP flush succeeds.
 * Does not invent success — only called from offline handlers after AppResult.Ok.
 */
object BookingStoreSyncHooks {
    fun onAthleteCreateSynced(
        store: BookingStore,
        offline: GeoOfflineStore,
        work: SyncWork,
        responseJson: String,
    ) {
        val payload = JSONObject(work.payloadJson)
        val coachId = payload.optString("coachId")
        val scheduledAt = payload.optString("scheduledAt")
        val remoteId = runCatching {
            JSONObject(responseJson).optJSONObject("booking")?.getString("id")
        }.getOrNull()
        val match = store.all().firstOrNull { booking ->
            booking.syncState == BookingSyncState.PENDING_PUSH &&
                booking.request.targetId == coachId &&
                (
                    scheduledAt.isBlank() ||
                        java.time.Instant.ofEpochMilli(booking.request.startEpochMs).toString() == scheduledAt
                    )
        }
        if (match != null) {
            if (remoteId != null && remoteId != match.id) {
                store.remove(match.id)
                store.upsert(
                    match.copy(
                        id = remoteId,
                        syncState = BookingSyncState.SYNCED,
                        updatedAtEpochMs = System.currentTimeMillis(),
                    ),
                )
            } else {
                store.upsert(match.copy(syncState = BookingSyncState.SYNCED))
            }
            offline.acknowledgeBookingAction("create", match.id)
            if (remoteId != null) offline.acknowledgeBookingAction("create", remoteId)
        }
    }

    fun onCoachActionSynced(
        store: BookingStore,
        offline: GeoOfflineStore,
        work: SyncWork,
        action: String,
    ) {
        val bookingId = JSONObject(work.payloadJson).optString("bookingId")
            .ifBlank { JSONObject(work.payloadJson).optString("id") }
        if (bookingId.isBlank()) return
        val current = store.get(bookingId) ?: return
        val status = when (action) {
            "approve" -> BookingLifecycle.CONFIRMED
            else -> BookingLifecycle.CANCELLED
        }
        store.upsert(
            current.copy(
                status = status,
                syncState = BookingSyncState.SYNCED,
                updatedAtEpochMs = System.currentTimeMillis(),
            ),
        )
        val offlineAction = if (action == "approve") "confirm" else "reject"
        offline.acknowledgeBookingAction(offlineAction, bookingId)
    }
}
