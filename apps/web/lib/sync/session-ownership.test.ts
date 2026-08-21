import { describe, expect, it } from "vitest";
import {
  OWNER_LEASE_TIMEOUT_MS,
  OwnershipCode,
  TRANSFER_TIMEOUT_MS,
  ackTransfer,
  authorizeWrite,
  claimStart,
  heartbeat,
  isOwnerStale,
  offerTransfer,
  originLabel,
  reclaimStale,
  winnerDeviceId
} from "./session-ownership";

function started(deviceId = "watch-1", nowEpochMs = 0) {
  const r = claimStart(null, { sessionId: "s1", deviceId, sportKey: "Run", nowEpochMs });
  if (!r.ok) throw new Error("lease must start");
  return r.lease;
}

describe("session ownership (ADR-011)", () => {
  it("blocks a second START while another device owns the session", () => {
    const watch = claimStart(null, {
      sessionId: "s1",
      deviceId: "watch-1",
      sportKey: "Run",
      nowEpochMs: 10
    });
    expect(watch.ok).toBe(true);
    const phone = claimStart(watch.ok ? watch.lease : null, {
      sessionId: "s2",
      deviceId: "phone-1",
      sportKey: "Run",
      nowEpochMs: 20
    });
    expect(phone.ok).toBe(false);
    if (!phone.ok) {
      expect(phone.code).toBe(OwnershipCode.SESSION_OWNED_BY);
      expect(phone.lease.ownerDeviceId).toBe("watch-1");
      expect(phone.lease.sessionId).toBe("s1");
    }
  });

  it("moves owner on transfer ACK without creating a second session", () => {
    const started = claimStart(null, {
      sessionId: "s1",
      deviceId: "watch-1",
      sportKey: "Run",
      nowEpochMs: 10
    });
    if (!started.ok) throw new Error("expected start");
    const offered = offerTransfer(started.lease, "web-1", 20);
    if (!offered.ok) throw new Error("expected offer");
    const acked = ackTransfer(offered.lease, "web-1", 21);
    expect(acked.ok).toBe(true);
    if (acked.ok) {
      expect(acked.lease.ownerDeviceId).toBe("web-1");
      expect(acked.lease.sessionId).toBe("s1");
      expect(acked.lease.state).toBe("ACTIVE");
    }
  });

  it("expires transfer after 8s and keeps the original owner", () => {
    const started = claimStart(null, {
      sessionId: "s1",
      deviceId: "watch-1",
      sportKey: "Run",
      nowEpochMs: 10
    });
    if (!started.ok) throw new Error("expected start");
    const offered = offerTransfer(started.lease, "web-1", 20);
    if (!offered.ok) throw new Error("expected offer");
    const late = ackTransfer(offered.lease, "web-1", 20 + TRANSFER_TIMEOUT_MS + 1);
    expect(late.ok).toBe(false);
    if (!late.ok) {
      expect(late.code).toBe(OwnershipCode.OFFER_EXPIRED);
      expect(late.lease.ownerDeviceId).toBe("watch-1");
    }
  });

  it("rejects ACK from a device that is not the offeree", () => {
    const started = claimStart(null, {
      sessionId: "s1",
      deviceId: "watch-1",
      sportKey: "Run",
      nowEpochMs: 10
    });
    if (!started.ok) throw new Error("expected start");
    const offered = offerTransfer(started.lease, "web-1", 20);
    if (!offered.ok) throw new Error("expected offer");
    const other = ackTransfer(offered.lease, "phone-1", 21);
    expect(other.ok).toBe(false);
    if (!other.ok) expect(other.code).toBe(OwnershipCode.NOT_OFFEREE);
  });

  it("maps device ids to origin chips", () => {
    expect(originLabel("SM-R860")).toBe("WATCH");
    expect(originLabel("web-1")).toBe("WEB");
    expect(originLabel("phone-1")).toBe("PHONE");
    expect(originLabel("cloud-sync")).toBe("CLOUD");
  });

  it("tie-breaks record conflicts on deviceId", () => {
    expect(winnerDeviceId(100, "aaa", 100, "zzz")).toBe("aaa");
    expect(winnerDeviceId(200, "watch", 50, "phone")).toBe("watch");
  });
});

// Estes testes espelham SessionOwnershipTest.kt. ADR-010: duas superficies podem
// MOSTRAR diferente, nao podem CALCULAR diferente. Se mexeres num lado, mexe no outro.
describe("epoch — writes from a device that lost ownership (ADR-011)", () => {
  it("bumps epoch on transfer and rejects the old owner's in-flight write", () => {
    const lease = started();
    expect(lease.epoch).toBe(0);
    const inFlightEpoch = lease.epoch;

    const offered = offerTransfer(lease, "phone-1", 1_000);
    expect(offered.ok).toBe(true);
    if (!offered.ok) return;
    const acked = ackTransfer(offered.lease, "phone-1", 1_100);
    expect(acked.ok).toBe(true);
    if (!acked.ok) return;
    expect(acked.lease.epoch).toBe(1);

    const late = authorizeWrite(acked.lease, "watch-1", inFlightEpoch);
    expect(late.ok).toBe(false);
    if (late.ok) return;
    expect(late.code).toBe(OwnershipCode.STALE_EPOCH);
  });

  it("authorizes the current owner at the current epoch", () => {
    const lease = started();
    expect(authorizeWrite(lease, "watch-1", lease.epoch).ok).toBe(true);
  });

  it("rejects a non-owner even at the current epoch", () => {
    const lease = started();
    const r = authorizeWrite(lease, "phone-1", lease.epoch);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.code).toBe(OwnershipCode.NOT_OWNER);
  });
});

describe("owner liveness (ADR-011)", () => {
  it("lets only the owner heartbeat", () => {
    const lease = started();
    expect(heartbeat(lease, "watch-1", 20_000).ok).toBe(true);
    const other = heartbeat(lease, "phone-1", 20_000);
    expect(other.ok).toBe(false);
    if (other.ok) return;
    expect(other.code).toBe(OwnershipCode.NOT_OWNER);
  });

  it("goes stale only after the lease timeout", () => {
    const lease = started();
    expect(isOwnerStale(lease, OWNER_LEASE_TIMEOUT_MS)).toBe(false);
    expect(isOwnerStale(lease, OWNER_LEASE_TIMEOUT_MS + 1)).toBe(true);
  });

  it("refuses reclaim while the owner is alive", () => {
    const lease = started();
    const r = reclaimStale(lease, "phone-1", 30_000);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.code).toBe(OwnershipCode.OWNER_ALIVE);
    expect(r.lease.ownerDeviceId).toBe("watch-1");
  });

  it("reclaims a dead owner's lease, bumps epoch, and zombies the old device", () => {
    // O relogio fica sem bateria a meio do treino.
    const lease = started();
    const now = OWNER_LEASE_TIMEOUT_MS + 1_000;
    const r = reclaimStale(lease, "phone-1", now);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.lease.ownerDeviceId).toBe("phone-1");
    expect(r.lease.epoch).toBe(1);

    // O relogio volta a si e tenta escrever com o epoch antigo.
    const zombie = authorizeWrite(r.lease, "watch-1", 0);
    expect(zombie.ok).toBe(false);
    if (zombie.ok) return;
    expect(zombie.code).toBe(OwnershipCode.STALE_EPOCH);
  });

  it("keeps the lease alive across repeated heartbeats", () => {
    let lease = started();
    let t = 0;
    for (let i = 0; i < 10; i += 1) {
      t += 10_000;
      const r = heartbeat(lease, "watch-1", t);
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      lease = r.lease;
      expect(isOwnerStale(lease, t)).toBe(false);
    }
    expect(t).toBe(100_000);
  });
});
