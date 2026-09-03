/**
 * Mirrors the Postgres RLS policy on public.activities (P1-DATA canonical).
 * shareable is generated as (upper(provider) <> 'STRAVA').
 * Legacy workout_sessions (uuid) is deprecated — same predicate applies.
 */
export type WorkoutSessionRow = {
  userId: string;
  provider: string;
  visibility: "private" | "public" | "followers";
  /** When present (DB generated column), prefer over recomputing from provider. */
  shareable?: boolean;
};

export function isShareableProvider(provider: string): boolean {
  return provider.toUpperCase() !== "STRAVA";
}

/** Default deny: only the owning athlete may read a Strava-origin record. */
export function canAccessStravaOwnedRecord(input: {
  actorId: string;
  ownerId: string;
}): boolean {
  if (!input.actorId || !input.ownerId) return false;
  return input.actorId === input.ownerId;
}

export function canSelectWorkoutSession(
  viewerId: string,
  row: WorkoutSessionRow,
): boolean {
  const shareable =
    typeof row.shareable === "boolean" ? row.shareable : isShareableProvider(row.provider);
  if (viewerId === row.userId) return true;
  return shareable && row.visibility === "public";
}
