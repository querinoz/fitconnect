/**
 * V10.5 Coach roster ACL — explicit relationship + scope.
 * Cross-tenant denial by default.
 */

export type CoachAthleteLink = {
  coachId: string;
  athleteId: string;
  scopes: Array<"training" | "recovery" | "performance" | "nutrition" | "notes">;
  active: boolean;
  revokedAt: string | null;
};

const links = new Map<string, CoachAthleteLink>(); // key coachId:athleteId

function key(coachId: string, athleteId: string) {
  return `${coachId}:${athleteId}`;
}

export function upsertCoachAthleteLink(link: CoachAthleteLink): void {
  links.set(key(link.coachId, link.athleteId), link);
}

export function revokeCoachAthleteLink(coachId: string, athleteId: string): void {
  const k = key(coachId, athleteId);
  const existing = links.get(k);
  if (!existing) return;
  links.set(k, {
    ...existing,
    active: false,
    revokedAt: new Date().toISOString(),
    scopes: []
  });
}

export type CoachAccessResult =
  | { ok: true; scopes: CoachAthleteLink["scopes"] }
  | { ok: false; reason: "not_linked" | "revoked" | "scope_denied" | "self_ok" };

export function coachMayAccessAthlete(params: {
  coachId: string;
  athleteId: string;
  scope: CoachAthleteLink["scopes"][number];
}): CoachAccessResult {
  if (params.coachId === params.athleteId) {
    return { ok: true, scopes: ["training", "recovery", "performance", "nutrition", "notes"] };
  }
  const link = links.get(key(params.coachId, params.athleteId));
  if (!link) return { ok: false, reason: "not_linked" };
  if (!link.active || link.revokedAt) return { ok: false, reason: "revoked" };
  if (!link.scopes.includes(params.scope)) return { ok: false, reason: "scope_denied" };
  return { ok: true, scopes: link.scopes };
}

export function listCoachAthletes(coachId: string): CoachAthleteLink[] {
  return [...links.values()].filter((l) => l.coachId === coachId && l.active);
}

export function __resetCoachRosterAcl(): void {
  links.clear();
}
