import type { SportsIdentityProfile } from "./sports-identity";
import { emptySportsIdentity } from "./sports-identity";
import type { AthleteGoal, SportId } from "./sport-registry";
import { SPORT_REGISTRY } from "./sport-registry";

const STORAGE_KEY = "fitconnect.sportsIdentity.v1";

function isSportId(v: unknown): v is SportId {
  return typeof v === "string" && v in SPORT_REGISTRY;
}

/** Local cache only — server `/api/v1/sports/identity` is source of truth. */
export function loadSportsIdentityCache(userId: string): SportsIdentityProfile {
  if (typeof window === "undefined") return emptySportsIdentity(userId);
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:${userId}`);
    if (!raw) return emptySportsIdentity(userId);
    const parsed = JSON.parse(raw) as Partial<SportsIdentityProfile>;
    const base = emptySportsIdentity(userId);
    return {
      ...base,
      ...parsed,
      userId,
      primarySport: isSportId(parsed.primarySport) ? parsed.primarySport : null,
      secondarySports: Array.isArray(parsed.secondarySports)
        ? parsed.secondarySports.filter(isSportId)
        : [],
      primaryGoal: (parsed.primaryGoal as AthleteGoal | null) ?? null,
      secondaryGoal: (parsed.secondaryGoal as AthleteGoal | null) ?? null
    };
  } catch {
    return emptySportsIdentity(userId);
  }
}

export function saveSportsIdentityCache(profile: SportsIdentityProfile): void {
  if (typeof window === "undefined") return;
  const next = { ...profile, updatedAtISO: new Date().toISOString() };
  window.localStorage.setItem(`${STORAGE_KEY}:${profile.userId}`, JSON.stringify(next));
}

/** @deprecated use loadSportsIdentityCache — kept for call-site compatibility */
export const loadSportsIdentity = loadSportsIdentityCache;
/** @deprecated use saveSportsIdentityCache */
export const saveSportsIdentity = saveSportsIdentityCache;

export async function fetchSportsIdentity(userId: string): Promise<SportsIdentityProfile> {
  try {
    const res = await fetch("/api/v1/sports/identity", { credentials: "include" });
    if (!res.ok) return loadSportsIdentityCache(userId);
    const body = (await res.json()) as { profile?: SportsIdentityProfile };
    if (body.profile) {
      saveSportsIdentityCache(body.profile);
      return body.profile;
    }
  } catch {
    /* offline cache */
  }
  return loadSportsIdentityCache(userId);
}

export async function persistSportsIdentity(
  patch: Partial<SportsIdentityProfile> & { userId: string }
): Promise<SportsIdentityProfile> {
  const res = await fetch("/api/v1/sports/identity", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });
  if (!res.ok) {
    const local = { ...loadSportsIdentityCache(patch.userId), ...patch };
    saveSportsIdentityCache(local);
    return local;
  }
  const body = (await res.json()) as { profile: SportsIdentityProfile };
  saveSportsIdentityCache(body.profile);
  return body.profile;
}
