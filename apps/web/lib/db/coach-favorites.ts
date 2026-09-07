import { randomUUID } from "crypto";

const favorites = new Map<string, Set<string>>();

export function resetCoachFavoritesForTests() {
  favorites.clear();
}

export function toggleCoachFavorite(coachId: string, athleteId: string): {
  athleteId: string;
  favorite: boolean;
} {
  const set = favorites.get(coachId) ?? new Set<string>();
  if (set.has(athleteId)) {
    set.delete(athleteId);
    favorites.set(coachId, set);
    return { athleteId, favorite: false };
  }
  set.add(athleteId);
  favorites.set(coachId, set);
  return { athleteId, favorite: true };
}
