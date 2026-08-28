/** Server-side squad challenge store (LOCAL_DEMO until Supabase squad tables ship). */

export type ChallengeLifecycle =
  | "AVAILABLE"
  | "JOINED"
  | "ACTIVE"
  | "COMPLETED"
  | "EXPIRED";

export type SquadChallenge = {
  id: string;
  nameKey: string;
  squadId: string;
  targetM: number;
  progressM: number;
  lifecycle: ChallengeLifecycle;
  expiresAt: string;
  rewardXp: number;
  contributions: Record<string, number>;
  memberIds: string[];
  demoLabeled: boolean;
};

const DAY_MS = 86_400_000;

const challenges = new Map<string, SquadChallenge>();
const memberships = new Map<string, Set<string>>();

function defaultChallenge(now = Date.now()): SquadChallenge {
  return {
    id: "squad-fc-week",
    nameKey: "challenge.squad_week",
    squadId: "fc-performance",
    targetM: 50_000,
    progressM: 0,
    lifecycle: "AVAILABLE",
    expiresAt: new Date(now + 7 * DAY_MS).toISOString(),
    rewardXp: 40,
    contributions: {},
    memberIds: [],
    demoLabeled: true
  };
}

export function getSquadChallenge(id: string, now = Date.now()): SquadChallenge {
  let challenge = challenges.get(id);
  if (!challenge) {
    challenge = defaultChallenge(now);
    challenges.set(id, challenge);
  }
  if (new Date(challenge.expiresAt).getTime() <= now && challenge.lifecycle !== "COMPLETED") {
    challenge = { ...challenge, lifecycle: "EXPIRED" };
    challenges.set(id, challenge);
  }
  return challenge;
}

export function joinSquadChallenge(
  challengeId: string,
  userId: string,
  now = Date.now()
): SquadChallenge {
  const challenge = getSquadChallenge(challengeId, now);
  const members = memberships.get(challengeId) ?? new Set<string>();
  members.add(userId);
  memberships.set(challengeId, members);

  const next: SquadChallenge = {
    ...challenge,
    memberIds: [...members],
    lifecycle:
      challenge.lifecycle === "AVAILABLE" || challenge.lifecycle === "JOINED"
        ? "JOINED"
        : challenge.lifecycle
  };
  challenges.set(challengeId, next);
  return next;
}

export function contributeToSquadChallenge(
  challengeId: string,
  userId: string,
  distanceM: number,
  now = Date.now()
): SquadChallenge {
  const challenge = joinSquadChallenge(challengeId, userId, now);
  const add = Math.max(0, distanceM);
  const contributions = {
    ...challenge.contributions,
    [userId]: (challenge.contributions[userId] ?? 0) + add
  };
  const progressM = Object.values(contributions).reduce((a, b) => a + b, 0);
  const done = progressM >= challenge.targetM;
  const next: SquadChallenge = {
    ...challenge,
    contributions,
    progressM,
    lifecycle: done ? "COMPLETED" : "ACTIVE"
  };
  challenges.set(challengeId, next);
  return next;
}

export function resetSquadChallengesForTests() {
  challenges.clear();
  memberships.clear();
}
