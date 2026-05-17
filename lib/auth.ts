export type UserRole = "admin" | "athlete" | "coach";

export type AuthUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  /** Links athlete login to dashboard athlete id (e.g. a-ines). */
  athleteId?: string;
  /** Links coach login to trainer id (e.g. t-002). */
  coachId?: string;
};

/** Demo accounts for local development and demos. */
const DEMO_USERS: Array<AuthUser & { password: string }> = [
  {
    id: "admin",
    username: "Admin",
    password: "Admin",
    name: "Admin",
    email: "admin@fitconnect.local",
    role: "admin"
  },
  {
    id: "athlete",
    username: "Athlete",
    password: "Athlete",
    name: "Inês M.",
    email: "ines@fitconnect.local",
    role: "athlete",
    athleteId: "a-ines"
  },
  {
    id: "coach",
    username: "Coach",
    password: "Coach",
    name: "Tomás Ribeiro",
    email: "tomas@fitconnect.local",
    role: "coach",
    coachId: "t-002"
  },
  {
    id: "coach-marina",
    username: "Marina",
    password: "Marina",
    name: "Marina Costa",
    email: "marina@fitconnect.local",
    role: "coach",
    coachId: "t-001"
  }
];

export function validateCredentials(
  identifier: string,
  password: string
): AuthUser | null {
  const id = identifier.trim().toLowerCase();
  const match = DEMO_USERS.find(
    (u) =>
      u.username.toLowerCase() === id ||
      u.email.toLowerCase() === id
  );
  if (!match || match.password !== password) return null;
  const { password: _pw, ...user } = match;
  return user;
}

export function dashboardPathForRole(role: UserRole): string {
  if (role === "coach") return "/coach/dashboard";
  return "/dashboard";
}
