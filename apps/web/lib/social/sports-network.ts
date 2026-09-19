/**
 * V11 Sports Network — spots, secret spots, events, challenges (domain core).
 * Privacy-first for secret spots. Strava activities never enter social graph.
 */

export type SpotVisibility = "public" | "followers" | "private" | "secret";

export type SportSpot = {
  spotId: string;
  name: string;
  sport: string;
  visibility: SpotVisibility;
  ownerId: string;
  /** Approximate only for public — never exact for secret */
  approxLat: number | null;
  approxLng: number | null;
  exactLat: number | null;
  exactLng: number | null;
  difficulty: string | null;
  surface: string | null;
  hazards: string[];
  bestTime: string | null;
  sharedWith: string[];
  dangerFlag: boolean;
  status: "ACTIVE" | "ARCHIVED";
};

export type SportEvent = {
  eventId: string;
  sport: string;
  title: string;
  startsAt: string;
  locationLabel: string | null;
  visibility: SpotVisibility;
  participantIds: string[];
  ownerId: string;
};

export type Challenge = {
  challengeId: string;
  sport: string;
  title: string;
  metric: string;
  startsAt: string;
  endsAt: string;
  participantIds: string[];
  visibility: SpotVisibility;
};

const spots = new Map<string, SportSpot>();
const events = new Map<string, SportEvent>();
const challenges = new Map<string, Challenge>();

export function createSpot(input: Omit<SportSpot, "status"> & { status?: SportSpot["status"] }): SportSpot {
  const spot: SportSpot = {
    ...input,
    status: input.status ?? "ACTIVE",
    exactLat: input.visibility === "secret" || input.visibility === "private" ? input.exactLat : null,
    exactLng: input.visibility === "secret" || input.visibility === "private" ? input.exactLng : null,
    approxLat: input.approxLat,
    approxLng: input.approxLng
  };
  if (spot.visibility === "public") {
    spot.exactLat = null;
    spot.exactLng = null;
  }
  spots.set(spot.spotId, spot);
  return spot;
}

export function getVisibleSpot(
  spotId: string,
  viewerId: string
): { spot: SportSpot | null; redacted: boolean } {
  const spot = spots.get(spotId) ?? null;
  if (!spot || spot.status !== "ACTIVE") return { spot: null, redacted: false };
  if (spot.visibility === "public") {
    return {
      spot: { ...spot, exactLat: null, exactLng: null },
      redacted: true
    };
  }
  if (spot.ownerId === viewerId || spot.sharedWith.includes(viewerId)) {
    return { spot, redacted: false };
  }
  return { spot: null, redacted: false };
}

export function listPublicSpots(sport?: string): SportSpot[] {
  return [...spots.values()]
    .filter((s) => s.status === "ACTIVE" && s.visibility === "public")
    .filter((s) => (sport ? s.sport === sport : true))
    .map((s) => ({ ...s, exactLat: null, exactLng: null }));
}

export function createEvent(event: SportEvent): SportEvent {
  events.set(event.eventId, event);
  return event;
}

export type JoinEventResult =
  | { ok: true; event: SportEvent }
  | { ok: false; reason: "not_found" | "forbidden" };

/**
 * Join is visibility-gated:
 * - public: anyone authenticated
 * - private / secret: owner or existing participant only (invite path not client-assertable)
 * - followers: treated as private until a real followers graph is wired
 */
export function joinEvent(eventId: string, userId: string): JoinEventResult {
  const e = events.get(eventId);
  if (!e) return { ok: false, reason: "not_found" };

  const already = e.participantIds.includes(userId);
  if (already) return { ok: true, event: e };

  const isOwner = e.ownerId === userId;
  if (e.visibility === "public" || isOwner) {
    e.participantIds = [...e.participantIds, userId];
    return { ok: true, event: e };
  }

  return { ok: false, reason: "forbidden" };
}

export function createChallenge(c: Challenge): Challenge {
  challenges.set(c.challengeId, c);
  return c;
}

export function __resetSportsNetwork(): void {
  spots.clear();
  events.clear();
  challenges.clear();
}
