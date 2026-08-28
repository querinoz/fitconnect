import { createSupabaseAdminClient } from "@/lib/db/supabase-admin";
import { pgQuery } from "@/lib/db/pg-pool";
import { createSupabaseRlsClient } from "@/lib/identity/supabase-rls-client";
import type { SquadChallenge } from "@/lib/squads/server-challenges";

type ChallengeRow = {
  id: string;
  name_key: string;
  squad_id: string;
  target_m: number;
  expires_at: string;
  reward_xp: number;
  demo_labeled: boolean;
};

type MemberRow = { user_id: string };
type ContributionRow = { user_id: string; distance_m: number };

function lifecycleFrom(
  progressM: number,
  targetM: number,
  expiresAt: string,
  hasMember: boolean
): SquadChallenge["lifecycle"] {
  const expired = new Date(expiresAt).getTime() <= Date.now();
  if (expired) return "EXPIRED";
  if (progressM >= targetM) return "COMPLETED";
  if (progressM > 0) return "ACTIVE";
  if (hasMember) return "JOINED";
  return "AVAILABLE";
}

function mapChallenge(
  row: ChallengeRow,
  members: MemberRow[],
  contributions: ContributionRow[]
): SquadChallenge {
  const contributionsMap: Record<string, number> = {};
  for (const c of contributions) {
    contributionsMap[c.user_id] = c.distance_m;
  }
  const progressM = Object.values(contributionsMap).reduce((a, b) => a + b, 0);
  const memberIds = members.map((m) => m.user_id);
  return {
    id: row.id,
    nameKey: row.name_key,
    squadId: row.squad_id,
    targetM: row.target_m,
    progressM,
    lifecycle: lifecycleFrom(progressM, row.target_m, row.expires_at, memberIds.length > 0),
    expiresAt: row.expires_at,
    rewardXp: row.reward_xp,
    contributions: contributionsMap,
    memberIds,
    demoLabeled: row.demo_labeled
  };
}

async function loadChallengeRows(challengeId: string) {
  const admin = createSupabaseAdminClient();
  if (admin) {
    const { data: row, error } = await admin
      .from("squad_challenges")
      .select("*")
      .eq("id", challengeId)
      .maybeSingle();
    if (!error && row) {
      const [{ data: members }, { data: contributions }] = await Promise.all([
        admin.from("squad_members").select("user_id").eq("challenge_id", challengeId),
        admin
          .from("squad_contributions")
          .select("user_id, distance_m")
          .eq("challenge_id", challengeId)
      ]);
      return {
        row: row as ChallengeRow,
        members: (members ?? []) as MemberRow[],
        contributions: (contributions ?? []) as ContributionRow[]
      };
    }
  }

  const rows = await pgQuery<ChallengeRow>(
    `select * from public.squad_challenges where id = $1`,
    [challengeId]
  );
  if (!rows[0]) return null;
  const members = await pgQuery<MemberRow>(
    `select user_id from public.squad_members where challenge_id = $1`,
    [challengeId]
  );
  const contributions = await pgQuery<ContributionRow>(
    `select user_id, distance_m from public.squad_contributions where challenge_id = $1`,
    [challengeId]
  );
  return { row: rows[0], members, contributions };
}

export async function getSquadChallengeFromSupabase(
  challengeId: string
): Promise<SquadChallenge | null> {
  const loaded = await loadChallengeRows(challengeId);
  if (!loaded) return null;
  return mapChallenge(loaded.row, loaded.members, loaded.contributions);
}

export async function joinSquadChallengeInSupabase(
  challengeId: string,
  userId: string,
  accessToken: string
): Promise<SquadChallenge | null> {
  const client = createSupabaseRlsClient(accessToken);
  if (client) {
    await client.from("squad_members").upsert({
      challenge_id: challengeId,
      user_id: userId,
      joined_at: new Date().toISOString()
    });
  } else {
    await pgQuery(
      `insert into public.squad_members (challenge_id, user_id, joined_at)
       values ($1, $2, now())
       on conflict (challenge_id, user_id) do nothing`,
      [challengeId, userId]
    );
  }
  return getSquadChallengeFromSupabase(challengeId);
}

export async function contributeSquadChallengeInSupabase(
  challengeId: string,
  userId: string,
  distanceM: number,
  accessToken: string
): Promise<SquadChallenge | null> {
  const add = Math.max(0, distanceM);
  const client = createSupabaseRlsClient(accessToken);

  if (client) {
    const { data: existing } = await client
      .from("squad_contributions")
      .select("distance_m")
      .eq("challenge_id", challengeId)
      .eq("user_id", userId)
      .maybeSingle();
    const nextDistance = (existing?.distance_m ?? 0) + add;
    await client.from("squad_contributions").upsert({
      challenge_id: challengeId,
      user_id: userId,
      distance_m: nextDistance,
      updated_at: new Date().toISOString()
    });
    await client.from("squad_members").upsert({
      challenge_id: challengeId,
      user_id: userId,
      joined_at: new Date().toISOString()
    });
  } else {
    await pgQuery(
      `insert into public.squad_contributions (challenge_id, user_id, distance_m, updated_at)
       values ($1, $2, $3, now())
       on conflict (challenge_id, user_id)
       do update set distance_m = public.squad_contributions.distance_m + excluded.distance_m,
                     updated_at = now()`,
      [challengeId, userId, add]
    );
    await pgQuery(
      `insert into public.squad_members (challenge_id, user_id, joined_at)
       values ($1, $2, now()) on conflict do nothing`,
      [challengeId, userId]
    );
  }

  return getSquadChallengeFromSupabase(challengeId);
}
