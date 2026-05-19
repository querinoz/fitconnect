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
    id: "coach-demo",
    username: "coach@fitconnect.com",
    password: "demo123",
    name: "Tomás Ribeiro",
    email: "coach@fitconnect.com",
    role: "coach",
    coachId: "t-002"
  },
  {
    id: "athlete-demo",
    username: "demo@fitconnect.com",
    password: "demo123",
    name: "Inês M.",
    email: "demo@fitconnect.com",
    role: "athlete",
    athleteId: "a-ines"
  },
  {
    id: "athlete-marina",
    username: "Marina",
    password: "Marina",
    name: "Marina Costa",
    email: "marina@fitconnect.local",
    role: "athlete",
    athleteId: "a-marina"
  }
];

export type DemoCredential = AuthUser & { password: string };

export function validateCredentials(
  identifier: string,
  password: string,
  extra: DemoCredential[] = []
): AuthUser | null {
  const id = identifier.trim().toLowerCase();
  const pool = [...DEMO_USERS, ...extra];
  const match = pool.find(
    (u) =>
      u.username.toLowerCase() === id ||
      u.email.toLowerCase() === id
  );
  if (!match || match.password !== password) return null;
  const { password: _pw, ...user } = match;
  return user;
}

export function createDemoUserFromSignup(input: {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "admin">;
}): DemoCredential {
  const slug = input.email.split("@")[0] ?? "user";
  const id = `user-${Date.now()}`;
  return {
    id,
    username: slug,
    password: input.password,
    name: input.name,
    email: input.email.toLowerCase(),
    role: input.role,
    athleteId: input.role === "athlete" ? `a-${slug}` : undefined,
    coachId: input.role === "coach" ? `t-${slug}` : undefined
  };
}

export function onboardingPathForRole(role: UserRole): string {
  if (role === "coach") return "/onboarding/coach";
  if (role === "admin") return "/dashboard";
  return "/onboarding/athlete";
}

export function dashboardPathForRole(role: UserRole): string {
  if (role === "coach") return "/coach/dashboard";
  return "/dashboard";
}

/** Same-origin paths only — for optional `next` sign-in redirects. */
export function safeInternalNextPath(
  raw: string | null | undefined
): string | undefined {
  if (raw == null) return undefined;
  let s = raw.trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    return undefined;
  }
  if (!s.startsWith("/") || s.startsWith("//")) return undefined;
  if (/^[a-zA-Z][a-zA-Z+.-]*:/.test(s)) return undefined;
  return s;
}
