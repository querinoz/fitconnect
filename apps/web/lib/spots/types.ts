/**
 * FitConnect Sports Intelligence — Spot domain types & privacy.
 * Exact coordinates never leave the server for unauthorized viewers.
 */

export const SPOT_KINDS = ["STANDARD", "MASTER", "SECRET"] as const;
export type SpotKind = (typeof SPOT_KINDS)[number];

export const CERTIFICATION_STATUSES = ["UNVERIFIED", "COMMUNITY", "MASTER"] as const;
export type CertificationStatus = (typeof CERTIFICATION_STATUSES)[number];

export const SKILL_LEVELS = ["BEGINNER", "AMATEUR", "ADVANCED", "PROFESSIONAL"] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export type SpotSummary = {
  id: string;
  name: string;
  slug: string | null;
  sportKey: string;
  spotKind: SpotKind;
  certificationStatus: CertificationStatus;
  skillLevel: SkillLevel | null;
  difficulty: string | null;
  approxLat: number;
  approxLng: number;
  /** Always null on public DTOs */
  exactLat: null;
  exactLng: null;
  region: string | null;
  country: string | null;
  ratingAvg: number | null;
  reviewCount: number;
  distanceM: number | null;
  permissionRequired: boolean;
  accessWarning: string | null;
  verifiedAt: string | null;
};

export type SpotDetail = SpotSummary & {
  description: string;
  surface: string | null;
  bestTime: string | null;
  facilities: Record<string, unknown>;
  trainingTypes: string[];
  equipment: string[];
  safetyNotes: string | null;
  landownerRestriction: boolean;
  parking: string | null;
  publicTransport: string | null;
  accessStatus: string | null;
  verifiedBy: string | null;
  photoCount: number;
  /** Present only when viewer is owner (or authorized); never for SECRET to strangers */
  exactLatAuthorized: number | null;
  exactLngAuthorized: number | null;
  exactCoordinates: "never" | "owner" | "restricted";
};

export type SpotQuery = {
  west?: number;
  south?: number;
  east?: number;
  north?: number;
  lat?: number;
  lng?: number;
  radiusM?: number;
  sport?: string;
  kind?: SpotKind | "ALL";
  certification?: CertificationStatus | "ALL";
  skill?: SkillLevel | "ALL";
  limit?: number;
};

export function assertValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function parseSpotKind(raw: string | null | undefined): SpotKind | "ALL" | null {
  if (!raw || raw === "ALL") return "ALL";
  const u = raw.toUpperCase();
  return (SPOT_KINDS as readonly string[]).includes(u) ? (u as SpotKind) : null;
}

export function parseSkillLevel(raw: string | null | undefined): SkillLevel | "ALL" | null {
  if (!raw || raw === "ALL") return "ALL";
  const u = raw.toUpperCase();
  return (SKILL_LEVELS as readonly string[]).includes(u) ? (u as SkillLevel) : null;
}

export function parseCertification(
  raw: string | null | undefined
): CertificationStatus | "ALL" | null {
  if (!raw || raw === "ALL") return "ALL";
  const u = raw.toUpperCase();
  return (CERTIFICATION_STATUSES as readonly string[]).includes(u)
    ? (u as CertificationStatus)
    : null;
}

/** Public DTO — exact coords always null. */
export function toPublicSummary(row: {
  id: string;
  name: string;
  slug: string | null;
  sport_key: string;
  spot_kind: string | null;
  certification_status: string | null;
  skill_level: string | null;
  difficulty: string | null;
  approx_lat: number;
  approx_lng: number;
  region: string | null;
  country: string | null;
  rating_avg: number | null;
  review_count: number | null;
  distance_m?: number | null;
  permission_required?: boolean | null;
  access_warning?: string | null;
  verified_at?: string | Date | null;
}): SpotSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sportKey: row.sport_key,
    spotKind: (row.spot_kind as SpotKind) || "STANDARD",
    certificationStatus: (row.certification_status as CertificationStatus) || "UNVERIFIED",
    skillLevel: (row.skill_level as SkillLevel) || null,
    difficulty: row.difficulty,
    approxLat: row.approx_lat,
    approxLng: row.approx_lng,
    exactLat: null,
    exactLng: null,
    region: row.region,
    country: row.country,
    ratingAvg: row.rating_avg,
    reviewCount: row.review_count ?? 0,
    distanceM: row.distance_m ?? null,
    permissionRequired: row.permission_required ?? false,
    accessWarning: row.access_warning ?? null,
    verifiedAt:
      row.verified_at == null
        ? null
        : typeof row.verified_at === "string"
          ? row.verified_at
          : row.verified_at.toISOString(),
  };
}
