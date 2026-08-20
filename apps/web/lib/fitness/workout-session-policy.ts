/**
 * Mirrors the Postgres RLS policy on workout_sessions.
 * shareable is generated as (provider <> 'STRAVA').
 */
export type WorkoutSessionRow = {
  userId: string;
  provider: string;
  visibility: "private" | "public" | "followers";
};

export function isShareableProvider(provider: string): boolean {
  return provider !== "STRAVA";
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
  const shareable = isShareableProvider(row.provider);
  if (viewerId === row.userId) return true;
  return shareable && row.visibility === "public";
}
