package com.fitconnect.shared.session

/**
 * Exclusive owner of an in-progress training session (ADR-011).
 *
 * A session has exactly one owning device at a time. Two mechanisms enforce that:
 *
 *  - [epoch] — a monotonic counter bumped on every ownership change. Writes carrying a
 *    stale epoch are REJECTED, not merged. This is what stops a device that lost
 *    ownership mid-flight from appending a duplicate set.
 *  - [ownerHeartbeatAtEpochMs] — the owner renews every [OWNER_HEARTBEAT_INTERVAL_MS].
 *    After [OWNER_LEASE_TIMEOUT_MS] with no renewal the lease is reclaimable, because
 *    the owner may simply have run out of battery mid-workout.
 *
 * Auth logout on another surface must NOT end this lease (ADR-011, scenario 9):
 * ownership belongs to the device, not to the auth session.
 */
data class SessionLease(
    val session: ActivitySession,
    val ownerDeviceId: String,
    val updatedAtEpochMs: Long,
    val pendingTransferTo: String? = null,
    val transferOfferedAtEpochMs: Long? = null,
    /** Bumped on every ownership change. Writes with a lower epoch are rejected. */
    val epoch: Int = 0,
    /** Last liveness signal from the owning device. */
    val ownerHeartbeatAtEpochMs: Long = updatedAtEpochMs,
)

sealed class OwnershipResult {
    data class Ok(val lease: SessionLease) : OwnershipResult()
    data class Blocked(val lease: SessionLease, val code: String) : OwnershipResult()
}

object SessionOwnership {
    const val TRANSFER_TIMEOUT_MS = 8_000L

    /** Owner renews its lease at this cadence. Suspended in watch ambient mode. */
    const val OWNER_HEARTBEAT_INTERVAL_MS = 10_000L

    /** No renewal for this long => the lease may be reclaimed by another device. */
    const val OWNER_LEASE_TIMEOUT_MS = 45_000L

    const val SESSION_OWNED_BY = "SESSION_OWNED_BY"
    const val NOT_ACTIVE = "NOT_ACTIVE"
    const val ALREADY_OWNER = "ALREADY_OWNER"
    const val NO_OFFER = "NO_OFFER"
    const val NOT_OFFEREE = "NOT_OFFEREE"
    const val OFFER_EXPIRED = "OFFER_EXPIRED"

    /** Write carried an epoch older than the lease — the writer lost ownership. */
    const val STALE_EPOCH = "STALE_EPOCH"

    /** Write came from a device that does not own the lease. */
    const val NOT_OWNER = "NOT_OWNER"

    /** Reclaim attempted while the owner is still sending heartbeats. */
    const val OWNER_ALIVE = "OWNER_ALIVE"

    fun isLocked(state: ActivitySessionState): Boolean =
        when (state) {
            ActivitySessionState.ACTIVE,
            ActivitySessionState.PAUSED,
            ActivitySessionState.RESUMING,
            ActivitySessionState.FINISHING,
            ActivitySessionState.ENDING,
            -> true
            else -> false
        }

    fun claimStart(
        current: SessionLease?,
        sessionId: String,
        deviceId: String,
        sportKey: String,
        nowEpochMs: Long,
    ): OwnershipResult {
        if (current != null && isLocked(current.session.state) && current.ownerDeviceId != deviceId) {
            return OwnershipResult.Blocked(expireIfNeeded(current, nowEpochMs), SESSION_OWNED_BY)
        }
        val seeded = ActivitySession(
            sessionId = sessionId,
            sportKey = sportKey,
            deviceId = deviceId,
        )
        val started = ActivitySessionMachine.apply(seeded, ActivitySessionEvent.START, nowEpochMs)
            .copy(deviceId = deviceId)
        return OwnershipResult.Ok(
            SessionLease(
                session = started,
                ownerDeviceId = deviceId,
                updatedAtEpochMs = nowEpochMs,
                epoch = 0,
                ownerHeartbeatAtEpochMs = nowEpochMs,
            ),
        )
    }

    fun offerTransfer(lease: SessionLease, toDeviceId: String, nowEpochMs: Long): OwnershipResult {
        val live = expireIfNeeded(lease, nowEpochMs)
        if (!isLocked(live.session.state)) {
            return OwnershipResult.Blocked(live, NOT_ACTIVE)
        }
        if (toDeviceId == live.ownerDeviceId) {
            return OwnershipResult.Blocked(live, ALREADY_OWNER)
        }
        return OwnershipResult.Ok(
            live.copy(
                pendingTransferTo = toDeviceId,
                transferOfferedAtEpochMs = nowEpochMs,
                updatedAtEpochMs = nowEpochMs,
            ),
        )
    }

    fun ackTransfer(lease: SessionLease, deviceId: String, nowEpochMs: Long): OwnershipResult {
        val hadOffer = lease.pendingTransferTo != null
        val live = expireIfNeeded(lease, nowEpochMs)
        val pending = live.pendingTransferTo
        if (pending == null) {
            return OwnershipResult.Blocked(live, if (hadOffer) OFFER_EXPIRED else NO_OFFER)
        }
        if (deviceId != pending) {
            return OwnershipResult.Blocked(live, NOT_OFFEREE)
        }
        return OwnershipResult.Ok(
            live.copy(
                session = live.session.copy(deviceId = deviceId),
                ownerDeviceId = deviceId,
                pendingTransferTo = null,
                transferOfferedAtEpochMs = null,
                updatedAtEpochMs = nowEpochMs,
                // Ownership changed: every write still in flight from the old owner
                // is now stale and must be rejected rather than merged.
                epoch = live.epoch + 1,
                ownerHeartbeatAtEpochMs = nowEpochMs,
            ),
        )
    }

    /** Owner renews its lease. Only the owner may do this. */
    fun heartbeat(lease: SessionLease, deviceId: String, nowEpochMs: Long): OwnershipResult {
        if (deviceId != lease.ownerDeviceId) {
            return OwnershipResult.Blocked(lease, NOT_OWNER)
        }
        return OwnershipResult.Ok(
            lease.copy(
                ownerHeartbeatAtEpochMs = nowEpochMs,
                updatedAtEpochMs = nowEpochMs,
            ),
        )
    }

    /** True when the owner has gone quiet for longer than [OWNER_LEASE_TIMEOUT_MS]. */
    fun isOwnerStale(lease: SessionLease, nowEpochMs: Long): Boolean =
        isLocked(lease.session.state) &&
            nowEpochMs - lease.ownerHeartbeatAtEpochMs > OWNER_LEASE_TIMEOUT_MS

    /**
     * Take over a session whose owner went quiet — flat battery, crash, out of range.
     *
     * Deliberately NOT automatic: the caller must have asked the user first. Silently
     * moving a live session between devices is how duplicate sessions get created.
     */
    fun reclaimStale(lease: SessionLease, deviceId: String, nowEpochMs: Long): OwnershipResult {
        if (!isLocked(lease.session.state)) {
            return OwnershipResult.Blocked(lease, NOT_ACTIVE)
        }
        if (deviceId == lease.ownerDeviceId) {
            return OwnershipResult.Blocked(lease, ALREADY_OWNER)
        }
        if (!isOwnerStale(lease, nowEpochMs)) {
            return OwnershipResult.Blocked(lease, OWNER_ALIVE)
        }
        return OwnershipResult.Ok(
            lease.copy(
                session = lease.session.copy(deviceId = deviceId),
                ownerDeviceId = deviceId,
                pendingTransferTo = null,
                transferOfferedAtEpochMs = null,
                updatedAtEpochMs = nowEpochMs,
                epoch = lease.epoch + 1,
                ownerHeartbeatAtEpochMs = nowEpochMs,
            ),
        )
    }

    /**
     * Gate every session-scoped write through this.
     *
     * Rejects — never merges — writes from a non-owner or carrying a stale epoch.
     * For training data, refusing and telling the user beats merging and lying.
     */
    fun authorizeWrite(
        lease: SessionLease,
        deviceId: String,
        writeEpoch: Int,
    ): OwnershipResult {
        if (writeEpoch < lease.epoch) {
            return OwnershipResult.Blocked(lease, STALE_EPOCH)
        }
        if (deviceId != lease.ownerDeviceId) {
            return OwnershipResult.Blocked(lease, NOT_OWNER)
        }
        return OwnershipResult.Ok(lease)
    }

    fun expireIfNeeded(lease: SessionLease, nowEpochMs: Long): SessionLease {
        val offeredAt = lease.transferOfferedAtEpochMs ?: return lease
        if (lease.pendingTransferTo == null) return lease
        if (nowEpochMs - offeredAt <= TRANSFER_TIMEOUT_MS) return lease
        return lease.copy(
            pendingTransferTo = null,
            transferOfferedAtEpochMs = null,
            updatedAtEpochMs = nowEpochMs,
        )
    }
}
