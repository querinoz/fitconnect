import { pgQuery } from "@/lib/db/pg-pool";
import { getPgPool } from "@/lib/db/pg-pool";
import {
  assertValidLatLng,
  toPublicSummary,
  type SpotDetail,
  type SpotKind,
  type SpotQuery,
  type SpotSummary,
  type SkillLevel,
} from "./types";

type SpotRow = {
  id: string;
  name: string;
  slug: string | null;
  sport_key: string;
  description: string;
  approx_lat: number;
  approx_lng: number;
  difficulty: string | null;
  skill_level: string | null;
  spot_kind: string | null;
  certification_status: string | null;
  region: string | null;
  country: string | null;
  surface: string | null;
  best_time: string | null;
  facilities: Record<string, unknown> | null;
  training_types: string[] | null;
  equipment: string[] | null;
  safety_notes: string | null;
  landowner_restriction: boolean | null;
  parking: string | null;
  public_transport: string | null;
  access_status: string | null;
  permission_required: boolean | null;
  access_warning: string | null;
  verified_by: string | null;
  verified_at: Date | string | null;
  rating_avg: number | null;
  review_count: number | null;
  photo_count: number | null;
  distance_m?: number | null;
  creator_id?: string;
  exact_lat?: number | null;
  exact_lng?: number | null;
  is_secret?: boolean | null;
};

function clampLimit(n: number | undefined): number {
  if (!n || !Number.isFinite(n)) return 80;
  return Math.min(Math.max(Math.floor(n), 1), 200);
}

/**
 * Query public spots for map viewport / radius.
 * Never returns SECRET rows or exact coordinates.
 */
export async function queryPublicSpots(q: SpotQuery): Promise<{
  spots: SpotSummary[];
  source: "postgres" | "unavailable" | "empty";
  exactCoordinates: "never";
  secretSpots: "never_auto_exposed";
}> {
  const pool = getPgPool();
  if (!pool) {
    return {
      spots: [],
      source: "unavailable",
      exactCoordinates: "never",
      secretSpots: "never_auto_exposed",
    };
  }

  const limit = clampLimit(q.limit);
  const params: unknown[] = [];
  const where: string[] = ["1=1"];

  if (q.west != null && q.south != null && q.east != null && q.north != null) {
    if (
      !assertValidLatLng(q.south, q.west) ||
      !assertValidLatLng(q.north, q.east)
    ) {
      return {
        spots: [],
        source: "empty",
        exactCoordinates: "never",
        secretSpots: "never_auto_exposed",
      };
    }
    params.push(q.south, q.north, q.west, q.east);
    const i = params.length;
    where.push(
      `approx_lat BETWEEN $${i - 3} AND $${i - 2} AND approx_lng BETWEEN $${i - 1} AND $${i}`
    );
  }

  if (q.lat != null && q.lng != null && q.radiusM != null && q.radiusM > 0) {
    if (!assertValidLatLng(q.lat, q.lng)) {
      return {
        spots: [],
        source: "empty",
        exactCoordinates: "never",
        secretSpots: "never_auto_exposed",
      };
    }
    params.push(q.lat, q.lng, q.radiusM);
    const i = params.length;
    where.push(
      `public.fc_haversine_m(approx_lat, approx_lng, $${i - 2}, $${i - 1}) <= $${i}`
    );
  }

  if (q.sport) {
    params.push(q.sport.toUpperCase());
    where.push(`upper(sport_key) = $${params.length}`);
  }
  if (q.kind && q.kind !== "ALL") {
    params.push(q.kind);
    where.push(`spot_kind = $${params.length}`);
  }
  if (q.certification && q.certification !== "ALL") {
    params.push(q.certification);
    where.push(`certification_status = $${params.length}`);
  }
  if (q.skill && q.skill !== "ALL") {
    params.push(q.skill);
    where.push(`skill_level = $${params.length}`);
  }

  const distanceSelect =
    q.lat != null && q.lng != null && assertValidLatLng(q.lat, q.lng)
      ? (() => {
          params.push(q.lat, q.lng);
          const i = params.length;
          return `public.fc_haversine_m(approx_lat, approx_lng, $${i - 1}, $${i}) AS distance_m`;
        })()
      : "NULL::double precision AS distance_m";

  params.push(limit);
  const sql = `
    SELECT
      id, name, slug, sport_key, description,
      approx_lat, approx_lng, difficulty, skill_level, spot_kind,
      certification_status, region, country, surface, best_time,
      facilities, training_types, equipment, safety_notes,
      landowner_restriction, parking, public_transport, access_status,
      permission_required, access_warning, verified_by, verified_at,
      rating_avg, review_count, photo_count,
      ${distanceSelect}
    FROM public.training_spots_public
    WHERE ${where.join(" AND ")}
    ORDER BY ${q.lat != null ? "distance_m ASC NULLS LAST," : ""} updated_at DESC
    LIMIT $${params.length}
  `;

  try {
    const rows = await pgQuery<SpotRow>(sql, params);
    return {
      spots: rows.map(toPublicSummary),
      source: rows.length ? "postgres" : "empty",
      exactCoordinates: "never",
      secretSpots: "never_auto_exposed",
    };
  } catch {
    // fc_haversine_m may be missing if 037 not applied — fall back without distance.
    try {
      const fallback = await pgQuery<SpotRow>(
        `SELECT id, name, slug, sport_key, description,
                approx_lat, approx_lng, difficulty, skill_level, spot_kind,
                certification_status, region, country, surface, best_time,
                facilities, training_types, equipment, safety_notes,
                landowner_restriction, parking, public_transport, access_status,
                permission_required, access_warning, verified_by, verified_at,
                rating_avg, review_count, photo_count,
                NULL::double precision AS distance_m
         FROM public.training_spots_public
         ORDER BY updated_at DESC
         LIMIT $1`,
        [limit]
      );
      let spots = fallback.map(toPublicSummary);
      if (q.sport) {
        const s = q.sport.toUpperCase();
        spots = spots.filter((x) => x.sportKey.toUpperCase() === s);
      }
      if (q.kind && q.kind !== "ALL") {
        spots = spots.filter((x) => x.spotKind === q.kind);
      }
      return {
        spots,
        source: spots.length ? "postgres" : "empty",
        exactCoordinates: "never",
        secretSpots: "never_auto_exposed",
      };
    } catch {
      return {
        spots: [],
        source: "unavailable",
        exactCoordinates: "never",
        secretSpots: "never_auto_exposed",
      };
    }
  }
}

/**
 * Detail: public surface by default. Exact coords only if viewer owns the row
 * (queried from base table with creator_id match — never from public view).
 */
export async function getSpotDetail(
  spotId: string,
  viewerId: string | null
): Promise<SpotDetail | null> {
  const publicRows = await pgQuery<SpotRow>(
    `SELECT id, name, slug, sport_key, description,
            approx_lat, approx_lng, difficulty, skill_level, spot_kind,
            certification_status, region, country, surface, best_time,
            facilities, training_types, equipment, safety_notes,
            landowner_restriction, parking, public_transport, access_status,
            permission_required, access_warning, verified_by, verified_at,
            rating_avg, review_count, photo_count
     FROM public.training_spots_public
     WHERE id = $1
     LIMIT 1`,
    [spotId]
  );

  if (publicRows[0]) {
    const summary = toPublicSummary({ ...publicRows[0], distance_m: null });
    return {
      ...summary,
      description: publicRows[0].description ?? "",
      surface: publicRows[0].surface,
      bestTime: publicRows[0].best_time,
      facilities: publicRows[0].facilities ?? {},
      trainingTypes: publicRows[0].training_types ?? [],
      equipment: publicRows[0].equipment ?? [],
      safetyNotes: publicRows[0].safety_notes,
      landownerRestriction: publicRows[0].landowner_restriction ?? false,
      parking: publicRows[0].parking,
      publicTransport: publicRows[0].public_transport,
      accessStatus: publicRows[0].access_status,
      verifiedBy: publicRows[0].verified_by,
      photoCount: publicRows[0].photo_count ?? 0,
      exactLatAuthorized: null,
      exactLngAuthorized: null,
      exactCoordinates: "never",
    };
  }

  // Owner-only path for private/secret — never expose to strangers.
  if (!viewerId) return null;
  const owned = await pgQuery<SpotRow>(
    `SELECT id, name, slug, sport_key, description,
            approx_lat, approx_lng, exact_lat, exact_lng,
            difficulty, skill_level, spot_kind, certification_status,
            region, country, surface, best_time, facilities, training_types,
            equipment, safety_notes, landowner_restriction, parking,
            public_transport, access_status, permission_required, access_warning,
            verified_by, verified_at, rating_avg, review_count, photo_count,
            creator_id, is_secret
     FROM public.training_spots
     WHERE id = $1 AND creator_id = $2
     LIMIT 1`,
    [spotId, viewerId]
  );
  const row = owned[0];
  if (!row) return null;

  const summary = toPublicSummary({ ...row, distance_m: null });
  const isSecret = row.is_secret === true || row.spot_kind === "SECRET";
  return {
    ...summary,
    spotKind: (row.spot_kind as SpotKind) || (isSecret ? "SECRET" : "STANDARD"),
    description: row.description ?? "",
    surface: row.surface,
    bestTime: row.best_time,
    facilities: row.facilities ?? {},
    trainingTypes: row.training_types ?? [],
    equipment: row.equipment ?? [],
    safetyNotes: row.safety_notes,
    landownerRestriction: row.landowner_restriction ?? false,
    parking: row.parking,
    publicTransport: row.public_transport,
    accessStatus: row.access_status,
    verifiedBy: row.verified_by,
    photoCount: row.photo_count ?? 0,
    exactLatAuthorized: row.exact_lat ?? null,
    exactLngAuthorized: row.exact_lng ?? null,
    exactCoordinates: "owner",
  };
}

export type CreateSpotInput = {
  name: string;
  sportKey: string;
  description?: string;
  approxLat: number;
  approxLng: number;
  exactLat?: number | null;
  exactLng?: number | null;
  isSecret?: boolean;
  difficulty?: string;
  skillLevel?: SkillLevel | null;
  creatorId: string;
};

/**
 * Insert spot. certification_status always UNVERIFIED — MASTER cannot be self-granted.
 */
export async function createTrainingSpot(input: CreateSpotInput): Promise<SpotSummary | null> {
  if (!assertValidLatLng(input.approxLat, input.approxLng)) return null;
  if (
    input.exactLat != null &&
    input.exactLng != null &&
    !assertValidLatLng(input.exactLat, input.exactLng)
  ) {
    return null;
  }
  const isSecret = Boolean(input.isSecret);
  const rows = await pgQuery<SpotRow>(
    `INSERT INTO public.training_spots (
       name, sport_key, description, approx_lat, approx_lng,
       exact_lat, exact_lng, visibility, access_status, difficulty,
       risk, creator_id, is_secret, spot_kind, certification_status, skill_level,
       exact_location_visibility
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7,
       $8, 'PUBLIC', COALESCE($9, 'INTERMEDIATE'),
       'MODERATE', $10, $11, $12, 'UNVERIFIED', $13,
       $14
     )
     RETURNING id, name, slug, sport_key, description,
               approx_lat, approx_lng, difficulty, skill_level, spot_kind,
               certification_status, region, country, surface, best_time,
               facilities, training_types, equipment, safety_notes,
               landowner_restriction, parking, public_transport, access_status,
               permission_required, access_warning, verified_by, verified_at,
               rating_avg, review_count, photo_count`,
    [
      input.name.slice(0, 120),
      input.sportKey.toUpperCase().slice(0, 64),
      (input.description ?? "").slice(0, 4000),
      input.approxLat,
      input.approxLng,
      isSecret ? input.exactLat ?? null : null,
      isSecret ? input.exactLng ?? null : null,
      isSecret ? "PRIVATE" : "PUBLIC",
      input.difficulty ?? "INTERMEDIATE",
      input.creatorId,
      isSecret,
      isSecret ? "SECRET" : "STANDARD",
      input.skillLevel ?? null,
      isSecret ? "OWNER_ONLY" : "PUBLIC_APPROXIMATION",
    ]
  );
  const row = rows[0];
  if (!row) return null;
  return toPublicSummary({ ...row, distance_m: null });
}

/** Future AI hook — never invent recommendations. */
export function spotIntelligenceUnavailable(reason: string) {
  return {
    status: "NOT_AVAILABLE" as const,
    reason,
    recommendations: [] as SpotSummary[],
  };
}
