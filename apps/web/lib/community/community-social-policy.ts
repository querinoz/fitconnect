/**
 * Mirrors Postgres community_posts Strava-never-social barrier (migration 020).
 * is_social_eligible is generated as (upper(provider_id) <> 'STRAVA').
 * Unlike activities.shareable (owner may still read own Strava privately),
 * social tables must never store or surface STRAVA-origin rows — including to the author.
 */
export function isSocialEligibleProvider(providerId: string): boolean {
  return providerId.toUpperCase() !== "STRAVA";
}

export type CommunityPostSocialRow = {
  providerId: string;
  /** When present (DB generated column), prefer over recomputing from providerId. */
  isSocialEligible?: boolean;
};

/** Feed / ranking / reactions: STRAVA origin is always denied. */
export function canSurfaceCommunityPost(row: CommunityPostSocialRow): boolean {
  if (typeof row.isSocialEligible === "boolean") return row.isSocialEligible;
  return isSocialEligibleProvider(row.providerId);
}

/** Inserts into community_posts must never use STRAVA as provider_id. */
export function assertCommunityPostProviderAllowed(providerId: string): boolean {
  return isSocialEligibleProvider(providerId);
}
