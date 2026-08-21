package com.fitconnect.shared.session

import com.fitconnect.shared.sync.RecordConflict
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SessionOwnershipTest {
    @Test
    fun secondDeviceCannotStartWhileWatchOwns() {
        val watch = SessionOwnership.claimStart(
            current = null,
            sessionId = "s1",
            deviceId = "watch-1",
            sportKey = "Run",
            nowEpochMs = 10L,
        )
        assertTrue(watch is OwnershipResult.Ok)
        val lease = (watch as OwnershipResult.Ok).lease
        val phone = SessionOwnership.claimStart(
            current = lease,
            sessionId = "s2",
            deviceId = "phone-1",
            sportKey = "Run",
            nowEpochMs = 20L,
        )
        assertTrue(phone is OwnershipResult.Blocked)
        assertEquals(SessionOwnership.SESSION_OWNED_BY, (phone as OwnershipResult.Blocked).code)
        assertEquals("watch-1", phone.lease.ownerDeviceId)
    }

    @Test
    fun transferAckMovesOwnerWithoutSecondSession() {
        val started = (SessionOwnership.claimStart(null, "s1", "watch-1", "Run", 10L) as OwnershipResult.Ok).lease
        val offered = (SessionOwnership.offerTransfer(started, "web-1", 20L) as OwnershipResult.Ok).lease
        val acked = (SessionOwnership.ackTransfer(offered, "web-1", 21L) as OwnershipResult.Ok).lease
        assertEquals("web-1", acked.ownerDeviceId)
        assertEquals("web-1", acked.session.deviceId)
        assertEquals(ActivitySessionState.ACTIVE, acked.session.state)
        assertEquals("s1", acked.session.sessionId)
    }

    @Test
    fun transferTimesOutAndOriginalOwnerKeepsSession() {
        val started = (SessionOwnership.claimStart(null, "s1", "watch-1", "Run", 10L) as OwnershipResult.Ok).lease
        val offered = (SessionOwnership.offerTransfer(started, "web-1", 20L) as OwnershipResult.Ok).lease
        val late = SessionOwnership.ackTransfer(
            offered,
            "web-1",
            20L + SessionOwnership.TRANSFER_TIMEOUT_MS + 1L,
        )
        assertTrue(late is OwnershipResult.Blocked)
        assertEquals(SessionOwnership.OFFER_EXPIRED, (late as OwnershipResult.Blocked).code)
        assertEquals("watch-1", late.lease.ownerDeviceId)
        assertFalse(SessionOwnership.isLocked(ActivitySessionState.IDLE))
        assertTrue(SessionOwnership.isLocked(ActivitySessionState.ACTIVE))
    }

    @Test
    fun recordConflictTieBreaksOnDeviceId() {
        assertEquals(
            "aaa",
            RecordConflict.winnerDeviceId(100L, "aaa", 100L, "zzz"),
        )
        assertEquals(
            "watch",
            RecordConflict.winnerDeviceId(200L, "watch", 50L, "phone"),
        )
    }

    // ─── ADR-011: epoch ────────────────────────────────────────────────

    @Test
    fun transferBumpsEpochSoInFlightWritesFromOldOwnerAreRejected() {
        val started = (SessionOwnership.claimStart(null, "s1", "watch-1", "Run", 10L) as OwnershipResult.Ok).lease
        assertEquals(0, started.epoch)

        // O relogio prepara uma escrita com o epoch que conhece.
        val inFlightEpoch = started.epoch

        val offered = (SessionOwnership.offerTransfer(started, "phone-1", 20L) as OwnershipResult.Ok).lease
        val acked = (SessionOwnership.ackTransfer(offered, "phone-1", 21L) as OwnershipResult.Ok).lease
        assertEquals(1, acked.epoch)

        // A escrita do relogio chega tarde: tem de ser REJEITADA, nao fundida.
        val late = SessionOwnership.authorizeWrite(acked, "watch-1", inFlightEpoch)
        assertTrue(late is OwnershipResult.Blocked)
        assertEquals(SessionOwnership.STALE_EPOCH, (late as OwnershipResult.Blocked).code)
    }

    @Test
    fun currentOwnerWriteIsAuthorized() {
        val started = (SessionOwnership.claimStart(null, "s1", "watch-1", "Run", 10L) as OwnershipResult.Ok).lease
        val ok = SessionOwnership.authorizeWrite(started, "watch-1", started.epoch)
        assertTrue(ok is OwnershipResult.Ok)
    }

    @Test
    fun nonOwnerWriteIsRejectedEvenWithCurrentEpoch() {
        val started = (SessionOwnership.claimStart(null, "s1", "watch-1", "Run", 10L) as OwnershipResult.Ok).lease
        val blocked = SessionOwnership.authorizeWrite(started, "phone-1", started.epoch)
        assertTrue(blocked is OwnershipResult.Blocked)
        assertEquals(SessionOwnership.NOT_OWNER, (blocked as OwnershipResult.Blocked).code)
    }

    // ─── ADR-011: liveness do dono ─────────────────────────────────────

    @Test
    fun onlyOwnerCanHeartbeat() {
        val started = (SessionOwnership.claimStart(null, "s1", "watch-1", "Run", 10L) as OwnershipResult.Ok).lease
        val byOwner = SessionOwnership.heartbeat(started, "watch-1", 20_000L)
        assertTrue(byOwner is OwnershipResult.Ok)
        assertEquals(20_000L, (byOwner as OwnershipResult.Ok).lease.ownerHeartbeatAtEpochMs)

        val byOther = SessionOwnership.heartbeat(started, "phone-1", 20_000L)
        assertTrue(byOther is OwnershipResult.Blocked)
        assertEquals(SessionOwnership.NOT_OWNER, (byOther as OwnershipResult.Blocked).code)
    }

    @Test
    fun ownerGoesStaleOnlyAfterLeaseTimeout() {
        val started = (SessionOwnership.claimStart(null, "s1", "watch-1", "Run", 0L) as OwnershipResult.Ok).lease
        assertFalse(SessionOwnership.isOwnerStale(started, SessionOwnership.OWNER_LEASE_TIMEOUT_MS))
        assertTrue(SessionOwnership.isOwnerStale(started, SessionOwnership.OWNER_LEASE_TIMEOUT_MS + 1L))
    }

    @Test
    fun reclaimBlockedWhileOwnerStillAlive() {
        val started = (SessionOwnership.claimStart(null, "s1", "watch-1", "Run", 0L) as OwnershipResult.Ok).lease
        val tooEarly = SessionOwnership.reclaimStale(started, "phone-1", 30_000L)
        assertTrue(tooEarly is OwnershipResult.Blocked)
        assertEquals(SessionOwnership.OWNER_ALIVE, (tooEarly as OwnershipResult.Blocked).code)
        assertEquals("watch-1", tooEarly.lease.ownerDeviceId)
    }

    @Test
    fun deadOwnerLeaseIsReclaimableAndBumpsEpoch() {
        // O relogio fica sem bateria a meio do treino.
        val started = (SessionOwnership.claimStart(null, "s1", "watch-1", "Run", 0L) as OwnershipResult.Ok).lease
        val now = SessionOwnership.OWNER_LEASE_TIMEOUT_MS + 1_000L
        val reclaimed = SessionOwnership.reclaimStale(started, "phone-1", now)
        assertTrue(reclaimed is OwnershipResult.Ok)
        val lease = (reclaimed as OwnershipResult.Ok).lease
        assertEquals("phone-1", lease.ownerDeviceId)
        assertEquals("phone-1", lease.session.deviceId)
        assertEquals(1, lease.epoch)
        assertEquals(ActivitySessionState.ACTIVE, lease.session.state)

        // O relogio volta a ligar-se e tenta escrever com o epoch antigo.
        val zombie = SessionOwnership.authorizeWrite(lease, "watch-1", 0)
        assertTrue(zombie is OwnershipResult.Blocked)
        assertEquals(SessionOwnership.STALE_EPOCH, (zombie as OwnershipResult.Blocked).code)
    }

    @Test
    fun heartbeatKeepsLeaseAliveAcrossIntervals() {
        var lease = (SessionOwnership.claimStart(null, "s1", "watch-1", "Run", 0L) as OwnershipResult.Ok).lease
        var t = 0L
        repeat(10) {
            t += SessionOwnership.OWNER_HEARTBEAT_INTERVAL_MS
            lease = (SessionOwnership.heartbeat(lease, "watch-1", t) as OwnershipResult.Ok).lease
            assertFalse(SessionOwnership.isOwnerStale(lease, t))
        }
        // 100 s de sessao com heartbeat: continua viva.
        assertEquals(100_000L, t)
        assertFalse(SessionOwnership.isOwnerStale(lease, t))
    }
}
