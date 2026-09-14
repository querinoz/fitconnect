import { CANONICAL_SPORTS } from "@fitconnect/types";
import { listCommunityPosts } from "@/lib/community/server-posts";
import { listCommunityPostsFromSupabase } from "@/lib/community/supabase-repository";
import { createAthleteBooking } from "@/lib/db/bookings";
import { pgQuery } from "@/lib/db/pg-pool";
import { isMemoryPersistence, persistenceReady } from "@/lib/persistence/config";
import { buildHealthReport } from "@/lib/observability/health";

export function mcpCanonicalSports() {
  return { sports: [...CANONICAL_SPORTS] };
}

export async function mcpListSocialFeed() {
  try {
    if (!persistenceReady() || isMemoryPersistence()) {
      const posts = listCommunityPosts().map((p) => ({
        id: p.id,
        text: p.text,
        author: p.author.name,
        sport: p.author.sport,
        ago: p.ago
      }));
      return { posts, stravaNeverSocial: true as const, source: "memory" };
    }
    const posts = (await listCommunityPostsFromSupabase()).map((p) => ({
      id: p.id,
      text: p.text,
      author: p.author.name,
      sport: p.author.sport,
      ago: p.ago
    }));
    return { posts, stravaNeverSocial: true as const, source: "supabase" };
  } catch {
    return { posts: [], stravaNeverSocial: true as const, source: "unavailable" };
  }
}

type PublicSpotRow = {
  id: string;
  name: string;
  sport_key: string | null;
  approx_lat: number | null;
  approx_lng: number | null;
  exact_lat: number | null;
  exact_lng: number | null;
  is_secret: boolean | null;
};

export async function mcpListPublicSpots() {
  try {
    const rows = await pgQuery<PublicSpotRow>(
      `select id, name, sport_key, approx_lat, approx_lng, exact_lat, exact_lng, is_secret
       from public.training_spots_public
       where coalesce(is_secret, false) = false
       order by updated_at desc
       limit 50`
    );
    return {
      spots: rows.map((row) => ({
        id: row.id,
        name: row.name,
        sport: row.sport_key,
        approxLat: row.approx_lat,
        approxLng: row.approx_lng,
        exactLat: null,
        exactLng: null
      })),
      exactCoordinates: "never" as const,
      secretSpots: "never_auto_exposed" as const
    };
  } catch {
    return {
      spots: [],
      exactCoordinates: "never" as const,
      secretSpots: "never_auto_exposed" as const,
      source: "unavailable"
    };
  }
}

export async function mcpCreateBooking(input: {
  athleteId: string;
  coachId: string;
  startsAt: string;
}) {
  const created = await createAthleteBooking({
    athleteId: input.athleteId,
    coachId: input.coachId,
    scheduledAt: input.startsAt
  });
  if (created.error || !created.booking) {
    return {
      ok: false as const,
      error: created.error ?? "create_failed",
      doubleBookCheck: "natural_key" as const
    };
  }
  return {
    ok: true as const,
    requested: true,
    idempotent: created.idempotent,
    source: created.source,
    booking: {
      id: created.booking.id,
      coachId: created.booking.coachId,
      startsAt: created.booking.scheduledAt,
      athleteId: created.booking.athleteId,
      status: created.booking.status
    },
    doubleBookCheck: "natural_key" as const
  };
}

export function mcpAdminHealth() {
  const report = buildHealthReport();
  return {
    status: report.status,
    dependencies: report.dependencies.map((d) => ({ name: d.name, status: d.status }))
  };
}
