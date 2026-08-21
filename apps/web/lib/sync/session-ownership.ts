/**
 * Web mirror of android/shared SessionOwnership (ADR-011).
 * Keep codes, timeouts and epoch semantics identical to Kotlin.
 * Do not invent a third schema.
 *
 * ADR-010 rule: two surfaces may DISPLAY differently; they may not CALCULATE
 * differently. Any change here must land in
 * android/shared/.../session/SessionOwnership.kt in the same commit.
 */

export const TRANSFER_TIMEOUT_MS = 8_000;

/** Owner renews its lease at this cadence. Suspended in watch ambient mode. */
export const OWNER_HEARTBEAT_INTERVAL_MS = 10_000;

/** No renewal for this long => the lease may be reclaimed by another device. */
export const OWNER_LEASE_TIMEOUT_MS = 45_000;

export const OwnershipCode = {
  SESSION_OWNED_BY: "SESSION_OWNED_BY",
  NOT_ACTIVE: "NOT_ACTIVE",
  ALREADY_OWNER: "ALREADY_OWNER",
  NO_OFFER: "NO_OFFER",
  NOT_OFFEREE: "NOT_OFFEREE",
  OFFER_EXPIRED: "OFFER_EXPIRED",
  /** Write carried an epoch older than the lease — the writer lost ownership. */
  STALE_EPOCH: "STALE_EPOCH",
  /** Write came from a device that does not own the lease. */
  NOT_OWNER: "NOT_OWNER",
  /** Reclaim attempted while the owner is still sending heartbeats. */
  OWNER_ALIVE: "OWNER_ALIVE"
} as const;

export type OwnershipCode = (typeof OwnershipCode)[keyof typeof OwnershipCode];

export type SessionState =
  | "IDLE"
  | "READY"
  | "COUNTDOWN"
  | "PREPARING"
  | "ACTIVE"
  | "PAUSED"
  | "RESUMING"
  | "FINISHING"
  | "ENDING"
  | "COMPLETED"
  | "FAILED";

export type SessionLease = {
  sessionId: string;
  sportKey: string;
  state: SessionState;
  ownerDeviceId: string;
  deviceId: string;
  startedAtEpochMs: number | null;
  updatedAtEpochMs: number;
  pendingTransferTo: string | null;
  transferOfferedAtEpochMs: number | null;
  /** Bumped on every ownership change. Writes with a lower epoch are rejected. */
  epoch: number;
  /** Last liveness signal from the owning device. */
  ownerHeartbeatAtEpochMs: number;
};

export type OwnershipResult =
  | { ok: true; lease: SessionLease }
  | { ok: false; lease: SessionLease; code: OwnershipCode };

const LOCKED: SessionState[] = ["ACTIVE", "PAUSED", "RESUMING", "FINISHING", "ENDING"];

export function isLocked(state: SessionState): boolean {
  return LOCKED.includes(state);
}

export function originLabel(deviceId: string): "WATCH" | "PHONE" | "WEB" | "CLOUD" {
  const id = deviceId.toLowerCase();
  if (id.includes("watch") || id.startsWith("sm-r") || id.includes("wear")) return "WATCH";
  if (id.includes("phone") || id.includes("pixel") || id.includes("android")) return "PHONE";
  if (id.includes("web") || id.includes("browser")) return "WEB";
  return "CLOUD";
}

export function expireIfNeeded(lease: SessionLease, nowEpochMs: number): SessionLease {
  if (!lease.pendingTransferTo || lease.transferOfferedAtEpochMs == null) return lease;
  if (nowEpochMs - lease.transferOfferedAtEpochMs <= TRANSFER_TIMEOUT_MS) return lease;
  return {
    ...lease,
    pendingTransferTo: null,
    transferOfferedAtEpochMs: null,
    updatedAtEpochMs: nowEpochMs
  };
}

export function claimStart(
  current: SessionLease | null,
  input: { sessionId: string; deviceId: string; sportKey: string; nowEpochMs: number }
): OwnershipResult {
  if (current && isLocked(current.state) && current.ownerDeviceId !== input.deviceId) {
    return { ok: false, lease: expireIfNeeded(current, input.nowEpochMs), code: OwnershipCode.SESSION_OWNED_BY };
  }
  const lease: SessionLease = {
    sessionId: input.sessionId,
    sportKey: input.sportKey,
    state: "ACTIVE",
    ownerDeviceId: input.deviceId,
    deviceId: input.deviceId,
    startedAtEpochMs: input.nowEpochMs,
    updatedAtEpochMs: input.nowEpochMs,
    pendingTransferTo: null,
    transferOfferedAtEpochMs: null,
    epoch: 0,
    ownerHeartbeatAtEpochMs: input.nowEpochMs
  };
  return { ok: true, lease };
}

export function offerTransfer(
  lease: SessionLease,
  toDeviceId: string,
  nowEpochMs: number
): OwnershipResult {
  const live = expireIfNeeded(lease, nowEpochMs);
  if (!isLocked(live.state)) return { ok: false, lease: live, code: OwnershipCode.NOT_ACTIVE };
  if (toDeviceId === live.ownerDeviceId) {
    return { ok: false, lease: live, code: OwnershipCode.ALREADY_OWNER };
  }
  return {
    ok: true,
    lease: {
      ...live,
      pendingTransferTo: toDeviceId,
      transferOfferedAtEpochMs: nowEpochMs,
      updatedAtEpochMs: nowEpochMs
    }
  };
}

export function ackTransfer(
  lease: SessionLease,
  deviceId: string,
  nowEpochMs: number
): OwnershipResult {
  const hadOffer = lease.pendingTransferTo != null;
  const live = expireIfNeeded(lease, nowEpochMs);
  if (!live.pendingTransferTo) {
    return {
      ok: false,
      lease: live,
      code: hadOffer ? OwnershipCode.OFFER_EXPIRED : OwnershipCode.NO_OFFER
    };
  }
  if (deviceId !== live.pendingTransferTo) {
    return { ok: false, lease: live, code: OwnershipCode.NOT_OFFEREE };
  }
  return {
    ok: true,
    lease: {
      ...live,
      ownerDeviceId: deviceId,
      deviceId,
      pendingTransferTo: null,
      transferOfferedAtEpochMs: null,
      updatedAtEpochMs: nowEpochMs,
      // Ownership changed: every write still in flight from the old owner is now
      // stale and must be rejected rather than merged.
      epoch: live.epoch + 1,
      ownerHeartbeatAtEpochMs: nowEpochMs
    }
  };
}

/** Owner renews its lease. Only the owner may do this. */
export function heartbeat(
  lease: SessionLease,
  deviceId: string,
  nowEpochMs: number
): OwnershipResult {
  if (deviceId !== lease.ownerDeviceId) {
    return { ok: false, lease, code: OwnershipCode.NOT_OWNER };
  }
  return {
    ok: true,
    lease: { ...lease, ownerHeartbeatAtEpochMs: nowEpochMs, updatedAtEpochMs: nowEpochMs }
  };
}

/** True when the owner has gone quiet for longer than OWNER_LEASE_TIMEOUT_MS. */
export function isOwnerStale(lease: SessionLease, nowEpochMs: number): boolean {
  return (
    isLocked(lease.state) &&
    nowEpochMs - lease.ownerHeartbeatAtEpochMs > OWNER_LEASE_TIMEOUT_MS
  );
}

/**
 * Take over a session whose owner went quiet — flat battery, crash, out of range.
 *
 * Deliberately NOT automatic: the caller must have asked the user first. Silently
 * moving a live session between devices is how duplicate sessions get created.
 */
export function reclaimStale(
  lease: SessionLease,
  deviceId: string,
  nowEpochMs: number
): OwnershipResult {
  if (!isLocked(lease.state)) return { ok: false, lease, code: OwnershipCode.NOT_ACTIVE };
  if (deviceId === lease.ownerDeviceId) {
    return { ok: false, lease, code: OwnershipCode.ALREADY_OWNER };
  }
  if (!isOwnerStale(lease, nowEpochMs)) {
    return { ok: false, lease, code: OwnershipCode.OWNER_ALIVE };
  }
  return {
    ok: true,
    lease: {
      ...lease,
      ownerDeviceId: deviceId,
      deviceId,
      pendingTransferTo: null,
      transferOfferedAtEpochMs: null,
      updatedAtEpochMs: nowEpochMs,
      epoch: lease.epoch + 1,
      ownerHeartbeatAtEpochMs: nowEpochMs
    }
  };
}

/**
 * Gate every session-scoped write through this.
 *
 * Rejects — never merges — writes from a non-owner or carrying a stale epoch.
 * For training data, refusing and telling the user beats merging and lying.
 */
export function authorizeWrite(
  lease: SessionLease,
  deviceId: string,
  writeEpoch: number
): OwnershipResult {
  if (writeEpoch < lease.epoch) return { ok: false, lease, code: OwnershipCode.STALE_EPOCH };
  if (deviceId !== lease.ownerDeviceId) {
    return { ok: false, lease, code: OwnershipCode.NOT_OWNER };
  }
  return { ok: true, lease };
}

export function winnerDeviceId(
  aUpdatedAtEpochMs: number,
  aDeviceId: string,
  bUpdatedAtEpochMs: number,
  bDeviceId: string
): string {
  if (aUpdatedAtEpochMs !== bUpdatedAtEpochMs) {
    return aUpdatedAtEpochMs > bUpdatedAtEpochMs ? aDeviceId : bDeviceId;
  }
  return aDeviceId <= bDeviceId ? aDeviceId : bDeviceId;
}
